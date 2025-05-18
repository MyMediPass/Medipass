"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { id, InstaQLEntity } from "@instantdb/react"
import { db, schema } from "@/db/instant"
import { format, parseISO, differenceInDays, isValid } from "date-fns"
import Link from "next/link"
import { PlusCircle, Search, Tag, BookOpen, Edit2, Trash2, Loader2, LayoutList, LayoutGrid, AlertTriangle, Save, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HealthNoteFormDialog, HealthNoteSubmitData } from "@/components/health-notes/HealthNoteFormDialog"

// Augment HealthNote type to include expected InstantDB fields and clarify tags type
export type HealthNote = InstaQLEntity<typeof schema, "healthNotes"> & {
  $createdAt?: number;
  $updatedAt?: number;
  tags?: string[]; // We expect to process the i.json() into string[]
};

const AUTOSAVE_DELAY = 2000; // 2 seconds

export default function HealthNotesPage() {
  const { user: clerkUser, isSignedIn, isLoaded: isUserLoaded } = useUser()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // State for Add Note Dialog
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)

  // State for editable fields (always active for selected note)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editTags, setEditTags] = useState("") // Comma-separated string

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  // Store the initial data of the selected note to compare for changes
  const initialSelectedNoteDataRef = useRef<{ title: string, content: string, tags: string[] } | null>(null);

  const {
    isLoading: isLoadingNotes,
    error: notesError,
    data: notesData,
  } = db.useQuery({
    healthNotes: {
      $: {
        where: { userId: clerkUser?.id || "" },
        // InstantDB auto-sorts by $updatedAt desc by default if no orderBy is specified
        // and if $updatedAt is available (which it is, implicitly)
        // orderBy: { createdAt: "desc" }, // Let's rely on default $updatedAt for now
      },
    },
  })

  const allNotes: HealthNote[] = useMemo(() => {
    // Sort by updatedAt (most recent first), then createdAt if updatedAt is the same or missing.
    // InstantDB now manages createdAt and updatedAt automatically.
    return (notesData?.healthNotes || [] as HealthNote[]).sort((a: HealthNote, b: HealthNote) => {
      const dateA = a.$updatedAt || a.$createdAt || 0;
      const dateB = b.$updatedAt || b.$createdAt || 0;
      return dateB - dateA;
    });
  }, [notesData]);


  const filteredNotes = useMemo(() => {
    return allNotes
      .filter(note => {
        const noteTags = Array.isArray(note.tags) ? note.tags : [];
        const searchMatch =
          note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          noteTags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        const tagMatch =
          activeFilters.length === 0 ||
          activeFilters.every((filterTag: string) => noteTags.includes(filterTag))
        return searchMatch && tagMatch
      })
    // Sorting is now done in allNotes memo
  }, [allNotes, searchTerm, activeFilters])

  const selectedNote = useMemo(() => {
    if (!selectedNoteId) return null
    return allNotes.find(note => note.id === selectedNoteId)
  }, [allNotes, selectedNoteId])

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    allNotes.forEach(note => {
      const noteTags = Array.isArray(note.tags) ? note.tags : [];
      noteTags.forEach((tag: string) => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  }, [allNotes])

  // Effect to populate edit fields when a note is selected or deselected
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    setSaveStatus("idle");

    if (selectedNote) {
      const currentTags = Array.isArray(selectedNote.tags) ? selectedNote.tags : [];
      const tagString = currentTags.join(", ");
      setEditTitle(selectedNote.title || "");
      setEditContent(selectedNote.content || "");
      setEditTags(tagString);
      initialSelectedNoteDataRef.current = {
        title: selectedNote.title || "",
        content: selectedNote.content || "",
        tags: currentTags,
      };
    } else {
      setEditTitle("");
      setEditContent("");
      setEditTags("");
      initialSelectedNoteDataRef.current = null;
    }
  }, [selectedNote]);

  const handleFieldChange = useCallback(() => {
    if (!selectedNote) return;
    setSaveStatus("idle"); // Reset status on new change

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      if (!selectedNote || !clerkUser?.id) return;

      const processedTags = (editTags || "")
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");

      // Check if data actually changed
      if (
        initialSelectedNoteDataRef.current &&
        initialSelectedNoteDataRef.current.title === editTitle &&
        initialSelectedNoteDataRef.current.content === editContent &&
        JSON.stringify(initialSelectedNoteDataRef.current.tags.sort()) === JSON.stringify(processedTags.sort())
      ) {
        setSaveStatus("idle"); // Or "saved" if you prefer to show it even if no network call
        return;
      }

      setSaveStatus("saving");
      const notePayload = {
        title: editTitle,
        content: editContent,
        tags: processedTags,
      };

      try {
        await db.transact(db.tx.healthNotes[selectedNote.id].update(notePayload));
        setSaveStatus("saved");
        // Update initial data ref to current saved state
        initialSelectedNoteDataRef.current = {
          title: editTitle,
          content: editContent,
          tags: processedTags,
        };
        // Optionally, set a timer to revert "saved" to "idle"
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveStatus("error");
      }
    }, AUTOSAVE_DELAY);
  }, [selectedNote, editTitle, editContent, editTags, clerkUser?.id]);

  // Trigger auto-save whenever editable fields change
  useEffect(() => {
    if (selectedNote) { // Only run if a note is selected and its fields are potentially changing
      handleFieldChange();
    }
    // Cleanup timer on unmount or if dependencies change significantly
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [editTitle, editContent, editTags, selectedNote, handleFieldChange]); // handleFieldChange is stable due to useCallback

  const handleSelectNote = (noteId: string) => {
    // If currently editing, potentially trigger save before switching
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      // Manually trigger save for the current edits before switching note
      // This is a design choice: save on switch or discard? For now, let's try to save.
      // handleFieldChange(); // This might be too complex here if it's async
      // Simpler: the useEffect for selectedNote will clear timer and reset fields.
    }
    setSelectedNoteId(noteId)
  }

  const openAddNoteDialog = () => {
    setSelectedNoteId(null);
    setIsAddFormOpen(true)
  }

  const handleAddNoteSubmit = async (data: HealthNoteSubmitData) => {
    if (!clerkUser?.id) throw new Error("User not authenticated.")
    const notePayload = {
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      userId: clerkUser.id,
    }
    try {
      const newNoteTx = db.tx.healthNotes[id()].update(notePayload);
      const result = await db.transact(newNoteTx);
      // InstantDB transactions might not directly return the full new object with ID in all setups.
      // If result provides ID, use it. For now, user finds new note in list. 
      // To select new note: find it in `allNotes` after data re-fetches, then `setSelectedNoteId`.
      setIsAddFormOpen(false)
    } catch (error) {
      console.error("Failed to add note:", error)
      throw error
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    try {
      await db.transact(db.tx.healthNotes[noteId].delete())
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null)
      }
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
  }

  const toggleTagFilter = (tag: string) => {
    setActiveFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const formatDate = (timestamp?: number | Date | string) => {
    if (!timestamp) return ""
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
    if (!isValid(date)) return ""
    const diff = differenceInDays(new Date(), date)
    if (diff < 1) return format(date, "p") // today: time
    if (diff < 7) return format(date, "eee") // this week: day name
    return format(date, "MMM d") // older: Month Day
  }

  const formatFullDate = (timestamp?: number | Date | string) => {
    if (!timestamp) return "N/A";
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
    if (!isValid(date)) return "Invalid date";
    return format(date, "PPPp");
  };

  const SaveStatusIndicator = () => {
    if (saveStatus === 'saving') {
      return <span className="text-xs text-muted-foreground flex items-center"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Saving...</span>;
    }
    if (saveStatus === 'saved') {
      return <span className="text-xs text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1" />Saved</span>;
    }
    if (saveStatus === 'error') {
      return <span className="text-xs text-red-500">Save error</span>;
    }
    return <span className="text-xs text-muted-foreground h-4"></span>; // Placeholder for height consistency
  };

  if (!isUserLoaded) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!isSignedIn) {
    return <div className="text-center py-10">Please sign in to view your health notes.</div>
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn(
        "flex flex-col md:flex-row h-[calc(100vh-var(--header-height,4rem)-2rem)] border rounded-lg overflow-hidden",
        saveStatus === 'saving' ? "pointer-events-none opacity-75" : null // Directly use ternary for conditional class
      )}>
        {/* Sidebar */}
        <div
          className={cn(
            "border-r md:border-r bg-slate-50/50 dark:bg-slate-900/50 flex flex-col",
            "w-full md:w-1/3 md:min-w-[280px] md:max-w-[400px]",
            selectedNoteId && "hidden md:flex" // Hide sidebar on mobile if a note is selected
          )}
        >
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">My Notes</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openAddNoteDialog}>
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">New Note</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Note</TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {allTags.length > 0 && (
              <ScrollArea className="h-16 mt-2">
                <div className="flex flex-wrap gap-1 py-1">
                  {allTags.map((tag: string) => (
                    <Button
                      key={tag}
                      variant={activeFilters.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTagFilter(tag)}
                      className="text-xs h-6 px-2"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <ScrollArea className="flex-grow">
            {isLoadingNotes && !notesData && (
              <div className="p-4 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading notes...
              </div>
            )}
            {notesError && (
              <div className="p-4 text-center text-red-500">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                Error: {(notesError as any).message}
              </div>
            )}
            {!isLoadingNotes && filteredNotes.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No notes found.</p>
                {searchTerm || activeFilters.length > 0 ? (
                  <p className="text-sm">Try adjusting your search or filters.</p>
                ) : (
                  <p className="text-sm">
                    <Button variant="link" onClick={openAddNoteDialog} className="p-0 h-auto text-sm">Create your first note</Button>
                  </p>
                )}
              </div>
            )}
            <div className="space-y-1 p-2">
              {filteredNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note.id!)}
                  className={cn(
                    "w-full text-left p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none",
                    selectedNoteId === note.id && "bg-primary/10 hover:bg-primary/15 dark:bg-primary/20 dark:hover:bg-primary/25"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm truncate">{note.title || "Untitled Note"}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{formatDate(note.$updatedAt || note.$createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {note.content ? (note.content.substring(0, 100) + (note.content.length > 100 ? "..." : "")) : <i>No content</i>}
                  </p>
                  {Array.isArray(note.tags) && note.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">{tag}</Badge>
                      ))}
                      {note.tags.length > 3 && <Badge variant="secondary" className="text-xs px-1.5 py-0.5">+{note.tags.length - 3}</Badge>}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area - Now always editable if a note is selected */}
        <div className={cn(
          "flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-950",
          !selectedNoteId && "hidden md:flex md:items-center md:justify-center" // Show placeholder on desktop if no note selected
        )}>
          {selectedNote ? (
            <div className="max-w-3xl mx-auto h-full flex flex-col">
              <div className="flex justify-between items-center mb-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => { setSelectedNoteId(null); }}>
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Back to List</span>
                  </Button>
                  <SaveStatusIndicator />
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteNote(selectedNote.id!)}>
                        <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Note</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Directly Editable Fields */}
              <div className="flex-grow overflow-y-auto pr-2 space-y-4"> {/* Added pr-2 for scrollbar */}
                <Input
                  placeholder="Untitled Note"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl md:text-3xl font-bold border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 h-auto !bg-transparent"
                />

                <Textarea
                  placeholder="Start typing your note here..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="text-base leading-relaxed border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 resize-none min-h-[calc(100%-150px)] !bg-transparent"
                  rows={15} // Adjust rows as needed, or use a height-based approach
                />

                <div>
                  <label htmlFor="editNoteTags" className="text-xs text-muted-foreground mb-1 block">Tags (comma-separated)</label>
                  <Input
                    id="editNoteTags"
                    placeholder="e.g., work, idea, important"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="text-sm border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 h-auto !bg-transparent"
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-4 pt-2 border-t flex-shrink-0">
                Created: {formatFullDate(selectedNote.$createdAt)}
                {selectedNote.$updatedAt && selectedNote.$updatedAt !== selectedNote.$createdAt && (
                  <span className="italic"> (Updated: {formatFullDate(selectedNote.$updatedAt)})</span>
                )}
              </div>

            </div>
          ) : (
            // Placeholder when no note is selected (for desktop view)
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Edit2 className="h-16 w-16 mb-4 text-gray-400" /> {/* Changed from BookOpen */}
              <p className="text-xl font-medium">Select a note to start editing</p>
              <p>Or, <Button variant="link" onClick={openAddNoteDialog} className="p-0 h-auto text-xl">create a new one</Button>.</p>
            </div>
          )}
        </div>

        {isAddFormOpen && clerkUser?.id && (
          <HealthNoteFormDialog
            isOpen={isAddFormOpen}
            onOpenChange={setIsAddFormOpen}
            mode="add"
            onSubmitAction={handleAddNoteSubmit}
            userId={clerkUser.id}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

// Helper function (cn)
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ")
}

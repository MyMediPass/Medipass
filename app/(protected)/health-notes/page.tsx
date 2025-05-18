"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { id, InstaQLEntity } from "@instantdb/react"
import { db, schema } from "@/db/instant"
import { format, parseISO, differenceInDays, isValid } from "date-fns"
import Link from "next/link"
import { PlusCircle, Search, Tag, BookOpen, Edit3, Trash2, Loader2, LayoutList, LayoutGrid, AlertTriangle } from "lucide-react"
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

export type HealthNote = InstaQLEntity<typeof schema, "healthNotes">

export type HealthNoteFormData = {
  id?: string
  title: string
  content: string
  tags?: string[] // Store as comma-separated string in form, then convert
}

export default function HealthNotesPage() {
  const { user: clerkUser, isSignedIn, isLoaded: isUserLoaded } = useUser()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([]) // For filtering by tags
  const [viewMode, setViewMode] = useState<"list" | "grid">("list") // For future view options

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [editingNote, setEditingNote] = useState<HealthNoteSubmitData | null>(null)

  const {
    isLoading: isLoadingNotes,
    error: notesError,
    data: notesData,
  } = db.useQuery({
    healthNotes: {
      $: {
        where: { userId: clerkUser?.id || "" },
        order: {
          serverCreatedAt: 'desc',
        },
      },
    },
  })
  if (notesError) {
    console.error("Error loading notes:", notesError)
  }

  const allNotes: HealthNote[] = notesData?.healthNotes || []

  const filteredNotes = useMemo(() => {
    return allNotes
      .filter(note => {
        const searchMatch =
          note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        const tagMatch =
          activeFilters.length === 0 ||
          activeFilters.every((filterTag: string) => note.tags?.includes(filterTag))
        return searchMatch && tagMatch
      })
      .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
  }, [allNotes, searchTerm, activeFilters])

  const selectedNote = useMemo(() => {
    if (!selectedNoteId) return null
    return allNotes.find(note => note.id === selectedNoteId)
  }, [allNotes, selectedNoteId])

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    allNotes.forEach(note => note.tags?.forEach((tag: string) => tagsSet.add(tag)))
    return Array.from(tagsSet).sort()
  }, [allNotes])

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId)
  }

  const openAddNoteDialog = () => {
    setFormMode("add")
    setEditingNote(null)
    setIsFormOpen(true)
  }

  const openEditNoteDialog = (note: HealthNote) => {
    setFormMode("edit")
    setEditingNote({
      id: note.id!,
      title: note.title || "",
      content: note.content || "",
      tags: note.tags || [],
    })
    setIsFormOpen(true)
  }

  const handleDialogSubmit = async (data: HealthNoteSubmitData, noteIdToEdit?: string) => {
    if (!clerkUser?.id) {
      throw new Error("User not authenticated.")
    }

    const notePayload: {
      title: string
      content: string
      tags?: string[]
      userId: string
      createdAt?: number
      updatedAt?: number
    } = {
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      userId: clerkUser.id,
    }

    try {
      if (noteIdToEdit) {
        notePayload.updatedAt = Date.now()
        delete notePayload.createdAt
        await db.transact(db.tx.healthNotes[noteIdToEdit].update(notePayload))
      } else {
        notePayload.createdAt = Date.now()
        delete notePayload.updatedAt
        await db.transact(db.tx.healthNotes[id()].update(notePayload))
      }
      setIsFormOpen(false)
    } catch (error) {
      console.error("Failed to save note:", error)
      throw error
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return
    try {
      await db.transact(db.tx.healthNotes[noteId].delete())
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null) // Clear selection if deleted note was selected
      }
    } catch (error) {
      console.error("Failed to delete note:", error)
      // TODO: Show error to user
    }
  }

  const toggleTagFilter = (tag: string) => {
    setActiveFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    if (!isValid(date)) return ""
    const diff = differenceInDays(new Date(), date)
    if (diff < 1) return format(date, "p") // today: time
    if (diff < 7) return format(date, "eee") // this week: day name
    return format(date, "MMM d") // older: Month Day
  }

  if (!isUserLoaded) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!isSignedIn) {
    return <div className="text-center py-10">Please sign in to view your health notes.</div>
  }

  // Main layout: Sidebar for notes list, Main content for selected note or placeholder
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-[calc(100vh-var(--header-height,4rem)-2rem)] border rounded-lg overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 min-w-[280px] max-w-[400px] border-r bg-slate-50/50 dark:bg-slate-900/50 flex flex-col">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">My Notes</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openAddNoteDialog}>
                <PlusCircle className="h-5 w-5" />
                <span className="sr-only">New Note</span>
              </Button>
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
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{formatDate(note.updatedAt || note.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {note.content ? (note.content.substring(0, 100) + (note.content.length > 100 ? "..." : "")) : <i>No content</i>}
                  </p>
                  {note.tags && note.tags.length > 0 && (
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

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedNote ? (
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedNote.tags && selectedNote.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditNoteDialog(selectedNote)}>
                    <Edit3 className="h-4 w-4 mr-1.5" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteNote(selectedNote.id!)}>
                    <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                  </Button>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-3 break-words">{selectedNote.title || "Untitled Note"}</h1>
              <div className="text-xs text-muted-foreground mb-6">
                Created: {selectedNote.createdAt ? format(new Date(selectedNote.createdAt), "PPPp") : "N/A"}
                {selectedNote.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt && (
                  <span className="italic"> (Updated: {format(new Date(selectedNote.updatedAt), "PPPp")})</span>
                )}
              </div>

              <Separator className="my-6" />

              {/* Using a div with whitespace-pre-wrap to render newlines from textarea */}
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {selectedNote.content}
                </p>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <BookOpen className="h-16 w-16 mb-4 text-gray-400" />
              <p className="text-xl font-medium">Select a note to view</p>
              <p>Or, <Button variant="link" onClick={openAddNoteDialog} className="p-0 h-auto text-xl">create a new one</Button> to get started.</p>
            </div>
          )}
        </div>

        {isFormOpen && clerkUser?.id && (
          <HealthNoteFormDialog
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            mode={formMode}
            initialData={editingNote || undefined}
            onSubmitAction={handleDialogSubmit}
            userId={clerkUser.id}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

// Helper function (cn) if not already globally available
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ")
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StickyNote, Search, Plus, Edit, Trash, Calendar, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

type Note = {
  id: number
  title: string
  content: string
  date: Date
  tags: string[]
}

export default function HealthNotesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: "Blood Pressure Tracking",
      content: "Morning reading: 120/80, Evening reading: 118/78. Feeling good today, no dizziness.",
      date: new Date("2025-04-15"),
      tags: ["blood pressure", "measurements"],
    },
    {
      id: 2,
      title: "Medication Side Effects",
      content: "Started experiencing mild headaches after taking Lisinopril. Will monitor for the next few days.",
      date: new Date("2025-04-10"),
      tags: ["medication", "side effects"],
    },
    {
      id: 3,
      title: "Exercise Log",
      content: "30 minutes walking, 15 minutes stretching. Felt energized afterward. Heart rate peaked at 125 bpm.",
      date: new Date("2025-04-08"),
      tags: ["exercise", "fitness"],
    },
    {
      id: 4,
      title: "Diet Changes",
      content: "Started reducing sodium intake. Replaced salt with herbs and spices. Meals still taste good!",
      date: new Date("2025-04-05"),
      tags: ["diet", "nutrition"],
    },
    {
      id: 5,
      title: "Sleep Quality",
      content: "Slept 7.5 hours. Woke up once during the night. Overall sleep quality: good.",
      date: new Date("2025-04-03"),
      tags: ["sleep", "wellness"],
    },
  ])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
  })

  const filteredNotes = notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.content) return

    const tagsArray = newNote.tags ? newNote.tags.split(",").map((tag) => tag.trim().toLowerCase()) : []

    const newNoteObj: Note = {
      id: notes.length > 0 ? Math.max(...notes.map((note) => note.id)) + 1 : 1,
      title: newNote.title,
      content: newNote.content,
      date: new Date(),
      tags: tagsArray,
    }

    setNotes([newNoteObj, ...notes])
    setNewNote({
      title: "",
      content: "",
      tags: "",
    })
    setIsCreating(false)
  }

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Health Notes</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Keep track of your health observations and thoughts
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Health Note</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Enter note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="content"
                  placeholder="Write your health note here..."
                  rows={6}
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  Tags (comma separated)
                </label>
                <Input
                  id="tags"
                  placeholder="e.g., blood pressure, medication, exercise"
                  value={newNote.tags}
                  onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateNote}>Save Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Search Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by title, content, or tags..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">My Notes</CardTitle>
                <p className="text-xs text-muted-foreground">{filteredNotes.length} notes</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                {filteredNotes.length > 0 ? (
                  <div className="divide-y">
                    {filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                          selectedNote?.id === note.id ? "bg-accent" : ""
                        }`}
                        onClick={() => setSelectedNote(note)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-medium">{note.title}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{format(note.date, "MMM d, yyyy")}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{note.content}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteNote(note.id)}>
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center p-4">
                    <StickyNote className="h-8 w-8 text-muted-foreground mb-4" />
                    <h3 className="font-medium">No notes found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? "Try adjusting your search" : "Create your first health note"}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card className="h-[calc(100vh-12rem)]">
            {selectedNote ? (
              <>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedNote.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{format(selectedNote.date, "MMMM d, yyyy")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteNote(selectedNote.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-20rem)]">
                    <div className="space-y-4">
                      <p className="whitespace-pre-line">{selectedNote.content}</p>

                      {selectedNote.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                          {selectedNote.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-accent">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Note Selected</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Select a note from the list to view its details, or create a new note to get started.
                </p>
                <Button className="mt-4" onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Note
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

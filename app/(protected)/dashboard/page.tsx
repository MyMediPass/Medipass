"use client"

import type React from "react"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pill,
  Calendar,
  MessageSquare,
  Send,
  Bot,
  User,
  Paperclip,
  Check,
  ImageIcon,
  FileText,
  AlertCircle,
  Info,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGrokChat } from "@/hooks/use-grok-chat"

export default function Dashboard() {
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: "Panadol",
      dosage: "10mg",
      time: "8:00 AM",
      instructions: "Take with breakfast",
      taken: false,
    },
    {
      id: 2,
      name: "Atorvastatin",
      dosage: "20mg",
      time: "8:00 PM",
      instructions: "Take with dinner",
      taken: false,
    },
    {
      id: 3,
      name: "Metformin",
      dosage: "500mg",
      time: "8:00 AM, 8:00 PM",
      instructions: "Take with meals",
      taken: false,
    },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const appointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      date: "April 20, 2025",
      time: "10:00 AM",
      location: "Cityview Medical Center",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Cardiology",
      date: "May 15, 2025",
      time: "2:30 PM",
      location: "Heart Health Specialists",
    },
  ]

  // Initialize chat with a welcome message
  const {
    messages: chatMessages,
    input: chatInput,
    handleInputChange,
    handleSubmit: handleSendMessage,
    isLoading,
    error: chatError,
    isOfflineMode,
    attachments,
    handleAddAttachments,
    handleRemoveAttachment,
    handleClearAttachments,
  } = useGrokChat([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm MediPass, your AI health assistant. How can I help you today?",
    },
  ])

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

  const handleToggleMedication = (id: number) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med)))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) form.requestSubmit()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      handleAddAttachments(newFiles)
    }
  }

  const renderAttachmentPreview = (file: File) => {
    const isImage = file.type.startsWith("image/")

    return (
      <div key={file.name} className="flex items-center gap-2 p-2 rounded-md bg-muted">
        {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        <span className="text-xs truncate max-w-[150px]">{file.name}</span>
        <button
          onClick={() => handleRemoveAttachment(attachments.indexOf(file))}
          className="ml-auto text-muted-foreground hover:text-foreground"
          type="button"
        >
          <span className="sr-only">Remove</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 md:px-6 md:py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Welcome back, John</h1>
        <p className="text-muted-foreground">Here's your health dashboard</p>
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-2">
        {/* Medication Reminders */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Medication Reminders
            </CardTitle>
            <CardDescription>Your medication schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-start gap-4 p-3 rounded-lg border">
                    <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                      <Pill className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {med.name} {med.dosage}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {med.time} • {med.instructions}
                      </div>
                    </div>
                    <Button
                      variant={med.taken ? "default" : "outline"}
                      size="sm"
                      className={`flex-shrink-0 ${med.taken ? "bg-green-600 hover:bg-green-700" : ""}`}
                      onClick={() => handleToggleMedication(med.id)}
                    >
                      {med.taken ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Taken
                        </>
                      ) : (
                        "Take"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/reminders">Manage Medications</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Your scheduled doctor visits</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="flex items-start gap-4 p-3 rounded-lg border">
                    <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{apt.doctor}</div>
                      <div className="text-sm text-muted-foreground">
                        {apt.date} at {apt.time}
                      </div>
                      <div className="text-sm text-muted-foreground">{apt.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/visits">View All Appointments</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Ask MediPass AI */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Ask MediPass AI
              {isOfflineMode ? (
                <Badge
                  variant="outline"
                  className="ml-2 text-xs font-normal bg-amber-100 text-amber-800 border-amber-200"
                >
                  Offline Mode
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-2 text-xs font-normal">
                  Powered by Grok
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Get quick answers to your health questions</CardDescription>
            {isOfflineMode && (
              <Alert variant="warning" className="mt-2">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-sm">
                    MediPass is currently running in offline mode with limited capabilities. Your questions will be
                    answered using pre-programmed responses about your medications and appointments.
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/settings">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure API Key
                      </Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {chatError && !isOfflineMode && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {chatError.message || "An error occurred while connecting to the AI service."}
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ScrollArea className="h-[250px] w-full pr-4">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${message.role === "assistant" ? "" : "flex-row-reverse"}`}
                      >
                        <Avatar className={`h-8 w-8 ${message.role === "assistant" ? "bg-primary/10" : "bg-muted"}`}>
                          <AvatarFallback>
                            {message.role === "assistant" ? (
                              <Bot className="h-4 w-4 text-primary" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{message.content}</p>

                          {/* Display error message if any */}
                          {message.error && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">{message.error}</AlertDescription>
                            </Alert>
                          )}

                          {/* Display attachments if any */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((file, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {file.type.startsWith("image/") ? (
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                  ) : (
                                    <FileText className="h-3 w-3 mr-1" />
                                  )}
                                  {file.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback>
                            <Bot className="h-4 w-4 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg bg-muted p-3">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce" />
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.2s]" />
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* File attachments preview */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((file) => renderAttachmentPreview(file))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0"
                  disabled={isLoading}
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="sr-only">Attach file</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                </Button>
                <Input
                  placeholder="Ask about your medications, appointments, or health..."
                  value={chatInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  disabled={isLoading}
                  name="message"
                />
                <Button
                  size="icon"
                  type="submit"
                  disabled={(!chatInput.trim() && attachments.length === 0) || isLoading}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            <p>
              AI responses are for informational purposes only and not a substitute for professional medical advice.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

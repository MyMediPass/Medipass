"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useChat } from "ai/react"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  attachments?: File[]
  error?: string
}

export function useGrokChat(initialMessages: Message[] = []) {
  const [attachments, setAttachments] = useState<File[]>([])
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // Convert our Message type to the format expected by the AI SDK
  const formattedInitialMessages = initialMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
  }))

  // Use the AI SDK's useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleAISubmit,
    isLoading,
    error,
    append,
    setMessages,
  } = useChat({
    api: "/api/chat",
    initialMessages: formattedInitialMessages,
    onResponse: (response) => {
      // Check if we're in offline mode from the response headers
      if (response.headers.get("X-Offline-Mode") === "true") {
        setIsOfflineMode(true)
      }
    },
    onError: (error) => {
      console.error("Chat error:", error)
      // If there's an API key error, switch to offline mode
      if (
        error.message &&
        (error.message.includes("API key") ||
          error.message.includes("authentication") ||
          error.message.includes("offline mode"))
      ) {
        setIsOfflineMode(true)
      }
    },
  })

  // Convert AI SDK messages back to our Message type
  const convertedMessages: Message[] = messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant" | "system",
    content: msg.content,
  }))

  // Handle file attachments
  const handleAddAttachments = useCallback((files: File[]) => {
    setAttachments((prev) => [...prev, ...files])
  }, [])

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleClearAttachments = useCallback(() => {
    setAttachments([])
  }, [])

  // Custom submit handler that includes attachments
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim() && attachments.length === 0) return

      // Create attachment descriptions
      const attachmentDescriptions = attachments.map((file) => {
        const fileType = file.type.startsWith("image/") ? "Image" : "Document"
        return `${fileType}: ${file.name} (${file.type})`
      })

      // Add attachment descriptions to the message
      let messageContent = input
      if (attachmentDescriptions.length > 0) {
        messageContent += "\n\n[Attached files: " + attachmentDescriptions.join(", ") + "]"
      }

      // Clear attachments and input
      setAttachments([])

      // Submit to AI
      await handleAISubmit(e, {
        options: {
          body: {
            attachmentDescriptions,
          },
        },
      })
    },
    [input, attachments, handleAISubmit],
  )

  return {
    messages: convertedMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    isOfflineMode,
    attachments,
    handleAddAttachments,
    handleRemoveAttachment,
    handleClearAttachments,
  }
}

"use client"

import { useRef, useState } from "react"
import { MessageSquare, Send, File, X } from "lucide-react"
import { useChat } from '@ai-sdk/react'
import Image from 'next/image'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"

export default function ChatPage() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<FileList | undefined>(undefined)

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
    })

    const handleClearFiles = () => {
        setFiles(undefined)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        handleSubmit(e, {
            experimental_attachments: files,
        })
        handleClearFiles()
    }

    return (
        <div className="relative h-[calc(100vh-80px)] flex flex-col overflow-hidden rounded-2xl">
            {/* Gradient background */} 
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 opacity-80">
                <div className="absolute inset-0 radial-gradient" />
            </div>

            <div className="relative flex flex-col h-full p-6 z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6 px-4 sm:px-8">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold">Chat with Healie</h1>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 pr-4 px-4 sm:px-8">
                    <div className="flex flex-col space-y-6 pb-6">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-[60vh]">
                                <div className="text-center space-y-3">
                                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/60" />
                                    <h3 className="text-lg font-medium">Start a conversation with Healie</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Upload medical documents or simply ask questions about your health.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                            }`}
                                    >
                                        {message.role === 'assistant' && (
                                            <Avatar className="h-8 w-8 bg-primary hidden sm:block">
                                                <span className="text-xs">M</span>
                                            </Avatar>
                                        )}
                                        <div>
                                            <div
                                                className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted/60 backdrop-blur-sm'
                                                    }`}
                                            >
                                                <div className="whitespace-pre-wrap">{message.content}</div>
                                            </div>

                                            {/* Render attachments if any */}
                                            {message.experimental_attachments && message.experimental_attachments.length > 0 && (
                                                <div className="mt-2">
                                                    {message.experimental_attachments
                                                        .filter(
                                                            attachment =>
                                                                attachment?.contentType?.startsWith('image/') ||
                                                                attachment?.contentType?.startsWith('application/pdf')
                                                        )
                                                        .map((attachment, index) =>
                                                            attachment.contentType?.startsWith('image/') ? (
                                                                <div key={`${message.id}-${index}`} className="rounded-md overflow-hidden mt-2">
                                                                    <Image
                                                                        src={attachment.url}
                                                                        width={300}
                                                                        height={200}
                                                                        alt={attachment.name ?? `attachment-${index}`}
                                                                        className="object-contain"
                                                                    />
                                                                </div>
                                                            ) : attachment.contentType?.startsWith('application/pdf') ? (
                                                                <div key={`${message.id}-${index}`} className="mt-2 border rounded-md overflow-hidden">
                                                                    <iframe
                                                                        src={attachment.url}
                                                                        width="100%"
                                                                        height="300"
                                                                        title={attachment.name ?? `attachment-${index}`}
                                                                        className="border-0"
                                                                    />
                                                                </div>
                                                            ) : null
                                                        )
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[85%]">
                                    <Avatar className="h-8 w-8 bg-primary">
                                        <span className="text-xs">M</span>
                                    </Avatar>
                                    <div className="rounded-2xl px-4 py-3 bg-muted/60 backdrop-blur-sm">
                                        <div className="flex space-x-1 items-center">
                                            <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                                            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input form */}
                <div className="sticky rounded-lg bottom-0 py-4 w-full backdrop-blur-sm bg-white/30 dark:bg-black/30 px-4 sm:px-4">
                    <form onSubmit={onSubmit} className="flex flex-col gap-3">
                        {files && files.length > 0 && (
                            <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-md">
                                <File className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm truncate">
                                    {files.length > 1
                                        ? `${files.length} files selected`
                                        : files[0].name}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto h-6 w-6 p-0"
                                    onClick={handleClearFiles}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="application/pdf,image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setFiles(e.target.files)
                                        }
                                    }}
                                    multiple
                                />
                                <File className="h-4 w-4" />
                            </Button>

                            <Input
                                placeholder="Message Healie..."
                                value={input}
                                onChange={handleInputChange}
                                className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted/40 backdrop-blur-sm"
                            />

                            <Button
                                type="submit"
                                size="icon"
                                className="shrink-0"
                                disabled={isLoading || (!input.trim() && (!files || files.length === 0))}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
} 
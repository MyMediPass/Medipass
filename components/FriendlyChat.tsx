import { useState, useRef, useEffect } from "react"
import { useChat } from '@ai-sdk/react'
import Image from 'next/image'
import { Bot, User, Paperclip, Send, ImageIcon, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface FriendlyChatProps {
    initialMessages?: Array<{
        id: string;
        role: 'user' | 'assistant';
        content: string;
    }>;
    apiEndpoint?: string;
    height?: string;
    showAttachmentPreviews?: boolean;
    className?: string;
}

export function FriendlyChat({
    initialMessages = [],
    apiEndpoint = '/api/chat',
    height = '250px',
    showAttachmentPreviews = true,
    className = '',
}: FriendlyChatProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const [files, setFiles] = useState<FileList | null>(null)

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: apiEndpoint,
        initialMessages,
        maxSteps: 4,
        // run client-side tools that are automatically executed:
        async onToolCall({ toolCall }) {
            if (toolCall.toolName === 'uploadLabReport') {
                console.log('Uploading lab report...')
                return {
                    toolName: 'uploadLabReport',
                    toolCallId: toolCall.toolCallId,
                    result: 'Lab report uploaded successfully'
                }
            }
        },
    })

    // Scroll to bottom of chat when messages change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            const form = e.currentTarget.form
            if (form) form.requestSubmit()
        }
    }

    const handleClearFiles = () => {
        setFiles(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files)
        }
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        handleSubmit(e, {
            experimental_attachments: files,
        })
        handleClearFiles()
    }

    const renderAttachmentPreview = (file: File) => {
        const isImage = file.type.startsWith("image/")

        return (
            <div key={file.name} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                <button
                    onClick={handleClearFiles}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                    type="button"
                >
                    <span className="sr-only">Remove</span>
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
    }

    return (
        <div className={`h-full space-y-4 ${className} flex flex-col p-4`}>
            <ScrollArea className={`flex-1 w-full pr-4`}>
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                        >
                            <div
                                className={`flex gap-3 max-w-[85%] ${message.role === "assistant" ? "" : "flex-row-reverse"}`}
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
                                <div>
                                    <div
                                        className={`rounded-lg p-3 ${message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                                    </div>

                                    {/* Display attachments if any */}
                                    {showAttachmentPreviews && message.experimental_attachments && message.experimental_attachments.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {message.experimental_attachments
                                                .filter(
                                                    (attachment: any) =>
                                                        attachment?.contentType?.startsWith('image/') ||
                                                        attachment?.contentType?.startsWith('application/pdf')
                                                )
                                                .map((attachment: any, index: number) =>
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
                                                    ) : (
                                                        <div key={`${message.id}-${index}`} className="mt-2 border rounded-md overflow-hidden">
                                                            <iframe
                                                                src={attachment.url}
                                                                width="100%"
                                                                height="300"
                                                                title={attachment.name ?? `attachment-${index}`}
                                                                className="border-0"
                                                            />
                                                        </div>
                                                    )
                                                )
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[85%]">
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
            {files && files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {Array.from(files).map((file) => renderAttachmentPreview(file))}
                </div>
            )}

            <form onSubmit={onSubmit} className="flex items-center gap-2">
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
                    placeholder="Type your message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                    disabled={isLoading}
                    name="message"
                />
                <Button
                    size="icon"
                    type="submit"
                    disabled={(!input.trim() && (!files || files.length === 0)) || isLoading}
                >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                </Button>
            </form>
        </div>
    )
} 
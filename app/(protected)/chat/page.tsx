"use client"

import type React from "react"
import { FriendlyChat } from "@/components/FriendlyChat"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    MessageSquare,
    Info,
    Settings,
    AlertCircle
} from "lucide-react"

export default function ChatPage() {
    // Mock API status - you may want to fetch this dynamically
    const isOfflineMode = false
    const chatError = null

    return (
        <div className="container mx-auto px-4 md:px-6 flex flex-col h-[calc(100vh-80px)] pt-6">
            <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold flex items-center">
                    Ask Healie AI
                    {isOfflineMode ? (
                        <Badge
                            variant="outline"
                            className="ml-2 text-xs font-normal bg-amber-100 text-amber-800 border-amber-200"
                        >
                            Offline Mode
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="ml-2 text-xs font-normal">
                            Powered by Claude
                        </Badge>
                    )}
                </h1>
            </div>
            <p className="text-muted-foreground text-sm mb-3">
                Get quick answers to your health questions.
            </p>
            {isOfflineMode && (
                <Alert className="mb-3">
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
                <Alert variant="destructive" className="mb-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        {"An error occurred while connecting to the AI service."}
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex-1 flex flex-col bg-card border rounded-lg overflow-hidden min-h-0">
                <FriendlyChat
                    className="h-full"
                    initialMessages={[
                        {
                            id: "1",
                            role: "assistant",
                            content: "Hello! I'm Healie, your AI health assistant. How can I help you today?",
                        }
                    ]}
                />
            </div>
            <div className="text-xs text-muted-foreground text-center pt-3 pb-4">
                <p>
                    AI responses are for informational purposes only and not a substitute for professional medical advice.
                </p>
            </div>
        </div>
    )
} 
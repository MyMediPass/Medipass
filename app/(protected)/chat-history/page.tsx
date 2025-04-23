"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Search, Calendar, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function ChatHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const chatHistory = [
    {
      id: 1,
      date: "April 17, 2025",
      preview: "I've been experiencing headaches after taking my new medication...",
      messages: [
        {
          id: "1-1",
          role: "user",
          content: "I've been experiencing headaches after taking my new medication. Is this normal?",
          timestamp: "10:30 AM",
        },
        {
          id: "1-2",
          role: "assistant",
          content:
            "Headaches can be a side effect of many medications. Which medication are you taking, and when did you start it?",
          timestamp: "10:30 AM",
        },
        {
          id: "1-3",
          role: "user",
          content: "I started taking Lisinopril 10mg about 3 days ago for high blood pressure.",
          timestamp: "10:31 AM",
        },
        {
          id: "1-4",
          role: "assistant",
          content:
            "Headaches are a known side effect of Lisinopril, especially when first starting the medication. They often improve after a few days as your body adjusts. Make sure you're staying well-hydrated. If the headaches are severe or persist beyond a week, you should contact your doctor. Never stop taking blood pressure medication without consulting your healthcare provider.",
          timestamp: "10:32 AM",
        },
      ],
    },
    {
      id: 2,
      date: "April 15, 2025",
      preview: "What do my cholesterol test results mean? My total cholesterol is 185...",
      messages: [
        {
          id: "2-1",
          role: "user",
          content: "What do my cholesterol test results mean? My total cholesterol is 185, LDL is 110, and HDL is 55.",
          timestamp: "2:45 PM",
        },
        {
          id: "2-2",
          role: "assistant",
          content:
            "Your cholesterol results look good overall. Total cholesterol of 185 mg/dL is below the recommended threshold of 200 mg/dL. Your HDL (good cholesterol) is 55 mg/dL, which is good (above 40 mg/dL for men and above 50 mg/dL for women is desirable). Your LDL (bad cholesterol) is 110 mg/dL, which is borderline high (optimal is below 100 mg/dL). You might want to discuss strategies with your doctor to lower your LDL slightly, but overall these are good results.",
          timestamp: "2:46 PM",
        },
      ],
    },
    {
      id: 3,
      date: "April 10, 2025",
      preview: "How often should I exercise with my current health condition?",
      messages: [
        {
          id: "3-1",
          role: "user",
          content: "How often should I exercise with my current health condition?",
          timestamp: "9:15 AM",
        },
        {
          id: "3-2",
          role: "assistant",
          content:
            "For most adults with stable health conditions, the general recommendation is at least 150 minutes of moderate-intensity aerobic activity per week, along with muscle-strengthening activities on 2 or more days per week. However, the specific recommendation for you depends on your particular health condition. What health conditions are you managing?",
          timestamp: "9:16 AM",
        },
        {
          id: "3-3",
          role: "user",
          content: "I have high blood pressure and slightly elevated cholesterol. I'm taking medication for both.",
          timestamp: "9:17 AM",
        },
        {
          id: "3-4",
          role: "assistant",
          content:
            "Regular exercise is beneficial for both high blood pressure and elevated cholesterol. For your conditions, aim for about 30 minutes of moderate-intensity exercise (like brisk walking, swimming, or cycling) most days of the week (at least 5 days). Start slowly if you haven't been exercising regularly and gradually increase intensity. Always warm up and cool down. Monitor your blood pressure before and after exercise initially. Avoid very intense activities that could spike your blood pressure. Always consult with your doctor before starting a new exercise program, especially with your conditions.",
          timestamp: "9:19 AM",
        },
      ],
    },
    {
      id: 4,
      date: "April 5, 2025",
      preview: "What foods should I avoid with my blood pressure medication?",
      messages: [
        {
          id: "4-1",
          role: "user",
          content: "What foods should I avoid with my blood pressure medication?",
          timestamp: "11:20 AM",
        },
        {
          id: "4-2",
          role: "assistant",
          content:
            "The foods to avoid depend on which blood pressure medication you're taking. Could you specify which medication you're on?",
          timestamp: "11:21 AM",
        },
        {
          id: "4-3",
          role: "user",
          content: "I'm taking Lisinopril 10mg once daily.",
          timestamp: "11:22 AM",
        },
        {
          id: "4-4",
          role: "assistant",
          content:
            "With Lisinopril (an ACE inhibitor), you should: 1) Limit high-potassium foods like bananas, oranges, and salt substitutes, as ACE inhibitors can increase potassium levels. 2) Avoid excessive salt/sodium, which can counteract the medication's effectiveness. 3) Be cautious with NSAIDs like ibuprofen, which can reduce the effectiveness of Lisinopril. 4) Limit alcohol consumption. Always consult your doctor or pharmacist about specific dietary restrictions with your medication.",
          timestamp: "11:24 AM",
        },
      ],
    },
  ]

  const filteredChats = chatHistory.filter((chat) => {
    const allMessages = chat.messages.map((msg) => msg.content).join(" ")
    return allMessages.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const [selectedChat, setSelectedChat] = useState<number | null>(null)

  const handleChatClick = (id: number) => {
    setSelectedChat(id === selectedChat ? null : id)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Chat History</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          View your previous conversations with the AI assistant
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Search Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search chat history..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Conversations</CardTitle>
            <p className="text-xs text-muted-foreground">{filteredChats.length} conversations</p>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
            <div className="space-y-3">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <div key={chat.id}>
                    <div
                      className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                        selectedChat === chat.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => handleChatClick(chat.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 bg-primary/10">
                            <AvatarFallback>
                              <Bot className="h-4 w-4 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">Healie</p>
                              <Badge variant="outline" className="text-[10px]">
                                {format(new Date(chat.date), "MMM d")}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{chat.preview}</p>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {selectedChat === chat.id && (
                      <div className="mt-3 rounded-lg border p-3 bg-card">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{chat.date}</p>
                        </div>

                        <div className="space-y-4">
                          {chat.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                            >
                              <div
                                className={`flex gap-2.5 max-w-[85%] ${
                                  message.role === "assistant" ? "" : "flex-row-reverse"
                                }`}
                              >
                                <Avatar
                                  className={`h-7 w-7 ${message.role === "assistant" ? "bg-primary/10" : "bg-muted"}`}
                                >
                                  <AvatarFallback>
                                    {message.role === "assistant" ? (
                                      <Bot className="h-3.5 w-3.5 text-primary" />
                                    ) : (
                                      <User className="h-3.5 w-3.5" />
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div
                                    className={`rounded-lg p-2.5 ${
                                      message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                                    }`}
                                  >
                                    <p className="text-xs">{message.content}</p>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1 px-1">{message.timestamp}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bot className="h-8 w-8 text-muted-foreground mb-4" />
                  <h3 className="font-medium">No conversations found</h3>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

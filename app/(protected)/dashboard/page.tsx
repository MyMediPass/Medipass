"use client"

import type React from "react"

import Link from "next/link"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pill,
  Calendar,
  MessageSquare,
  Bot,
  AlertCircle,
  Info,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FriendlyChat } from "@/components/FriendlyChat"

export default function Dashboard() {
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: "Lisinopril",
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

  // Mock API status
  const isOfflineMode = false
  const chatError = null

  const handleToggleMedication = (id: number) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med)))
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
                            className="lucide lucide-check mr-1 h-4 w-4"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          Taken
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
                  Powered by Claude
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Get quick answers to your health questions</CardDescription>
            {isOfflineMode && (
              <Alert className="mt-2">
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
                  {"An error occurred while connecting to the AI service."}
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            <FriendlyChat
              initialMessages={[
                {
                  id: "1",
                  role: "assistant",
                  content: "Hello! I'm MediPass, your AI health assistant. How can I help you today?",
                }
              ]}
              height="250px"
            />
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

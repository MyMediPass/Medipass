"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "lucide-react"

interface Appointment {
    id: number
    doctor: string
    specialty: string
    date: string
    time: string
    location: string
}

interface UpcomingAppointmentsProps {
    appointments: Appointment[]
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
    return (
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
    )
} 
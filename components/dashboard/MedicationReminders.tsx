"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pill } from "lucide-react"

interface Medication {
    id: number
    name: string
    dosage: string
    time: string
    instructions: string
    taken: boolean
}

interface MedicationRemindersProps {
    initialMedications: Medication[]
}

export function MedicationReminders({ initialMedications }: MedicationRemindersProps) {
    const [medications, setMedications] = useState<Medication[]>(initialMedications)

    const handleToggleMedication = (id: number) => {
        setMedications(medications.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med)))
    }

    return (
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
    )
} 
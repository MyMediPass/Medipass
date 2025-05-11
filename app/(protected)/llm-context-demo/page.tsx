"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildLLMContext, LLMContext } from "@/lib/llm-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LLMContextDemoPage() {
    const [userId, setUserId] = useState("user123")
    const [llmContext, setLlmContext] = useState<LLMContext | null>(null)
    const [activeTab, setActiveTab] = useState("health-notes")
    const [jsonView, setJsonView] = useState(false)

    useEffect(() => {
        const context = buildLLMContext(userId)
        setLlmContext(context)
    }, [userId])

    if (!llmContext) {
        return <div>Loading context...</div>
    }

    const renderSelectedData = () => {
        if (jsonView) {
            let dataToRender = {}

            switch (activeTab) {
                case "health-notes":
                    dataToRender = llmContext.healthNotes
                    break
                case "health-vitals":
                    dataToRender = llmContext.healthVitals
                    break
                case "historical-vitals":
                    dataToRender = llmContext.historicalVitalData
                    break
                case "family-history":
                    dataToRender = llmContext.familyHistory
                    break
                case "medications":
                    dataToRender = llmContext.medications
                    break
                case "all":
                    dataToRender = llmContext
                    break
                default:
                    dataToRender = {}
            }

            return (
                <pre className="bg-slate-100 p-4 rounded-md overflow-auto h-[50vh]">
                    {JSON.stringify(dataToRender, null, 2)}
                </pre>
            )
        }

        switch (activeTab) {
            case "health-notes":
                return (
                    <div className="space-y-4">
                        {llmContext.healthNotes.map((note) => (
                            <Card key={note.id}>
                                <CardHeader>
                                    <CardTitle>{note.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {note.date.toLocaleDateString()} • {note.tags.join(", ")}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <p>{note.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )

            case "health-vitals":
                return (
                    <div className="space-y-4">
                        {llmContext.healthVitals.map((vital) => (
                            <Card key={vital.id}>
                                <CardHeader>
                                    <CardTitle>{vital.type}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {vital.date} • {vital.time}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        Values:{" "}
                                        {vital.values.systolic
                                            ? `${vital.values.systolic}/${vital.values.diastolic}`
                                            : vital.values.value}
                                    </p>
                                    <p>Status: {vital.status}</p>
                                    <p>Notes: {vital.notes}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )

            case "family-history":
                return (
                    <div className="space-y-4">
                        {llmContext.familyHistory.map((member) => (
                            <Card key={member.id}>
                                <CardHeader>
                                    <CardTitle>
                                        {member.name} ({member.relationship})
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {member.deceased ? `Deceased at age ${member.deceasedAge}` : `Age: ${member.age}`}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <h3 className="font-medium mb-2">Conditions:</h3>
                                    <ul className="list-disc pl-5">
                                        {member.conditions.map((condition) => (
                                            <li key={condition.id}>
                                                {condition.name} - {condition.severity} (diagnosed at age {condition.diagnosisAge})
                                                {condition.notes && <p className="text-sm ml-2">{condition.notes}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )

            case "medications":
                return (
                    <div className="space-y-4">
                        {llmContext.medications.map((med) => (
                            <Card key={med.id}>
                                <CardHeader>
                                    <CardTitle>
                                        {med.name} {med.dosage}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {med.frequency} • {med.status}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <p>Purpose: {med.purpose}</p>
                                    <p>Instructions: {med.instructions}</p>
                                    <p>Prescribed by: {med.prescribedBy}</p>
                                    <p>Started: {med.startDate}</p>
                                    {med.endDate && <p>Ended: {med.endDate}</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )

            case "all":
            default:
                return (
                    <div className="space-y-2">
                        <p>Select a specific data category or toggle to JSON view to see all data.</p>
                        <Button onClick={() => setJsonView(true)}>View All Data as JSON</Button>
                    </div>
                )
        }
    }

    return (
        <div className="container py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">LLM Context Demo</h1>
                <p className="text-muted-foreground">
                    This page demonstrates how the buildLLMContext function collects all user data
                </p>
            </div>

            <div className="flex justify-between">
                <div className="flex gap-4 items-center">
                    <div>
                        <p className="text-sm mb-1">User ID:</p>
                        <Select value={userId} onValueChange={setUserId}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select User" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user123">User 123</SelectItem>
                                <SelectItem value="user456">User 456</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setJsonView(!jsonView)}
                    >
                        {jsonView ? "Formatted View" : "JSON View"}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="health-notes">Health Notes</TabsTrigger>
                    <TabsTrigger value="health-vitals">Health Vitals</TabsTrigger>
                    <TabsTrigger value="family-history">Family History</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="all">All Data</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                    {renderSelectedData()}
                </TabsContent>
            </Tabs>
        </div>
    )
} 
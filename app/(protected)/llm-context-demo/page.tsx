"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildLLMContext, LLMContext } from "@/lib/llm-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function LLMContextDemoPage() {
    const [userId, setUserId] = useState("user123")
    const [llmContext, setLlmContext] = useState<LLMContext | null>(null)
    const [activeTab, setActiveTab] = useState("profile")
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
                case "profile":
                    dataToRender = llmContext.profile
                    break
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
            case "profile":
                return (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-sm font-medium">Name:</div>
                                    <div>{llmContext.profile.name}</div>

                                    <div className="text-sm font-medium">Age:</div>
                                    <div>{llmContext.profile.age}</div>

                                    <div className="text-sm font-medium">Gender:</div>
                                    <div>{llmContext.profile.gender}</div>

                                    <div className="text-sm font-medium">Date of Birth:</div>
                                    <div>{llmContext.profile.dateOfBirth}</div>

                                    <div className="text-sm font-medium">Email:</div>
                                    <div>{llmContext.profile.email}</div>

                                    <div className="text-sm font-medium">Phone:</div>
                                    <div>{llmContext.profile.phone}</div>

                                    <div className="text-sm font-medium">Address:</div>
                                    <div>{llmContext.profile.address}</div>

                                    <div className="text-sm font-medium">Primary Physician:</div>
                                    <div>{llmContext.profile.primaryPhysician}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Emergency Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-sm font-medium">Name:</div>
                                    <div>{llmContext.profile.emergencyContact.name}</div>

                                    <div className="text-sm font-medium">Relation:</div>
                                    <div>{llmContext.profile.emergencyContact.relation}</div>

                                    <div className="text-sm font-medium">Phone:</div>
                                    <div>{llmContext.profile.emergencyContact.phone}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>AI Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-sm font-medium">Response Style:</div>
                                    <div>
                                        <Badge variant="outline">{llmContext.profile.aiPreferences.responseStyle}</Badge>
                                    </div>

                                    <div className="text-sm font-medium">Medical Terminology:</div>
                                    <div>
                                        <Badge variant="outline">{llmContext.profile.aiPreferences.medicalTerminologyLevel}</Badge>
                                    </div>

                                    <div className="text-sm font-medium">Reminder Frequency:</div>
                                    <div>
                                        <Badge variant="outline">{llmContext.profile.aiPreferences.reminderFrequency}</Badge>
                                    </div>

                                    <div className="text-sm font-medium">Preferred Topics:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {llmContext.profile.aiPreferences.preferredTopics.map((topic, index) => (
                                            <Badge key={index} variant="secondary">{topic}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )

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
                    <TabsTrigger value="profile">Profile</TabsTrigger>
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
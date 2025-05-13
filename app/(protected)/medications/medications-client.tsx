"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pill, Search, Calendar, Check, Filter, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Medication } from "@/lib/medications" // Import the actual Medication type
import type { User } from "@supabase/supabase-js" // Assuming User type from Supabase

interface MedicationsClientPageProps {
    initialMedications: Medication[];
    user: User | null; // Or your specific User type from lib/auth
}

export default function MedicationsClientPage({ initialMedications, user }: MedicationsClientPageProps) {
    const [medications, setMedications] = useState<Medication[]>(initialMedications)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    // Update medications if initialMedications prop changes (e.g., after adding a new one and revalidating)
    useEffect(() => {
        setMedications(initialMedications);
    }, [initialMedications]);

    if (!user) {
        // This check might be redundant if the parent server component handles it,
        // but good for robustness or if this component were used elsewhere.
        return <div>Loading user data...</div>
    }

    const filteredMedications = medications.filter((medication) => {
        const matchesSearch =
            medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (medication.purpose && medication.purpose.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = statusFilter === "all" || medication.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const activeMedications = filteredMedications.filter((med) => med.status === "active")
    const completedMedications = filteredMedications.filter((med) => med.status === "completed")

    // getRefillStatusColor and getRefillStatusBadge can remain largely the same
    // but ensure they use the Medication type correctly

    const getRefillStatusBadge = (daysUntilRefill: number, status: string) => {
        if (status === "completed") {
            return (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                    Completed
                </Badge>
            )
        }
        if (daysUntilRefill === 0 && status === "active") { // Could be 0 if refillDate is N/A or past
            return (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                    Check Refill
                </Badge>
            )
        }
        if (daysUntilRefill <= 7) {
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                    Refill Soon
                </Badge>
            )
        }
        if (daysUntilRefill <= 14) {
            return (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                    Refill Soon
                </Badge>
            )
        }
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                Refill in {daysUntilRefill} days
            </Badge>
        )
    }

    // TODO: Implement Add Medication Dialog and form submission logic
    // TODO: Implement "Take" button functionality (will likely call a Server Action)

    return (
        <div className="container px-4 md:px-6 py-6 md:py-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Medications</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Track and manage your medications and refills</p>
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1">
                                <Search className="h-3.5 w-3.5" />
                                <Filter className="h-3.5 w-3.5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Search & Filter</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="search" className="text-sm font-medium">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            type="search"
                                            placeholder="Search medications..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="status-filter" className="text-sm font-medium">
                                        Status
                                    </label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger id="status-filter">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Medications</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end">
                                    <DialogClose asChild>
                                        <Button>Apply Filters</Button>
                                    </DialogClose>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {/* TODO: Wire up Add Medication Dialog Trigger */}
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active" className="text-xs">
                        Active Medications ({activeMedications.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs">
                        Completed Medications ({completedMedications.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeMedications.length > 0 ? (
                            activeMedications.map((medication) => (
                                <Card key={medication.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                                                    <Pill className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-medium">
                                                            {medication.name} {medication.dosage}
                                                        </h3>
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {medication.frequency} • {medication.time}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{medication.instructions}</p>
                                                    <p className="text-xs mt-1">
                                                        <span className="text-muted-foreground">Purpose: </span>
                                                        {medication.purpose}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-xs font-medium">Pills Remaining</p>
                                                <p className="text-xs">
                                                    {medication.pillsRemaining} of {medication.totalPills}
                                                </p>
                                            </div>
                                            <Progress value={(medication.pillsRemaining / medication.totalPills) * 100} className="h-2" />

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <p className="text-xs">Refill by: {medication.refillDate}</p>
                                                </div>
                                                {getRefillStatusBadge(medication.daysUntilRefill, medication.status)}
                                            </div>

                                            <div className="mt-3 pt-3 border-t flex justify-end">
                                                {/* TODO: Implement "Take" button server action call */}
                                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Take
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                                <Search className="h-8 w-8 text-muted-foreground mb-4" />
                                <h3 className="font-medium">No active medications found</h3>
                                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters, or add a new medication.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="completed">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedMedications.length > 0 ? (
                            completedMedications.map((medication) => (
                                <Card key={medication.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                                                    <Pill className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-medium">
                                                            {medication.name} {medication.dosage}
                                                        </h3>
                                                        <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                                                            Completed
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {medication.frequency} • {medication.time}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{medication.instructions}</p>
                                                    <p className="text-xs mt-1">
                                                        <span className="text-muted-foreground">Purpose: </span>
                                                        {medication.purpose}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                <p className="text-xs">
                                                    Taken from {medication.startDate} to {medication.endDate || 'current'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                                <Search className="h-8 w-8 text-muted-foreground mb-4" />
                                <h3 className="font-medium">No completed medications found</h3>
                                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
} 
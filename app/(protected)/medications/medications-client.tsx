"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Pill, Search, Calendar, Check, Filter, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Medication, StoredMedicationData } from "@/lib/medications"
import type { User } from "@supabase/supabase-js"
import { handleAddMedication, handleTakeMedication } from "./actions"

interface MedicationsClientPageProps {
    initialMedications: Medication[];
    user: User | null;
}

const initialFormState: StoredMedicationData = {
    name: "",
    dosage: "",
    frequency: "",
    time: "",
    instructions: "",
    refillDate: "",
    status: "active",
    pillsRemaining: 0,
    totalPills: 0,
    prescribedBy: "",
    startDate: "",
    purpose: "",
    endDate: "",
};

export default function MedicationsClientPage({ initialMedications, user }: MedicationsClientPageProps) {
    const [medications, setMedications] = useState<Medication[]>(initialMedications)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newMedicationForm, setNewMedicationForm] = useState<StoredMedicationData>(initialFormState);
    const [formError, setFormError] = useState<string | null>(null);
    const [isPendingAdd, startAddTransition] = useTransition();
    const [alreadyTookSome, setAlreadyTookSome] = useState(false);
    const [isPendingTake, startTakeTransition] = useTransition();
    const [takeError, setTakeError] = useState<Record<number, string | null>>({});

    useEffect(() => {
        setMedications(initialMedications);
    }, [initialMedications]);

    useEffect(() => {
        if (!alreadyTookSome) {
            setNewMedicationForm(prev => ({
                ...prev,
                pillsRemaining: prev.totalPills
            }));
        }
    }, [newMedicationForm.totalPills, alreadyTookSome]);

    if (!user) {
        return <div>Loading user data...</div>
    }

    const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        let { name, value, type } = target;

        let processedValue: string | number = value;
        if (type === 'number' && name !== 'status') {
            processedValue = value === '' ? 0 : parseInt(value, 10);
            if (isNaN(processedValue as number)) processedValue = 0;
        }

        setNewMedicationForm(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleFormSelectChange = (value: string, name: string) => {
        setNewMedicationForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAlreadyTookSomeChange = (checked: boolean | 'indeterminate') => {
        const isChecked = !!checked;
        setAlreadyTookSome(isChecked);
        if (!isChecked) {
            setNewMedicationForm(prev => ({
                ...prev,
                pillsRemaining: prev.totalPills
            }));
        } else {
            setNewMedicationForm(prev => ({ ...prev, pillsRemaining: prev.pillsRemaining }));
        }
    };

    const openAddDialog = () => {
        setNewMedicationForm(initialFormState);
        setAlreadyTookSome(false);
        setFormError(null);
        setIsAddDialogOpen(true);
    };

    const handleAddMedicationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        if (!newMedicationForm.name || !newMedicationForm.startDate) {
            setFormError("Medication name and start date are required.");
            return;
        }

        const dataToSubmit: StoredMedicationData = {
            ...newMedicationForm,
            pillsRemaining: Number(newMedicationForm.pillsRemaining) || 0,
            totalPills: Number(newMedicationForm.totalPills) || 0,
        };

        if (!alreadyTookSome) {
            dataToSubmit.pillsRemaining = dataToSubmit.totalPills;
        }

        startAddTransition(async () => {
            const result = await handleAddMedication(dataToSubmit);
            if (result.success) {
                setIsAddDialogOpen(false);
            } else {
                setFormError(result.error || "An unknown error occurred.");
            }
        });
    };

    const onTakeMedication = (medicationId: number, currentPills: number) => {
        setTakeError(prev => ({ ...prev, [medicationId]: null }));
        if (currentPills <= 0) return;

        startTakeTransition(async () => {
            const result = await handleTakeMedication(medicationId);
            if (!result.success) {
                setTakeError(prev => ({ ...prev, [medicationId]: result.error || "Failed to take medication." }));
            }
        });
    };

    const filteredMedications = medications.filter((medication) => {
        const matchesSearch =
            medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (medication.purpose && medication.purpose.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = statusFilter === "all" || medication.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const activeMedications = filteredMedications.filter((med) => med.status === "active")
    const completedMedications = filteredMedications.filter((med) => med.status === "completed")

    const getRefillStatusBadge = (daysUntilRefill: number, status: string) => {
        if (status === "completed") {
            return (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                    Completed
                </Badge>
            )
        }
        if (daysUntilRefill === 0 && status === "active") {
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
                                    <label htmlFor="search-dialog-input" className="text-sm font-medium">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search-dialog-input"
                                            type="search"
                                            placeholder="Search medications..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="status-filter-select" className="text-sm font-medium">Status</label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger id="status-filter-select">
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
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openAddDialog}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Medication
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Medication</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddMedicationSubmit} className="space-y-4 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                                        <Input id="name" name="name" value={newMedicationForm.name} onChange={handleFormInputChange} placeholder="e.g., Lisinopril" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dosage">Dosage</Label>
                                        <Input id="dosage" name="dosage" value={newMedicationForm.dosage} onChange={handleFormInputChange} placeholder="e.g., 10mg" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="frequency">Frequency</Label>
                                        <Input id="frequency" name="frequency" value={newMedicationForm.frequency} onChange={handleFormInputChange} placeholder="e.g., Once daily" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="time">Time</Label>
                                        <Input id="time" name="time" value={newMedicationForm.time} onChange={handleFormInputChange} placeholder="e.g., 8:00 AM" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instructions">Instructions</Label>
                                    <Textarea id="instructions" name="instructions" value={newMedicationForm.instructions} onChange={handleFormInputChange} placeholder="e.g., Take with breakfast" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">Purpose</Label>
                                        <Input id="purpose" name="purpose" value={newMedicationForm.purpose} onChange={handleFormInputChange} placeholder="e.g., Blood pressure" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="prescribedBy">Prescribed By</Label>
                                        <Input id="prescribedBy" name="prescribedBy" value={newMedicationForm.prescribedBy} onChange={handleFormInputChange} placeholder="e.g., Dr. Smith" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="totalPills">Total Pills in Prescription</Label>
                                        <Input id="totalPills" name="totalPills" type="number" value={newMedicationForm.totalPills || ''} onChange={handleFormInputChange} placeholder="e.g., 30" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pillsRemaining">Pills Currently Remaining</Label>
                                        <Input
                                            id="pillsRemaining"
                                            name="pillsRemaining"
                                            type="number"
                                            value={newMedicationForm.pillsRemaining || ''}
                                            onChange={handleFormInputChange}
                                            placeholder="e.g., 25"
                                            disabled={!alreadyTookSome}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Checkbox
                                        id="alreadyTookSome"
                                        checked={alreadyTookSome}
                                        onCheckedChange={handleAlreadyTookSomeChange}
                                    />
                                    <Label htmlFor="alreadyTookSome" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        I have already taken some doses / Specify custom remaining amount
                                    </Label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                                        <Input id="startDate" name="startDate" type="date" value={newMedicationForm.startDate} onChange={handleFormInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="refillDate">Next Refill Date</Label>
                                        <Input id="refillDate" name="refillDate" type="date" value={newMedicationForm.refillDate} onChange={handleFormInputChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select name="status" value={newMedicationForm.status} onValueChange={(value) => handleFormSelectChange(value, "status")}>
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date (if completed)</Label>
                                        <Input id="endDate" name="endDate" type="date" value={newMedicationForm.endDate} onChange={handleFormInputChange} />
                                    </div>
                                </div>

                                {formError && <p className="text-sm text-red-500">{formError}</p>}

                                <div className="flex justify-end gap-2 pt-2">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isPendingAdd}>
                                        {isPendingAdd ? "Adding..." : "Add Medication"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                                            {takeError[medication.id] && (
                                                <p className="text-xs text-red-500 mt-1">{takeError[medication.id]}</p>
                                            )}
                                            <div className="mt-3 pt-3 border-t flex justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => onTakeMedication(medication.id, medication.pillsRemaining)}
                                                    disabled={isPendingTake || medication.pillsRemaining <= 0}
                                                >
                                                    <Check className="h-3 w-3 mr-1" />
                                                    {isPendingTake ? "Processing..." : "Take"}
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
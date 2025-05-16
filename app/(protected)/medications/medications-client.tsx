"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Pill,
    Search,
    Calendar,
    Check,
    Filter,
    Plus,
    Bell,
    ChevronDown,
    Edit2,
    ArrowUpDown,
    Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Medication, StoredMedicationData } from "@/lib/medications"
import type { User } from "@supabase/supabase-js"
import { handleAddMedication, handleTakeMedication } from "./actions"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MedCard } from "@/components/medications/MedCard"

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
    const [statusFilter, setStatusFilter] = useState("active")
    const [sortPreference, setSortPreference] = useState("refillDate_asc");

    // Dialog and Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentStep, setCurrentStep] = useState(1);
    const [newMedicationForm, setNewMedicationForm] = useState<StoredMedicationData>(initialFormState);
    const [formError, setFormError] = useState<string | null>(null);
    const [isPendingAdd, startAddTransition] = useTransition();
    const [alreadyTookSome, setAlreadyTookSome] = useState(false);
    const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

    // "Take" action state
    const [isPendingTake, startTakeTransition] = useTransition();
    const [takeError, setTakeError] = useState<Record<number, string | null>>({});
    const [takingState, setTakingState] = useState<Record<number, 'idle' | 'pending' | 'success' | 'error'>>({});

    // Medication name suggestions (mocked)
    const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
    const commonMedications = ["Lisinopril", "Metformin", "Amoxicillin", "Atorvastatin", "Levothyroxine", "Amlodipine", "Omeprazole"];

    useEffect(() => {
        setMedications(initialMedications);
    }, [initialMedications]);

    useEffect(() => {
        if (!alreadyTookSome && modalMode === 'add') {
            setNewMedicationForm(prev => ({
                ...prev,
                pillsRemaining: prev.totalPills
            }));
        }
    }, [newMedicationForm.totalPills, alreadyTookSome, modalMode]);

    const userName = useMemo(() => {
        if (!user) return "User";
        return user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
    }, [user]);

    if (!user) {
        return <div className="container px-4 md:px-6 py-6 md:py-10 text-center">Loading user data...</div>
    }

    // --- Form Input Handlers ---
    const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        let { name, value, type } = target;

        let processedValue: string | number = value;
        if (type === 'number' && name !== 'status') {
            processedValue = value === '' ? 0 : parseInt(value, 10);
            if (isNaN(processedValue as number)) processedValue = 0;
        }
        if (name === 'totalPills' || name === 'pillsRemaining') {
            processedValue = Math.max(0, Number(processedValue));
        }

        setNewMedicationForm(prev => ({
            ...prev,
            [name]: processedValue
        }));

        if (name === "name" && value.length > 1) {
            setNameSuggestions(commonMedications.filter(med => med.toLowerCase().includes(value.toLowerCase())));
        } else {
            setNameSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setNewMedicationForm(prev => ({ ...prev, name: suggestion }));
        setNameSuggestions([]);
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
        }
    };

    const resetFormAndCloseModal = () => {
        setIsModalOpen(false);
        setCurrentStep(1);
        setNewMedicationForm(initialFormState);
        setEditingMedication(null);
        setFormError(null);
        setAlreadyTookSome(false);
        setNameSuggestions([]);
    };

    // --- Dialog Openers ---
    const openAddModal = () => {
        setModalMode('add');
        setNewMedicationForm({ ...initialFormState, startDate: new Date().toISOString().split('T')[0] }); // Default start date to today
        setEditingMedication(null);
        setAlreadyTookSome(false);
        setCurrentStep(1);
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (med: Medication) => {
        setModalMode('edit');
        const formData: StoredMedicationData = {
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            time: med.time,
            instructions: med.instructions,
            refillDate: med.refillDate ? new Date(med.refillDate).toISOString().split('T')[0] : "",
            status: med.status,
            pillsRemaining: med.pillsRemaining,
            totalPills: med.totalPills,
            prescribedBy: med.prescribedBy,
            startDate: med.startDate ? new Date(med.startDate).toISOString().split('T')[0] : "",
            purpose: med.purpose,
            endDate: med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : "",
        };
        setNewMedicationForm(formData);
        setEditingMedication(med);
        setAlreadyTookSome(med.pillsRemaining < med.totalPills && med.totalPills > 0);
        setCurrentStep(1); // Start from step 1 for edits too, allows review
        setFormError(null);
        setIsModalOpen(true);
    };

    // --- Action Handlers (Add, Edit, Take) ---
    const handleAddOrEditMedicationSubmit = async () => { // No event needed if called from button
        setFormError(null);

        if (!newMedicationForm.name) {
            setFormError("Medication name is required.");
            setCurrentStep(1); // Go back to step 1 if name is missing
            return;
        }
        if (!newMedicationForm.startDate) {
            setFormError("Start date is required.");
            setCurrentStep(2); // Go back to step 2 if start date is missing
            return;
        }


        const dataToSubmit: StoredMedicationData = {
            ...newMedicationForm,
            pillsRemaining: Number(newMedicationForm.pillsRemaining) || 0,
            totalPills: Number(newMedicationForm.totalPills) || 0,
        };

        if (!alreadyTookSome && modalMode === 'add') { // Only default pillsRemaining on add if not manually set
            dataToSubmit.pillsRemaining = dataToSubmit.totalPills;
        }

        if (dataToSubmit.pillsRemaining > dataToSubmit.totalPills) {
            dataToSubmit.pillsRemaining = dataToSubmit.totalPills;
        }

        startAddTransition(async () => {
            const result = await handleAddMedication(dataToSubmit, editingMedication?.id);
            if (result.success) {
                resetFormAndCloseModal();
                // Re-fetching or optimistic update handled by useEffect on initialMedications or dedicated state
            } else {
                setFormError(result.error || "An unknown error occurred.");
            }
        });
    };

    const onTakeMedication = (medicationId: number, currentPills: number) => {
        setTakeError(prev => ({ ...prev, [medicationId]: null }));
        if (currentPills <= 0) return;

        setTakingState(prev => ({ ...prev, [medicationId]: 'pending' }));

        // Optimistic update:
        setMedications(prevMeds =>
            prevMeds.map(m =>
                m.id === medicationId
                    ? { ...m, pillsRemaining: Math.max(0, m.pillsRemaining - 1) }
                    : m
            )
        );

        startTakeTransition(async () => {
            const result = await handleTakeMedication(medicationId);
            if (result.success) {
                setTakingState(prev => ({ ...prev, [medicationId]: 'success' }));
                // Data will be re-fetched via revalidatePath, or we could update client state more thoroughly
                // For now, the optimistic update handles the immediate UI change.
                // If server returns updated medication, merge it here.
                if (result.medication) {
                    setMedications(prevMeds => prevMeds.map(m => m.id === medicationId ? result.medication! : m));
                }
                setTimeout(() => setTakingState(prev => ({ ...prev, [medicationId]: 'idle' })), 2000); // Reset after 2s
            } else {
                setTakeError(prev => ({ ...prev, [medicationId]: result.error || "Failed to take medication." }));
                setTakingState(prev => ({ ...prev, [medicationId]: 'error' }));
                // Revert optimistic update if needed:
                setMedications(prevMeds =>
                    prevMeds.map(m =>
                        m.id === medicationId
                            ? { ...m, pillsRemaining: currentPills } // Revert to original count
                            : m
                    )
                );
                setTimeout(() => setTakingState(prev => ({ ...prev, [medicationId]: 'idle' })), 3000);
            }
        });
    };

    const nextStep = () => {
        setFormError(null); // Clear previous errors
        if (currentStep === 1 && !newMedicationForm.name) {
            setFormError("Medication name is required to proceed.");
            return;
        }
        if (currentStep === 2 && !newMedicationForm.startDate) {
            setFormError("Start date is required to proceed.");
            return;
        }
        setCurrentStep(s => s + 1);
    };
    const prevStep = () => setCurrentStep(s => s - 1);


    // --- Filtering and Sorting Logic (remains the same) ---
    const sortedAndFilteredMedications = useMemo(() => {
        let items = medications.filter((medication) => {
            const matchesSearch =
                medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (medication.purpose && medication.purpose.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (medication.dosage && medication.dosage.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === "all" || medication.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        const [sortField, sortDirection] = sortPreference.split('_');

        items.sort((a, b) => {
            let valA: any, valB: any;
            if (sortField === 'refillDate') {
                valA = a.refillDate ? new Date(a.refillDate).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
                valB = b.refillDate ? new Date(b.refillDate).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
            } else if (sortField === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else { // Default to startDate or name
                valA = a.startDate ? new Date(a.startDate).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
                valB = b.startDate ? new Date(b.startDate).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            // If primary sort keys are equal, sort by name as a secondary criterion
            if (sortField !== 'name') {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
            }
            return 0;
        });
        return items;
    }, [medications, searchQuery, statusFilter, sortPreference]);


    // --- Sub-Components for Page Layout ---
    const PageHeader = () => (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <Button onClick={openAddModal} size="lg" className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-5 w-5 mr-2" />
                Track a New Medication
            </Button>
        </div>
    );

    const AllMedicationsSection = () => (
        <section>
            <div className="flex flex-col sm:flex-row gap-2 items-center mb-4">
                <h2 className="text-2xl font-semibold whitespace-nowrap text-gray-700">All Your Medications</h2>
                <div className="relative w-full sm:w-auto sm:flex-grow sm:max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name, purpose..."
                        className="pl-8 w-full h-10 rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px] h-10 rounded-md border-gray-300 focus:border-primary focus:ring-primary">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortPreference} onValueChange={setSortPreference}>
                    <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-md border-gray-300 focus:border-primary focus:ring-primary">
                        <ArrowUpDown className="h-4 w-4 mr-2 opacity-50" />
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="refillDate_asc">Refill Date (Soonest)</SelectItem>
                        <SelectItem value="refillDate_desc">Refill Date (Latest)</SelectItem>
                        <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                        <SelectItem value="startDate_desc">Start Date (Newest)</SelectItem>
                        <SelectItem value="startDate_asc">Start Date (Oldest)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {sortedAndFilteredMedications.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-lg shadow-sm">
                    <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-xl text-gray-700">No medications found.</h3>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters, or add a new one!</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedAndFilteredMedications.map((med) => {
                    const currentTakeState = takingState[med.id] || 'idle';
                    const currentTakeError = takeError[med.id] || null;

                    return (
                        <MedCard
                            key={med.id}
                            med={med}
                            onTakeMedication={onTakeMedication}
                            onEditMedication={openEditModal}
                            takingState={currentTakeState}
                            takeError={currentTakeError}
                            isPendingTake={isPendingTake}
                        />
                    );
                })}
            </div>
        </section>
    );

    // --- Main Render ---
    return (
        <div className="min-h-screen bg-background dark:bg-slate-900">
            <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-10">
                <PageHeader />
                <AllMedicationsSection />

                {/* Add/Edit Medication Dialog (Multi-Step) */}
                <Dialog open={isModalOpen} onOpenChange={(isOpen) => { if (!isOpen) resetFormAndCloseModal(); }}>
                    <DialogContent className="sm:max-w-lg p-0 overflow-hidden"> {/* Changed max-width and padding */}
                        <DialogHeader className="p-6 pb-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                {modalMode === 'edit' ? "Edit Medication" : "Add New Medication"}
                            </DialogTitle>
                            {/* Progress Dots for steps */}
                            <div className="flex justify-center space-x-2 pt-2">
                                {[1, 2, 3].map(step => (
                                    <div key={step} className={cn(
                                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                        currentStep === step ? "bg-primary scale-125" : "bg-gray-300 dark:bg-gray-600",
                                        currentStep > step ? "bg-primary" : ""
                                    )}></div>
                                ))}
                            </div>
                        </DialogHeader>

                        <div className="p-6 space-y-5"> {/* Changed to space-y-5 */}
                            {formError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center">{formError}</p>}

                            {/* Step 1: Name and Dosage */}
                            {currentStep === 1 && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="space-y-1.5 relative">
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Medication Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name" name="name"
                                            value={newMedicationForm.name}
                                            onChange={handleFormInputChange}
                                            placeholder="e.g., Lisinopril, Advil"
                                            required
                                            className="h-10 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        {nameSuggestions.length > 0 && (
                                            <Card className="absolute z-10 w-full mt-1 border-gray-300 shadow-lg dark:bg-gray-700 dark:border-gray-600">
                                                <CardContent className="p-2 max-h-40 overflow-y-auto">
                                                    {nameSuggestions.map(suggestion => (
                                                        <Button
                                                            key={suggestion}
                                                            variant="ghost"
                                                            className="w-full justify-start text-left h-8 px-2 dark:text-gray-200 dark:hover:bg-gray-600"
                                                            onClick={() => handleSuggestionClick(suggestion)}
                                                        >
                                                            {suggestion}
                                                        </Button>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dosage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Dosage (Optional)</Label>
                                        <Input
                                            id="dosage" name="dosage"
                                            value={newMedicationForm.dosage}
                                            onChange={handleFormInputChange}
                                            placeholder="e.g., 10mg, 1 pill, 2 puffs"
                                            className="h-10 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Schedule */}
                            {currentStep === 2 && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="frequency" className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</Label>
                                        <Input id="frequency" name="frequency" value={newMedicationForm.frequency} onChange={handleFormInputChange} placeholder="e.g., Once daily, Twice a week" className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="time" className="text-sm font-medium text-gray-700 dark:text-gray-300">Time / When to Take (Optional)</Label>
                                        <Input id="time" name="time" value={newMedicationForm.time} onChange={handleFormInputChange} placeholder="e.g., 8:00 AM, With food, Before bed" className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date <span className="text-red-500">*</span></Label>
                                        <Input id="startDate" name="startDate" type="date" value={newMedicationForm.startDate} onChange={handleFormInputChange} required className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Pills & Other Details (Optional) */}
                            {currentStep === 3 && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="totalPills" className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Pills in Rx</Label>
                                            <Input id="totalPills" name="totalPills" type="number" min="0" value={newMedicationForm.totalPills || ''} onChange={handleFormInputChange} placeholder="e.g., 30" className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="pillsRemaining" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pills Remaining</Label>
                                            <Input
                                                id="pillsRemaining" name="pillsRemaining" type="number" min="0"
                                                value={newMedicationForm.pillsRemaining || ''}
                                                onChange={handleFormInputChange}
                                                placeholder="e.g., 25"
                                                disabled={!alreadyTookSome}
                                                className="h-10 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-1">
                                        <Checkbox
                                            id="alreadyTookSome"
                                            checked={alreadyTookSome}
                                            onCheckedChange={handleAlreadyTookSomeChange}
                                            className="dark:border-gray-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label htmlFor="alreadyTookSome" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {modalMode === 'edit' ? "Current pill count is custom" : "Specify current pill count"}
                                        </Label>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="refillDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Refill Date</Label>
                                        <Input id="refillDate" name="refillDate" type="date" value={newMedicationForm.refillDate} onChange={handleFormInputChange} className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="purpose" className="text-sm font-medium text-gray-700 dark:text-gray-300">Purpose (Optional)</Label>
                                        <Input id="purpose" name="purpose" value={newMedicationForm.purpose} onChange={handleFormInputChange} placeholder="e.g., Blood pressure, Pain relief" className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="instructions" className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes (Optional)</Label>
                                        <Textarea id="instructions" name="instructions" value={newMedicationForm.instructions} onChange={handleFormInputChange} placeholder="e.g., Take with food, Avoid grapefruit" className="min-h-[60px] dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    {/* Status and End Date for Edit mode primarily */}
                                    {modalMode === 'edit' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                                                <Select name="status" value={newMedicationForm.status} onValueChange={(value) => handleFormSelectChange(value, "status")}>
                                                    <SelectTrigger id="status" className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date (if completed)</Label>
                                                <Input id="endDate" name="endDate" type="date" value={newMedicationForm.endDate} onChange={handleFormInputChange} disabled={newMedicationForm.status !== 'completed'} className="h-10 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={resetFormAndCloseModal}
                                className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                            <div className="flex gap-2">
                                {currentStep > 1 && (
                                    <Button type="button" variant="outline" onClick={prevStep} className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Back
                                    </Button>
                                )}
                                {currentStep < 3 ? (
                                    <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90 text-white">
                                        Next
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleAddOrEditMedicationSubmit} disabled={isPendingAdd} className="bg-green-600 hover:bg-green-700 text-white">
                                        {isPendingAdd ? (modalMode === 'edit' ? "Saving..." : "Adding...") : (modalMode === 'edit' ? "Save Changes" : "Add Medication")}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
} 
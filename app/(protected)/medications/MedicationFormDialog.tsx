"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Medication } from "./medications-client"; // Assuming Medication type is exported or re-defined

// Type for form data within the dialog
export type MedicationFormData = Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>;

const initialDialogFormState: MedicationFormData = {
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
    startDate: new Date().toISOString().split('T')[0],
    purpose: "",
    endDate: "",
};

// Define common medications for suggestions internally or pass as prop
const commonMedications = ["Lisinopril", "Metformin", "Amoxicillin", "Atorvastatin", "Levothyroxine", "Amlodipine", "Omeprazole"];


interface MedicationFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    mode: 'add' | 'edit';
    initialData?: MedicationFormData; // For editing
    userId?: string; // Needed if transactions happen here, or for context
    onSubmitAction: (data: MedicationFormData, medicationId?: string) => Promise<void>; // Parent handles the actual submission
    isSubmitting: boolean; // Controlled by parent
}

export default function MedicationFormDialog({
    isOpen,
    onOpenChange,
    mode,
    initialData,
    userId, // Not directly used if onSubmitAction handles all DB logic including userId
    onSubmitAction,
    isSubmitting
}: MedicationFormDialogProps) {
    const [formState, setFormState] = useState<MedicationFormData>(initialDialogFormState);
    const [formError, setFormError] = useState<string | null>(null);
    const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormState(initialData);
        } else {
            // Ensure startDate is today for 'add' mode, status is active
            setFormState({ ...initialDialogFormState, startDate: new Date().toISOString().split('T')[0], status: "active" });
        }
    }, [isOpen, mode, initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let processedValue: string | number = value;
        if (type === 'number' && name !== 'status') {
            processedValue = value === '' ? 0 : parseInt(value, 10);
            if (isNaN(processedValue as number)) processedValue = 0;
        }
        if (name === 'totalPills' || name === 'pillsRemaining') {
            processedValue = Math.max(0, Number(processedValue));
        }

        setFormState(prev => ({ ...prev, [name]: processedValue }));

        if (name === "name" && value.length > 1) {
            setNameSuggestions(commonMedications.filter(med => med.toLowerCase().includes(value.toLowerCase())));
        } else {
            setNameSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setFormState(prev => ({ ...prev, name: suggestion }));
        setNameSuggestions([]);
    };

    const handleSelectChange = (value: string, name: string) => {
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setFormError(null);
        if (!formState.name) {
            setFormError("Medication name is required.");
            return;
        }
        if (!formState.startDate) {
            setFormError("Start date is required.");
            return;
        }

        // Prepare data for submission
        const dataToSubmit: MedicationFormData = {
            ...formState,
            pillsRemaining: Number(formState.pillsRemaining) || 0,
            totalPills: Number(formState.totalPills) || 0,
            status: formState.status || "active",
        };

        if ((Number(dataToSubmit.totalPills) || 0) > 0 &&
            (Number(dataToSubmit.pillsRemaining) || 0) > (Number(dataToSubmit.totalPills) || 0)) {
            dataToSubmit.pillsRemaining = dataToSubmit.totalPills;
        }

        // If adding and pillsRemaining wasn't touched, default it to totalPills
        if (mode === 'add' &&
            (Number(dataToSubmit.totalPills) || 0) > 0 &&
            (formState.pillsRemaining === 0 || formState.pillsRemaining === undefined)) {
            dataToSubmit.pillsRemaining = dataToSubmit.totalPills;
        }

        const medicationIdToEdit = mode === 'edit' ? (initialData as any)?.id : undefined; // Risky 'as any', better to pass id if editing

        try {
            await onSubmitAction(dataToSubmit, medicationIdToEdit);
            // onOpenChange(false); // Parent should control this on successful submission
        } catch (error: any) {
            setFormError(error.message || "An error occurred during submission.");
        }
    };

    const handleClose = () => {
        setFormError(null);
        setNameSuggestions([]);
        // Reset form state if dialog is closed without submitting,
        // useEffect also handles resetting when isOpen changes or mode changes
        setFormState({ ...initialDialogFormState, startDate: new Date().toISOString().split('T')[0], status: "active" });
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange /* Consider handleClose here if direct state reset is needed */}>
            <DialogContent className="sm:max-w-lg" onEscapeKeyDown={handleClose} onPointerDownOutside={handleClose}>
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Add New Medication' : 'Edit Medication'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {formError && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{formError}</p>}

                    <div className="space-y-2">
                        <Label htmlFor="name">Medication Name <span className="text-red-500">*</span></Label>
                        <Input id="name" name="name" value={formState.name || ""} onChange={handleInputChange} placeholder="e.g., Amoxicillin" />
                        {nameSuggestions.length > 0 && (
                            <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
                                {nameSuggestions.map(s => (
                                    <button key={s} onClick={() => handleSuggestionClick(s)} className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dosage">Dosage</Label>
                            <Input id="dosage" name="dosage" value={formState.dosage || ""} onChange={handleInputChange} placeholder="e.g., 250mg" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <Input id="frequency" name="frequency" value={formState.frequency || ""} onChange={handleInputChange} placeholder="e.g., Twice a day" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input id="time" name="time" type="time" value={formState.time || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea id="instructions" name="instructions" value={formState.instructions || ""} onChange={handleInputChange} placeholder="e.g., Take with food" />
                    </div>

                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 pt-2 border-t mt-2">Prescription & Supply</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                            <Input id="startDate" name="startDate" type="date" value={formState.startDate || ""} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date (Optional)</Label>
                            <Input id="endDate" name="endDate" type="date" value={formState.endDate || ""} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalPills">Total Pills (Optional)</Label>
                            <Input id="totalPills" name="totalPills" type="number" value={formState.totalPills || ''} onChange={handleInputChange} placeholder="e.g., 30" min="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pillsRemaining">Pills Remaining (Optional)</Label>
                            <Input id="pillsRemaining" name="pillsRemaining" type="number" value={formState.pillsRemaining || ''} onChange={handleInputChange} placeholder="e.g., 15" min="0" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="refillDate">Refill Date (Optional)</Label>
                            <Input id="refillDate" name="refillDate" type="date" value={formState.refillDate || ""} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" value={formState.status || "active"} onValueChange={(value) => handleSelectChange(value, "status")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="paused">Paused</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 pt-2 border-t mt-2">Additional Information</h3>
                    <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose (Optional)</Label>
                        <Input id="purpose" name="purpose" value={formState.purpose || ""} onChange={handleInputChange} placeholder="e.g., For infection" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="prescribedBy">Prescribed By (Optional)</Label>
                        <Input id="prescribedBy" name="prescribedBy" value={formState.prescribedBy || ""} onChange={handleInputChange} placeholder="e.g., Dr. Smith" />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {mode === 'add' ? 'Add Medication' : 'Save Changes'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 
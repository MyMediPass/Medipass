"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { StoredMedicationData } from "@/lib/medications";
import { cn } from "@/lib/utils";

const commonMedications = ["Lisinopril", "Metformin", "Amoxicillin", "Atorvastatin", "Levothyroxine", "Amlodipine", "Omeprazole"];

export const initialFormStateForCreate: StoredMedicationData = {
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
    startDate: new Date().toISOString().split('T')[0], // Default to today for new entries
    purpose: "",
    endDate: "",
};

interface MedCreateFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    mode: 'add' | 'edit';
    initialData?: StoredMedicationData | null;
    onSubmit: (data: StoredMedicationData) => Promise<void>; // Make it simple, parent handles transition & error
    isPendingSubmit: boolean;
    externalFormError: string | null;
    clearExternalFormError: () => void;
}

export function MedCreateForm({
    isOpen,
    onOpenChange,
    mode,
    initialData,
    onSubmit,
    isPendingSubmit,
    externalFormError,
    clearExternalFormError
}: MedCreateFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formState, setFormState] = useState<StoredMedicationData>(initialData || initialFormStateForCreate);
    const [internalFormError, setInternalFormError] = useState<string | null>(null);
    const [alreadyTookSome, setAlreadyTookSome] = useState(false);
    const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            const dataToLoad = initialData ? { ...initialData } : { ...initialFormStateForCreate, startDate: new Date().toISOString().split('T')[0] };
            setFormState(dataToLoad);
            setAlreadyTookSome(mode === 'edit' && dataToLoad.totalPills > 0 && dataToLoad.pillsRemaining < dataToLoad.totalPills);
            setCurrentStep(1);
            setInternalFormError(null);
            clearExternalFormError(); // Clear server-side errors when dialog opens/data changes
        } else {
            // Reset suggestions when dialog closes
            setNameSuggestions([]);
        }
    }, [isOpen, initialData, mode, clearExternalFormError]);

    useEffect(() => {
        // Auto-fill pillsRemaining if not 'alreadyTookSome' and in 'add' mode or totalPills changes
        if (!alreadyTookSome && formState.totalPills >= 0) { // Allow 0 total pills
            setFormState(prev => ({ ...prev, pillsRemaining: prev.totalPills }));
        }
    }, [formState.totalPills, alreadyTookSome]);

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

        setFormState(prev => ({
            ...prev,
            [name]: processedValue
        }));

        if (name === "name" && value.length > 1) {
            setNameSuggestions(commonMedications.filter(med => med.toLowerCase().includes(value.toLowerCase())));
        } else {
            setNameSuggestions([]);
        }
        if (internalFormError) setInternalFormError(null); // Clear internal error on input change
        if (externalFormError) clearExternalFormError();
    };

    const handleSuggestionClick = (suggestion: string) => {
        setFormState(prev => ({ ...prev, name: suggestion }));
        setNameSuggestions([]);
        if (internalFormError) setInternalFormError(null);
        if (externalFormError) clearExternalFormError();
    };

    const handleFormSelectChange = (value: string, name: string) => {
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
        if (internalFormError) setInternalFormError(null);
        if (externalFormError) clearExternalFormError();
    };

    const handleAlreadyTookSomeChange = (checked: boolean | 'indeterminate') => {
        const isChecked = !!checked;
        setAlreadyTookSome(isChecked);
        if (!isChecked) {
            setFormState(prev => ({
                ...prev,
                pillsRemaining: prev.totalPills
            }));
        }
    };

    const resetFormAndClose = () => {
        onOpenChange(false);
        // State reset is handled by useEffect on isOpen change
    };

    const nextStep = () => {
        setInternalFormError(null);
        if (externalFormError) clearExternalFormError();

        if (currentStep === 1 && !formState.name) {
            setInternalFormError("Medication name is required to proceed.");
            return;
        }
        if (currentStep === 2 && !formState.startDate) {
            setInternalFormError("Start date is required to proceed.");
            return;
        }
        setCurrentStep(s => s + 1);
    };
    const prevStep = () => setCurrentStep(s => s - 1);

    const handleSubmit = async () => {
        setInternalFormError(null);
        if (externalFormError) clearExternalFormError();

        if (!formState.name) {
            setInternalFormError("Medication name is required.");
            setCurrentStep(1);
            return;
        }
        if (!formState.startDate) {
            setInternalFormError("Start date is required.");
            setCurrentStep(2);
            return;
        }

        let dataToSubmit: StoredMedicationData = {
            ...formState,
            pillsRemaining: Number(formState.pillsRemaining) || 0,
            totalPills: Number(formState.totalPills) || 0,
        };

        if (!alreadyTookSome) { // If checkbox is unticked, always sync remaining with total
            dataToSubmit.pillsRemaining = dataToSubmit.totalPills;
        }

        if (dataToSubmit.pillsRemaining > dataToSubmit.totalPills) {
            setInternalFormError("Pills remaining cannot exceed total pills.");
            setCurrentStep(3); // Assuming this is where pills are set
            return;
        }

        await onSubmit(dataToSubmit);
        // Parent will handle closing on success or displaying externalFormError
    };

    const displayError = internalFormError || externalFormError;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden dark:bg-gray-850">
                <DialogHeader className="p-6 pb-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        {mode === 'edit' ? "Edit Medication" : "Add New Medication"}
                    </DialogTitle>
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

                <div className="p-6 space-y-5">
                    {displayError && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md text-center">{displayError}</p>}

                    {/* Step 1: Name and Dosage */}
                    {currentStep === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="space-y-1.5 relative">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Medication Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name" name="name"
                                    value={formState.name}
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
                                    value={formState.dosage}
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
                                <Input id="frequency" name="frequency" value={formState.frequency} onChange={handleFormInputChange} placeholder="e.g., Once daily, Twice a week" className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="time" className="text-sm font-medium text-gray-700 dark:text-gray-300">Time / When to Take (Optional)</Label>
                                <Input id="time" name="time" value={formState.time} onChange={handleFormInputChange} placeholder="e.g., 8:00 AM, With food, Before bed" className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date <span className="text-red-500">*</span></Label>
                                <Input id="startDate" name="startDate" type="date" value={formState.startDate} onChange={handleFormInputChange} required className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Pills & Other Details (Optional) */}
                    {currentStep === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="totalPills" className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Pills in Rx</Label>
                                    <Input id="totalPills" name="totalPills" type="number" min="0" value={formState.totalPills || ''} onChange={handleFormInputChange} placeholder="e.g., 30" className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="pillsRemaining" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pills Remaining</Label>
                                    <Input
                                        id="pillsRemaining" name="pillsRemaining" type="number" min="0"
                                        value={formState.pillsRemaining || ''}
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
                                    {mode === 'edit' ? "Current pill count is custom" : "Specify current pill count"}
                                </Label>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="refillDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Refill Date</Label>
                                <Input id="refillDate" name="refillDate" type="date" value={formState.refillDate} onChange={handleFormInputChange} className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="purpose" className="text-sm font-medium text-gray-700 dark:text-gray-300">Purpose (Optional)</Label>
                                <Input id="purpose" name="purpose" value={formState.purpose} onChange={handleFormInputChange} placeholder="e.g., Blood pressure, Pain relief" className="h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="instructions" className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes (Optional)</Label>
                                <Textarea id="instructions" name="instructions" value={formState.instructions} onChange={handleFormInputChange} placeholder="e.g., Take with food, Avoid grapefruit" className="min-h-[60px] dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            {/* Status and End Date for Edit mode primarily */}
                            {mode === 'edit' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                                        <Select name="status" value={formState.status} onValueChange={(value) => handleFormSelectChange(value, "status")}>
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
                                        <Input id="endDate" name="endDate" type="date" value={formState.endDate} onChange={handleFormInputChange} disabled={formState.status !== 'completed'} className="h-10 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" />
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
                        onClick={resetFormAndClose}
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
                            <Button type="button" onClick={handleSubmit} disabled={isPendingSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                                {isPendingSubmit ? (mode === 'edit' ? "Saving..." : "Adding...") : (mode === 'edit' ? "Save Changes" : "Add Medication")}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 
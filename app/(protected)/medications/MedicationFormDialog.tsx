"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import type { Medication } from "./medications-client";
import { cn } from "@/lib/utils";

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

const commonMedications = ["Lisinopril", "Metformin", "Amoxicillin", "Atorvastatin", "Levothyroxine", "Amlodipine", "Omeprazole"];

interface MedicationFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    mode: 'add' | 'edit';
    initialData?: MedicationFormData & { id?: string }; // Pass ID for edit mode submissions
    onSubmitAction: (data: MedicationFormData, medicationId?: string) => Promise<void>;
    isSubmitting: boolean;
}

const TOTAL_STEPS = 3;

export default function MedicationFormDialog({
    isOpen,
    onOpenChange,
    mode,
    initialData,
    onSubmitAction,
    isSubmitting
}: MedicationFormDialogProps) {
    const [formState, setFormState] = useState<MedicationFormData>(initialDialogFormState);
    const [formError, setFormError] = useState<string | null>(null); // For general/submission errors
    const [stepError, setStepError] = useState<string | null>(null); // For step-specific validation errors
    const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1); // Reset to step 1 when dialog opens
            setFormError(null);
            setStepError(null);
            if (mode === 'edit' && initialData) {
                setFormState(initialData);
            } else {
                setFormState({ ...initialDialogFormState, startDate: new Date().toISOString().split('T')[0], status: "active" });
            }
        } else {
            // Optional: Reset form when dialog is fully closed, though useEffect above handles re-opening
            // setFormState({ ...initialDialogFormState, startDate: new Date().toISOString().split('T')[0], status: "active" });
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

    const validateStep = (step: number): boolean => {
        setStepError(null); // Clear previous step error
        if (step === 1 && !formState.name) {
            setStepError("Medication name is required.");
            return false;
        }
        if (step === 2 && !formState.startDate) {
            setStepError("Start date is required.");
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < TOTAL_STEPS) {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    const prevStep = () => {
        setStepError(null);
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return; // Validate current step before submission if it's the last
        setFormError(null);

        const dataToSubmit: MedicationFormData = {
            ...formState,
            pillsRemaining: Number(formState.pillsRemaining) || 0,
            totalPills: Number(formState.totalPills) || 0,
            status: formState.status || "active",
        };
        if ((Number(dataToSubmit.totalPills) || 0) > 0 && (Number(dataToSubmit.pillsRemaining) || 0) > (Number(dataToSubmit.totalPills) || 0)) {
            dataToSubmit.pillsRemaining = dataToSubmit.totalPills;
        }
        if (mode === 'add' && (Number(dataToSubmit.totalPills) || 0) > 0 && (formState.pillsRemaining === 0 || formState.pillsRemaining === undefined)) {
            dataToSubmit.pillsRemaining = dataToSubmit.totalPills;
        }
        const medicationIdToEdit = mode === 'edit' ? initialData?.id : undefined;

        try {
            await onSubmitAction(dataToSubmit, medicationIdToEdit);
            // Success, parent will close dialog via onOpenChange or by setting isOpen to false
        } catch (error: any) {
            setFormError(error.message || "An error occurred during submission.");
        }
    };

    const handleDialogClose = () => {
        // Reset state when dialog is closed via X button or overlay click
        setCurrentStep(1);
        setFormError(null);
        setStepError(null);
        setNameSuggestions([]);
        setFormState({ ...initialDialogFormState, startDate: new Date().toISOString().split('T')[0], status: "active" });
        onOpenChange(false);
    }

    const StepIndicator = () => (
        <div className="flex justify-center space-x-2 mb-4">
            {[...Array(TOTAL_STEPS)].map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                        currentStep === i + 1 ? "bg-primary scale-125" : "bg-gray-300 dark:bg-gray-600",
                        currentStep > i + 1 ? "bg-primary" : ""
                    )}
                />
            ))}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg" onEscapeKeyDown={handleDialogClose} onPointerDownOutside={handleDialogClose}>
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Add New Medication' : 'Edit Medication'}</DialogTitle>
                    <StepIndicator />
                </DialogHeader>
                <div className="grid gap-4 py-1 max-h-[60vh] overflow-y-auto px-2">
                    {formError && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md mb-2">{formError}</p>}
                    {stepError && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md mb-2">{stepError}</p>}

                    {currentStep === 1 && (
                        <div className="space-y-3 animate-fadeIn">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Step 1: Basic Information</h3>
                            <div className="space-y-2">
                                <Label htmlFor="name">Medication Name <span className="text-red-500">*</span></Label>
                                <Input id="name" name="name" value={formState.name || ""} onChange={handleInputChange} placeholder="e.g., Amoxicillin" />
                                {nameSuggestions.length > 0 && (
                                    <div className="border rounded-md mt-1 max-h-32 overflow-y-auto">
                                        {nameSuggestions.map(s => (
                                            <button key={s} onClick={() => handleSuggestionClick(s)} className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                <Textarea id="instructions" name="instructions" value={formState.instructions || ""} onChange={handleInputChange} placeholder="e.g., Take with food" rows={2} />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-3 animate-fadeIn">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Step 2: Prescription & Supply</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                                    <Input id="startDate" name="startDate" type="date" value={formState.startDate || ""} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date (Optional)</Label>
                                    <Input id="endDate" name="endDate" type="date" value={formState.endDate || ""} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="totalPills">Total Pills (Optional)</Label>
                                    <Input id="totalPills" name="totalPills" type="number" value={formState.totalPills || ''} onChange={handleInputChange} placeholder="e.g., 30" min="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pillsRemaining">Pills Remaining (Optional)</Label>
                                    <Input id="pillsRemaining" name="pillsRemaining" type="number" value={formState.pillsRemaining || ''} onChange={handleInputChange} placeholder="e.g., 15" min="0" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="refillDate">Refill Date (Optional)</Label>
                                    <Input id="refillDate" name="refillDate" type="date" value={formState.refillDate || ""} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select name="status" value={formState.status || "active"} onValueChange={(value) => handleSelectChange(value, "status")}>
                                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="paused">Paused</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-3 animate-fadeIn">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Step 3: Additional Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="purpose">Purpose (Optional)</Label>
                                <Input id="purpose" name="purpose" value={formState.purpose || ""} onChange={handleInputChange} placeholder="e.g., For infection" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prescribedBy">Prescribed By (Optional)</Label>
                                <Input id="prescribedBy" name="prescribedBy" value={formState.prescribedBy || ""} onChange={handleInputChange} placeholder="e.g., Dr. Smith" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t mt-4 px-6 pb-4">
                    <Button variant="outline" onClick={prevStep} disabled={isSubmitting || currentStep === 1} className={cn(currentStep === 1 && "invisible")} >
                        <ArrowLeft size={16} className="mr-1" /> Back
                    </Button>
                    {currentStep < TOTAL_STEPS ? (
                        <Button onClick={nextStep} disabled={isSubmitting}>
                            Next <ArrowRight size={16} className="ml-1" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {mode === 'add' ? 'Add Medication' : 'Save Changes'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 
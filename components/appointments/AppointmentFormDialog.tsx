"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, isValid as isValidDate } from 'date-fns';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Appointment, AppointmentFormData } from "@/app/(protected)/visits/page"; // Assuming types are exported from here

// Zod Schema for validation
// Splitting schema for multi-step validation if needed, or a single schema
const appointmentFormSchema = z.object({
    doctor: z.string().min(1, "Doctor name is required"),
    specialty: z.string().min(1, "Specialty is required"),
    date: z.string().min(1, "Date is required"), // Stored as ISO string "yyyy-MM-dd"
    time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),

    location: z.string().min(1, "Location is required"),
    address: z.string().optional(),
    notes: z.string().optional(), // Purpose of visit

    type: z.string().min(1, "Visit type is required"),
    status: z.string().min(1, "Status is required"), // "upcoming", "completed", "cancelled"
    summary: z.string().optional(),
});

// This type will be used by react-hook-form
export type DialogFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    mode: "add" | "edit";
    initialData?: AppointmentFormData & { id?: string }; // Pass full Appointment for editing, map it internally
    onSubmitAction: (data: DialogFormData, appointmentId?: string) => Promise<void>;
    userId: string; // Needed to associate the appointment
}

const APPOINTMENT_TYPES = [
    { value: "physical", label: "Physical Exam" },
    { value: "followup", label: "Follow-up" },
    { value: "checkup", label: "Check-up" },
    { value: "telehealth", label: "Telehealth" },
    { value: "specialist", label: "Specialist Visit" },
    { value: "dental", label: "Dental Visit" },
    { value: "therapy", label: "Therapy Session" },
    { value: "other", label: "Other" },
];

const APPOINTMENT_STATUSES = [
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "rescheduled", label: "Rescheduled" }, // Consider if needed
];


export function AppointmentFormDialog({
    isOpen,
    onOpenChange,
    mode,
    initialData,
    onSubmitAction,
    userId,
}: AppointmentFormDialogProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, startTransition] = useTransition();
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm<DialogFormData>({
        resolver: zodResolver(appointmentFormSchema),
        defaultValues: {
            doctor: "",
            specialty: "",
            date: "",
            time: "",
            location: "",
            address: "",
            notes: "",
            type: "",
            status: "upcoming", // Default for new appointments
            summary: "",
        },
    });

    const appointmentIdToEdit = mode === "edit" ? initialData?.id : undefined;

    useEffect(() => {
        if (mode === "edit" && initialData) {
            form.reset({
                doctor: initialData.doctor || "",
                specialty: initialData.specialty || "",
                date: initialData.date ? format(parseISO(initialData.date), 'yyyy-MM-dd') : "", // Ensure date is string for form
                time: initialData.time || "",
                location: initialData.location || "",
                address: initialData.address || "",
                notes: initialData.notes || "",
                type: initialData.type || "",
                status: initialData.status || "upcoming",
                summary: initialData.summary || "",
            });
        } else {
            form.reset({ // Default for 'add' mode
                doctor: "",
                specialty: "",
                date: "",
                time: "",
                location: "",
                address: "",
                notes: "",
                type: "",
                status: "upcoming",
                summary: "",
            });
        }
        setCurrentStep(1); // Reset to first step when dialog opens or mode changes
        setFormError(null);
    }, [isOpen, mode, initialData, form]);

    const totalSteps = 3;

    const handleNextStep = async () => {
        let fieldsToValidate: (keyof DialogFormData)[] = [];
        if (currentStep === 1) fieldsToValidate = ['doctor', 'specialty', 'date', 'time'];
        if (currentStep === 2) fieldsToValidate = ['location']; // Address and notes are optional

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onSubmit = (data: DialogFormData) => {
        setFormError(null);
        startTransition(async () => {
            try {
                await onSubmitAction(data, appointmentIdToEdit);
                form.reset();
                onOpenChange(false); // Close dialog on success
            } catch (error) {
                console.error("Submission error:", error);
                setFormError(error instanceof Error ? error.message : "An unexpected error occurred.");
            }
        });
    };

    const StepIndicator = () => (
        <div className="flex justify-center space-x-2 mb-6">
            {[...Array(totalSteps)].map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        "w-2 h-2 rounded-full",
                        currentStep === index + 1 ? "bg-primary" : "bg-gray-300"
                    )}
                />
            ))}
        </div>
    );


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "add" ? "Add New Appointment" : "Edit Appointment"}
                    </DialogTitle>
                </DialogHeader>
                <StepIndicator />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-grow overflow-y-auto px-1 py-2">
                        {formError && <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">{formError}</p>}

                        {/* Step 1: Core Information */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="doctor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Doctor Name*</FormLabel>
                                            <FormControl><Input placeholder="e.g., Dr. Jane Doe" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="specialty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Specialty*</FormLabel>
                                            <FormControl><Input placeholder="e.g., Cardiology" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date*</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(parseISO(field.value), "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? parseISO(field.value) : undefined}
                                                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) && !initialData} // Allow past dates if editing
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Time*</FormLabel>
                                                <FormControl><Input type="time" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location & Purpose */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location/Clinic Name*</FormLabel>
                                            <FormControl><Input placeholder="e.g., City General Hospital" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl><Textarea placeholder="e.g., 123 Main St, Anytown, USA" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes / Purpose of Visit</FormLabel>
                                            <FormControl><Textarea placeholder="e.g., Annual check-up, follow-up for X..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Step 3: Classification & Status */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Visit Type*</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select visit type" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {APPOINTMENT_TYPES.map(type => (
                                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status*</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {APPOINTMENT_STATUSES.map(status => (
                                                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {form.watch("status") === "completed" && (
                                    <FormField
                                        control={form.control}
                                        name="summary"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Visit Summary</FormLabel>
                                                <FormControl><Textarea placeholder="e.g., Doctor's findings, follow-up instructions..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}
                    </form>
                </Form>
                <DialogFooter className="mt-auto pt-4 border-t">
                    <div className="flex w-full justify-between items-center">
                        <div>
                            {currentStep > 1 && (
                                <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isSubmitting}>
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="ghost" disabled={isSubmitting}>Cancel</Button>
                            </DialogClose>
                            {currentStep < totalSteps && (
                                <Button type="button" onClick={handleNextStep} disabled={isSubmitting}>
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            )}
                            {currentStep === totalSteps && (
                                <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    {mode === "add" ? "Add Appointment" : "Save Changes"}
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 
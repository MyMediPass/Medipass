'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import { Loader2, Save } from 'lucide-react';

// Zod Schema for validation
const healthNoteFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
    content: z.string().optional(), // Content is optional but can be extensive
    tags: z.string().optional(), // Comma-separated tags, will be processed into an array
});

// This type will be used by react-hook-form
export type HealthNoteDialogFormData = z.infer<typeof healthNoteFormSchema>;

// This type is what the page expects for submission (with tags as array)
export type HealthNoteSubmitData = {
    id?: string;
    title: string;
    content: string;
    tags?: string[];
};

interface HealthNoteFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    mode: "add" | "edit";
    initialData?: HealthNoteSubmitData; // Note: tags here are already an array
    onSubmitAction: (data: HealthNoteSubmitData, noteId?: string) => Promise<void>;
    userId: string; // For potential future use or consistency
}

export function HealthNoteFormDialog({
    isOpen,
    onOpenChange,
    mode,
    initialData,
    onSubmitAction,
    userId, // Currently unused, but good to have for consistency
}: HealthNoteFormDialogProps) {
    const [isSubmitting, startTransition] = useTransition();
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm<HealthNoteDialogFormData>({
        resolver: zodResolver(healthNoteFormSchema),
        defaultValues: {
            title: "",
            content: "",
            tags: "",
        },
    });

    const noteIdToEdit = mode === "edit" ? initialData?.id : undefined;

    useEffect(() => {
        if (isOpen) {
            form.reset(); // Clear previous validation errors
            setFormError(null);
            if (mode === "edit" && initialData) {
                form.reset({
                    title: initialData.title || "",
                    content: initialData.content || "",
                    tags: initialData.tags ? initialData.tags.join(", ") : "",
                });
            } else {
                form.reset({
                    title: "",
                    content: "",
                    tags: "",
                });
            }
        }
    }, [isOpen, mode, initialData, form]);

    const processTags = (tagsString?: string): string[] => {
        if (!tagsString) return [];
        return tagsString.split(",").map(tag => tag.trim()).filter(tag => tag !== "");
    };

    const onSubmit = (data: HealthNoteDialogFormData) => {
        setFormError(null);
        startTransition(async () => {
            try {
                const submitData: HealthNoteSubmitData = {
                    title: data.title,
                    content: data.content || "", // Ensure content is string even if undefined
                    tags: processTags(data.tags),
                };
                await onSubmitAction(submitData, noteIdToEdit);
                form.reset();
                onOpenChange(false); // Close dialog on success
            } catch (error) {
                console.error("Submission error:", error);
                setFormError(error instanceof Error ? error.message : "An unexpected error occurred.");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (isSubmitting) return; // Prevent closing while submitting
            onOpenChange(open);
        }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "add" ? "Add New Health Note" : "Edit Health Note"}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        {formError && (
                            <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">
                                {formError}
                            </p>
                        )}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title*</FormLabel>
                                    <FormControl><Input placeholder="e.g., Morning Headache Analysis" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your observations, feelings, or any details..."
                                            rows={8}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl><Input placeholder="e.g., headache, stress, medication side-effect" {...field} /></FormControl>
                                    <FormDescription>Comma-separated list of tags.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="ghost" disabled={isSubmitting}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {mode === "add" ? "Add Note" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 
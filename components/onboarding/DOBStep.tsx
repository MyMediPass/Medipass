"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { OnboardingData } from "@/app/onboarding/page";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DOBStepProps {
    data: OnboardingData;
    updateFormData: (data: Partial<OnboardingData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function DOBStep({ data, updateFormData, onNext, onPrev }: DOBStepProps) {
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
        data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
    );
    const [popoverOpen, setPopoverOpen] = useState(false);

    const handleNext = () => {
        if (!dateOfBirth) {
            alert("Please select your date of birth.");
            return;
        }
        updateFormData({ dateOfBirth: format(dateOfBirth, "yyyy-MM-dd") });
        onNext();
    };

    const handleDateSelect = (date: Date | undefined) => {
        setDateOfBirth(date);
        setPopoverOpen(false); // Close popover on date selection
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6 flex flex-col items-center py-6"
        >
            <h2 className="text-3xl font-semibold text-center text-primary">When were you born?</h2>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full max-w-sm justify-start text-left font-normal text-lg p-3 h-auto font-serif rounded-md shadow-sm",
                            !dateOfBirth && "text-muted-foreground"
                        )}
                        onClick={() => setPopoverOpen(true)}
                    >
                        <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={handleDateSelect}
                        defaultMonth={dateOfBirth || new Date(new Date().setFullYear(new Date().getFullYear() - 25))}
                        captionLayout="dropdown"
                        fromYear={1920}
                        toYear={new Date().getFullYear() - 10}
                    />
                </PopoverContent>
            </Popover>
            <div className="flex justify-between w-full max-w-sm pt-4">
                <Button onClick={onPrev} variant="outline">
                    Back
                </Button>
                <Button onClick={handleNext}>
                    Next
                </Button>
            </div>
        </motion.div>
    );
} 
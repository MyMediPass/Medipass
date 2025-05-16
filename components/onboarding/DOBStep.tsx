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
            <h2 className="text-3xl font-semibold text-center text-green-400">When were you born?</h2>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full max-w-sm justify-start text-left font-normal text-lg p-3 h-auto font-serif",
                            "bg-slate-700 border border-slate-600 hover:bg-slate-600/80 text-slate-100 hover:text-white focus:ring-0 focus:border-green-500 rounded-md shadow-sm",
                            !dateOfBirth && "text-slate-400"
                        )}
                        onClick={() => setPopoverOpen(true)}
                    >
                        <CalendarIcon className="mr-2 h-5 w-5 text-slate-300" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700 shadow-xl" align="center">
                    <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={handleDateSelect}
                        // initialFocus // Can cause issues with controlled popover
                        defaultMonth={dateOfBirth || new Date(new Date().setFullYear(new Date().getFullYear() - 25))} // Default to 25 years ago if no date
                        captionLayout="dropdown-buttons" // Reverted to dropdown-buttons as per Shadcn's default for better year/month nav
                        fromYear={1920}
                        toYear={new Date().getFullYear() - 10}
                        className="bg-slate-800 text-slate-100 p-2 rounded-md"
                        classNames={{
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-base font-medium text-green-400 font-serif", // Use serif for consistency
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-slate-300 hover:bg-slate-700 rounded-md",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 text-slate-100",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-700 rounded-md transition-colors",
                            day_selected: "bg-green-500 text-white hover:bg-green-600 focus:bg-green-600 rounded-md",
                            day_today: "bg-slate-700 text-green-400 rounded-md",
                            day_outside: "text-slate-500 opacity-50",
                            day_disabled: "text-slate-600 opacity-50",
                            day_range_middle: "aria-selected:bg-slate-700 aria-selected:text-slate-100",
                            day_hidden: "invisible",
                            dropdown_icon: "ml-1 w-4 h-4 text-green-400",
                            dropdown: "rdp-dropdown bg-slate-700 border-slate-600 text-slate-100 rounded-md py-1 px-2 text-sm font-serif focus:ring-green-500", // Added focus ring to dropdown
                            dropdown_month: "rdp-dropdown_month",
                            dropdown_year: "rdp-dropdown_year",
                        }}
                    />
                </PopoverContent>
            </Popover>
            <div className="flex justify-between w-full max-w-sm pt-4">
                <Button onClick={onPrev} variant="outline" className="bg-transparent hover:bg-slate-700 border-slate-500 text-slate-300 hover:text-white">
                    Back
                </Button>
                <Button onClick={handleNext} className="bg-green-500 hover:bg-green-600 text-white">
                    Next
                </Button>
            </div>
        </motion.div>
    );
} 
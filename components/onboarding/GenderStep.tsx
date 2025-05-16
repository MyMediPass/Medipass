"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "@/app/onboarding/page";

interface GenderStepProps {
    data: OnboardingData;
    updateFormData: (data: Partial<OnboardingData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

const genderOptions = [
    { id: "male", label: "Male" },
    { id: "female", label: "Female" },
    { id: "prefer-not-to-say", label: "Prefer not to say" },
    { id: "other", label: "Other" },
];

export default function GenderStep({ data, updateFormData, onNext, onPrev }: GenderStepProps) {
    const [gender, setGender] = useState(data.gender || "");

    const handleNext = () => {
        if (gender.trim() === "") {
            alert("Please select an option.");
            return;
        }
        updateFormData({ gender });
        onNext();
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6 flex flex-col items-center py-6"
        >
            <h2 className="text-3xl font-semibold text-center text-primary">What is your gender?</h2>
            <RadioGroup
                value={gender}
                onValueChange={setGender}
                className="space-y-3 pt-2 w-full max-w-sm"
            >
                {genderOptions.map((option) => (
                    <Label
                        key={option.id}
                        htmlFor={option.id}
                        className="flex items-center space-x-3 p-4 rounded-md hover:bg-accent transition-colors cursor-pointer border hover:border-primary has-[input:checked]:border-primary has-[input:checked]:bg-accent"
                    >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <span className="text-lg text-foreground font-serif">
                            {option.label}
                        </span>
                    </Label>
                ))}
            </RadioGroup>
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
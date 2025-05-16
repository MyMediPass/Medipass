"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/app/onboarding/page";

interface AgeStepProps {
    data: OnboardingData;
    updateFormData: (data: Partial<OnboardingData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function AgeStep({ data, updateFormData, onNext, onPrev }: AgeStepProps) {
    const [age, setAge] = useState<string>(data.age ? String(data.age) : "");

    const handleNext = () => {
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
            alert("Please enter a valid age.");
            return;
        }
        updateFormData({ age: ageNum });
        onNext();
    };

    useEffect(() => {
        const inputElement = document.getElementById("age-input");
        if (inputElement) {
            inputElement.focus();
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6 flex flex-col items-center py-6"
        >
            <h2 className="text-3xl font-semibold text-center text-primary">How old are you?</h2>
            <Input
                id="age-input"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="w-full max-w-sm text-lg p-3 font-serif focus:ring-0 rounded-md shadow-sm"
                onKeyPress={(e) => {
                    if (e.key === "Enter") {
                        handleNext();
                    }
                }}
            />
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
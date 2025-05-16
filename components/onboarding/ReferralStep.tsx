"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "@/app/onboarding/page";

interface ReferralStepProps {
    data: OnboardingData;
    updateFormData: (data: Partial<OnboardingData>) => void;
    onNext: () => void; // This will be the final submit action
    onPrev: () => void;
}

const referralOptions = [
    { id: "friend_family", label: "Friend or Family" },
    { id: "social_media", label: "Social Media (Facebook, Instagram, etc.)" },
    { id: "search_engine", label: "Search Engine (Google, Bing, etc.)" },
    { id: "doctor_clinic", label: "Doctor or Clinic Referral" },
    { id: "advertisement", label: "Online Advertisement" },
    { id: "other", label: "Other" },
];

export default function ReferralStep({ data, updateFormData, onNext, onPrev }: ReferralStepProps) {
    const [referralSource, setReferralSource] = useState(data.referralSource || "");

    const handleFinish = () => {
        if (referralSource.trim() === "" && !referralOptions.find(opt => opt.id === "other")) { // Only enforce if 'Other' isn't an implicit fallback
            // If you want to make it mandatory, uncomment the alert
            // alert("Please select how you heard about us.");
            // return;
        }
        updateFormData({ referralSource });
        onNext(); // This will call handleSubmit on the main page
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6 flex flex-col items-center py-6"
        >
            <h2 className="text-3xl font-semibold text-center text-green-400">How did you hear about us?</h2>
            <p className="text-sm text-center text-slate-300">(Optional, but helps us a lot!)</p>
            <RadioGroup
                value={referralSource}
                onValueChange={setReferralSource}
                className="space-y-3 pt-2 w-full max-w-sm"
            >
                {referralOptions.map((option) => (
                    <Label
                        key={option.id}
                        htmlFor={`referral-${option.id}`}
                        className="flex items-center space-x-3 p-4 bg-slate-700 rounded-md hover:bg-slate-600/70 transition-colors cursor-pointer border border-slate-600 hover:border-green-500 has-[input:checked]:border-green-500 has-[input:checked]:bg-green-900/30"
                    >
                        <RadioGroupItem value={option.id} id={`referral-${option.id}`} className="border-slate-500 text-green-500 focus:ring-green-500 focus:ring-offset-slate-800 data-[state=checked]:border-green-500" />
                        <span className="text-lg text-slate-100 font-serif">
                            {option.label}
                        </span>
                    </Label>
                ))}
            </RadioGroup>
            {/* Optionally, add a text input if 'Other' is selected */}
            {/* {referralSource === 'other' && ( <Input placeholder="Please specify..." /> )} */}
            <div className="flex justify-between w-full max-w-sm pt-4">
                <Button onClick={onPrev} variant="outline" className="bg-transparent hover:bg-slate-700 border-slate-500 text-slate-300 hover:text-white">
                    Back
                </Button>
                <Button onClick={handleFinish} className="bg-green-500 hover:bg-green-600 text-white">
                    Finish Onboarding
                </Button>
            </div>
        </motion.div>
    );
} 
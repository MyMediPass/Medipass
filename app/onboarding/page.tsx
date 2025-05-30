"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/profile"; // Assuming Profile type is in lib/profile.ts
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import NameStep from "@/components/onboarding/NameStep";
import AgeStep from "@/components/onboarding/AgeStep";
import GenderStep from "@/components/onboarding/GenderStep";
import DOBStep from "@/components/onboarding/DOBStep";
import ReferralStep from "@/components/onboarding/ReferralStep";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";

// Placeholder for the action to save the profile
// import { saveProfile } from "@/lib/actions/onboardingActions"; 

export type OnboardingData = {
    name?: string;
    age?: number;
    gender?: string;
    dateOfBirth?: string;
    referralSource?: string;
};

const TOTAL_STEPS = 6;
const STEP_NAMES = [
    "Welcome",
    "Your Name",
    "Your Age",
    "Gender Identity",
    "Date of Birth",
    "How You Found Us"
];

// TODO: Add a progress bar component here later
// const TOTAL_STEPS = 6; // Welcome (1) + Name (2) + Age (3) + Gender (4) + DOB (5) + Referral (6)

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<OnboardingData>({});
    const router = useRouter();

    const nextStep = () => setStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev));
    const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

    const updateFormData = (data: Partial<OnboardingData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const handleSubmit = async () => {
        // Construct the Profile object
        // For now, we'll use some defaults for fields not collected in this basic flow
        const profileData: Profile = {
            id: "", // This will be generated by Supabase or we can use user.id
            name: formData.name || "Anonymous",
            age: formData.age || 0,
            gender: formData.gender || "Not specified",
            dateOfBirth: formData.dateOfBirth || "",
            email: "", // This should come from the authenticated user
            phone: "", // This should come from the authenticated user or collected
            address: "", // Default or collect later
            primaryPhysician: "", // Default or collect later
            emergencyContact: { // Default or collect later
                name: "",
                relation: "",
                phone: ""
            },
            aiPreferences: { // Default preferences
                responseStyle: "concise",
                medicalTerminologyLevel: "basic",
                reminderFrequency: "medium",
                preferredTopics: ["general wellness"]
            },
            // Add referralSource if you want to store it in the Profile object
            // customFields: { referralSource: formData.referralSource } // Example
        };

        try {
            // Placeholder: Get current user (e.g., from useAuth or similar)
            // const user = { id: "test-user-id", email: "test@example.com" }; 
            // if (!user) throw new Error("User not authenticated");

            // profileData.id = user.id; // Or let DB generate it and use user_id column
            // profileData.email = user.email;

            // await saveProfile(user.id, profileData); // saveProfile will handle Supabase
            console.log("Profile to save:", profileData);
            // For now, just log and redirect
            alert("Onboarding complete! Profile data: " + JSON.stringify(profileData));
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("There was an error completing your onboarding. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-10 sm:pt-16">
            <div className="w-full max-w-xl mb-8">
                {step > 0 && <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} stepNames={STEP_NAMES} />}
            </div>

            <div className="w-full max-w-xl p-6 sm:p-8 space-y-8 bg-card text-card-foreground rounded-xl shadow-2xl">
                {step === 1 && <WelcomeStep onNext={nextStep} />}
                {step === 2 && <NameStep data={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
                {step === 3 && <AgeStep data={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
                {step === 4 && <GenderStep data={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
                {step === 5 && <DOBStep data={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
                {step === 6 && <ReferralStep data={formData} updateFormData={updateFormData} onNext={handleSubmit} onPrev={prevStep} />}
            </div>
        </div>
    );
} 
"use client";

interface OnboardingProgressProps {
    currentStep: number;
    totalSteps: number;
    stepNames: string[];
}

export default function OnboardingProgress({ currentStep, totalSteps, stepNames }: OnboardingProgressProps) {
    return (
        <div className="w-full mb-8 px-4 sm:px-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">
                    Step {currentStep} of {totalSteps}: {stepNames[currentStep - 1]}
                </span>
                <span className="text-sm font-medium text-primary">{((currentStep / totalSteps) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
                <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
            </div>
        </div>
    );
} 
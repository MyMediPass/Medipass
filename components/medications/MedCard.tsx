"use client";

import { Pill, Check, Edit2, Bell, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Medication } from "@/lib/medications"; // Assuming Medication type is here

// PillProgressIcon (extracted from medications-client.tsx)
const PillProgressIcon = ({ percentage, pillsLeft, totalPills }: { percentage: number, pillsLeft: number, totalPills: number }) => {
    const filledSegments = Math.max(0, Math.min(5, Math.round(percentage / 20)));
    const segments = Array(5).fill(0);

    if (totalPills === 0 && pillsLeft === 0) {
        return <Pill className="h-5 w-5 text-gray-400" />;
    }
    if (pillsLeft > 0 && totalPills > 0 && percentage === 0 && pillsLeft < totalPills) {
        return (
            <div className="relative h-5 w-5">
                <Pill className="h-5 w-5 text-gray-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-[2px] w-[calc(100%-6px)] bg-primary/70 rounded-full" style={{ marginLeft: '3px', marginRight: '3px' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-5 w-5">
            <Pill className={cn("h-5 w-5", percentage > 0 ? "text-primary/30" : "text-gray-300")} />
            {percentage > 0 && (
                <div
                    className="absolute inset-0 overflow-hidden rounded-full"
                    style={{ clipPath: `inset(0 ${100 - percentage}% 0 0)` }}
                >
                    <Pill className="h-5 w-5 text-primary" />
                </div>
            )}
        </div>
    );
};


interface MedCardProps {
    med: Medication;
    onTakeMedication: (medicationId: number, currentPills: number) => void;
    onEditMedication: (medication: Medication) => void;
    takingState: 'idle' | 'pending' | 'success' | 'error';
    takeError: string | null;
    isPendingTake: boolean; // General pending state for take action group
}

export function MedCard({ med, onTakeMedication, onEditMedication, takingState, takeError, isPendingTake }: MedCardProps) {
    const pillsPercentage = med.totalPills > 0 ? (med.pillsRemaining / med.totalPills) * 100 : (med.status === 'active' && med.totalPills === 0 ? 5 : 0);
    const refillSoon = med.daysUntilRefill != null && med.daysUntilRefill <= 7 && med.status === 'active';
    const refillVerySoon = med.daysUntilRefill != null && med.daysUntilRefill <= 3 && med.status === 'active';
    const currentTakeState = takingState || 'idle';

    return (
        <Card className="flex flex-col bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <PillProgressIcon percentage={pillsPercentage} pillsLeft={med.pillsRemaining} totalPills={med.totalPills} />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {med.name} {med.dosage && <span className="text-sm text-gray-600 dark:text-gray-400 font-normal">{med.dosage}</span>}
                        </h3>
                    </div>
                    <Badge variant={med.status === "active" ? "default" : "outline"}
                        className={cn(
                            med.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
                            "text-xs font-medium py-1 px-2.5"
                        )}>
                        {med.status.charAt(0).toUpperCase() + med.status.slice(1)}
                    </Badge>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5 mb-4 flex-grow">
                    {(med.instructions || med.frequency || med.time) && (
                        <p><span className="font-medium text-gray-700 dark:text-gray-200">Schedule:</span> {med.instructions || ""} {med.frequency && `(${med.frequency}${med.time ? ` - ${med.time}` : ''})`.trim()}</p>
                    )}
                    {med.purpose && <p><span className="font-medium text-gray-700 dark:text-gray-200">Purpose:</span> {med.purpose}</p>}
                </div>

                <div className="text-sm mb-4 space-y-1">
                    <p className="text-gray-700 dark:text-gray-300">
                        Pills: <span className="font-semibold text-primary">{med.pillsRemaining}</span> of <span className="font-semibold text-gray-800 dark:text-gray-100">{med.totalPills > 0 ? med.totalPills : 'N/A'}</span> left
                    </p>
                    {med.refillDate && med.status === 'active' && (
                        <p className={cn(
                            "font-medium",
                            refillVerySoon ? "text-red-600 dark:text-red-400" : refillSoon ? "text-orange-500 dark:text-orange-400" : "text-gray-700 dark:text-gray-300"
                        )}>
                            Refill due: {new Date(med.refillDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {med.daysUntilRefill != null && med.daysUntilRefill >= 0 && <span className="text-gray-500 dark:text-gray-400 font-normal"> (in {med.daysUntilRefill} days)</span>}
                        </p>
                    )}
                    {med.status === 'completed' && med.endDate && (
                        <p className="text-gray-600 dark:text-gray-400">Completed: {new Date(med.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    )}
                </div>

                {takeError && (
                    <p className="text-xs text-red-500 dark:text-red-400 mb-2 text-center">{takeError}</p>
                )}

                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    <Button
                        variant={currentTakeState === 'success' ? 'ghost' : "default"}
                        size="sm"
                        className={cn(
                            "h-9 text-sm flex-1 transition-all duration-200",
                            currentTakeState === 'pending' ? "bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700" :
                                currentTakeState === 'success' ? "bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700" :
                                    currentTakeState === 'error' ? "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700" :
                                        "bg-primary hover:bg-primary/90 text-white"
                        )}
                        onClick={() => onTakeMedication(med.id, med.pillsRemaining)}
                        disabled={isPendingTake || med.pillsRemaining <= 0 || med.status === 'completed' || currentTakeState === 'pending' || currentTakeState === 'success'}
                    >
                        {currentTakeState === 'pending' && <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Processing...</>}
                        {currentTakeState === 'success' && <><Check className="h-4 w-4 mr-1.5" />Taken!</>}
                        {currentTakeState === 'error' && <>Error! Try Again</>}
                        {currentTakeState === 'idle' && (med.pillsRemaining > 0 ? <><Check className="h-4 w-4 mr-1.5" />Take Dose</> : <>No Pills Left</>)}
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 text-sm flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500" onClick={() => onEditMedication(med)}>
                        <Edit2 className="h-4 w-4 mr-1.5" /> Edit
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500" disabled={med.status === 'completed'}>
                                    <Bell className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-gray-900 dark:text-gray-200">
                                <p>Set refill reminder (future)</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
} 
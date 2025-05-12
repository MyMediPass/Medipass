import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import React from "react"

export interface AIInterpretationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    resultName: string
    interpretation: string
}

export const AIInterpretationDialog: React.FC<AIInterpretationDialogProps> = ({
    open,
    onOpenChange,
    resultName,
    interpretation,
}) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>AI Interpretation: {resultName}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <div className="flex items-start gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                        <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm">{interpretation}</p>
                    </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                    <p className="text-xs text-yellow-800 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                        >
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        This AI interpretation is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider about your test results.
                    </p>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
)

export default AIInterpretationDialog 
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp } from "lucide-react"
import React from "react"

export interface TestResultCardProps {
    test_name: string
    result_value: string | number
    units?: string | null
    flag?: string | null
    reference_range?: string | null
    getStatusIndicator: (flag: string | null | undefined) => React.ReactNode
    onShowTrend: () => void
    onShowAIInterpretation: () => void
}

export const TestResultCard: React.FC<TestResultCardProps> = ({
    test_name,
    result_value,
    units,
    flag,
    reference_range,
    getStatusIndicator,
    onShowTrend,
    onShowAIInterpretation,
}) => (
    <div className="border rounded-lg p-4 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-2 mb-2">
            <div className="text-primary">
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
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M8 13h2" />
                    <path d="M8 17h2" />
                    <path d="M14 13h2" />
                    <path d="M14 17h2" />
                </svg>
            </div>
            <h3 className="text-sm font-medium">{test_name}</h3>
        </div>
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{result_value}</span>
                    {units && <span className="text-sm text-muted-foreground">{units}</span>}
                </div>
                {reference_range && (
                    <p className="text-xs text-muted-foreground">Range: {reference_range}</p>
                )}
            </div>
            <div className="flex flex-col gap-2">
                {getStatusIndicator(flag)}
                <div className="flex gap-2 mt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={onShowTrend}
                    >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Compare Trend
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={onShowAIInterpretation}
                    >
                        <Brain className="h-3 w-3 mr-1" />
                        AI Interpretation
                    </Button>
                </div>
            </div>
        </div>
    </div>
)

export default TestResultCard 
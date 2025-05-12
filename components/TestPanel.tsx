import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, FileText } from "lucide-react"
import TestResultCard from "@/components/TestResultCard"
import React from "react"

export interface TestResult {
    test_name: string
    result_value: string | number
    units?: string | null
    flag?: string | null
    reference_range?: string | null
    is_calculated?: boolean
}

export interface TestPanelProps {
    id: string
    name: string
    reported_at?: string | null
    lab_name?: string | null
    status?: string
    test_results: TestResult[]
    expanded: boolean
    onToggle: () => void
    getStatusIndicator: (flag: string | null | undefined) => React.ReactNode
    onShowTrend: (testName: string, unit: string) => void
    onShowAIInterpretation: (testName: string) => void
}

export const TestPanel: React.FC<TestPanelProps> = ({
    id,
    name,
    reported_at,
    lab_name,
    status,
    test_results,
    expanded,
    onToggle,
    getStatusIndicator,
    onShowTrend,
    onShowAIInterpretation,
}) => (
    <Card key={id} className={expanded ? "border-primary shadow-md" : ""}>
        <CardHeader className="pb-2 cursor-pointer" onClick={onToggle}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">{name}</CardTitle>
                </div>
                <ChevronRight
                    className={`h-5 w-5 transition-transform ${expanded ? "rotate-90" : ""}`}
                />
            </div>
            {reported_at && (
                <p className="text-xs text-muted-foreground">
                    Reported: {new Date(reported_at).toLocaleDateString()}
                </p>
            )}
        </CardHeader>
        {expanded && (
            <CardContent>
                <div className="space-y-4 pt-2">
                    {test_results.map((result, index) => (
                        <TestResultCard
                            key={index}
                            test_name={result.test_name}
                            result_value={result.result_value}
                            units={result.units}
                            flag={result.flag}
                            reference_range={result.reference_range}
                            getStatusIndicator={getStatusIndicator}
                            onShowTrend={() => onShowTrend(result.test_name, result.units || "")}
                            onShowAIInterpretation={() => onShowAIInterpretation(result.test_name)}
                        />
                    ))}
                </div>
            </CardContent>
        )}
    </Card>
)

export default TestPanel 
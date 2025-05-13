import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import React from "react"

export interface TrendDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    resultName: string
    resultUnit: string
    resultData: { date: string; value: number; isSynthetic?: boolean }[]
}

export const TrendDialog: React.FC<TrendDialogProps> = ({
    open,
    onOpenChange,
    resultName,
    resultUnit,
    resultData,
}) => {
    // Split data into real and synthetic for display purposes
    const realData = resultData.filter(item => !item.isSynthetic);
    const hasSyntheticData = resultData.some(item => item.isSynthetic);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{resultName} Trend</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={resultData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis
                                    domain={["auto", "auto"]}
                                    label={{ value: resultUnit, angle: -90, position: "insideLeft" }}
                                />
                                <Tooltip
                                    formatter={(value, name, props) => {
                                        const isSynthetic = props.payload.isSynthetic;
                                        return [`${value} ${resultUnit}${isSynthetic ? ' (estimated)' : ''}`, resultName];
                                    }}
                                    labelFormatter={(label) => `Date: ${label}`}
                                    contentStyle={{ backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    activeDot={{ r: 8, fill: "#2563eb" }}
                                    name={resultName}
                                    dot={(props) => {
                                        const { cx, cy, payload } = props;
                                        if (payload.isSynthetic) {
                                            return (
                                                <svg x={cx - 4} y={cy - 4} width={8} height={8}>
                                                    <circle cx={4} cy={4} r={4} fill="#3b82f6" fillOpacity={0.6} stroke="#1e40af" strokeWidth={1} strokeDasharray="2 2" />
                                                </svg>
                                            );
                                        }
                                        return (
                                            <svg x={cx - 4} y={cy - 4} width={8} height={8}>
                                                <circle cx={4} cy={4} r={4} fill="#3b82f6" stroke="#1e40af" strokeWidth={1} />
                                            </svg>
                                        );
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium">Trend Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                            This chart shows how your {resultName.toLowerCase()} has changed over time.
                            {resultData.length > 1 && (() => {
                                const firstValue = resultData[0].value
                                const lastValue = resultData[resultData.length - 1].value
                                const change = (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
                                const direction = lastValue > firstValue ? "increased" : lastValue < firstValue ? "decreased" : "remained stable"
                                return ` Your values have ${direction}${direction !== "remained stable" ? ` by ${Math.abs(Number.parseFloat(change))}%` : ""} over this period.`
                            })()}
                        </p>
                        {hasSyntheticData && (
                            <p className="text-sm text-muted-foreground italic">
                                Note: This chart includes estimated historical values based on your current data.
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Tracking these changes helps identify trends and evaluate the effectiveness of treatments or lifestyle changes.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default TrendDialog 
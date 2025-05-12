"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, ChevronRight, TrendingUp, Brain, Loader2, ExternalLink } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

interface TestResult {
  test_name: string
  result_value: string | number
  units: string | null
  flag: string | null
  reference_range: string | null
  is_calculated: boolean
}

interface Panel {
  id: string
  name: string
  reported_at: string | null
  lab_name: string | null
  status: string
  test_results: TestResult[]
  report_id: string
  report_created_at: string
}

interface HistoricalDataPoint {
  created_at: string
  result_value: string | number
}

export default function TestResultsPage() {
  const [panels, setPanels] = useState<Panel[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrendDialog, setShowTrendDialog] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [selectedResultName, setSelectedResultName] = useState("")
  const [selectedResultUnit, setSelectedResultUnit] = useState("")
  const [selectedResultData, setSelectedResultData] = useState<any[]>([])
  const [selectedResultInterpretation, setSelectedResultInterpretation] = useState("")
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set())
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchPanels = async () => {
      try {
        const { data: panels, error } = await supabase
          .from('panels')
          .select(`
            id,
            name,
            reported_at,
            lab_name,
            status,
            test_results (
              test_name,
              result_value,
              units,
              flag,
              reference_range,
              is_calculated
            ),
            report_id,
            lab_reports!inner (
              created_at
            )
          `)
          .order('reported_at', { ascending: false })

        if (error) throw error

        // Transform the data to include report_created_at
        const transformedPanels = panels.map(panel => ({
          ...panel,
          report_created_at: panel.lab_reports.created_at
        }))

        setPanels(transformedPanels)
      } catch (error) {
        console.error('Error fetching panels:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPanels()
  }, [])

  const togglePanel = (panelId: string) => {
    setExpandedPanels(prev => {
      const next = new Set(prev)
      if (next.has(panelId)) {
        next.delete(panelId)
      } else {
        next.add(panelId)
      }
      return next
    })
  }

  const getStatusIndicator = (flag: string | null) => {
    if (!flag) return null

    switch (flag.toLowerCase()) {
      case "h":
      case "high":
        return (
          <div className="flex items-center">
            <div className="text-xs font-medium text-red-600 mr-1">HIGH</div>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-red-400 rounded-full w-14 relative">
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-1/2 right-1 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )
      case "l":
      case "low":
        return (
          <div className="flex items-center">
            <div className="text-xs font-medium text-red-600 mr-1">LOW</div>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-red-400 rounded-full w-2 relative">
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-1/2 left-1 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center">
            <div className="text-xs font-medium text-green-600 mr-1">IN RANGE</div>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-400 rounded-full w-8 relative">
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )
    }
  }

  const handleShowTrend = async (testName: string, unit: string) => {
    try {
      const { data: historicalData, error } = await supabase
        .from('test_results')
        .select('result_value, created_at')
        .eq('test_name', testName)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedData = (historicalData as HistoricalDataPoint[]).map(item => ({
        date: new Date(item.created_at).toLocaleDateString(),
        value: parseFloat(item.result_value as string)
      }))

      setSelectedResultName(testName)
      setSelectedResultUnit(unit)
      setSelectedResultData(formattedData)
      setShowTrendDialog(true)
    } catch (error) {
      console.error('Error fetching historical data:', error)
    }
  }

  const handleShowAIInterpretation = async (testName: string) => {
    try {
      const { data: interpretation, error } = await supabase
        .from('ai_interpretations')
        .select('interpretation')
        .eq('test_name', testName)
        .single()

      if (error) throw error

      setSelectedResultName(testName)
      setSelectedResultInterpretation(interpretation.interpretation)
      setShowAIDialog(true)
    } catch (error) {
      console.error('Error fetching AI interpretation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
        <p className="text-muted-foreground">View your latest test results and track changes over time</p>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-4 pr-4">
          {panels.map((panel) => (
            <Card key={panel.id} className={expandedPanels.has(panel.id) ? "border-primary shadow-md" : ""}>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => togglePanel(panel.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">{panel.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/test-results/${panel.report_id}`)
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Full Report
                    </Button>
                    <ChevronRight
                      className={`h-5 w-5 transition-transform ${expandedPanels.has(panel.id) ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(panel.report_created_at).toLocaleDateString()} • {panel.lab_name || 'Unknown Lab'}
                </p>
              </CardHeader>
              {expandedPanels.has(panel.id) && (
                <CardContent>
                  <div className="space-y-4 pt-2">
                    {panel.test_results.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:border-primary/30 transition-colors">
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
                          <h3 className="text-sm font-medium">{result.test_name}</h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold">{result.result_value}</span>
                              {result.units && <span className="text-sm text-muted-foreground">{result.units}</span>}
                            </div>
                            {result.reference_range && (
                              <p className="text-xs text-muted-foreground">Range: {result.reference_range}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {getStatusIndicator(result.flag)}
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleShowTrend(result.test_name, result.units || '')}
                              >
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Compare Trend
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleShowAIInterpretation(result.test_name)}
                              >
                                <Brain className="h-3 w-3 mr-1" />
                                AI Interpretation
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {panels.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mb-4" />
              <h3 className="font-medium">No test results found</h3>
              <p className="text-sm text-muted-foreground mt-1">Upload a lab report to see your results</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Trend Dialog */}
      <Dialog open={showTrendDialog} onOpenChange={setShowTrendDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedResultName} Trend</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedResultData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={["auto", "auto"]}
                    label={{ value: selectedResultUnit, angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} ${selectedResultUnit}`, selectedResultName]}
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
                    name={selectedResultName}
                    dot={{ stroke: "#1e40af", strokeWidth: 1, r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Trend Analysis</h4>
              <p className="text-sm text-muted-foreground">
                This chart shows how your {selectedResultName.toLowerCase()} has changed over time.
                {selectedResultData.length > 1 &&
                  (() => {
                    const firstValue = selectedResultData[0].value
                    const lastValue = selectedResultData[selectedResultData.length - 1].value
                    const change = (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
                    const direction =
                      lastValue > firstValue ? "increased" : lastValue < firstValue ? "decreased" : "remained stable"
                    return ` Your values have ${direction}${direction !== "remained stable" ? ` by ${Math.abs(Number.parseFloat(change))}%` : ""} over this period.`
                  })()}
              </p>
              <p className="text-sm text-muted-foreground">
                Tracking these changes helps identify trends and evaluate the effectiveness of treatments or lifestyle
                changes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTrendDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Interpretation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Interpretation: {selectedResultName}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">{selectedResultInterpretation}</p>
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
                This AI interpretation is for informational purposes only and should not replace professional medical
                advice. Always consult with your healthcare provider about your test results.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAIDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

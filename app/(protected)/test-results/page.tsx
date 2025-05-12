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
import TestPanel from "@/components/TestPanel"
import TrendDialog from "@/components/TrendDialog"
import AIInterpretationDialog from "@/components/AIInterpretationDialog"

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

  const getStatusIndicator = (flag: string | null | undefined) => {
    if (!flag || flag.trim() === "") {
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
      // const { data: interpretation, error } = await supabase
      //   .from('ai_interpretations')
      //   .select('interpretation')
      //   .eq('test_name', testName)
      //   .single()

      // if (error) throw error

      setSelectedResultName(testName)
      setSelectedResultInterpretation("Interpretation to be built")
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
            <TestPanel
              key={panel.id}
              id={panel.id}
              name={panel.name}
              reported_at={panel.reported_at}
              lab_name={panel.lab_name}
              status={panel.status}
              test_results={panel.test_results}
              expanded={expandedPanels.has(panel.id)}
              onToggle={() => togglePanel(panel.id)}
              getStatusIndicator={getStatusIndicator}
              onShowTrend={handleShowTrend}
              onShowAIInterpretation={handleShowAIInterpretation}
            />
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

      <TrendDialog
        open={showTrendDialog}
        onOpenChange={setShowTrendDialog}
        resultName={selectedResultName}
        resultUnit={selectedResultUnit}
        resultData={selectedResultData}
      />
      <AIInterpretationDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        resultName={selectedResultName}
        interpretation={selectedResultInterpretation}
      />
    </div>
  )
}

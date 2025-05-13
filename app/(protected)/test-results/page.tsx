"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, ChevronRight, TrendingUp, Brain, Loader2, ExternalLink, Plus, FileUp, Check, Clock } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import TestPanel from "@/components/TestPanel"
import TrendDialog from "@/components/TrendDialog"
import AIInterpretationDialog from "@/components/AIInterpretationDialog"
import { toast } from "sonner"

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

interface LabReportEntry {
  id: string;
  created_at: string;
  original_filename: string;
  status: string;
  panels: Array<{ name: string; lab_name: string | null }>;
}

interface HistoricalDataPoint {
  created_at: string
  result_value: string | number
}

export default function TestResultsPage() {
  const [panels, setPanels] = useState<Panel[]>([])
  const [labReports, setLabReports] = useState<LabReportEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrendDialog, setShowTrendDialog] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [selectedResultName, setSelectedResultName] = useState("")
  const [selectedResultUnit, setSelectedResultUnit] = useState("")
  const [selectedResultData, setSelectedResultData] = useState<any[]>([])
  const [selectedResultInterpretation, setSelectedResultInterpretation] = useState("")
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set())
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [currentUploadFilename, setCurrentUploadFilename] = useState<string | null>(null)
  const [newReportId, setNewReportId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const [panelsResponse, labReportsResponse] = await Promise.all([
        supabase
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
          .order('reported_at', { ascending: false }),
        user ? supabase
          .from('lab_reports')
          .select(`
            id,
            created_at,
            original_filename,
            status,
            panels (
              name,
              lab_name
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null })
      ]);

      if (panelsResponse.error) throw panelsResponse.error;
      const transformedPanels: Panel[] = (panelsResponse.data as any[]).map(panel => ({
        id: panel.id,
        name: panel.name,
        reported_at: panel.reported_at,
        lab_name: panel.lab_name,
        status: panel.status,
        test_results: panel.test_results,
        report_id: panel.report_id,
        report_created_at: panel.lab_reports?.created_at || ''
      }));
      setPanels(transformedPanels);

      if (labReportsResponse.error) throw labReportsResponse.error;
      setLabReports((labReportsResponse.data as LabReportEntry[]) || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
      setStatusMessage(null)
      setNewReportId(null)
      setCurrentUploadFilename(null)
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    setCurrentUploadFilename(uploadedFile.name)
    setNewReportId(null);

    const formData = new FormData()
    formData.append('file', uploadedFile)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload and processing failed')
      }

      toast.success(`Report "${result.fileName}" processed successfully!`);
      setNewReportId(result.reportId);
      fetchData();
      setUploadedFile(null);
      setCurrentUploadFilename(null);

    } catch (error: any) {
      console.error('Analysis request failed:', error)
      toast.error(error.message || 'An unknown error occurred.');
    } finally {
      setIsAnalyzing(false)
    }
  }

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

      if (formattedData.length <= 1) {
        const syntheticData = generateSyntheticHistoricalData(formattedData[0]);
        setSelectedResultData([...syntheticData, ...formattedData]);
      } else {
        setSelectedResultData(formattedData);
      }

      setSelectedResultName(testName)
      setSelectedResultUnit(unit)
      setShowTrendDialog(true)
    } catch (error) {
      console.error('Error fetching historical data:', error)
    }
  }

  const generateSyntheticHistoricalData = (actualDataPoint: { date: string, value: number }) => {
    if (!actualDataPoint) return [];

    const syntheticData = [];
    const actualDate = new Date(actualDataPoint.date);
    const actualValue = actualDataPoint.value;

    for (let i = 1; i <= Math.floor(Math.random() * 2) + 2; i++) {
      const pastDate = new Date(actualDate);
      pastDate.setDate(pastDate.getDate() - (30 + Math.floor(Math.random() * 60)));
      const randomVariation = (Math.random() * 0.3) - 0.15;
      const syntheticValue = actualValue * (1 + randomVariation);
      syntheticData.push({
        date: pastDate.toLocaleDateString(),
        value: parseFloat(syntheticValue.toFixed(2)),
        isSynthetic: true
      });
    }
    return syntheticData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  const handleShowAIInterpretation = async (testName: string) => {
    try {
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
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
          <p className="text-muted-foreground">View your latest test results and track changes over time</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lab Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload Lab Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {!isAnalyzing && !newReportId && (
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center relative">
                  <FileUp className="h-8 w-8 mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Drag and drop your file here or click to browse</p>
                    <p className="text-xs text-muted-foreground">Supports PDF, JPG, and PNG files up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {uploadedFile && !isAnalyzing && !newReportId && (
                <div className="mt-4 p-6 border rounded-lg bg-card shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="bg-muted/40 rounded-md p-3">
                          <FileText className="h-6 w-6 text-primary/80" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setUploadedFile(null)}>
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {isAnalyzing && currentUploadFilename && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing: {currentUploadFilename}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Your lab report is being uploaded and analyzed. Please wait a moment...
                    </p>
                  </CardContent>
                </Card>
              )}

              {newReportId && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-center font-medium">{statusMessage}</p>
                  <DialogClose asChild>
                    <Button onClick={() => router.push(`/test-results/${newReportId}`)}>View Results</Button>
                  </DialogClose>
                </div>
              )}

              {!newReportId && !isAnalyzing && uploadedFile && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUploadedFile(null)}>Cancel</Button>
                  <Button onClick={handleAnalyze}>Analyze Report</Button>
                </DialogFooter>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="panels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="panels">Test Panels</TabsTrigger>
          <TabsTrigger value="reports">Lab Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="panels">
          <ScrollArea className="h-[calc(100vh-12rem)]">
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
              {panels.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-4" />
                  <h3 className="font-medium">No test panels found</h3>
                  <p className="text-sm text-muted-foreground mt-1">Upload a lab report to see your results and panels.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="reports">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4 pr-4">
              {labReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-primary" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium truncate group-hover:underline">
                                {report.original_filename}
                                {report.id === newReportId && (
                                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-300">New</Badge>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center">
                              <Clock className="h-3 w-3 mr-1.5" />
                              Uploaded on {new Date(report.created_at).toLocaleDateString()} • Status:
                              <Badge variant={report.status === 'completed' || report.status === 'processed' ? 'default' : 'outline'} className="ml-1.5 text-xs">
                                {report.status}
                              </Badge>
                            </div>
                          </div>
                        </CardTitle>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/test-results/${report.id}`)}>
                        View Report <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  {report.panels && report.panels.length > 0 && (
                    <CardContent>
                      <h4 className="text-sm font-medium mb-2">Panels in this report:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {report.panels.slice(0, 5).map((panel, index) => (
                          <li key={index}>{panel.name}{panel.lab_name ? ` (${panel.lab_name})` : ''}</li>
                        ))}
                        {report.panels.length > 5 && (
                          <li className="text-xs">...and {report.panels.length - 5} more.</li>
                        )}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              ))}
              {labReports.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-4" />
                  <h3 className="font-medium">No lab reports found</h3>
                  <p className="text-sm text-muted-foreground mt-1">Upload a lab report to see it listed here.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

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

"use client"

import type React from "react"

import { useState, useEffect, useCallback, Suspense } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUp, FileText, Check, Clock, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

interface LabReport {
  id: string
  created_at: string
  original_filename: string
  status: string
  panels: {
    name: string
    lab_name: string | null
  }[]
}

// New component to handle tabs and useSearchParams
function LabUploadTabs({
  previousReports,
  loadingReports,
  uploadedFile,
  isAnalyzing,
  statusMessage,
  newReportId,
  handleFileChange,
  handleAnalyze,
  handleViewReport,
  currentUploadFilename
}: {
  previousReports: LabReport[]
  loadingReports: boolean
  uploadedFile: File | null
  isAnalyzing: boolean
  statusMessage: string | null
  newReportId: string | null
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleAnalyze: () => void
  handleViewReport: (reportId: string) => void
  currentUploadFilename: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('t') || 'upload'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('t', value)
    router.push(`?${params.toString()}`)
  }

  return (
    <Tabs
      value={currentTab}
      onValueChange={handleTabChange}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="upload">Upload New Lab</TabsTrigger>
        <TabsTrigger value="previous">Previous Labs</TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Upload Lab Report</CardTitle>
            <CardDescription>Upload a PDF or image of your lab report to get an AI-generated summary</CardDescription>
          </CardHeader>
          <CardContent>
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

            {uploadedFile && (
              <div className="mt-4 p-6 border rounded-lg bg-card shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="bg-muted/40 rounded-md p-3">
                        {newReportId ? (
                          <Check className="h-6 w-6 text-green-500" />
                        ) : (
                          <FileText className="h-6 w-6 text-primary/80" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!isAnalyzing && !newReportId && (
                    <Button onClick={handleAnalyze} size="sm" className="ml-auto">
                      Analyze
                    </Button>
                  )}
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <p className="text-sm font-medium">{statusMessage || "Analyzing..."}</p>
                </div>
                <p className="text-xs text-muted-foreground">This may take a few moments. Please don't close this page.</p>
              </div>
            )}

            {!isAnalyzing && newReportId && statusMessage && (
              <div className="mt-6 text-center">
                <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium mb-2">{statusMessage}</p>
                <Button onClick={() => handleViewReport(newReportId)}>View Results</Button>
              </div>
            )}

            {!isAnalyzing && !newReportId && statusMessage && !uploadedFile && (
              <div className="mt-6 text-center">
                <p className="text-sm font-medium text-red-500">{statusMessage}</p>
              </div>
            )}


          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="previous" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Previous Lab Reports</CardTitle>
            <CardDescription>View your previously uploaded and analyzed lab reports.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingReports ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : previousReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No previous reports found.</p>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {previousReports.map((report) => (
                    <Card key={report.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg leading-tight">
                              {report.panels?.[0]?.name || "Lab Report"}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {report.panels?.[0]?.lab_name ? `${report.panels?.[0]?.lab_name} • ` : ''}
                              Uploaded on {new Date(report.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${report.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : report.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {report.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3">
                        <p className="text-sm text-muted-foreground truncate">
                          Original file: {report.original_filename}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReport(report.id)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}


export default function LabUploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusStep, setStatusStep] = useState(0)
  const [newReportId, setNewReportId] = useState<string | null>(null)
  const [previousReports, setPreviousReports] = useState<LabReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [currentUploadFilename, setCurrentUploadFilename] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const statusMessages = [
    "Analyzing test results...",
    "Verifying correctness...",
    "Extracting data...",
    "Pondering...",
    "Almost there..."
  ]

  // Complete analysis and set final state
  const completeAnalysis = useCallback(() => {
    // Use a timeout to ensure all state updates happen in a single batch
    setTimeout(() => {
      setStatusMessage("Analysis complete! Click below to view your results.")
      setIsAnalyzing(false)
      setNewReportId('222e30f3-0f68-4f2b-85fc-b2a3bb32492f')
      fetchReports()
    }, 0)
  }, [])

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    if (isAnalyzing && currentUploadFilename) {
      // Special handling for files starting with "zen"
      if (currentUploadFilename.toLowerCase().startsWith('zen')) {
        let mockStep = 0
        pollInterval = setInterval(() => {
          mockStep++

          if (mockStep >= 2) {
            // Immediately complete the analysis
            clearInterval(pollInterval)
            completeAnalysis()
          } else {
            // Update status during the mock analysis
            setStatusStep(mockStep % statusMessages.length)
            setStatusMessage(statusMessages[mockStep % statusMessages.length])
          }
        }, 3000)
        return () => clearInterval(pollInterval);
      }

      // Regular polling logic for non-zen files
      pollInterval = setInterval(async () => {
        // Update status message
        setStatusStep((prev) => (prev + 1) % statusMessages.length)
        setStatusMessage(statusMessages[statusStep])

        // Check for new report
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: reports } = await supabase
          .from('lab_reports')
          .select('id, original_filename, panels!inner(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (reports && reports.length > 0 && reports[0].panels.length > 0) {
          // Check if this is the report we just uploaded
          if (reports[0].original_filename === currentUploadFilename) {
            setNewReportId(reports[0].id)
            setIsAnalyzing(false)
            setStatusMessage("Analysis complete! Click below to view your results.")
            // Refresh the list of reports
            fetchReports()
          }
        }
      }, 3000)
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [isAnalyzing, statusStep, currentUploadFilename, completeAnalysis])

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: reports, error } = await supabase
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
        .order('created_at', { ascending: false })

      if (error) throw error
      setPreviousReports(reports || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoadingReports(false)
    }
  }

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
    setStatusMessage('Uploading file...')
    setStatusStep(0)
    setCurrentUploadFilename(uploadedFile.name)

    const formData = new FormData()
    formData.append('file', uploadedFile)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setStatusMessage(`File uploaded: ${result.fileName}. Starting analysis...`)
    } catch (error: any) {
      console.error('Analysis request failed:', error)
      // Set both states in a single update
      setTimeout(() => {
        setStatusMessage(`Error: ${error.message}`)
        setIsAnalyzing(false)
      }, 0)
    }
  }

  const handleViewReport = (reportId: string) => {
    router.push(`/lab-results/${reportId}`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Lab Upload & Results</h1>
        <p className="text-muted-foreground">Upload your lab reports and get AI-powered analysis</p>
      </div>

      <Suspense fallback={<div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> Loading tabs...</div>}>
        <LabUploadTabs
          previousReports={previousReports}
          loadingReports={loadingReports}
          uploadedFile={uploadedFile}
          isAnalyzing={isAnalyzing}
          statusMessage={statusMessage}
          newReportId={newReportId}
          handleFileChange={handleFileChange}
          handleAnalyze={handleAnalyze}
          handleViewReport={handleViewReport}
          currentUploadFilename={currentUploadFilename}
        />
      </Suspense>
    </div>
  )
}

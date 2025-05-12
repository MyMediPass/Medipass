"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUp, FileText, Check, Clock, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
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

export default function LabUploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusStep, setStatusStep] = useState(0)
  const [newReportId, setNewReportId] = useState<string | null>(null)
  const [previousReports, setPreviousReports] = useState<LabReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
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

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    if (isAnalyzing) {
      pollInterval = setInterval(async () => {
        // Update status message
        setStatusStep((prev) => (prev + 1) % statusMessages.length)
        setStatusMessage(statusMessages[statusStep])

        // Check for new report
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: reports } = await supabase
          .from('lab_reports')
          .select('id, panels!inner(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (reports && reports.length > 0 && reports[0].panels.length > 0) {
          setNewReportId(reports[0].id)
          setIsAnalyzing(false)
          setStatusMessage("Analysis complete! Click below to view your results.")
          // Refresh the list of reports
          fetchReports()
        }
      }, 3000)
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [isAnalyzing, statusStep])

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
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    setStatusMessage('Uploading file...')
    setStatusStep(0)

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
      setStatusMessage(`Error: ${error.message}`)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Lab Upload & Results</h1>
        <p className="text-muted-foreground">Upload your lab reports and get AI-powered analysis</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
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
                <div className="mt-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {statusMessage && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  {isAnalyzing ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : newReportId ? (
                    <Check className="h-6 w-6 text-green-500" />
                  ) : (
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${statusMessage.startsWith('Error:') ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {statusMessage}
                    </p>
                  </div>
                  {newReportId && (
                    <Button onClick={() => router.push(`/test-results/${newReportId}`)}>
                      View Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="previous">
          <Card>
            <CardHeader>
              <CardTitle>Previous Lab Reports</CardTitle>
              <CardDescription>View your previously uploaded lab reports</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {loadingReports ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : previousReports.length > 0 ? (
                  <div className="space-y-4">
                    {previousReports.map((report) => (
                      <div key={report.id}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{report.original_filename}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()} • {report.panels[0]?.lab_name || 'Unknown Lab'}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {report.panels.map((panel, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                  {panel.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/test-results/${report.id}`)}>
                            View
                          </Button>
                        </div>
                        <Separator className="my-4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mb-4" />
                    <h3 className="font-medium">No reports found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Upload your first lab report to get started</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

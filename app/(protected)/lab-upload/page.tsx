"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUp, FileText, Check, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function LabUploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
      setIsAnalyzed(false)
    }
  }

  const handleAnalyze = () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      setIsAnalyzed(true)
    }, 2000)
  }

  const previousLabs = [
    {
      id: 1,
      name: "Complete Blood Count",
      date: "March 15, 2025",
      provider: "LabCorp",
    },
    {
      id: 2,
      name: "Lipid Panel",
      date: "February 10, 2025",
      provider: "Quest Diagnostics",
    },
    {
      id: 3,
      name: "Comprehensive Metabolic Panel",
      date: "January 5, 2025",
      provider: "LabCorp",
    },
  ]

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
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
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
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
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

          {isAnalyzed && (
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis Results</CardTitle>
                <CardDescription>Plain-language summary of your lab results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Your lab results are mostly within normal ranges. Your cholesterol levels have improved since your
                    last test, with total cholesterol now at 185 mg/dL (normal range: &lt;200 mg/dL). Your LDL
                    cholesterol is at 110 mg/dL, which is slightly above the optimal range but has decreased from your
                    previous test.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Key Findings</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/10 p-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="font-medium">Total Cholesterol</p>
                      </div>
                      <p className="mt-2 text-sm">185 mg/dL (Normal range: &lt;200 mg/dL)</p>
                      <p className="mt-1 text-xs text-green-600">Improved from previous test (200 mg/dL)</p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-yellow-500/10 p-1">
                          <Check className="h-4 w-4 text-yellow-500" />
                        </div>
                        <p className="font-medium">LDL Cholesterol</p>
                      </div>
                      <p className="mt-2 text-sm">110 mg/dL (Optimal range: &lt;100 mg/dL)</p>
                      <p className="mt-1 text-xs text-green-600">Improved from previous test (122 mg/dL)</p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/10 p-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="font-medium">HDL Cholesterol</p>
                      </div>
                      <p className="mt-2 text-sm">55 mg/dL (Normal range: &gt;40 mg/dL)</p>
                      <p className="mt-1 text-xs text-green-600">Stable from previous test (53 mg/dL)</p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/10 p-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="font-medium">Triglycerides</p>
                      </div>
                      <p className="mt-2 text-sm">120 mg/dL (Normal range: &lt;150 mg/dL)</p>
                      <p className="mt-1 text-xs text-green-600">Improved from previous test (145 mg/dL)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save to Health Records</Button>
              </CardFooter>
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
                <div className="space-y-4">
                  {previousLabs.map((lab) => (
                    <div key={lab.id}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{lab.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {lab.date} • {lab.provider}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

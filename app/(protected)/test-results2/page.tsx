"use client"

import { useState, useCallback, useRef } from "react"
import { id, InstaQLEntity } from "@instantdb/react"
import { db, schema } from "@/db/instant"
import { format } from "date-fns"
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Type for lab reports with InstantDB fields
export type LabReport = InstaQLEntity<typeof schema, "labReports"> & {
    $createdAt?: number;
    $updatedAt?: number;
    file?: InstaQLEntity<typeof schema, "$files">;
};

export default function TestResults2Page() {
    // Use InstantDB auth instead of Clerk
    const { isLoading: isAuthLoading, user, error: authError } = db.useAuth()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Query lab reports for the current user
    const {
        isLoading: isLoadingReports,
        error: reportsError,
        data: reportsData,
    } = db.useQuery(user ? {
        labReports: {
            $: {
                where: { userId: user.id },
                order: { createdAt: "desc" },
            },
            file: {}, // Include linked file data
        },
    } : null)

    const labReports: LabReport[] = reportsData?.labReports || []

    const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !user?.id) return

        setIsUploading(true)
        setUploadError(null)

        try {
            // Create a unique path for the file
            const timestamp = Date.now()
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
            const filePath = `lab-reports/${user.id}/${timestamp}-${sanitizedFileName}`

            // Upload file to InstantDB storage
            const uploadResult = await db.storage.uploadFile(filePath, file, {
                contentType: file.type,
                contentDisposition: `attachment; filename="${file.name}"`,
            })

            // Create lab report record and link to file
            const labReportId = id()
            await db.transact([
                db.tx.labReports[labReportId].update({
                    userId: user.id,
                    originalFileName: file.name,
                    status: "uploading",
                    createdAt: timestamp,
                }),
                db.tx.labReports[labReportId].link({ file: uploadResult.data.id }),
            ])

            // Update status to processing and trigger AI analysis
            await db.transact(
                db.tx.labReports[labReportId].update({
                    status: "processing",
                })
            )

            // Call the API to process the file (pass file path, server will get URL)
            const response = await fetch('/api/processFile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    labReportId,
                    filePath,
                    fileName: file.name,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to process file')
            }

            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (error) {
            console.error('Upload error:', error)
            setUploadError(error instanceof Error ? error.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }, [user?.id])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "uploading":
                return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            case "processing":
                return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case "error":
                return <AlertCircle className="h-4 w-4 text-red-500" />
            default:
                return <FileText className="h-4 w-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "uploading":
                return "bg-blue-100 text-blue-800"
            case "processing":
                return "bg-yellow-100 text-yellow-800"
            case "completed":
                return "bg-green-100 text-green-800"
            case "error":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const formatDate = (timestamp: number) => {
        return format(new Date(timestamp), "MMM dd, yyyy 'at' h:mm a")
    }

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (authError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Error loading authentication: {authError.message}</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Please sign in to view your test results.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Results</h1>
                <p className="text-gray-600">Upload and analyze your lab reports with AI</p>
            </div>

            {/* Upload Section */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Lab Report
                    </CardTitle>
                    <CardDescription>
                        Upload PDF, image, or document files of your lab results for AI analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    {isUploading ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    ) : (
                                        <Upload className="h-8 w-8 text-gray-400" />
                                    )}
                                    <p className="text-sm text-gray-600">
                                        {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        PDF, JPG, PNG, DOC up to 10MB
                                    </p>
                                </div>
                            </label>
                        </div>

                        {uploadError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{uploadError}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Your Lab Reports
                    </CardTitle>
                    <CardDescription>
                        View and manage your uploaded lab reports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingReports ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading reports...</span>
                        </div>
                    ) : reportsError ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Error loading reports: {reportsError.message}
                            </AlertDescription>
                        </Alert>
                    ) : labReports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No lab reports uploaded yet</p>
                            <p className="text-sm">Upload your first report to get started</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[600px]">
                            <div className="space-y-4">
                                {labReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getStatusIcon(report.status)}
                                                    <h3 className="font-medium text-gray-900">
                                                        {report.originalFileName}
                                                    </h3>
                                                    <Badge className={getStatusColor(report.status)}>
                                                        {report.status}
                                                    </Badge>
                                                </div>

                                                <p className="text-sm text-gray-500 mb-3">
                                                    Uploaded {formatDate(report.createdAt)}
                                                </p>

                                                {report.status === "completed" && (
                                                    <div className="space-y-3">
                                                        {report.aiSummary && (
                                                            <div>
                                                                <h4 className="font-medium text-sm text-gray-700 mb-1">
                                                                    AI Summary
                                                                </h4>
                                                                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                                                                    {report.aiSummary}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {report.aiTranscription && (
                                                            <div>
                                                                <h4 className="font-medium text-sm text-gray-700 mb-1">
                                                                    Transcription
                                                                </h4>
                                                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                                                                    {report.aiTranscription}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {report.status === "error" && (
                                                    <Alert variant="destructive" className="mt-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>
                                                            Failed to process this file. Please try uploading again.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                {report.file?.url && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(report.file?.url, '_blank')}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const link = document.createElement('a')
                                                                link.href = report.file?.url || ''
                                                                link.download = report.originalFileName
                                                                link.click()
                                                            }}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 
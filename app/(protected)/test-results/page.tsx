"use client"

import { useState, useCallback, useRef } from "react"
import { id, InstaQLEntity } from "@instantdb/react"
import { db, schema } from "@/db/instant"
import { format } from "date-fns"
import {
    Upload,
    FileText,
    Loader2,
    CheckCircle,
    AlertCircle,
    Eye,
    Download,
    ChevronDown,
    ChevronRight,
    FileImage,
    FileSpreadsheet,
    Calendar,
    User,
    Activity,
    TrendingUp,
    AlertTriangle,
    Trash2,
    MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Type for lab reports with InstantDB fields
export type LabReport = InstaQLEntity<typeof schema, "labReports"> & {
    $createdAt?: number;
    $updatedAt?: number;
    file?: InstaQLEntity<typeof schema, "$files">;
};

// JSON Viewer Component for structured transcription data
function JsonViewer({ data, title }: { data: any; title: string }) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

    const toggleSection = (key: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(key)) {
            newExpanded.delete(key)
        } else {
            newExpanded.add(key)
        }
        setExpandedSections(newExpanded)
    }

    const renderValue = (value: any, key: string, depth: number = 0): React.ReactNode => {
        if (value === null || value === undefined) {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </span>
                    <span className="text-muted-foreground italic">n/a</span>
                </div>
            )
        }

        if (typeof value === 'boolean') {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </span>
                    <span className="text-blue-600">{value.toString()}</span>
                </div>
            )
        }

        if (typeof value === 'number') {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </span>
                    <span className="text-green-600">{value}</span>
                </div>
            )
        }

        if (typeof value === 'string') {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </span>
                    <span className="text-gray-900">{value}</span>
                </div>
            )
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </span>
                        <span className="text-muted-foreground italic">n/a</span>
                    </div>
                )
            }

            const sectionKey = `${key}-${depth}`
            const isExpanded = expandedSections.has(sectionKey)

            return (
                <div className="space-y-2">
                    <button
                        onClick={() => toggleSection(sectionKey)}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({value.length} items)
                    </button>
                    {isExpanded && (
                        <div className="ml-6 space-y-4">
                            {value.map((item, index) => (
                                <div key={index}>
                                    {index > 0 && <div className="pt-4" />}
                                    <div className="pl-4">
                                        {typeof item === 'object' && item !== null ? (
                                            <div className="space-y-3">
                                                {Object.entries(item).map(([subKey, subValue]) => (
                                                    <div key={subKey}>
                                                        {renderValue(subValue, subKey, depth + 1)}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-900">{String(item)}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        if (typeof value === 'object') {
            const sectionKey = `${key}-${depth}`
            const isExpanded = expandedSections.has(sectionKey)

            return (
                <div className="space-y-2">
                    <button
                        onClick={() => toggleSection(sectionKey)}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                    {isExpanded && (
                        <div className="ml-6 space-y-3">
                            {Object.entries(value).map(([subKey, subValue]) => (
                                <div key={subKey} className="border-l-2 border-gray-200 pl-4">
                                    {renderValue(subValue, subKey, depth + 1)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        return (
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </span>
                <span>{String(value)}</span>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {title}
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key}>
                        {renderValue(value, key)}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Expandable File Row Component
function FileRow({ report }: { report: LabReport }) {
    const [isExpanded, setIsExpanded] = useState(false)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "uploading":
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Uploading</Badge>
            case "processing":
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>
            case "completed":
                return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
            case "error":
                return <Badge variant="destructive">Error</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
            return <FileImage className="h-4 w-4" />
        }
        if (['pdf', 'doc', 'docx'].includes(ext || '')) {
            return <FileText className="h-4 w-4" />
        }
        return <FileSpreadsheet className="h-4 w-4" />
    }

    const getFileType = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
            return 'image'
        }
        if (['pdf'].includes(ext || '')) {
            return 'pdf'
        }
        if (['doc', 'docx'].includes(ext || '')) {
            return 'document'
        }
        return ext || 'unknown'
    }

    const formatDate = (timestamp: number) => {
        return format(new Date(timestamp), "MMM dd, yyyy")
    }

    const tryParseJson = (transcription: string) => {
        try {
            let cleanedTranscription = transcription.trim()
            if (cleanedTranscription.startsWith('```json')) {
                cleanedTranscription = cleanedTranscription.replace(/^```json\s*/, '').replace(/```\s*$/, '')
            } else if (cleanedTranscription.startsWith('```')) {
                cleanedTranscription = cleanedTranscription.replace(/^```\s*/, '').replace(/```\s*$/, '')
            }
            return JSON.parse(cleanedTranscription)
        } catch {
            return null
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this lab report? This action cannot be undone.')) {
            return
        }
        try {
            await db.transact(db.tx.labReports[report.id].delete())
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete the lab report. Please try again.')
        }
    }

    const handleView = () => {
        if (report.file?.url) {
            window.open(report.file.url, '_blank')
        }
    }

    const handleDownload = () => {
        if (report.file?.url) {
            const link = document.createElement('a')
            link.href = report.file.url
            link.download = report.originalFileName
            link.click()
        }
    }

    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <TableCell className="w-8">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </TableCell>
                <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                        {getFileIcon(report.originalFileName)}
                        <span className="truncate">{report.originalFileName}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className="capitalize">
                        {getFileType(report.originalFileName)}
                    </Badge>
                </TableCell>
                <TableCell>
                    {getStatusBadge(report.status)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                    {formatDate(report.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {report.file?.url && (
                                <>
                                    <DropdownMenuItem onClick={handleView}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDownload}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={6} className="p-0">
                        <div className="border-t bg-muted/20 p-6 space-y-6">
                            {report.status === "completed" && (
                                <>
                                    {report.aiSummary && (
                                        <JsonViewer
                                            data={tryParseJson(report.aiSummary)}
                                            title="Detailed Lab Results"
                                        />
                                    )}
                                </>
                            )}

                            {report.status === "error" && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Failed to process this file. Please try uploading again.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {(report.status === "uploading" || report.status === "processing") && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span className="text-muted-foreground">
                                        {report.status === "uploading" ? "Uploading file..." : "Processing with AI..."}
                                    </span>
                                </div>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}

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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
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

            {/* Reports Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Your Lab Reports
                    </CardTitle>
                    <CardDescription>
                        Click on any row to expand and view detailed analysis
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoadingReports ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading reports...</span>
                        </div>
                    ) : reportsError ? (
                        <div className="p-6">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Error loading reports: {reportsError.message}
                                </AlertDescription>
                            </Alert>
                        </div>
                    ) : labReports.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No lab reports uploaded yet</p>
                            <p className="text-sm">Upload your first report to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-8"></TableHead>
                                        <TableHead className="w-[300px]">Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Modified</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {labReports.map((report) => (
                                        <FileRow key={report.id} report={report} />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 
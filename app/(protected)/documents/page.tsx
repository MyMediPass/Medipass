"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, ImageIcon, Calendar, Download, Eye, FileIcon, Filter, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DocumentUpload } from "@/components/documents/DocumentUpload"
import { UserDocument, DocumentCategory, CATEGORY_CONFIG } from "@/lib/types/documents"

// Utility function moved here since we can't import from services
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (typeFilter !== 'all') {
        params.append('category', typeFilter)
      }

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      // Add date filtering
      if (dateFilter !== 'all') {
        const now = new Date()
        let startDate: Date

        switch (dateFilter) {
          case '3months':
            startDate = new Date()
            startDate.setMonth(now.getMonth() - 3)
            break
          case '6months':
            startDate = new Date()
            startDate.setMonth(now.getMonth() - 6)
            break
          case '1year':
            startDate = new Date()
            startDate.setFullYear(now.getFullYear() - 1)
            break
          default:
            startDate = new Date(0) // No filtering
        }

        if (dateFilter !== 'all') {
          params.append('start_date', startDate.toISOString())
        }
      }

      const response = await fetch(`/api/documents?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.documents || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('Failed to load documents')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [typeFilter, dateFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (document.provider && document.provider.toLowerCase().includes(searchQuery.toLowerCase())) ||
      document.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (document.notes && document.notes.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

  const getCategoryBadge = (category: DocumentCategory) => {
    const config = CATEGORY_CONFIG[category]
    if (!config) return <Badge variant="outline">Document</Badge>

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getDocumentIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />
    }
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    }
    return <FileIcon className="h-4 w-4 text-gray-500" />
  }

  const handleDownload = async (doc: UserDocument) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`)
      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }

      const { download_url, file_name } = await response.json()

      // Create a temporary link and click it to download
      const link = document.createElement('a')
      link.href = download_url
      link.download = file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      // TODO: Show error toast
    }
  }

  const handleUploadComplete = (documentIds: string[]) => {
    // Refresh the documents list
    fetchDocuments()
  }

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Documents</h1>
        <div className="flex gap-2">
          <DocumentUpload onUploadComplete={handleUploadComplete} />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Search className="h-3.5 w-3.5" />
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Search & Filter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="search" className="text-sm font-medium">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      type="search"
                      placeholder="Search documents..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="type-filter" className="text-sm font-medium">
                    Document Category
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="date-filter" className="text-sm font-medium">
                    Date Range
                  </label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="date-filter">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="6months">Last 6 Months</SelectItem>
                      <SelectItem value="1year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <DialogClose asChild>
                    <Button>Apply Filters</Button>
                  </DialogClose>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid" className="text-xs">
            Grid View
          </TabsTrigger>
          <TabsTrigger value="list" className="text-xs">
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
                {filteredDocuments.map((document) => (
                  <Card key={document.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-center h-32 bg-muted rounded-md mb-3">
                        {document.file_type.startsWith('image/') ? (
                          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        ) : (
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5">
                          {getDocumentIcon(document.file_type)}
                          <p className="text-sm font-medium truncate">{document.display_name}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {new Date(document.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {getCategoryBadge(document.category)}
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(document.file_size)}
                          </p>
                        </div>

                        {document.provider && (
                          <p className="text-xs text-muted-foreground truncate">
                            {document.provider}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1 mt-3 pt-3 border-t">
                        <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs flex-1"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="font-medium">No documents found</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {searchQuery || typeFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by uploading your first document'
                  }
                </p>
                {!searchQuery && typeFilter === 'all' && dateFilter === 'all' && (
                  <DocumentUpload onUploadComplete={handleUploadComplete} />
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="list">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-3 pr-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredDocuments.length > 0 ? (
                filteredDocuments.map((document) => (
                  <Card key={document.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            {getDocumentIcon(document.file_type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{document.display_name}</p>
                            <div className="flex flex-wrap gap-2 items-center mt-1">
                              <p className="text-xs text-muted-foreground">
                                {new Date(document.created_at).toLocaleDateString()}
                                {document.provider && ` • ${document.provider}`}
                              </p>
                              {getCategoryBadge(document.category)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatFileSize(document.file_size)}
                            </p>
                            {document.tags && document.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {document.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {document.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{document.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleDownload(document)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-4" />
                  <h3 className="font-medium">No documents found</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {searchQuery || typeFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by uploading your first document'
                    }
                  </p>
                  {!searchQuery && typeFilter === 'all' && dateFilter === 'all' && (
                    <DocumentUpload onUploadComplete={handleUploadComplete} />
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

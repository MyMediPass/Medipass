"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search, Download, Eye, Loader2, Plus, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DocumentUpload } from "@/components/documents/DocumentUpload"
import { DocumentViewer } from "@/components/documents/DocumentViewer"
import { DocumentThumbnail } from "@/components/documents/DocumentThumbnail"
import { UserDocument, DocumentCategory, CATEGORY_CONFIG } from "@/lib/types/documents"

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/documents?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch documents')

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredDocuments = documents.filter((document) =>
    document.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (document.provider && document.provider.toLowerCase().includes(searchQuery.toLowerCase())) ||
    document.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCategoryBadge = (category: DocumentCategory) => {
    const config = CATEGORY_CONFIG[category]
    if (!config) return <Badge variant="outline" className="text-xs bg-gray-50">Document</Badge>

    // Medical-friendly colors
    const medicalColors: Record<DocumentCategory, string> = {
      'lab': 'bg-blue-50 text-blue-700 border-blue-200',
      'prescription': 'bg-green-50 text-green-700 border-green-200',
      'imaging': 'bg-purple-50 text-purple-700 border-purple-200',
      'insurance': 'bg-orange-50 text-orange-700 border-orange-200',
      'general': 'bg-gray-50 text-gray-700 border-gray-200',
      'report': 'bg-teal-50 text-teal-700 border-teal-200',
      'immunization': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'photo': 'bg-pink-50 text-pink-700 border-pink-200'
    }

    return (
      <Badge variant="outline" className={`text-xs ${medicalColors[category]}`}>
        {config.label}
      </Badge>
    )
  }

  const handleDownload = async (doc: UserDocument) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`)
      if (!response.ok) throw new Error('Failed to get download URL')

      const { download_url, file_name } = await response.json()
      const link = document.createElement('a')
      link.href = download_url
      link.download = file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const handleViewDocument = (document: UserDocument) => {
    setSelectedDocument(document)
    setIsViewerOpen(true)
  }

  const handleUploadComplete = () => {
    setShowUpload(false)
    fetchDocuments()
  }

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="w-full p-2 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900">My Health Documents</h1>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search your documents..."
          className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="border-gray-200 hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div
                    className="w-16 h-16 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border border-gray-200"
                    onClick={() => handleViewDocument(document)}
                  >
                    <DocumentThumbnail document={document} className="w-full h-full" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate text-sm">
                          {document.display_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getCategoryBadge(document.category)}
                          <span className="text-xs text-gray-500">
                            {formatFileSize(document.file_size)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(document.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                          {document.provider && (
                            <span className="text-blue-600 font-medium"> • {document.provider}</span>
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => handleViewDocument(document)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-green-600 hover:bg-green-50"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              {searchQuery
                ? 'Try a different search term to find your documents'
                : 'Start building your digital health record by uploading your first document'
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Document
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upload Health Document</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpload(false)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            </div>
            <div className="p-4">
              <DocumentUpload onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false)
          setSelectedDocument(null)
        }}
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, ImageIcon, Calendar, Download, Eye, FileIcon, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const documents = [
    {
      id: 1,
      name: "Annual Physical Report",
      date: "April 5, 2025",
      provider: "Dr. Sarah Johnson",
      type: "pdf",
      category: "report",
      size: "1.2 MB",
      thumbnail: "/placeholder.svg?height=40&width=32",
    },
    {
      id: 2,
      name: "Cholesterol Lab Results",
      date: "April 5, 2025",
      provider: "LabCorp",
      type: "pdf",
      category: "lab",
      size: "850 KB",
      thumbnail: "/placeholder.svg?height=40&width=32",
    },
    {
      id: 3,
      name: "Chest X-Ray",
      date: "March 15, 2025",
      provider: "Cityview Radiology",
      type: "image",
      category: "imaging",
      size: "3.5 MB",
      thumbnail: "/placeholder.svg?height=40&width=32",
    },
    {
      id: 4,
      name: "Prescription - Lisinopril",
      date: "March 1, 2025",
      provider: "Dr. Sarah Johnson",
      type: "pdf",
      category: "prescription",
      size: "450 KB",
      thumbnail: "/placeholder.svg?height=40&width=32",
    },
    {
      id: 5,
      name: "Cardiology Consultation",
      date: "February 15, 2025",
      provider: "Dr. Michael Chen",
      type: "pdf",
      category: "report",
      size: "1.5 MB",
      thumbnail: "/placeholder.svg?height=40&width=32",
    },
    {
      id: 6,
      name: "Skin Condition Photo",
      date: "February 10, 2025",
      provider: "Self-uploaded",
      type: "image",
      category: "photo",
      size: "2.1 MB",
      thumbnail: "/placeholder.svg?height=40&width=32",
    },
    {
      id: 7,
      name: "Blood Test Results",
      date: "January 20, 2025",
      provider: "Quest Diagnostics",
      type: "pdf",
      category: "lab",
      size: "780 KB",
      thumbnail: "/placeholder.svg?height=40&width=32",
    },
    {
      id: 8,
      name: "Vaccination Record",
      date: "January 10, 2025",
      provider: "Cityview Medical Center",
      type: "pdf",
      category: "immunization",
      size: "520 KB",
      thumbnail: "/placeholder.svg?height=40&width=32",
    },
  ]

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || document.type === typeFilter

    const documentDate = new Date(document.date)
    const now = new Date()
    let matchesDate = true

    if (dateFilter === "3months") {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      matchesDate = documentDate >= threeMonthsAgo
    } else if (dateFilter === "6months") {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(now.getMonth() - 6)
      matchesDate = documentDate >= sixMonthsAgo
    } else if (dateFilter === "1year") {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(now.getFullYear() - 1)
      matchesDate = documentDate >= oneYearAgo
    }

    return matchesSearch && matchesType && matchesDate
  })

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "lab":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Lab Result
          </Badge>
        )
      case "report":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Medical Report
          </Badge>
        )
      case "imaging":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
            Imaging
          </Badge>
        )
      case "prescription":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-50">
            Prescription
          </Badge>
        )
      case "photo":
        return (
          <Badge variant="outline" className="bg-pink-50 text-pink-700 hover:bg-pink-50">
            Photo
          </Badge>
        )
      case "immunization":
        return (
          <Badge variant="outline" className="bg-teal-50 text-teal-700 hover:bg-teal-50">
            Immunization
          </Badge>
        )
      default:
        return <Badge variant="outline">Document</Badge>
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "image":
        return <ImageIcon className="h-4 w-4 text-blue-500" />
      default:
        return <FileIcon className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Documents</h1>
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
                  Document Type
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF Documents</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
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
            {filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
                {filteredDocuments.map((document) => (
                  <Card key={document.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-center h-32 bg-muted rounded-md mb-3">
                        {document.type === "image" ? (
                          <img
                            src={document.thumbnail || "/placeholder.svg"}
                            alt={document.name}
                            className="h-full object-cover rounded-md"
                          />
                        ) : (
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5">
                          {getDocumentIcon(document.type)}
                          <p className="text-sm font-medium truncate">{document.name}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{document.date}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {getCategoryBadge(document.category)}
                          <p className="text-xs text-muted-foreground">{document.size}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 mt-3 pt-3 border-t">
                        <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
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
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="list">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-3 pr-4">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((document) => (
                  <Card key={document.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            {getDocumentIcon(document.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{document.name}</p>
                            <div className="flex flex-wrap gap-2 items-center mt-1">
                              <p className="text-xs text-muted-foreground">
                                {document.date} • {document.provider}
                              </p>
                              {getCategoryBadge(document.category)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{document.size}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
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
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

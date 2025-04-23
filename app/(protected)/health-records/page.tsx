"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, FileText, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function HealthRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState("all")

  const healthRecords = [
    {
      id: 1,
      title: "Complete Blood Count",
      date: "March 15, 2025",
      category: "lab",
      provider: "LabCorp",
      summary: "All values within normal range. White blood cell count slightly elevated but within acceptable limits.",
    },
    {
      id: 2,
      title: "Annual Physical Examination",
      date: "March 1, 2025",
      category: "visit",
      provider: "Dr. Sarah Johnson",
      summary: "Overall health is good. Blood pressure: 120/80 mmHg. Heart rate: 72 bpm. Weight: 165 lbs.",
    },
    {
      id: 3,
      title: "Lipid Panel",
      date: "February 10, 2025",
      category: "lab",
      provider: "Quest Diagnostics",
      summary: "Total cholesterol: 200 mg/dL. LDL: 122 mg/dL. HDL: 53 mg/dL. Triglycerides: 145 mg/dL.",
    },
    {
      id: 4,
      title: "Cardiology Consultation",
      date: "January 20, 2025",
      category: "visit",
      provider: "Dr. Michael Chen",
      summary: "EKG normal. No signs of cardiovascular disease. Recommended continued exercise and diet management.",
    },
    {
      id: 5,
      title: "Comprehensive Metabolic Panel",
      date: "January 5, 2025",
      category: "lab",
      provider: "LabCorp",
      summary:
        "Liver function tests normal. Kidney function normal. Glucose: 92 mg/dL. All electrolytes within normal range.",
    },
    {
      id: 6,
      title: "Vaccination - Influenza",
      date: "November 10, 2024",
      category: "immunization",
      provider: "Walgreens Pharmacy",
      summary: "Annual flu vaccine administered. No adverse reactions.",
    },
  ]

  const filteredRecords = healthRecords.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.summary.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || record.category === selectedCategory

    const recordDate = new Date(record.date)
    const now = new Date()
    let matchesTimeframe = true

    if (selectedTimeframe === "3months") {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      matchesTimeframe = recordDate >= threeMonthsAgo
    } else if (selectedTimeframe === "6months") {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(now.getMonth() - 6)
      matchesTimeframe = recordDate >= sixMonthsAgo
    } else if (selectedTimeframe === "1year") {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(now.getFullYear() - 1)
      matchesTimeframe = recordDate >= oneYearAgo
    }

    return matchesSearch && matchesCategory && matchesTimeframe
  })

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "lab":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Lab Result
          </Badge>
        )
      case "visit":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Doctor Visit
          </Badge>
        )
      case "immunization":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
            Immunization
          </Badge>
        )
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Health Records</h1>
        <p className="text-muted-foreground">View and search your medical records and lab results</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific health records by keyword, date, or condition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search records..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Category</p>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="lab">Lab Results</SelectItem>
                    <SelectItem value="visit">Doctor Visits</SelectItem>
                    <SelectItem value="immunization">Immunizations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Timeframe</p>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Health Records</CardTitle>
                <p className="text-sm text-muted-foreground">{filteredRecords.length} records found</p>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <div key={record.id} className="rounded-lg border p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">{record.title}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <p className="text-sm text-muted-foreground">
                                {record.date} • {record.provider}
                              </p>
                              {getCategoryBadge(record.category)}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                            View Details
                          </Button>
                        </div>
                        <p className="mt-2 text-sm">{record.summary}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Search className="h-8 w-8 text-muted-foreground mb-4" />
                      <h3 className="font-medium">No records found</h3>
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Timeline View</CardTitle>
                <p className="text-sm text-muted-foreground">{filteredRecords.length} records found</p>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="relative space-y-8 before:absolute before:inset-0 before:left-9 before:border-l-2 before:border-dashed pl-14">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <div key={record.id} className="relative">
                        <div className="absolute left-[-40px] flex h-7 w-7 items-center justify-center rounded-full border bg-background">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">{record.title}</p>
                              <div className="flex flex-wrap gap-2">
                                <p className="text-sm text-muted-foreground">
                                  {record.date} • {record.provider}
                                </p>
                                {getCategoryBadge(record.category)}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                              View Details
                            </Button>
                          </div>
                          <p className="mt-2 text-sm">{record.summary}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Search className="h-8 w-8 text-muted-foreground mb-4" />
                      <h3 className="font-medium">No records found</h3>
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

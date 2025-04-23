"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pill, Search, Calendar, Check, Filter, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MedicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const medications = [
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      time: "8:00 AM",
      instructions: "Take with breakfast",
      refillDate: "May 15, 2025",
      daysUntilRefill: 28,
      status: "active",
      pillsRemaining: 28,
      totalPills: 30,
      prescribedBy: "Dr. Sarah Johnson",
      startDate: "January 15, 2025",
      purpose: "Blood pressure management",
    },
    {
      id: 2,
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      time: "8:00 PM",
      instructions: "Take with dinner",
      refillDate: "May 20, 2025",
      daysUntilRefill: 33,
      status: "active",
      pillsRemaining: 33,
      totalPills: 30,
      prescribedBy: "Dr. Sarah Johnson",
      startDate: "January 15, 2025",
      purpose: "Cholesterol management",
    },
    {
      id: 3,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      time: "8:00 AM, 8:00 PM",
      instructions: "Take with meals",
      refillDate: "June 5, 2025",
      daysUntilRefill: 49,
      status: "active",
      pillsRemaining: 49,
      totalPills: 60,
      prescribedBy: "Dr. Michael Chen",
      startDate: "February 5, 2025",
      purpose: "Blood sugar management",
    },
    {
      id: 4,
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "Three times daily",
      time: "8:00 AM, 2:00 PM, 8:00 PM",
      instructions: "Take until completed",
      refillDate: "N/A",
      daysUntilRefill: 0,
      status: "completed",
      pillsRemaining: 0,
      totalPills: 21,
      prescribedBy: "Dr. Lisa Rodriguez",
      startDate: "March 10, 2025",
      purpose: "Bacterial infection",
      endDate: "March 17, 2025",
    },
    {
      id: 5,
      name: "Loratadine",
      dosage: "10mg",
      frequency: "Once daily",
      time: "8:00 AM",
      instructions: "Take as needed for allergies",
      refillDate: "July 15, 2025",
      daysUntilRefill: 89,
      status: "active",
      pillsRemaining: 25,
      totalPills: 30,
      prescribedBy: "Dr. Sarah Johnson",
      startDate: "March 15, 2025",
      purpose: "Allergy relief",
    },
  ]

  const filteredMedications = medications.filter((medication) => {
    const matchesSearch =
      medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.purpose.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || medication.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const activeMedications = filteredMedications.filter((med) => med.status === "active")
  const completedMedications = filteredMedications.filter((med) => med.status === "completed")

  const getRefillStatusColor = (daysUntilRefill: number) => {
    if (daysUntilRefill <= 7) return "text-red-500"
    if (daysUntilRefill <= 14) return "text-yellow-500"
    return "text-green-500"
  }

  const getRefillStatusBadge = (daysUntilRefill: number, status: string) => {
    if (status === "completed") {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
          Completed
        </Badge>
      )
    }

    if (daysUntilRefill <= 7) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
          Refill Soon
        </Badge>
      )
    }

    if (daysUntilRefill <= 14) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
          Refill Soon
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
        Refill in {daysUntilRefill} days
      </Badge>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Medications</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track and manage your medications and refills</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
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
                      placeholder="Search medications..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="status-filter" className="text-sm font-medium">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Medications</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="text-xs">
            Active Medications
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Completed Medications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMedications.length > 0 ? (
              activeMedications.map((medication) => (
                <Card key={medication.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                          <Pill className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">
                              {medication.name} {medication.dosage}
                            </h3>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                              Active
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {medication.frequency} • {medication.time}
                          </p>
                          <p className="text-xs text-muted-foreground">{medication.instructions}</p>
                          <p className="text-xs mt-1">
                            <span className="text-muted-foreground">Purpose: </span>
                            {medication.purpose}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-medium">Pills Remaining</p>
                        <p className="text-xs">
                          {medication.pillsRemaining} of {medication.totalPills}
                        </p>
                      </div>
                      <Progress value={(medication.pillsRemaining / medication.totalPills) * 100} className="h-2" />

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-xs">Refill by: {medication.refillDate}</p>
                        </div>
                        {getRefillStatusBadge(medication.daysUntilRefill, medication.status)}
                      </div>

                      <div className="mt-3 pt-3 border-t flex justify-end">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Take
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="font-medium">No active medications found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedMedications.length > 0 ? (
              completedMedications.map((medication) => (
                <Card key={medication.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                          <Pill className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">
                              {medication.name} {medication.dosage}
                            </h3>
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                              Completed
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {medication.frequency} • {medication.time}
                          </p>
                          <p className="text-xs text-muted-foreground">{medication.instructions}</p>
                          <p className="text-xs mt-1">
                            <span className="text-muted-foreground">Purpose: </span>
                            {medication.purpose}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs">
                          Taken from {medication.startDate} to {medication.endDate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="font-medium">No completed medications found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

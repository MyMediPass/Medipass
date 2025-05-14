"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Search, MapPin, User, FileText, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function VisitsPage() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("appointment")

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedVisit, setSelectedVisit] = useState<number | null>(null)

  useEffect(() => {
    // If appointment ID is provided in URL, select that visit
    if (appointmentId) {
      setSelectedVisit(Number(appointmentId))
    }
  }, [appointmentId])

  const visits = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      date: "April 20, 2025",
      time: "10:00 AM",
      location: "Cityview Medical Center",
      address: "123 Medical Blvd, Suite 100",
      notes: "Annual physical exam",
      type: "physical",
      status: "upcoming",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Cardiology",
      date: "May 15, 2025",
      time: "2:30 PM",
      location: "Heart Health Specialists",
      address: "456 Cardio Lane, Suite 200",
      notes: "Follow-up appointment",
      type: "followup",
      status: "upcoming",
    },
    {
      id: 3,
      doctor: "Dr. Lisa Rodriguez",
      specialty: "Dermatology",
      date: "June 10, 2025",
      time: "9:15 AM",
      location: "Skin Care Clinic",
      address: "789 Dermatology Drive",
      notes: "Annual skin check",
      type: "checkup",
      status: "upcoming",
    },
    {
      id: 4,
      doctor: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      date: "January 15, 2025",
      time: "11:30 AM",
      location: "Cityview Medical Center",
      address: "123 Medical Blvd, Suite 100",
      notes: "Blood pressure check",
      type: "followup",
      status: "completed",
      summary: "Blood pressure: 120/80 mmHg. Continue current medication regimen. Follow up in 3 months.",
    },
    {
      id: 5,
      doctor: "Dr. Robert Williams",
      specialty: "Ophthalmology",
      date: "February 5, 2025",
      time: "3:45 PM",
      location: "Vision Care Center",
      address: "321 Eye Street",
      notes: "Annual eye exam",
      type: "checkup",
      status: "completed",
      summary: "Vision stable. No signs of glaucoma or retinopathy. Continue annual check-ups.",
    },
  ]

  const filteredVisits = visits.filter((visit) => {
    const matchesSearch =
      visit.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.notes.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || visit.type === typeFilter

    return matchesSearch && matchesType
  })

  const upcomingVisits = filteredVisits.filter((visit) => visit.status === "upcoming")
  const pastVisits = filteredVisits.filter((visit) => visit.status === "completed")

  const getVisitTypeBadge = (type: string) => {
    switch (type) {
      case "physical":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Physical Exam
          </Badge>
        )
      case "followup":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
            Follow-up
          </Badge>
        )
      case "checkup":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Check-up
          </Badge>
        )
      default:
        return <Badge variant="outline">Appointment</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Appointments</h1>
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
                    placeholder="Search appointments..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="type-filter" className="text-sm font-medium">
                  Visit Type
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="physical">Physical Exam</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="checkup">Check-up</SelectItem>
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

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming" className="text-xs">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs">
            Past Appointments
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs">
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4 pr-4">
              {upcomingVisits.length > 0 ? (
                upcomingVisits.map((visit) => (
                  <Card
                    key={visit.id}
                    className={selectedVisit === visit.id ? "border-primary" : ""}
                    onClick={() => setSelectedVisit(visit.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">{visit.doctor}</h3>
                            {getVisitTypeBadge(visit.type)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{visit.specialty}</p>

                          <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-xs">
                                {visit.date} at {visit.time}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-xs">{visit.location}</p>
                            </div>

                            {visit.notes && (
                              <div className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                <p className="text-xs">{visit.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Directions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground mb-4" />
                  <h3 className="font-medium">No upcoming visits</h3>
                  <p className="text-sm text-muted-foreground mt-1">You don't have any upcoming appointments</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="past">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4 pr-4">
              {pastVisits.length > 0 ? (
                pastVisits.map((visit) => (
                  <Card
                    key={visit.id}
                    className={selectedVisit === visit.id ? "border-primary" : ""}
                    onClick={() => setSelectedVisit(visit.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">{visit.doctor}</h3>
                            {getVisitTypeBadge(visit.type)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{visit.specialty}</p>

                          <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-xs">
                                {visit.date} at {visit.time}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-xs">{visit.location}</p>
                            </div>
                          </div>

                          {visit.summary && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs font-medium">Visit Summary</p>
                              <p className="text-xs text-muted-foreground mt-1">{visit.summary}</p>
                            </div>
                          )}
                        </div>

                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground mb-4" />
                  <h3 className="font-medium">No past visits</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your visit history will appear here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-auto">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                </div>

                <div className="flex-1">
                  <div className="rounded-lg border p-3">
                    <h3 className="text-sm font-medium mb-2">
                      {date ? format(date, "MMMM d, yyyy") : "Select a date"}
                    </h3>

                    {date && date.toDateString() === new Date("April 20, 2025").toDateString() ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Dr. Sarah Johnson</p>
                            <p className="text-xs text-muted-foreground">10:00 AM - Primary Care</p>
                            <p className="text-xs text-muted-foreground">Annual physical exam</p>
                            <p className="text-xs text-muted-foreground">Cityview Medical Center</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-center">
                        <p className="text-sm text-muted-foreground">No appointments on this date</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

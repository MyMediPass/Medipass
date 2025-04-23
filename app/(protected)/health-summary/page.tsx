"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Calendar, Filter, Download, Printer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HealthSummaryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [doctorFilter, setDoctorFilter] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("")

  // Health Conditions data
  const healthConditions = [
    {
      name: "Hypertension",
      status: "Controlled",
      lastChecked: "April 15, 2025",
      medication: "Lisinopril 10mg daily",
    },
    {
      name: "Hyperlipidemia",
      status: "Improving",
      lastChecked: "April 5, 2025",
      medication: "Atorvastatin 20mg daily",
    },
    {
      name: "Type 2 Diabetes",
      status: "Well-controlled",
      lastChecked: "April 15, 2025",
      medication: "Metformin 500mg twice daily",
    },
  ]

  // Allergies data
  const allergies = [
    {
      name: "Penicillin",
      severity: "Severe",
      reaction: "Anaphylaxis",
      diagnosed: "January 10, 2020",
      notes: "Avoid all penicillin-based antibiotics",
    },
    {
      name: "Peanuts",
      severity: "Moderate",
      reaction: "Hives, Swelling",
      diagnosed: "March 5, 2018",
      notes: "Carry epinephrine auto-injector at all times",
    },
    {
      name: "Latex",
      severity: "Mild",
      reaction: "Contact dermatitis",
      diagnosed: "June 12, 2022",
      notes: "Notify healthcare providers before procedures",
    },
    {
      name: "Shellfish",
      severity: "Moderate",
      reaction: "Gastrointestinal distress, Rash",
      diagnosed: "September 30, 2019",
      notes: "Avoid all crustaceans and mollusks",
    },
  ]

  // Health Entries data
  const healthEntries = [
    {
      id: 1,
      date: "April 17, 2025",
      title: "Primary Care Visit",
      provider: "Dr. Sarah Johnson",
      type: "visit",
      notes:
        "Patient is doing well on current medication regimen. Blood pressure is well-controlled at 120/80 mmHg. Cholesterol levels have improved since last visit. Continue current medications and lifestyle modifications. Follow up in 3 months.",
    },
    {
      id: 2,
      date: "April 5, 2025",
      title: "Lab Results Review",
      provider: "Dr. Sarah Johnson",
      type: "note",
      notes:
        "Reviewed recent lab results with patient. Cholesterol levels have improved: Total cholesterol 185 mg/dL (previously 200), LDL 110 mg/dL (previously 122), HDL 55 mg/dL (stable). Blood glucose is well-controlled at 92 mg/dL fasting. Continue current treatment plan.",
    },
    {
      id: 3,
      date: "March 15, 2025",
      title: "Cardiology Consultation",
      provider: "Dr. Michael Chen",
      type: "visit",
      notes:
        "Patient referred for evaluation of mild chest discomfort. ECG normal, no evidence of ischemia. Physical examination unremarkable. Stress test scheduled for next week. Continue current medications. Advised on stress management techniques.",
    },
    {
      id: 4,
      date: "February 20, 2025",
      title: "Medication Adjustment",
      provider: "Dr. Sarah Johnson",
      type: "note",
      notes:
        "Increased Lisinopril from 5mg to 10mg daily due to blood pressure readings consistently above target. Discussed potential side effects and when to call office. Follow up in 2 weeks to check blood pressure response.",
    },
    {
      id: 5,
      date: "February 10, 2025",
      title: "Diabetes Education",
      provider: "Emma Wilson, CDE",
      type: "education",
      notes:
        "Comprehensive diabetes education session. Reviewed blood glucose monitoring, dietary recommendations, and importance of regular physical activity. Patient demonstrates good understanding of diabetes management. Provided resources for carbohydrate counting.",
    },
  ]

  // Doctor's Notes data
  const doctorsNotes = [
    {
      id: 1,
      date: "2023-04-15",
      doctorName: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      department: "Family Medicine",
      notes:
        "Patient presented with symptoms of seasonal allergies. Prescribed Loratadine 10mg daily. Advised to increase fluid intake and monitor symptoms. Follow up in two weeks if symptoms persist.",
      tags: ["Allergies", "Medication Change"],
    },
    {
      id: 2,
      date: "2023-03-02",
      doctorName: "Dr. Michael Chen",
      specialty: "Cardiology",
      department: "Cardiovascular Health",
      notes:
        "Routine follow-up for hypertension. Blood pressure readings have improved (128/82). Continue current medication regimen. Discussed importance of maintaining low-sodium diet and regular exercise. Schedule follow-up in 3 months.",
      tags: ["Hypertension", "Follow-up"],
    },
    {
      id: 3,
      date: "2023-02-10",
      doctorName: "Dr. Emily Rodriguez",
      specialty: "Endocrinology",
      department: "Diabetes Care",
      notes:
        "HbA1c levels have decreased to 6.8% (from 7.2%). Patient reports consistent adherence to medication schedule and improved dietary habits. Discussed potential adjustment to insulin dosage. Continue monitoring blood glucose levels daily.",
      tags: ["Diabetes", "Lab Review"],
    },
    {
      id: 4,
      date: "2023-01-05",
      doctorName: "Dr. James Wilson",
      specialty: "Orthopedics",
      department: "Joint & Spine Center",
      notes:
        "Patient reports improvement in lower back pain following physical therapy regimen. Range of motion has improved. Recommended continued PT exercises at home. Advised against heavy lifting for another 4 weeks. No medication changes at this time.",
      tags: ["Back Pain", "Physical Therapy"],
    },
    {
      id: 5,
      date: "2022-11-20",
      doctorName: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      department: "Family Medicine",
      notes:
        "Annual physical examination. All vital signs within normal ranges. Routine bloodwork ordered. Discussed preventive health measures including flu vaccination, which was administered during visit. No significant health concerns at this time.",
      tags: ["Annual Physical", "Vaccination"],
    },
    {
      id: 6,
      date: "2022-10-08",
      doctorName: "Dr. Lisa Thompson",
      specialty: "Dermatology",
      department: "Skin Health",
      notes:
        "Evaluated suspicious mole on upper back. No concerning features observed. Took baseline photos for future reference. Provided education on sun protection and monthly skin self-examinations. Return in 6 months for follow-up or sooner if changes noted.",
      tags: ["Skin Check", "Preventive Care"],
    },
  ]

  // Filter health entries based on search and date
  const filteredHealthEntries = healthEntries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.provider.toLowerCase().includes(searchQuery.toLowerCase())

    const entryDate = new Date(entry.date)
    const now = new Date()
    let matchesDate = true

    if (dateFilter === "month") {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(now.getMonth() - 1)
      matchesDate = entryDate >= oneMonthAgo
    } else if (dateFilter === "3months") {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      matchesDate = entryDate >= threeMonthsAgo
    } else if (dateFilter === "6months") {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(now.getMonth() - 6)
      matchesDate = entryDate >= sixMonthsAgo
    }

    return matchesSearch && matchesDate
  })

  // Filter doctor's notes based on filters
  const filteredDoctorsNotes = doctorsNotes.filter((note) => {
    const matchesSearch =
      note.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesDoctor = doctorFilter ? note.doctorName === doctorFilter : true
    const matchesSpecialty = specialtyFilter ? note.specialty === specialtyFilter : true

    const noteDate = new Date(note.date)
    const now = new Date()
    let matchesDate = true

    if (dateFilter === "month") {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(now.getMonth() - 1)
      matchesDate = noteDate >= oneMonthAgo
    } else if (dateFilter === "3months") {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      matchesDate = noteDate >= threeMonthsAgo
    } else if (dateFilter === "6months") {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(now.getMonth() - 6)
      matchesDate = noteDate >= sixMonthsAgo
    }

    return matchesSearch && matchesDate && matchesDoctor && matchesSpecialty
  })

  // Get unique doctors and specialties for filters
  const doctors = Array.from(new Set(doctorsNotes.map((note) => note.doctorName)))
  const specialties = Array.from(new Set(doctorsNotes.map((note) => note.specialty)))

  // Format date to a more readable format
  function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // Get badge for entry type
  const getEntryTypeBadge = (type: string) => {
    switch (type) {
      case "visit":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Visit
          </Badge>
        )
      case "note":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Note
          </Badge>
        )
      case "education":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
            Education
          </Badge>
        )
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Health Summary</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Overview of your health conditions and medical notes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 rounded-lg">
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
                      placeholder="Search health entries..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="date-filter" className="text-sm font-medium">
                    Time Period
                  </label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="date-filter">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="3months">Past 3 Months</SelectItem>
                      <SelectItem value="6months">Past 6 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="doctor-filter" className="text-sm font-medium">
                    Doctor
                  </label>
                  <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                    <SelectTrigger id="doctor-filter">
                      <SelectValue placeholder="All Doctors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allDoctors">All Doctors</SelectItem>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor} value={doctor}>
                          {doctor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="specialty-filter" className="text-sm font-medium">
                    Specialty
                  </label>
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger id="specialty-filter">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allSpecialties">All Specialties</SelectItem>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Health Conditions and Allergies */}
        <div className="lg:col-span-1 space-y-6">
          {/* Health Conditions Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Health Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthConditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div>
                      <p className="text-sm font-medium">{condition.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {condition.status} • {condition.medication}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-background">
                      Last checked: {condition.lastChecked}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Allergies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allergies.map((allergy, index) => (
                  <div key={index} className="p-3 rounded-lg bg-accent/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{allergy.name}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          allergy.severity === "Severe"
                            ? "bg-red-50 text-red-700 hover:bg-red-50"
                            : allergy.severity === "Moderate"
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-50"
                        }`}
                      >
                        {allergy.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      <span className="font-medium">Reaction:</span> {allergy.reaction}
                    </p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Diagnosed: {allergy.diagnosed}</span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            View Notes
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{allergy.name} Allergy</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-4 gap-4">
                              <div className="col-span-1 text-sm font-medium">Severity:</div>
                              <div className="col-span-3 text-sm">{allergy.severity}</div>

                              <div className="col-span-1 text-sm font-medium">Reaction:</div>
                              <div className="col-span-3 text-sm">{allergy.reaction}</div>

                              <div className="col-span-1 text-sm font-medium">Diagnosed:</div>
                              <div className="col-span-3 text-sm">{allergy.diagnosed}</div>

                              <div className="col-span-1 text-sm font-medium">Notes:</div>
                              <div className="col-span-3 text-sm">{allergy.notes}</div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area with Tabs */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <Tabs defaultValue="recent-notes">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recent-notes">Recent Notes</TabsTrigger>
                <TabsTrigger value="doctors-notes">Doctor's Notes</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="recent-notes" className="w-full">
              {/* Recent Notes Tab */}
              <TabsContent value="recent-notes" className="mt-0">
                <ScrollArea className="h-[calc(100vh-24rem)] pr-4">
                  <div className="space-y-4">
                    {filteredHealthEntries.length > 0 ? (
                      filteredHealthEntries.map((entry) => (
                        <div key={entry.id} className="rounded-lg border p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium">{entry.title}</h3>
                                {getEntryTypeBadge(entry.type)}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                  {entry.date} • {entry.provider}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm">{entry.notes}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Search className="h-8 w-8 text-muted-foreground mb-4" />
                        <h3 className="font-medium">No entries found</h3>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Doctor's Notes Tab */}
              <TabsContent value="doctors-notes" className="mt-0">
                <ScrollArea className="h-[calc(100vh-24rem)] pr-4">
                  <div className="space-y-4">
                    {filteredDoctorsNotes.length > 0 ? (
                      filteredDoctorsNotes.map((note) => (
                        <Card key={note.id} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{note.doctorName}</CardTitle>
                                <CardDescription>
                                  {note.specialty} • {note.department}
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-medium">{formatDate(note.date)}</span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="text-sm">{note.notes}</p>
                          </CardContent>
                          <div className="px-6 py-3 bg-muted/50 flex flex-wrap justify-between items-center gap-2">
                            <div className="flex flex-wrap gap-2">
                              {note.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                Share
                              </Button>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Search className="h-8 w-8 text-muted-foreground mb-4" />
                        <h3 className="font-medium">No notes found</h3>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

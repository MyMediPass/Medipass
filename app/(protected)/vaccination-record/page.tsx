"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Syringe, Search, Calendar, Plus, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"

export default function VaccinationRecordPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const vaccinations = [
    {
      id: 1,
      name: "COVID-19 (Pfizer)",
      date: "January 15, 2025",
      provider: "Cityview Medical Center",
      type: "covid19",
      dose: "Booster (3rd dose)",
      nextDose: null,
    },
    {
      id: 2,
      name: "Influenza",
      date: "November 10, 2024",
      provider: "Walgreens Pharmacy",
      type: "flu",
      dose: "Annual",
      nextDose: "November 2025",
    },
    {
      id: 3,
      name: "Tdap (Tetanus, Diphtheria, Pertussis)",
      date: "June 5, 2024",
      provider: "Dr. Sarah Johnson",
      type: "tdap",
      dose: "Booster",
      nextDose: "June 2034",
    },
    {
      id: 4,
      name: "Pneumococcal (Prevnar 20)",
      date: "March 20, 2024",
      provider: "CVS Pharmacy",
      type: "pneumococcal",
      dose: "Single dose",
      nextDose: null,
    },
    {
      id: 5,
      name: "Shingrix (Shingles)",
      date: "February 5, 2024",
      provider: "Dr. Sarah Johnson",
      type: "shingles",
      dose: "Dose 1 of 2",
      nextDose: "August 5, 2024",
    },
    {
      id: 6,
      name: "Shingrix (Shingles)",
      date: "August 10, 2024",
      provider: "Dr. Sarah Johnson",
      type: "shingles",
      dose: "Dose 2 of 2",
      nextDose: null,
    },
    {
      id: 7,
      name: "COVID-19 (Pfizer)",
      date: "May 15, 2023",
      provider: "Cityview Medical Center",
      type: "covid19",
      dose: "2nd dose",
      nextDose: "January 15, 2025",
    },
    {
      id: 8,
      name: "COVID-19 (Pfizer)",
      date: "April 24, 2023",
      provider: "Cityview Medical Center",
      type: "covid19",
      dose: "1st dose",
      nextDose: "May 15, 2023",
    },
  ]

  const filteredVaccinations = vaccinations.filter((vaccination) => {
    const matchesSearch =
      vaccination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vaccination.provider.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || vaccination.type === typeFilter

    const vaccinationDate = new Date(vaccination.date)
    const now = new Date()
    let matchesDate = true

    if (dateFilter === "year") {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(now.getFullYear() - 1)
      matchesDate = vaccinationDate >= oneYearAgo
    } else if (dateFilter === "3years") {
      const threeYearsAgo = new Date()
      threeYearsAgo.setFullYear(now.getFullYear() - 3)
      matchesDate = vaccinationDate >= threeYearsAgo
    } else if (dateFilter === "5years") {
      const fiveYearsAgo = new Date()
      fiveYearsAgo.setFullYear(now.getFullYear() - 5)
      matchesDate = vaccinationDate >= fiveYearsAgo
    }

    return matchesSearch && matchesType && matchesDate
  })

  const getVaccinationTypeBadge = (type: string) => {
    switch (type) {
      case "covid19":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            COVID-19
          </Badge>
        )
      case "flu":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Influenza
          </Badge>
        )
      case "tdap":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
            Tdap
          </Badge>
        )
      case "pneumococcal":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-50">
            Pneumococcal
          </Badge>
        )
      case "shingles":
        return (
          <Badge variant="outline" className="bg-pink-50 text-pink-700 hover:bg-pink-50">
            Shingles
          </Badge>
        )
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Vaccination Record</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your immunization history and upcoming vaccinations
          </p>
        </div>
        <div className="flex gap-2">
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
                      placeholder="Search vaccinations..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="type-filter" className="text-sm font-medium">
                    Vaccine Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="covid19">COVID-19</SelectItem>
                      <SelectItem value="flu">Influenza</SelectItem>
                      <SelectItem value="tdap">Tdap</SelectItem>
                      <SelectItem value="pneumococcal">Pneumococcal</SelectItem>
                      <SelectItem value="shingles">Shingles</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="year">Past Year</SelectItem>
                      <SelectItem value="3years">Past 3 Years</SelectItem>
                      <SelectItem value="5years">Past 5 Years</SelectItem>
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
            Add Vaccination
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Upcoming Vaccinations Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Vaccinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Influenza</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Due: November 2025</p>
                <p className="text-xs text-muted-foreground">Annual vaccination</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vaccination History Card */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Vaccination History</CardTitle>
              <p className="text-xs text-muted-foreground">{filteredVaccinations.length} records</p>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-4 pr-4">
                {filteredVaccinations.length > 0 ? (
                  filteredVaccinations.map((vaccination) => (
                    <div
                      key={vaccination.id}
                      className="rounded-lg border p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">{vaccination.name}</h3>
                            {getVaccinationTypeBadge(vaccination.type)}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {vaccination.date} • {vaccination.provider}
                            </p>
                          </div>
                          <p className="text-xs mt-2">
                            <span className="font-medium">Dose:</span> {vaccination.dose}
                          </p>
                          {vaccination.nextDose && (
                            <p className="text-xs text-primary mt-1">Next dose due: {vaccination.nextDose}</p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Syringe className="h-8 w-8 text-muted-foreground mb-4" />
                    <h3 className="font-medium">No vaccinations found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

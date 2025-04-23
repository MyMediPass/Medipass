"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pill, Calendar, MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState("medications")

  const medications = [
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      time: "8:00 AM",
      instructions: "Take with breakfast",
      refillDate: "May 15, 2025",
    },
    {
      id: 2,
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      time: "8:00 PM",
      instructions: "Take with dinner",
      refillDate: "May 20, 2025",
    },
    {
      id: 3,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      time: "8:00 AM, 8:00 PM",
      instructions: "Take with meals",
      refillDate: "June 5, 2025",
    },
  ]

  const appointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      date: "April 20, 2025",
      time: "10:00 AM",
      location: "Cityview Medical Center",
      notes: "Annual physical exam",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Cardiology",
      date: "May 15, 2025",
      time: "2:30 PM",
      location: "Heart Health Specialists",
      notes: "Follow-up appointment",
    },
    {
      id: 3,
      doctor: "Dr. Lisa Rodriguez",
      specialty: "Dermatology",
      date: "June 10, 2025",
      time: "9:15 AM",
      location: "Skin Care Clinic",
      notes: "Annual skin check",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
        <p className="text-muted-foreground">Manage your medication and appointment reminders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add {activeTab === "medications" ? "Medication" : "Appointment"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New {activeTab === "medications" ? "Medication" : "Appointment"}</DialogTitle>
                <DialogDescription>
                  {activeTab === "medications"
                    ? "Add details about your medication and reminder schedule."
                    : "Add details about your upcoming appointment."}
                </DialogDescription>
              </DialogHeader>

              {activeTab === "medications" ? (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="medication-name">Medication Name</Label>
                    <Input id="medication-name" placeholder="Enter medication name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input id="dosage" placeholder="e.g., 10mg" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select>
                        <SelectTrigger id="frequency">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Once daily</SelectItem>
                          <SelectItem value="twice">Twice daily</SelectItem>
                          <SelectItem value="three">Three times daily</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Reminder Time</Label>
                    <Input id="time" type="time" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea id="instructions" placeholder="Special instructions" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="refill-date">Next Refill Date</Label>
                    <Input id="refill-date" type="date" />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="doctor-name">Doctor Name</Label>
                    <Input id="doctor-name" placeholder="Enter doctor name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input id="specialty" placeholder="e.g., Cardiology" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" type="time" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Enter location" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Additional notes" />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="medications">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Medication Reminders</CardTitle>
              <CardDescription>Track your medications and get reminders when to take them</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div key={medication.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Pill className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {medication.name} {medication.dosage}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {medication.frequency}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {medication.time} • {medication.instructions}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Next refill: {medication.refillDate}</p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Appointment Reminders</CardTitle>
              <CardDescription>Keep track of your upcoming doctor appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{appointment.doctor}</h3>
                              <Badge variant="outline" className="text-xs">
                                {appointment.specialty}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {appointment.date} at {appointment.time}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{appointment.location}</p>
                            {appointment.notes && (
                              <p className="text-xs text-muted-foreground mt-1">Notes: {appointment.notes}</p>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

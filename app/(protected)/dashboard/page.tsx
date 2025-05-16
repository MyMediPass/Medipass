"use client"

import type React from "react"

import { useState } from "react"
import { MedicationReminders } from "@/components/dashboard/MedicationReminders"
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments"
import { useUser } from "@clerk/nextjs"

export default function Dashboard() {
  const { user } = useUser()
  const [initialMedications] = useState([
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg",
      time: "8:00 AM",
      instructions: "Take with breakfast",
      taken: false,
    },
    {
      id: 2,
      name: "Atorvastatin",
      dosage: "20mg",
      time: "8:00 PM",
      instructions: "Take with dinner",
      taken: false,
    },
    {
      id: 3,
      name: "Metformin",
      dosage: "500mg",
      time: "8:00 AM, 8:00 PM",
      instructions: "Take with meals",
      taken: false,
    },
  ])

  const appointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      date: "April 20, 2025",
      time: "10:00 AM",
      location: "Cityview Medical Center",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Cardiology",
      date: "May 15, 2025",
      time: "2:30 PM",
      location: "Heart Health Specialists",
    },
  ]

  return (
    <div className="container px-4 py-6 md:px-6 md:py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}</h1>
        <p className="text-muted-foreground">Here's your health dashboard</p>
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-2">
        {/* Medication Reminders */}
        <MedicationReminders initialMedications={initialMedications} />

        {/* Upcoming Appointments */}
        <UpcomingAppointments appointments={appointments} />
      </div>
    </div>
  )
}

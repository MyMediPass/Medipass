export type Medication = {
    id: number
    name: string
    dosage: string
    frequency: string
    time: string
    instructions: string
    refillDate: string
    daysUntilRefill: number
    status: "active" | "completed"
    pillsRemaining: number
    totalPills: number
    prescribedBy: string
    startDate: string
    purpose: string
    endDate?: string
}

export function getMedications(userId: string): Medication[] {
    // In a real app, this would fetch from a database based on userId
    // For now, returning mock data
    return [
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
} 
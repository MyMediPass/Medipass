export type Profile = {
    id: string
    name: string
    age: number
    gender: string
    dateOfBirth: string
    email: string
    phone: string
    address: string
    primaryPhysician: string
    emergencyContact: {
        name: string
        relation: string
        phone: string
    }
    aiPreferences: {
        responseStyle: "detailed" | "concise" | "simple"
        medicalTerminologyLevel: "basic" | "moderate" | "advanced"
        reminderFrequency: "low" | "medium" | "high"
        preferredTopics: string[]
    }
}

export function getProfile(userId: string): Profile {
    // In a real app, this would fetch from a database based on userId
    // For now, returning mock data
    return {
        id: userId,
        name: "Avis Chan",
        age: 31,
        gender: "Male",
        dateOfBirth: "1983-05-15",
        email: "avis@example.com",
        phone: "555-123-4567",
        address: "123 Health Street, Wellness City, CA 94123",
        primaryPhysician: "Dr. Sarah Williams",
        emergencyContact: {
            name: "Emily Johnson",
            relation: "Spouse",
            phone: "555-987-6543"
        },
        aiPreferences: {
            responseStyle: "detailed",
            medicalTerminologyLevel: "moderate",
            reminderFrequency: "medium",
            preferredTopics: ["preventive care", "nutrition", "fitness", "mental health"]
        }
    }
} 
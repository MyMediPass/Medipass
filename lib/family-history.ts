export type Condition = {
    id: number
    name: string
    diagnosisAge?: string
    notes?: string
    severity: "mild" | "moderate" | "severe"
}

export type FamilyMember = {
    id: number
    name: string
    relationship: string
    age?: number
    deceased?: boolean
    deceasedAge?: number
    deceasedCause?: string
    conditions: Condition[]
}

// Relationship categories for organizing family members
export const relationshipCategories = {
    immediate: ["Father", "Mother", "Brother", "Sister", "Son", "Daughter"],
    extended: ["Grandfather", "Grandmother", "Uncle", "Aunt", "Cousin"],
    other: ["Other"],
}

export function getFamilyHistory(userId: string): FamilyMember[] {
    // In a real app, this would fetch from a database based on userId
    // For now, returning mock data
    return [
        {
            id: 1,
            name: "John Smith Sr.",
            relationship: "Father",
            age: 68,
            conditions: [
                {
                    id: 1,
                    name: "Hypertension",
                    diagnosisAge: "45",
                    notes: "Controlled with medication",
                    severity: "moderate",
                },
                {
                    id: 2,
                    name: "Type 2 Diabetes",
                    diagnosisAge: "50",
                    notes: "Diet controlled",
                    severity: "mild",
                },
            ],
        },
        {
            id: 2,
            name: "Mary Smith",
            relationship: "Mother",
            age: 65,
            conditions: [
                {
                    id: 3,
                    name: "Breast Cancer",
                    diagnosisAge: "52",
                    notes: "In remission after treatment",
                    severity: "severe",
                },
            ],
        },
        {
            id: 3,
            name: "James Smith",
            relationship: "Brother",
            age: 42,
            conditions: [
                {
                    id: 4,
                    name: "Asthma",
                    diagnosisAge: "12",
                    notes: "Seasonal triggers",
                    severity: "moderate",
                },
            ],
        },
        {
            id: 4,
            name: "Robert Smith",
            relationship: "Grandfather",
            deceased: true,
            deceasedAge: 75,
            deceasedCause: "Heart Attack",
            conditions: [
                {
                    id: 5,
                    name: "Coronary Artery Disease",
                    diagnosisAge: "60",
                    notes: "Required bypass surgery",
                    severity: "severe",
                },
                {
                    id: 6,
                    name: "Hypertension",
                    diagnosisAge: "55",
                    severity: "moderate",
                },
            ],
        },
    ]
} 
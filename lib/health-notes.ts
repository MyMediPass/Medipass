import { format } from "date-fns"

export type Note = {
    id: number
    title: string
    content: string
    date: Date
    tags: string[]
}

export function getHealthNotes(userId: string): Note[] {
    // In a real app, this would fetch from a database based on userId
    // For now, returning mock data
    return [
        {
            id: 1,
            title: "Blood Pressure Tracking",
            content: "Morning reading: 120/80, Evening reading: 118/78. Feeling good today, no dizziness.",
            date: new Date("2025-04-15"),
            tags: ["blood pressure", "measurements"],
        },
        {
            id: 2,
            title: "Medication Side Effects",
            content: "Started experiencing mild headaches after taking Lisinopril. Will monitor for the next few days.",
            date: new Date("2025-04-10"),
            tags: ["medication", "side effects"],
        },
        {
            id: 3,
            title: "Exercise Log",
            content: "30 minutes walking, 15 minutes stretching. Felt energized afterward. Heart rate peaked at 125 bpm.",
            date: new Date("2025-04-08"),
            tags: ["exercise", "fitness"],
        },
        {
            id: 4,
            title: "Diet Changes",
            content: "Started reducing sodium intake. Replaced salt with herbs and spices. Meals still taste good!",
            date: new Date("2025-04-05"),
            tags: ["diet", "nutrition"],
        },
        {
            id: 5,
            title: "Sleep Quality",
            content: "Slept 7.5 hours. Woke up once during the night. Overall sleep quality: good.",
            date: new Date("2025-04-03"),
            tags: ["sleep", "wellness"],
        },
    ]
} 
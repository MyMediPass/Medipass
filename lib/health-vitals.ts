import { LucideIcon, Activity, Heart, Thermometer, Droplets, TreesIcon as Lungs, Weight, Ruler, Percent } from "lucide-react"

export type VitalType = {
    name: string
    icon: LucideIcon
    unit: string
    ranges: Record<string, number[]> | Record<string, Record<string, number[]>>
}

export type VitalData = {
    id: string
    type: string
    date: string
    time: string
    values: { value?: number; systolic?: number; diastolic?: number }
    status: string
    notes: string
}

export type HistoricalVitalData = {
    date: string
    value?: number
    systolic?: number
    diastolic?: number
}

export type HistoricalData = Record<string, HistoricalVitalData[]>

export const vitalTypes: Record<string, VitalType> = {
    "blood-pressure": {
        name: "Blood Pressure",
        icon: Activity,
        unit: "mmHg",
        ranges: {
            systolic: { normal: [90, 120], elevated: [120, 130], high: [130, 180], crisis: [180, 300] },
            diastolic: { normal: [60, 80], elevated: [80, 80], high: [80, 120], crisis: [120, 200] },
        },
    },
    "heart-rate": {
        name: "Heart Rate",
        icon: Heart,
        unit: "bpm",
        ranges: { normal: [60, 100], low: [30, 60], high: [100, 220] },
    },
    temperature: {
        name: "Body Temperature",
        icon: Thermometer,
        unit: "°F",
        ranges: { normal: [97.8, 99.1], low: [93.0, 97.8], high: [99.1, 108.0] },
    },
    "blood-glucose": {
        name: "Blood Glucose",
        icon: Droplets,
        unit: "mg/dL",
        ranges: { normal: [70, 99], prediabetic: [100, 125], diabetic: [126, 400] },
    },
    "oxygen-saturation": {
        name: "Oxygen Saturation",
        icon: Lungs,
        unit: "%",
        ranges: { normal: [95, 100], low: [80, 95], critical: [0, 80] },
    },
    weight: {
        name: "Weight",
        icon: Weight,
        unit: "lbs",
        ranges: {}, // Ranges depend on height, age, etc.
    },
    height: {
        name: "Height",
        icon: Ruler,
        unit: "in",
        ranges: {}, // No specific ranges
    },
    bmi: {
        name: "BMI",
        icon: Percent,
        unit: "",
        ranges: { underweight: [0, 18.5], normal: [18.5, 24.9], overweight: [25, 29.9], obese: [30, 100] },
    },
}

export function getHealthVitals(userId: string): VitalData[] {
    // In a real app, this would fetch from a database based on userId
    // For now, returning mock data
    return [
        {
            id: "bp-1",
            type: "blood-pressure",
            date: "May 15, 2025",
            time: "08:30 AM",
            values: { systolic: 118, diastolic: 75 },
            status: "normal",
            notes: "Morning reading, before breakfast",
        },
        {
            id: "bp-2",
            type: "blood-pressure",
            date: "May 14, 2025",
            time: "09:15 PM",
            values: { systolic: 122, diastolic: 78 },
            status: "elevated",
            notes: "Evening reading, after light exercise",
        },
        {
            id: "bp-3",
            type: "blood-pressure",
            date: "May 13, 2025",
            time: "08:45 AM",
            values: { systolic: 120, diastolic: 76 },
            status: "normal",
            notes: "Morning reading, after coffee",
        },
        {
            id: "hr-1",
            type: "heart-rate",
            date: "May 15, 2025",
            time: "08:30 AM",
            values: { value: 68 },
            status: "normal",
            notes: "Resting heart rate",
        },
        {
            id: "hr-2",
            type: "heart-rate",
            date: "May 14, 2025",
            time: "06:45 PM",
            values: { value: 88 },
            status: "normal",
            notes: "After 30 min walk",
        },
        {
            id: "temp-1",
            type: "temperature",
            date: "May 15, 2025",
            time: "07:00 AM",
            values: { value: 98.6 },
            status: "normal",
            notes: "Morning temperature",
        },
        {
            id: "glucose-1",
            type: "blood-glucose",
            date: "May 15, 2025",
            time: "07:30 AM",
            values: { value: 92 },
            status: "normal",
            notes: "Fasting blood glucose",
        },
        {
            id: "glucose-2",
            type: "blood-glucose",
            date: "May 14, 2025",
            time: "01:30 PM",
            values: { value: 138 },
            status: "elevated",
            notes: "2 hours after lunch",
        },
        {
            id: "o2-1",
            type: "oxygen-saturation",
            date: "May 15, 2025",
            time: "09:00 AM",
            values: { value: 98 },
            status: "normal",
            notes: "Resting oxygen level",
        },
        {
            id: "weight-1",
            type: "weight",
            date: "May 15, 2025",
            time: "07:15 AM",
            values: { value: 172.5 },
            status: "normal",
            notes: "Morning weight, before breakfast",
        },
        {
            id: "height-1",
            type: "height",
            date: "May 10, 2025",
            time: "10:30 AM",
            values: { value: 70 },
            status: "normal",
            notes: "Height measurement at doctor's office",
        },
        {
            id: "bmi-1",
            type: "bmi",
            date: "May 10, 2025",
            time: "10:35 AM",
            values: { value: 24.7 },
            status: "normal",
            notes: "BMI calculated at doctor's office",
        },
    ]
}

export function getHistoricalVitalData(userId: string): HistoricalData {
    // In a real app, this would fetch from a database based on userId
    // For now, returning mock data
    return {
        "Blood Pressure": [
            { date: "May 1", systolic: 121, diastolic: 79 },
            { date: "May 5", systolic: 119, diastolic: 77 },
            { date: "May 9", systolic: 120, diastolic: 76 },
            { date: "May 13", systolic: 120, diastolic: 76 },
            { date: "May 14", systolic: 122, diastolic: 78 },
            { date: "May 15", systolic: 118, diastolic: 75 },
        ],
        "Heart Rate": [
            { date: "May 1", value: 72 },
            { date: "May 5", value: 70 },
            { date: "May 9", value: 74 },
            { date: "May 13", value: 74 },
            { date: "May 14", value: 88 },
            { date: "May 15", value: 68 },
        ],
    }
} 
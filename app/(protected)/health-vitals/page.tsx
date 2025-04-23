"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  Brain,
  Plus,
  Upload,
  FileText,
  X,
  Heart,
  Thermometer,
  Droplets,
  TreesIcon as Lungs,
  Weight,
  Ruler,
  Percent,
  Clock,
  CalendarIcon,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"

// Define vital types and their icons
const vitalTypes = {
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

export default function HealthVitalsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedVitalType, setSelectedVitalType] = useState<string | null>(null)
  const [showTrendDialog, setShowTrendDialog] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedVitalName, setSelectedVitalName] = useState("")
  const [selectedVitalUnit, setSelectedVitalUnit] = useState("")
  const [selectedVitalData, setSelectedVitalData] = useState<any[]>([])
  const [selectedVitalInterpretation, setSelectedVitalInterpretation] = useState("")
  const [newVitalType, setNewVitalType] = useState("")
  const [newVitalValue, setNewVitalValue] = useState("")
  const [newVitalValue2, setNewVitalValue2] = useState("") // For systolic/diastolic
  const [newVitalDate, setNewVitalDate] = useState("")
  const [newVitalTime, setNewVitalTime] = useState("")
  const [newVitalNotes, setNewVitalNotes] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Sample vitals data
  const vitalsData = [
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

  // Historical data for trends
  const historicalData = {
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
      { date: "May 14", value: 88 },
      { date: "May 15", value: 68 },
    ],
    "Body Temperature": [
      { date: "May 1", value: 98.4 },
      { date: "May 8", value: 98.5 },
      { date: "May 15", value: 98.6 },
    ],
    "Blood Glucose": [
      { date: "May 1", value: 94 },
      { date: "May 8", value: 96 },
      { date: "May 14", value: 138 },
      { date: "May 15", value: 92 },
    ],
    "Oxygen Saturation": [
      { date: "May 1", value: 97 },
      { date: "May 8", value: 98 },
      { date: "May 15", value: 98 },
    ],
    Weight: [
      { date: "Apr 15", value: 175.0 },
      { date: "Apr 22", value: 174.2 },
      { date: "Apr 29", value: 173.5 },
      { date: "May 8", value: 173.0 },
      { date: "May 15", value: 172.5 },
    ],
    BMI: [
      { date: "Apr 15", value: 25.1 },
      { date: "Apr 29", value: 24.9 },
      { date: "May 10", value: 24.7 },
    ],
  }

  // AI interpretations
  const aiInterpretations = {
    "Blood Pressure":
      "Your blood pressure readings are generally within the normal range (below 120/80 mmHg), which is excellent. Your most recent reading of 118/75 mmHg indicates healthy cardiovascular function. There was a slight elevation on May 14th (122/78 mmHg), but this is still considered normal to slightly elevated and may be related to your noted light exercise before the reading. Continue monitoring regularly and maintain your healthy lifestyle habits including regular exercise, balanced diet low in sodium, and stress management techniques.",
    "Heart Rate":
      "Your resting heart rate of 68 bpm is within the healthy range (60-100 bpm), indicating good cardiovascular fitness. The elevated reading of 88 bpm after walking is a normal physiological response to exercise. Your heart rate data shows healthy variability between rest and activity, which is a positive indicator of cardiovascular health. Continue with regular aerobic exercise to maintain or potentially further improve your resting heart rate.",
    "Body Temperature":
      "Your body temperature readings are consistently normal, with your most recent reading at 98.6°F falling within the typical range (97.8°F to 99.1°F). This indicates absence of fever or hypothermia. Your temperature has been very stable over time, showing only minor fluctuations that are normal throughout the day.",
    "Blood Glucose":
      "Your fasting blood glucose level of 92 mg/dL is within the normal range (below 100 mg/dL), which is excellent. However, your post-meal reading of 138 mg/dL is slightly elevated (normal is below 140 mg/dL two hours after eating). While this single elevated reading isn't concerning, it would be beneficial to monitor post-meal glucose levels to ensure they consistently return to normal range. Consider discussing with your healthcare provider if you frequently see post-meal readings above 140 mg/dL.",
    "Oxygen Saturation":
      "Your oxygen saturation level of 98% is excellent, falling within the normal range (95-100%). This indicates your lungs are functioning well and your blood is carrying oxygen efficiently to your tissues and organs. Your readings have been consistently good over time, showing healthy respiratory function.",
    Weight:
      "Your weight shows a gradual, healthy decrease from 175.0 lbs to 172.5 lbs over the past month. This represents a loss of 2.5 pounds, or about 0.6 pounds per week, which is considered a healthy and sustainable rate of weight loss. If weight loss is your goal, this gradual approach is ideal for long-term success and health benefits.",
    BMI: "Your BMI has decreased from 25.1 to 24.7, moving from the overweight category (25-29.9) into the normal weight range (18.5-24.9). This is a positive change for your overall health. While BMI has limitations as a measure of health, this trend suggests improvements in your body composition. Continue with your current approach to maintain this healthy BMI.",
  }

  // Group vitals by type
  const groupedVitals = useMemo(() => {
    const grouped: Record<string, typeof vitalsData> = {}

    vitalsData.forEach((vital) => {
      if (!grouped[vital.type]) {
        grouped[vital.type] = []
      }
      grouped[vital.type].push(vital)
    })

    // Sort each group by date (newest first)
    Object.keys(grouped).forEach((type) => {
      grouped[type].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`)
        const dateB = new Date(`${b.date} ${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })
    })

    return grouped
  }, [vitalsData])

  // Filter vital types based on search and filters
  const filteredVitalTypes = useMemo(() => {
    return Object.keys(groupedVitals).filter((type) => {
      const vitalTypeInfo = vitalTypes[type as keyof typeof vitalTypes]
      const matchesSearch = vitalTypeInfo.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === "all" || type === typeFilter

      // Date filtering
      let matchesDate = true
      if (dateFilter !== "all") {
        const now = new Date()
        let cutoffDate: Date

        if (dateFilter === "1week") {
          cutoffDate = new Date(now.setDate(now.getDate() - 7))
        } else if (dateFilter === "1month") {
          cutoffDate = new Date(now.setMonth(now.getMonth() - 1))
        } else if (dateFilter === "3months") {
          cutoffDate = new Date(now.setMonth(now.getMonth() - 3))
        } else {
          cutoffDate = new Date(0) // Default to epoch
        }

        // Check if any vital in this group is within the date range
        matchesDate = groupedVitals[type].some((vital) => {
          const vitalDate = new Date(vital.date)
          return vitalDate >= cutoffDate
        })
      }

      return matchesSearch && matchesType && matchesDate
    })
  }, [groupedVitals, searchQuery, typeFilter, dateFilter])

  // Handle vital type click
  const handleVitalTypeClick = (type: string) => {
    setSelectedVitalType(type === selectedVitalType ? null : type)
  }

  // Handle showing trend
  const handleShowTrend = (vitalType: string) => {
    const vitalTypeInfo = vitalTypes[vitalType as keyof typeof vitalTypes]
    const vitalName = vitalTypeInfo.name
    const vitalUnit = vitalTypeInfo.unit

    if (historicalData[vitalName]) {
      setSelectedVitalName(vitalName)
      setSelectedVitalUnit(vitalUnit)
      setSelectedVitalData(historicalData[vitalName])
      setShowTrendDialog(true)
    } else {
      // If no historical data is available, show a message
      alert(`No historical data available for ${vitalName}`)
    }
  }

  // Handle showing AI interpretation
  const handleShowAIInterpretation = (vitalType: string) => {
    const vitalTypeInfo = vitalTypes[vitalType as keyof typeof vitalTypes]
    const vitalName = vitalTypeInfo.name

    if (aiInterpretations[vitalName]) {
      setSelectedVitalName(vitalName)
      setSelectedVitalInterpretation(aiInterpretations[vitalName])
      setShowAIDialog(true)
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(filesArray)
    }
  }

  // Handle file upload
  const handleUpload = () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        setUploadProgress(0)
        setSelectedFiles([])
        setShowUploadDialog(false)

        // Show success message
        alert("Files uploaded successfully! The data will be processed and added to your vitals.")
      }
    }, 300)
  }

  // Handle adding new vital
  const handleAddVital = () => {
    // Validate inputs
    if (
      !newVitalType ||
      (!newVitalValue && newVitalType !== "blood-pressure") ||
      (newVitalType === "blood-pressure" && (!newVitalValue || !newVitalValue2)) ||
      !newVitalDate
    ) {
      alert("Please fill in all required fields")
      return
    }

    // Here you would normally save the data to your database
    // For now, we'll just close the dialog and show a success message
    setShowAddDialog(false)

    // Reset form
    setNewVitalType("")
    setNewVitalValue("")
    setNewVitalValue2("")
    setNewVitalDate("")
    setNewVitalTime("")
    setNewVitalNotes("")

    // Show success message
    alert("Vital sign added successfully!")
  }

  // Get status indicator
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "normal":
        return (
          <div className="flex items-center">
            <div className="text-xs font-medium text-green-600 mr-1">NORMAL</div>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-green-400 rounded-full w-8 relative">
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )
      case "elevated":
        return (
          <div className="flex items-center">
            <div className="text-xs font-medium text-yellow-600 mr-1">ELEVATED</div>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-yellow-400 rounded-full w-12 relative">
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )
      case "high":
        return (
          <div className="flex items-center">
            <div className="text-xs font-medium text-red-600 mr-1">HIGH</div>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-red-400 rounded-full w-14 relative">
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-1/2 right-1 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )
      case "low":
        return (
          <div className="flex items-center">
            <div className="text-xs font-medium text-blue-600 mr-1">LOW</div>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-400 rounded-full w-2 relative">
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-1/2 left-1 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Format vital value for display
  const formatVitalValue = (vital: any) => {
    const vitalTypeInfo = vitalTypes[vital.type as keyof typeof vitalTypes]

    if (vital.type === "blood-pressure") {
      return (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {vital.values.systolic}/{vital.values.diastolic}
          </span>
          <span className="text-sm text-muted-foreground">{vitalTypeInfo.unit}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{vital.values.value}</span>
          <span className="text-sm text-muted-foreground">{vitalTypeInfo.unit}</span>
        </div>
      )
    }
  }

  // Format vital value for history list
  const formatVitalValueCompact = (vital: any) => {
    if (vital.type === "blood-pressure") {
      return `${vital.values.systolic}/${vital.values.diastolic} mmHg`
    } else {
      const vitalTypeInfo = vitalTypes[vital.type as keyof typeof vitalTypes]
      return `${vital.values.value} ${vitalTypeInfo.unit}`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Health Vitals</h1>
        <div className="flex gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 gap-1 rounded-lg">
                <Plus className="h-3.5 w-3.5" />
                Add Vital
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Vital Sign</DialogTitle>
                <DialogDescription>
                  Record a new health vital measurement. Required fields are marked with an asterisk (*).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="vital-type">Vital Type *</Label>
                  <Select value={newVitalType} onValueChange={setNewVitalType}>
                    <SelectTrigger id="vital-type">
                      <SelectValue placeholder="Select vital type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(vitalTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <value.icon className="h-4 w-4" />
                            <span>{value.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newVitalType === "blood-pressure" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systolic">Systolic (mmHg) *</Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        value={newVitalValue}
                        onChange={(e) => setNewVitalValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diastolic">Diastolic (mmHg) *</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        value={newVitalValue2}
                        onChange={(e) => setNewVitalValue2(e.target.value)}
                      />
                    </div>
                  </div>
                ) : newVitalType ? (
                  <div className="space-y-2">
                    <Label htmlFor="vital-value">
                      Value * ({vitalTypes[newVitalType as keyof typeof vitalTypes]?.unit})
                    </Label>
                    <Input
                      id="vital-value"
                      type="number"
                      step="0.1"
                      placeholder="Enter value"
                      value={newVitalValue}
                      onChange={(e) => setNewVitalValue(e.target.value)}
                    />
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vital-date">Date *</Label>
                    <Input
                      id="vital-date"
                      type="date"
                      value={newVitalDate}
                      onChange={(e) => setNewVitalDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vital-time">Time</Label>
                    <Input
                      id="vital-time"
                      type="time"
                      value={newVitalTime}
                      onChange={(e) => setNewVitalTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vital-notes">Notes</Label>
                  <Input
                    id="vital-notes"
                    placeholder="Any additional information"
                    value={newVitalNotes}
                    onChange={(e) => setNewVitalNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddVital}>Save Vital</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 rounded-lg">
                <Upload className="h-3.5 w-3.5" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Vitals Data</DialogTitle>
                <DialogDescription>
                  Upload files from your health devices or apps. We support CSV, PDF, and image files.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">CSV, PDF, JPG, PNG files up to 10MB</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept=".csv,.pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files</Label>
                    <div className="border rounded-md divide-y">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / 1024).toFixed(0)} KB
                            </Badge>
                          </div>
                          <Button
                            variantt="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              const newFiles = [...selectedFiles]
                              newFiles.splice(index, 1)
                              setSelectedFiles(newFiles)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || isUploading}>
                  {isUploading ? "Uploading..." : "Upload Files"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                      placeholder="Search vitals..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="type-filter" className="text-sm font-medium">
                    Vital Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(vitalTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <value.icon className="h-4 w-4" />
                            <span>{value.name}</span>
                          </div>
                        </SelectItem>
                      ))}
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
                      <SelectItem value="1week">Last Week</SelectItem>
                      <SelectItem value="1month">Last Month</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
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

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-4 pr-4">
          {filteredVitalTypes.length > 0 ? (
            filteredVitalTypes.map((vitalType) => {
              const vitalTypeInfo = vitalTypes[vitalType as keyof typeof vitalTypes]
              const vitals = groupedVitals[vitalType]
              const mostRecentVital = vitals[0] // Already sorted newest first

              return (
                <Card key={vitalType} className={selectedVitalType === vitalType ? "border-primary shadow-md" : ""}>
                  <CardHeader className="pb-2 cursor-pointer" onClick={() => handleVitalTypeClick(vitalType)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <vitalTypeInfo.icon className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">{vitalTypeInfo.name}</CardTitle>
                        <Badge variant="outline" className="ml-2">
                          {vitals.length} {vitals.length === 1 ? "reading" : "readings"}
                        </Badge>
                      </div>
                      <ChevronRight
                        className={`h-5 w-5 transition-transform ${selectedVitalType === vitalType ? "rotate-90" : ""}`}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        Latest: {mostRecentVital.date} • {mostRecentVital.time}
                      </p>
                      {getStatusIndicator(mostRecentVital.status)}
                    </div>
                  </CardHeader>

                  {selectedVitalType === vitalType && (
                    <CardContent>
                      <div className="space-y-4 pt-2">
                        <div className="border rounded-lg p-4 hover:border-primary/30 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-primary">
                              <vitalTypeInfo.icon className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-medium">Latest {vitalTypeInfo.name}</h3>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              {formatVitalValue(mostRecentVital)}
                              {vitalType === "blood-pressure" && (
                                <p className="text-xs text-muted-foreground">
                                  Range: Systolic &lt;120, Diastolic &lt;80
                                </p>
                              )}
                              {mostRecentVital.notes && (
                                <p className="text-xs text-muted-foreground mt-1">Note: {mostRecentVital.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleShowTrend(vitalType)}
                              >
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Compare Trend
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleShowAIInterpretation(vitalType)}
                              >
                                <Brain className="h-3 w-3 mr-1" />
                                AI Interpretation
                              </Button>
                            </div>
                          </div>
                        </div>

                        {vitals.length > 1 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              History
                            </h3>
                            <div className="border rounded-lg divide-y">
                              {vitals.map((vital, index) => (
                                <div key={vital.id} className={`p-3 ${index === 0 ? "bg-muted/30" : ""}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-sm">
                                        {vital.date} • {vital.time}
                                      </span>
                                      {index === 0 && (
                                        <Badge variant="outline" size="sm" className="text-xs">
                                          Latest
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{formatVitalValueCompact(vital)}</span>
                                      <Badge
                                        variant={
                                          vital.status === "normal"
                                            ? "outline"
                                            : vital.status === "elevated"
                                              ? "secondary"
                                              : vital.status === "high"
                                                ? "destructive"
                                                : "outline"
                                        }
                                        className="text-xs uppercase"
                                      >
                                        {vital.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  {vital.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 ml-5.5">Note: {vital.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mb-4" />
              <h3 className="font-medium">No vitals found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Vital
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Trend Dialog */}
      <Dialog open={showTrendDialog} onOpenChange={setShowTrendDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedVitalName} Trend</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedVitalData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={["auto", "auto"]}
                    label={{ value: selectedVitalUnit, angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} ${selectedVitalUnit}`, selectedVitalName]}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  {selectedVitalName === "Blood Pressure" ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke="#ef4444"
                        strokeWidth={2}
                        activeDot={{ r: 8, fill: "#dc2626" }}
                        name="Systolic"
                        dot={{ stroke: "#b91c1c", strokeWidth: 1, r: 4, fill: "#ef4444" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{ r: 8, fill: "#2563eb" }}
                        name="Diastolic"
                        dot={{ stroke: "#1d4ed8", strokeWidth: 1, r: 4, fill: "#3b82f6" }}
                      />
                    </>
                  ) : (
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      activeDot={{ r: 8, fill: "#2563eb" }}
                      name={selectedVitalName}
                      dot={{ stroke: "#1d4ed8", strokeWidth: 1, r: 4, fill: "#3b82f6" }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Trend Analysis</h4>
              <p className="text-sm text-muted-foreground">
                This chart shows how your {selectedVitalName.toLowerCase()} has changed over time.
                {selectedVitalData.length > 1 &&
                  (() => {
                    if (selectedVitalName === "Blood Pressure") {
                      const firstSystolic = selectedVitalData[0].systolic
                      const lastSystolic = selectedVitalData[selectedVitalData.length - 1].systolic
                      const firstDiastolic = selectedVitalData[0].diastolic
                      const lastDiastolic = selectedVitalData[selectedVitalData.length - 1].diastolic

                      const systolicChange = lastSystolic - firstSystolic
                      const diastolicChange = lastDiastolic - firstDiastolic

                      return ` Your systolic pressure has ${systolicChange > 0 ? "increased" : "decreased"} by ${Math.abs(systolicChange)} mmHg and your diastolic pressure has ${diastolicChange > 0 ? "increased" : "decreased"} by ${Math.abs(diastolicChange)} mmHg over this period.`
                    } else {
                      const firstValue = selectedVitalData[0].value
                      const lastValue = selectedVitalData[selectedVitalData.length - 1].value
                      const change = (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
                      const direction =
                        lastValue > firstValue ? "increased" : lastValue < firstValue ? "decreased" : "remained stable"
                      return ` Your values have ${direction}${direction !== "remained stable" ? ` by ${Math.abs(Number.parseFloat(change))}%` : ""} over this period.`
                    }
                  })()}
              </p>
              <p className="text-sm text-muted-foreground">
                Tracking these changes helps identify trends and evaluate the effectiveness of treatments or lifestyle
                changes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTrendDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Interpretation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Interpretation: {selectedVitalName}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">{selectedVitalInterpretation}</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-yellow-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                This AI interpretation is for informational purposes only and should not replace professional medical
                advice. Always consult with your healthcare provider about your health vitals.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAIDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

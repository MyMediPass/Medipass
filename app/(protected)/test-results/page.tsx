"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, ChevronRight, TrendingUp, Brain } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function TestResultsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedTest, setSelectedTest] = useState<string | null>(null)

  // Add these new state variables inside the TestResultsPage component, after the existing state variables
  const [showTrendDialog, setShowTrendDialog] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [selectedResultName, setSelectedResultName] = useState("")
  const [selectedResultUnit, setSelectedResultUnit] = useState("")
  const [selectedResultData, setSelectedResultData] = useState<any[]>([])
  const [selectedResultInterpretation, setSelectedResultInterpretation] = useState("")

  const testResults = [
    {
      id: "cbc",
      title: "Complete Blood Count",
      date: "April 5, 2025",
      provider: "LabCorp",
      category: "blood",
      results: [
        {
          name: "White Blood Cell Count",
          value: "7.2",
          unit: "K/uL",
          range: "4.5-11.0",
          status: "normal",
        },
        {
          name: "Red Blood Cell Count",
          value: "4.8",
          unit: "M/uL",
          range: "4.5-5.9",
          status: "normal",
        },
        {
          name: "Hemoglobin",
          value: "14.2",
          unit: "g/dL",
          range: "13.5-17.5",
          status: "normal",
        },
        {
          name: "Hematocrit",
          value: "42.1",
          unit: "%",
          range: "41.0-50.0",
          status: "normal",
        },
        {
          name: "Platelet Count",
          value: "250",
          unit: "K/uL",
          range: "150-450",
          status: "normal",
        },
        {
          name: "Neutrophil %",
          value: "62.0",
          unit: "%",
          range: "40.0-70.0",
          status: "normal",
        },
        {
          name: "Lymphocyte %",
          value: "28.0",
          unit: "%",
          range: "20.0-40.0",
          status: "normal",
        },
        {
          name: "Monocyte %",
          value: "8.0",
          unit: "%",
          range: "2.0-10.0",
          status: "normal",
        },
        {
          name: "Eosinophil %",
          value: "1.5",
          unit: "%",
          range: "0.0-6.0",
          status: "normal",
        },
        {
          name: "Basophil %",
          value: "0.5",
          unit: "%",
          range: "0.0-2.0",
          status: "normal",
        },
      ],
    },
    {
      id: "lipid",
      title: "Lipid Panel",
      date: "April 5, 2025",
      provider: "LabCorp",
      category: "cholesterol",
      results: [
        {
          name: "Total Cholesterol",
          value: "185",
          unit: "mg/dL",
          range: "<200",
          status: "normal",
          previous: "200",
          change: "improved",
        },
        {
          name: "LDL Cholesterol",
          value: "110",
          unit: "mg/dL",
          range: "<100",
          status: "borderline",
          previous: "122",
          change: "improved",
        },
        {
          name: "HDL Cholesterol",
          value: "55",
          unit: "mg/dL",
          range: ">40",
          status: "normal",
          previous: "53",
          change: "improved",
        },
        {
          name: "Triglycerides",
          value: "120",
          unit: "mg/dL",
          range: "<150",
          status: "normal",
          previous: "145",
          change: "improved",
        },
      ],
    },
    {
      id: "metabolic",
      title: "Comprehensive Metabolic Panel",
      date: "April 5, 2025",
      provider: "LabCorp",
      category: "metabolic",
      results: [
        {
          name: "Glucose",
          value: "92",
          unit: "mg/dL",
          range: "70-99",
          status: "normal",
        },
        {
          name: "BUN",
          value: "15",
          unit: "mg/dL",
          range: "7-20",
          status: "normal",
        },
        {
          name: "Creatinine",
          value: "0.9",
          unit: "mg/dL",
          range: "0.6-1.2",
          status: "normal",
        },
        {
          name: "Sodium",
          value: "140",
          unit: "mmol/L",
          range: "136-145",
          status: "normal",
        },
        {
          name: "Potassium",
          value: "4.2",
          unit: "mmol/L",
          range: "3.5-5.1",
          status: "normal",
        },
        {
          name: "Chloride",
          value: "102",
          unit: "mmol/L",
          range: "98-107",
          status: "normal",
        },
        {
          name: "CO2",
          value: "24",
          unit: "mmol/L",
          range: "22-29",
          status: "normal",
        },
        {
          name: "Calcium",
          value: "9.5",
          unit: "mg/dL",
          range: "8.5-10.2",
          status: "normal",
        },
        {
          name: "Protein, Total",
          value: "7.0",
          unit: "g/dL",
          range: "6.4-8.2",
          status: "normal",
        },
        {
          name: "Albumin",
          value: "4.5",
          unit: "g/dL",
          range: "3.5-5.0",
          status: "normal",
        },
        {
          name: "Bilirubin, Total",
          value: "0.8",
          unit: "mg/dL",
          range: "0.3-1.0",
          status: "normal",
        },
        {
          name: "Alkaline Phosphatase",
          value: "70",
          unit: "U/L",
          range: "40-129",
          status: "normal",
        },
        {
          name: "AST",
          value: "25",
          unit: "U/L",
          range: "10-40",
          status: "normal",
        },
        {
          name: "ALT",
          value: "30",
          unit: "U/L",
          range: "10-55",
          status: "normal",
        },
      ],
    },
    {
      id: "a1c",
      title: "Hemoglobin A1C",
      date: "March 10, 2025",
      provider: "Quest Diagnostics",
      category: "diabetes",
      results: [
        {
          name: "Hemoglobin A1C",
          value: "5.6",
          unit: "%",
          range: "<5.7",
          status: "normal",
          previous: "5.8",
          change: "improved",
        },
      ],
    },
    {
      id: "thyroid",
      title: "Thyroid Panel",
      date: "February 15, 2025",
      provider: "LabCorp",
      category: "thyroid",
      results: [
        {
          name: "TSH",
          value: "2.1",
          unit: "mIU/L",
          range: "0.4-4.0",
          status: "normal",
        },
        {
          name: "T4, Free",
          value: "1.2",
          unit: "ng/dL",
          range: "0.8-1.8",
          status: "normal",
        },
        {
          name: "T3, Free",
          value: "3.1",
          unit: "pg/mL",
          range: "2.3-4.2",
          status: "normal",
        },
      ],
    },
  ]

  // Add this historical data object after the testResults array
  const historicalData = {
    "Total Cholesterol": [
      { date: "Jan 2024", value: 210 },
      { date: "Feb 2024", value: 205 },
      { date: "Mar 2024", value: 195 },
      { date: "Apr 2024", value: 185 },
    ],
    "LDL Cholesterol": [
      { date: "Jan 2024", value: 130 },
      { date: "Feb 2024", value: 125 },
      { date: "Mar 2024", value: 118 },
      { date: "Apr 2024", value: 110 },
    ],
    "HDL Cholesterol": [
      { date: "Jan 2024", value: 48 },
      { date: "Feb 2024", value: 50 },
      { date: "Mar 2024", value: 52 },
      { date: "Apr 2024", value: 55 },
    ],
    Triglycerides: [
      { date: "Jan 2024", value: 160 },
      { date: "Feb 2024", value: 150 },
      { date: "Mar 2024", value: 135 },
      { date: "Apr 2024", value: 120 },
    ],
    "Hemoglobin A1C": [
      { date: "Oct 2023", value: 6.1 },
      { date: "Dec 2023", value: 6.0 },
      { date: "Feb 2024", value: 5.8 },
      { date: "Mar 2024", value: 5.6 },
    ],
    Glucose: [
      { date: "Jan 2024", value: 98 },
      { date: "Feb 2024", value: 96 },
      { date: "Mar 2024", value: 94 },
      { date: "Apr 2024", value: 92 },
    ],
    "White Blood Cell Count": [
      { date: "Dec 2023", value: 7.0 },
      { date: "Feb 2024", value: 7.1 },
      { date: "Apr 2024", value: 7.2 },
    ],
    TSH: [
      { date: "Nov 2023", value: 2.3 },
      { date: "Jan 2024", value: 2.2 },
      { date: "Feb 2024", value: 2.1 },
    ],
  }

  // Add this AI interpretations object
  const aiInterpretations = {
    "Total Cholesterol":
      "Your total cholesterol is 185 mg/dL, which is within the desirable range (below 200 mg/dL). This is a positive indicator for your cardiovascular health. Your value has improved from previous measurements, showing good progress with your current treatment plan. Continue with your current diet, exercise, and medication regimen.",
    "LDL Cholesterol":
      'Your LDL ("bad") cholesterol is 110 mg/dL, which is slightly above the optimal range (below 100 mg/dL) but still in the near-optimal category. While not a major concern, further reduction would be beneficial for heart health. Your trend shows consistent improvement, which is excellent. Consider discussing with your doctor about additional dietary changes or medication adjustments if this level plateaus.',
    "HDL Cholesterol":
      'Your HDL ("good") cholesterol is 55 mg/dL, which is in the healthy range. For men, values above 40 mg/dL and for women, above 50 mg/dL are considered protective against heart disease. Your HDL has been steadily increasing, which is excellent as higher HDL levels help remove LDL cholesterol from your arteries. Continue with regular exercise and heart-healthy dietary choices to maintain this positive trend.',
    Triglycerides:
      "Your triglyceride level is 120 mg/dL, which falls within the normal range (below 150 mg/dL). This indicates good management of dietary fats and carbohydrates. Your values have been consistently improving, suggesting your lifestyle changes are effective. Continue limiting refined carbohydrates, sugary foods, and alcohol while maintaining a diet rich in omega-3 fatty acids.",
    "Hemoglobin A1C":
      "Your Hemoglobin A1C is 5.6%, which is at the upper end of the normal range (below 5.7%). This indicates your average blood sugar over the past 3 months has been well-controlled. You've shown consistent improvement from previous readings, moving from prediabetic range toward normal. Continue with your current diet and exercise regimen, and monitor for any changes.",
    Glucose:
      "Your fasting glucose level is 92 mg/dL, which is within the normal range (70-99 mg/dL). This indicates good blood sugar control. Your trend shows gradual improvement, suggesting effective lifestyle management. Continue with balanced meals, regular physical activity, and weight management to maintain healthy glucose levels.",
    "White Blood Cell Count":
      "Your white blood cell count is 7.2 K/uL, which is within the normal range (4.5-11.0 K/uL). This suggests your immune system is functioning properly without signs of infection, inflammation, or other concerning conditions. Your values have been stable over time, which is reassuring. No specific action is needed based on this result.",
    TSH: "Your TSH (Thyroid Stimulating Hormone) level is 2.1 mIU/L, which is within the normal range (0.4-4.0 mIU/L). This indicates your thyroid function is normal. Your TSH has been gradually decreasing but remains well within normal limits. Continue with regular monitoring as recommended by your healthcare provider.",
  }

  const filteredResults = testResults.filter((result) => {
    const matchesSearch = result.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || result.category === categoryFilter

    const resultDate = new Date(result.date)
    const now = new Date()
    let matchesDate = true

    if (dateFilter === "3months") {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      matchesDate = resultDate >= threeMonthsAgo
    } else if (dateFilter === "6months") {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(now.getMonth() - 6)
      matchesDate = resultDate >= sixMonthsAgo
    } else if (dateFilter === "1year") {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(now.getFullYear() - 1)
      matchesDate = resultDate >= oneYearAgo
    }

    return matchesSearch && matchesCategory && matchesDate
  })

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "normal":
        return (
          <div className="flex items-center">
            <div className="text-xs font-medium text-green-600 mr-1">IN RANGE</div>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-400 rounded-full w-8 relative">
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )
      case "borderline":
        return (
          <div className="flex items-center">
            <div className="text-xs font-medium text-yellow-600 mr-1">BORDERLINE</div>
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
            <div className="text-xs font-medium text-red-600 mr-1">LOW</div>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-red-400 rounded-full w-2 relative">
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full top-1/2 left-1 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const handleTestClick = (id: string) => {
    setSelectedTest(id === selectedTest ? null : id)
  }

  // Add these helper functions before the return statement
  const handleShowTrend = (resultName: string, unit: string) => {
    if (historicalData[resultName]) {
      // Sort the data by date to ensure proper trend display
      const sortedData = [...historicalData[resultName]].sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      })

      setSelectedResultName(resultName)
      setSelectedResultUnit(unit)
      setSelectedResultData(sortedData)
      setShowTrendDialog(true)
    } else {
      // If no historical data is available, show a message
      alert(`No historical data available for ${resultName}`)
    }
  }

  const handleShowAIInterpretation = (resultName: string) => {
    if (aiInterpretations[resultName]) {
      setSelectedResultName(resultName)
      setSelectedResultInterpretation(aiInterpretations[resultName])
      setShowAIDialog(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Test Results</h1>
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
                    placeholder="Search test results..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="category-filter" className="text-sm font-medium">
                  Category
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="blood">Blood</SelectItem>
                    <SelectItem value="cholesterol">Cholesterol</SelectItem>
                    <SelectItem value="metabolic">Metabolic</SelectItem>
                    <SelectItem value="diabetes">Diabetes</SelectItem>
                    <SelectItem value="thyroid">Thyroid</SelectItem>
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
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
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

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-4 pr-4">
          {filteredResults.map((test) => (
            <Card key={test.id} className={selectedTest === test.id ? "border-primary shadow-md" : ""}>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => handleTestClick(test.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 transition-transform ${selectedTest === test.id ? "rotate-90" : ""}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {test.date} • {test.provider}
                </p>
              </CardHeader>
              {selectedTest === test.id && (
                <CardContent>
                  <div className="space-y-4 pt-2">
                    {test.results.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-primary">
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
                            >
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                              <polyline points="14 2 14 8 20 8" />
                              <path d="M8 13h2" />
                              <path d="M8 17h2" />
                              <path d="M14 13h2" />
                              <path d="M14 17h2" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium">{result.name}</h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold">{result.value}</span>
                              <span className="text-sm text-muted-foreground">{result.unit}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Range: {result.range}</p>
                            {result.previous && (
                              <p className="text-xs text-green-600 mt-1">
                                Previous: {result.previous} ({result.change})
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {getStatusIndicator(result.status)}
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleShowTrend(result.name, result.unit)}
                              >
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Compare Trend
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleShowAIInterpretation(result.name)}
                              >
                                <Brain className="h-3 w-3 mr-1" />
                                AI Interpretation
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {filteredResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mb-4" />
              <h3 className="font-medium">No test results found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </ScrollArea>
      {/* Trend Dialog */}
      <Dialog open={showTrendDialog} onOpenChange={setShowTrendDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedResultName} Trend</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedResultData}
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
                    label={{ value: selectedResultUnit, angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} ${selectedResultUnit}`, selectedResultName]}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    activeDot={{ r: 8, fill: "#2563eb" }}
                    name={selectedResultName}
                    dot={{ stroke: "#1e40af", strokeWidth: 1, r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Trend Analysis</h4>
              <p className="text-sm text-muted-foreground">
                This chart shows how your {selectedResultName.toLowerCase()} has changed over time.
                {selectedResultData.length > 1 &&
                  (() => {
                    const firstValue = selectedResultData[0].value
                    const lastValue = selectedResultData[selectedResultData.length - 1].value
                    const change = (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
                    const direction =
                      lastValue > firstValue ? "increased" : lastValue < firstValue ? "decreased" : "remained stable"
                    return ` Your values have ${direction}${direction !== "remained stable" ? ` by ${Math.abs(Number.parseFloat(change))}%` : ""} over this period.`
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
            <DialogTitle>AI Interpretation: {selectedResultName}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">{selectedResultInterpretation}</p>
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
                advice. Always consult with your healthcare provider about your test results.
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

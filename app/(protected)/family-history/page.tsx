"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserPlus, Edit, Trash, Search, Filter, Heart, AlertCircle } from "lucide-react"

// Types for family history data
type Condition = {
  id: number
  name: string
  diagnosisAge?: string
  notes?: string
  severity: "mild" | "moderate" | "severe"
}

type FamilyMember = {
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
const relationshipCategories = {
  immediate: ["Father", "Mother", "Brother", "Sister", "Son", "Daughter"],
  extended: ["Grandfather", "Grandmother", "Uncle", "Aunt", "Cousin"],
  other: ["Other"],
}

export default function FamilyHistoryPage() {
  // Sample data - in a real app, this would come from a database
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
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
  ])

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const [relationshipFilter, setRelationshipFilter] = useState("all")
  const [conditionFilter, setConditionFilter] = useState("")

  // State for new family member form
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    name: "",
    relationship: "",
    conditions: [],
  })
  const [isDeceased, setIsDeceased] = useState(false)

  // State for editing a family member
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)

  // State for adding/editing conditions
  const [isAddingCondition, setIsAddingCondition] = useState(false)
  const [newCondition, setNewCondition] = useState<Partial<Condition>>({
    name: "",
    severity: "moderate",
  })
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)

  // Filter family members based on search and filters
  const filteredMembers = familyMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRelationship =
      relationshipFilter === "all" ||
      (relationshipFilter === "immediate" && relationshipCategories.immediate.includes(member.relationship)) ||
      (relationshipFilter === "extended" && relationshipCategories.extended.includes(member.relationship)) ||
      (relationshipFilter === "other" && relationshipCategories.other.includes(member.relationship))
    const matchesCondition = conditionFilter
      ? member.conditions.some((condition) => condition.name.toLowerCase().includes(conditionFilter.toLowerCase()))
      : true

    return matchesSearch && matchesRelationship && matchesCondition
  })

  // Group family members by relationship category
  const groupedMembers = {
    immediate: filteredMembers.filter((member) => relationshipCategories.immediate.includes(member.relationship)),
    extended: filteredMembers.filter((member) => relationshipCategories.extended.includes(member.relationship)),
    other: filteredMembers.filter((member) => relationshipCategories.other.includes(member.relationship)),
  }

  // Handle adding a new family member
  const handleAddMember = () => {
    if (!newMember.name || !newMember.relationship) return

    const memberToAdd: FamilyMember = {
      id: Math.max(0, ...familyMembers.map((m) => m.id)) + 1,
      name: newMember.name || "",
      relationship: newMember.relationship || "",
      age: newMember.age,
      deceased: isDeceased,
      deceasedAge: isDeceased ? newMember.deceasedAge : undefined,
      deceasedCause: isDeceased ? newMember.deceasedCause : undefined,
      conditions: [],
    }

    setFamilyMembers([...familyMembers, memberToAdd])
    setNewMember({
      name: "",
      relationship: "",
      conditions: [],
    })
    setIsDeceased(false)
    setIsAddingMember(false)
  }

  // Handle updating a family member
  const handleUpdateMember = () => {
    if (!editingMember) return

    setFamilyMembers(familyMembers.map((member) => (member.id === editingMember.id ? { ...editingMember } : member)))
    setEditingMember(null)
  }

  // Handle deleting a family member
  const handleDeleteMember = (id: number) => {
    setFamilyMembers(familyMembers.filter((member) => member.id !== id))
  }

  // Handle adding a condition to a family member
  const handleAddCondition = () => {
    if (!newCondition.name || !selectedMemberId) return

    const conditionToAdd: Condition = {
      id: Math.max(0, ...familyMembers.flatMap((m) => m.conditions.map((c) => c.id))) + 1,
      name: newCondition.name || "",
      diagnosisAge: newCondition.diagnosisAge,
      notes: newCondition.notes,
      severity: newCondition.severity as "mild" | "moderate" | "severe",
    }

    setFamilyMembers(
      familyMembers.map((member) =>
        member.id === selectedMemberId ? { ...member, conditions: [...member.conditions, conditionToAdd] } : member,
      ),
    )

    setNewCondition({
      name: "",
      severity: "moderate",
    })
    setIsAddingCondition(false)
    setSelectedMemberId(null)
  }

  // Handle updating a condition
  const handleUpdateCondition = () => {
    if (!editingCondition || !selectedMemberId) return

    setFamilyMembers(
      familyMembers.map((member) =>
        member.id === selectedMemberId
          ? {
              ...member,
              conditions: member.conditions.map((condition) =>
                condition.id === editingCondition.id ? { ...editingCondition } : condition,
              ),
            }
          : member,
      ),
    )

    setEditingCondition(null)
    setSelectedMemberId(null)
  }

  // Handle deleting a condition
  const handleDeleteCondition = (memberId: number, conditionId: number) => {
    setFamilyMembers(
      familyMembers.map((member) =>
        member.id === memberId
          ? { ...member, conditions: member.conditions.filter((condition) => condition.id !== conditionId) }
          : member,
      ),
    )
  }

  // Get severity badge for conditions
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "mild":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Mild
          </Badge>
        )
      case "moderate":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
            Moderate
          </Badge>
        )
      case "severe":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            Severe
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Family Medical History</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track and manage your family's medical history to better understand your health risks
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
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
                  <Label htmlFor="search">Search Family Members</Label>
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship-filter">Relationship</Label>
                  <Select value={relationshipFilter} onValueChange={setRelationshipFilter}>
                    <SelectTrigger id="relationship-filter">
                      <SelectValue placeholder="Filter by relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Relationships</SelectItem>
                      <SelectItem value="immediate">Immediate Family</SelectItem>
                      <SelectItem value="extended">Extended Family</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition-filter">Medical Condition</Label>
                  <Input
                    id="condition-filter"
                    placeholder="Filter by condition..."
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Apply Filters</Button>
                  </DialogClose>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Family Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter name"
                    value={newMember.name || ""}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select
                    value={newMember.relationship || ""}
                    onValueChange={(value) => setNewMember({ ...newMember, relationship: value })}
                  >
                    <SelectTrigger id="relationship">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Grandfather">Grandfather</SelectItem>
                      <SelectItem value="Grandmother">Grandmother</SelectItem>
                      <SelectItem value="Uncle">Uncle</SelectItem>
                      <SelectItem value="Aunt">Aunt</SelectItem>
                      <SelectItem value="Cousin">Cousin</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    value={newMember.age || ""}
                    onChange={(e) => setNewMember({ ...newMember, age: Number.parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="deceased"
                    checked={isDeceased}
                    onChange={(e) => setIsDeceased(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="deceased">Deceased</Label>
                </div>
                {isDeceased && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="deceasedAge">Age at Death</Label>
                      <Input
                        id="deceasedAge"
                        type="number"
                        placeholder="Enter age at death"
                        value={newMember.deceasedAge || ""}
                        onChange={(e) =>
                          setNewMember({ ...newMember, deceasedAge: Number.parseInt(e.target.value) || undefined })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deceasedCause">Cause of Death</Label>
                      <Input
                        id="deceasedCause"
                        placeholder="Enter cause of death"
                        value={newMember.deceasedCause || ""}
                        onChange={(e) => setNewMember({ ...newMember, deceasedCause: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember}>Add Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grouped">Grouped View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {member.name}
                        {member.deceased && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700">
                            Deceased
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {member.relationship}
                        {member.age && !member.deceased && ` • ${member.age} years old`}
                        {member.deceased &&
                          member.deceasedAge &&
                          ` • Passed at age ${member.deceasedAge}${
                            member.deceasedCause ? ` due to ${member.deceasedCause}` : ""
                          }`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingMember(member)
                              setIsDeceased(!!member.deceased)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Edit Family Member</DialogTitle>
                          </DialogHeader>
                          {editingMember && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  placeholder="Enter name"
                                  value={editingMember.name}
                                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-relationship">Relationship</Label>
                                <Select
                                  value={editingMember.relationship}
                                  onValueChange={(value) => setEditingMember({ ...editingMember, relationship: value })}
                                >
                                  <SelectTrigger id="edit-relationship">
                                    <SelectValue placeholder="Select relationship" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Father">Father</SelectItem>
                                    <SelectItem value="Mother">Mother</SelectItem>
                                    <SelectItem value="Brother">Brother</SelectItem>
                                    <SelectItem value="Sister">Sister</SelectItem>
                                    <SelectItem value="Son">Son</SelectItem>
                                    <SelectItem value="Daughter">Daughter</SelectItem>
                                    <SelectItem value="Grandfather">Grandfather</SelectItem>
                                    <SelectItem value="Grandmother">Grandmother</SelectItem>
                                    <SelectItem value="Uncle">Uncle</SelectItem>
                                    <SelectItem value="Aunt">Aunt</SelectItem>
                                    <SelectItem value="Cousin">Cousin</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-age">Age</Label>
                                <Input
                                  id="edit-age"
                                  type="number"
                                  placeholder="Enter age"
                                  value={editingMember.age || ""}
                                  onChange={(e) =>
                                    setEditingMember({
                                      ...editingMember,
                                      age: Number.parseInt(e.target.value) || undefined,
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="edit-deceased"
                                  checked={isDeceased}
                                  onChange={(e) => {
                                    setIsDeceased(e.target.checked)
                                    setEditingMember({
                                      ...editingMember,
                                      deceased: e.target.checked,
                                    })
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="edit-deceased">Deceased</Label>
                              </div>
                              {isDeceased && (
                                <>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-deceasedAge">Age at Death</Label>
                                    <Input
                                      id="edit-deceasedAge"
                                      type="number"
                                      placeholder="Enter age at death"
                                      value={editingMember.deceasedAge || ""}
                                      onChange={(e) =>
                                        setEditingMember({
                                          ...editingMember,
                                          deceasedAge: Number.parseInt(e.target.value) || undefined,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-deceasedCause">Cause of Death</Label>
                                    <Input
                                      id="edit-deceasedCause"
                                      placeholder="Enter cause of death"
                                      value={editingMember.deceasedCause || ""}
                                      onChange={(e) =>
                                        setEditingMember({
                                          ...editingMember,
                                          deceasedCause: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingMember(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateMember}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Medical Conditions</h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMemberId(member.id)
                              setIsAddingCondition(true)
                            }}
                          >
                            Add Condition
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Add Medical Condition</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="condition-name">Condition Name</Label>
                              <Input
                                id="condition-name"
                                placeholder="Enter condition name"
                                value={newCondition.name || ""}
                                onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="diagnosis-age">Age at Diagnosis</Label>
                              <Input
                                id="diagnosis-age"
                                placeholder="Enter age at diagnosis"
                                value={newCondition.diagnosisAge || ""}
                                onChange={(e) => setNewCondition({ ...newCondition, diagnosisAge: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="severity">Severity</Label>
                              <Select
                                value={newCondition.severity || "moderate"}
                                onValueChange={(value) =>
                                  setNewCondition({
                                    ...newCondition,
                                    severity: value as "mild" | "moderate" | "severe",
                                  })
                                }
                              >
                                <SelectTrigger id="severity">
                                  <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mild">Mild</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="severe">Severe</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea
                                id="notes"
                                placeholder="Enter additional notes"
                                value={newCondition.notes || ""}
                                onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddingCondition(false)
                                setSelectedMemberId(null)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAddCondition}>Add Condition</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {member.conditions.length > 0 ? (
                      <div className="space-y-3">
                        {member.conditions.map((condition) => (
                          <div key={condition.id} className="rounded-lg border p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-medium">{condition.name}</h4>
                                  {getSeverityBadge(condition.severity)}
                                </div>
                                {condition.diagnosisAge && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Diagnosed at age {condition.diagnosisAge}
                                  </p>
                                )}
                                {condition.notes && <p className="text-xs mt-2">{condition.notes}</p>}
                              </div>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => {
                                        setEditingCondition(condition)
                                        setSelectedMemberId(member.id)
                                      }}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                      <DialogTitle>Edit Medical Condition</DialogTitle>
                                    </DialogHeader>
                                    {editingCondition && (
                                      <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                          <Label htmlFor="edit-condition-name">Condition Name</Label>
                                          <Input
                                            id="edit-condition-name"
                                            placeholder="Enter condition name"
                                            value={editingCondition.name}
                                            onChange={(e) =>
                                              setEditingCondition({ ...editingCondition, name: e.target.value })
                                            }
                                          />
                                        </div>
                                        <div className="grid gap-2">
                                          <Label htmlFor="edit-diagnosis-age">Age at Diagnosis</Label>
                                          <Input
                                            id="edit-diagnosis-age"
                                            placeholder="Enter age at diagnosis"
                                            value={editingCondition.diagnosisAge || ""}
                                            onChange={(e) =>
                                              setEditingCondition({
                                                ...editingCondition,
                                                diagnosisAge: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <div className="grid gap-2">
                                          <Label htmlFor="edit-severity">Severity</Label>
                                          <Select
                                            value={editingCondition.severity}
                                            onValueChange={(value) =>
                                              setEditingCondition({
                                                ...editingCondition,
                                                severity: value as "mild" | "moderate" | "severe",
                                              })
                                            }
                                          >
                                            <SelectTrigger id="edit-severity">
                                              <SelectValue placeholder="Select severity" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="mild">Mild</SelectItem>
                                              <SelectItem value="moderate">Moderate</SelectItem>
                                              <SelectItem value="severe">Severe</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="grid gap-2">
                                          <Label htmlFor="edit-notes">Notes</Label>
                                          <Textarea
                                            id="edit-notes"
                                            placeholder="Enter additional notes"
                                            value={editingCondition.notes || ""}
                                            onChange={(e) =>
                                              setEditingCondition({ ...editingCondition, notes: e.target.value })
                                            }
                                          />
                                        </div>
                                      </div>
                                    )}
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setEditingCondition(null)
                                          setSelectedMemberId(null)
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button onClick={handleUpdateCondition}>Save Changes</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteCondition(member.id, condition.id)}
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Heart className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">No medical conditions recorded</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click "Add Condition" to record medical history
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No family members found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                {searchQuery || relationshipFilter !== "all" || conditionFilter
                  ? "Try adjusting your search or filters"
                  : "Add family members to start tracking your family medical history"}
              </p>
              <Button className="mt-4" onClick={() => setIsAddingMember(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Family Member
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="grouped" className="space-y-6">
          {/* Immediate Family */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Immediate Family</h2>
            {groupedMembers.immediate.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedMembers.immediate.map((member) => (
                  <Card key={member.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {member.name}
                            {member.deceased && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                Deceased
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {member.relationship}
                            {member.age && !member.deceased && ` • ${member.age} years old`}
                            {member.deceased &&
                              member.deceasedAge &&
                              ` • Passed at age ${member.deceasedAge}${
                                member.deceasedCause ? ` due to ${member.deceasedCause}` : ""
                              }`}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Medical Conditions</h3>
                        {member.conditions.length > 0 ? (
                          <div className="space-y-2">
                            {member.conditions.map((condition) => (
                              <div key={condition.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-primary" />
                                  <span className="text-sm">{condition.name}</span>
                                </div>
                                {getSeverityBadge(condition.severity)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No medical conditions recorded</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border p-6 text-center">
                <p className="text-muted-foreground">No immediate family members found</p>
              </div>
            )}
          </div>

          {/* Extended Family */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Extended Family</h2>
            {groupedMembers.extended.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedMembers.extended.map((member) => (
                  <Card key={member.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {member.name}
                            {member.deceased && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                Deceased
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {member.relationship}
                            {member.age && !member.deceased && ` • ${member.age} years old`}
                            {member.deceased &&
                              member.deceasedAge &&
                              ` • Passed at age ${member.deceasedAge}${
                                member.deceasedCause ? ` due to ${member.deceasedCause}` : ""
                              }`}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Medical Conditions</h3>
                        {member.conditions.length > 0 ? (
                          <div className="space-y-2">
                            {member.conditions.map((condition) => (
                              <div key={condition.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-primary" />
                                  <span className="text-sm">{condition.name}</span>
                                </div>
                                {getSeverityBadge(condition.severity)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No medical conditions recorded</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border p-6 text-center">
                <p className="text-muted-foreground">No extended family members found</p>
              </div>
            )}
          </div>

          {/* Other */}
          {groupedMembers.other.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Other</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedMembers.other.map((member) => (
                  <Card key={member.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {member.name}
                            {member.deceased && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                Deceased
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {member.relationship}
                            {member.age && !member.deceased && ` • ${member.age} years old`}
                            {member.deceased &&
                              member.deceasedAge &&
                              ` • Passed at age ${member.deceasedAge}${
                                member.deceasedCause ? ` due to ${member.deceasedCause}` : ""
                              }`}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Medical Conditions</h3>
                        {member.conditions.length > 0 ? (
                          <div className="space-y-2">
                            {member.conditions.map((condition) => (
                              <div key={condition.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-primary" />
                                  <span className="text-sm">{condition.name}</span>
                                </div>
                                {getSeverityBadge(condition.severity)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No medical conditions recorded</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No family members found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                {searchQuery || relationshipFilter !== "all" || conditionFilter
                  ? "Try adjusting your search or filters"
                  : "Add family members to start tracking your family medical history"}
              </p>
              <Button className="mt-4" onClick={() => setIsAddingMember(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Family Member
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

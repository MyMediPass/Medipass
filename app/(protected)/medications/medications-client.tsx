"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import { id, InstaQLEntity } from '@instantdb/react'
import { db, schema } from '@/db/instant'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pill,
    Search,
    Check,
    Plus,
    Edit2,
    Loader2,
    Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import MedicationFormDialog, { MedicationFormData as DialogFormData } from "./MedicationFormDialog"

export type Medication = InstaQLEntity<typeof schema, 'medications'>

interface PlainUser {
    id: string;
    fullName: string | null;
    firstName: string | null;
    primaryEmailAddress: string | null;
}

interface MedicationsClientPageProps {
    user: PlainUser | null;
}

export default function MedicationsClientPage({ user }: MedicationsClientPageProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortPreference, setSortPreference] = useState("startDate_desc");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

    const [isPendingSubmit, startSubmitTransition] = useTransition();
    const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

    const [pendingTakeOps, setPendingTakeOps] = useState<Record<string, boolean>>({});

    const { isLoading, error, data } = db.useQuery({
        medications: {
            $: {
                where: { userId: user?.id || "" },
            }
        }
    });

    const medications: Medication[] = data?.medications || [];

    const filteredAndSortedMedications = useMemo(() => {
        let filtered = medications;
        if (statusFilter !== "all") {
            filtered = filtered.filter(med => med.status === statusFilter);
        }
        if (searchQuery) {
            filtered = filtered.filter(med => med.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return filtered.sort((a, b) => {
            if (sortPreference === "refillDate_asc") {
                return (a.refillDate || "").localeCompare(b.refillDate || "");
            } else if (sortPreference === "startDate_desc") {
                return (b.startDate || "").localeCompare(a.startDate || "");
            }
            return 0;
        });
    }, [medications, searchQuery, statusFilter, sortPreference]);

    const userName = useMemo(() => {
        if (!user) return "User";
        if (user.fullName) return user.fullName;
        if (user.firstName) return user.firstName;
        if (user.primaryEmailAddress) return user.primaryEmailAddress.split('@')[0];
        return "User";
    }, [user]);

    if (isLoading && !data) {
        return <div className="container px-4 md:px-6 py-6 md:py-10 text-center flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /> Loading medications...</div>
    }
    if (error) {
        return <div className="container px-4 md:px-6 py-6 md:py-10 text-center text-red-500">Error loading medications: {(error as any).message}</div>;
    }
    if (!user || !user.id) {
        return <div className="container px-4 md:px-6 py-6 md:py-10 text-center">User not authenticated or user ID missing.</div>
    }
    const userId = user.id;

    const resetDialogState = () => {
        setIsModalOpen(false);
        setEditingMedication(null);
        setFormSubmitError(null);
    };

    const openAddModal = () => {
        setModalMode('add');
        setEditingMedication(null);
        setFormSubmitError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (med: Medication) => {
        setModalMode('edit');
        setEditingMedication(med);
        setFormSubmitError(null);
        setIsModalOpen(true);
    };

    const handleDeleteMedication = (medId: string) => {
        if (!confirm("Are you sure you want to delete this medication?")) return;
        db.transact(db.tx.medications[medId].delete())
            .catch(err => {
                console.error("Failed to delete medication:", err);
                setFormSubmitError("Failed to delete medication. " + (err as any).message);
            });
    };

    const handleDialogSubmit = async (formData: DialogFormData, medicationIdToEdit?: string) => {
        setFormSubmitError(null);
        if (!userId) {
            const errMsg = "User ID is missing. Cannot save medication.";
            setFormSubmitError(errMsg);
            throw new Error(errMsg);
        }

        const dataToSubmit: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: userId,
            name: formData.name!,
            dosage: formData.dosage,
            frequency: formData.frequency,
            time: formData.time,
            instructions: formData.instructions,
            refillDate: formData.refillDate,
            status: formData.status || "active",
            pillsRemaining: Number(formData.pillsRemaining) || 0,
            totalPills: Number(formData.totalPills) || 0,
            prescribedBy: formData.prescribedBy,
            startDate: formData.startDate!,
            purpose: formData.purpose,
            endDate: formData.endDate,
        };

        startSubmitTransition(async () => {
            try {
                if (modalMode === 'add') {
                    const newId = id();
                    await db.transact(db.tx.medications[newId].update(dataToSubmit as any));
                } else if (medicationIdToEdit) {
                    await db.transact(db.tx.medications[medicationIdToEdit].update(dataToSubmit as any));
                }
                resetDialogState();
            } catch (err: any) {
                console.error("Error saving medication:", err);
                setFormSubmitError(err.message || "An unknown error occurred while saving.");
                throw err;
            }
        });
    };

    const onTakeMedication = (med: Medication) => {
        if (!med.id || ((med.pillsRemaining !== undefined && med.pillsRemaining <= 0) && typeof med.pillsRemaining === 'number')) return;
        setPendingTakeOps(prev => ({ ...prev, [med.id!]: true }));
        const currentPills = Number(med.pillsRemaining) || 0;
        const newPillsRemaining = Math.max(0, currentPills - 1);
        const updateData: Partial<Medication> = { pillsRemaining: newPillsRemaining };
        if (newPillsRemaining === 0 && med.status === 'active') {
            updateData.status = 'completed';
            updateData.endDate = new Date().toISOString().split('T')[0];
        }
        db.transact(db.tx.medications[med.id!].update(updateData))
            .catch(err => {
                console.error("Error taking medication:", err);
            })
            .finally(() => {
                setPendingTakeOps(prev => ({ ...prev, [med.id!]: false }));
            });
    };

    const PageHeader = () => (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">My Medications</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your prescriptions and track your intake.</p>
            </div>
            <Button onClick={openAddModal} className="flex items-center gap-2"><Plus size={18} /> Add Medication</Button>
        </div>
    );

    const FiltersAndSearch = () => (
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search medications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <TooltipProvider>
            <div className="container mx-auto px-4 md:px-6 py-6 md:py-10">
                <PageHeader />
                <FiltersAndSearch />

                {formSubmitError && <p className="mb-4 text-center text-red-600 bg-red-50 p-3 rounded-md">{formSubmitError}</p>}

                {isLoading && medications.length === 0 && (
                    <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" /><p className="mt-2 text-gray-500">Loading your medications...</p></div>
                )}
                {!isLoading && !error && medications.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <Pill size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-1">No Medications Yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click "Add Medication" to get started.</p>
                        <Button onClick={openAddModal} variant="outline"><Plus size={16} className="mr-2" /> Add First Medication</Button>
                    </div>
                )}
                {error && (
                    <div className="text-center py-10 text-red-500"><p>Could not load medications: {(error as any).message}</p></div>
                )}

                {medications.length > 0 && (
                    <Card className="overflow-hidden shadow-sm dark:border-gray-800">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Name</TableHead>
                                        <TableHead>Dosage</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Pills Left</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedMedications.map((med) => (
                                        <TableRow key={med.id}>
                                            <TableCell className="font-medium">{med.name}</TableCell>
                                            <TableCell>{med.dosage || "-"}</TableCell>
                                            <TableCell>{med.frequency || "-"}</TableCell>
                                            <TableCell><Badge variant={med.status === 'active' ? 'default' : med.status === 'completed' ? 'secondary' : 'outline'}>{med.status || "N/A"}</Badge></TableCell>
                                            <TableCell>
                                                {Number(med.totalPills) && Number(med.totalPills) > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <span>{Number(med.pillsRemaining) || 0} / {Number(med.totalPills)}</span>
                                                        <Progress value={((Number(med.pillsRemaining) || 0) / (Number(med.totalPills))!) * 100} className="w-16 h-1.5" />
                                                    </div>
                                                ) : med.pillsRemaining !== undefined ? (
                                                    `${Number(med.pillsRemaining) || 0}`
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Tooltip><TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => onTakeMedication(med)} disabled={((med.pillsRemaining !== undefined && med.pillsRemaining <= 0) && typeof med.pillsRemaining === 'number') || pendingTakeOps[med.id!]} className="text-green-600 hover:text-green-700">
                                                        {pendingTakeOps[med.id!] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                                                    </Button></TooltipTrigger><TooltipContent>Take 1 Dose</TooltipContent></Tooltip>
                                                <Tooltip><TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(med)} className="text-blue-600 hover:text-blue-700"><Edit2 size={16} /></Button>
                                                </TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
                                                <Tooltip><TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMedication(med.id!)} className="text-red-600 hover:text-red-700"><Trash2 size={16} /></Button>
                                                </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                <MedicationFormDialog
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    mode={modalMode}
                    initialData={editingMedication ? mapMedicationToFormData(editingMedication) : undefined}
                    onSubmitAction={handleDialogSubmit}
                    isSubmitting={isPendingSubmit}
                />
            </div>
        </TooltipProvider>
    );
}

function mapMedicationToFormData(med: Medication): DialogFormData {
    return {
        name: med.name,
        dosage: med.dosage || "",
        frequency: med.frequency || "",
        time: med.time || "",
        instructions: med.instructions || "",
        refillDate: med.refillDate || "",
        status: med.status || "active",
        pillsRemaining: med.pillsRemaining || 0,
        totalPills: med.totalPills || 0,
        prescribedBy: med.prescribedBy || "",
        startDate: med.startDate || "",
        purpose: med.purpose || "",
        endDate: med.endDate || "",
    };
} 
"use client"

import { useState, useEffect, useMemo, useTransition } from "react"
import { useUser } from "@clerk/nextjs";
import { id, InstaQLEntity } from '@instantdb/react';
import { db, schema } from '@/db/instant';
import { format, parseISO, isValid as isValidDate } from "date-fns"

import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Search, MapPin, User as UserIcon, FileText, Filter, PlusCircle, Edit3, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppointmentFormDialog, DialogFormData as AppointmentDialogFormData } from "@/components/appointments/AppointmentFormDialog";

export type Appointment = InstaQLEntity<typeof schema, 'appointments'>;

export type PageAppointmentData = Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'userId'>> & { id?: string };

export default function VisitsPage() {
  const searchParams = useSearchParams();
  const urlAppointmentId = searchParams.get("appointment");
  const { user: clerkUser, isSignedIn, isLoaded: isUserLoaded } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDateForCalendar, setSelectedDateForCalendar] = useState<Date | undefined>(new Date());
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'add' | 'edit'>('add');
  const [editingAppointment, setEditingAppointment] = useState<PageAppointmentData | null>(null);

  useEffect(() => {
    if (urlAppointmentId) {
      setSelectedVisitId(urlAppointmentId);
    }
  }, [urlAppointmentId]);

  const { isLoading: isLoadingAppointments, error: appointmentsError, data: appointmentsData } = db.useQuery({
    appointments: {
      $: {
        where: { userId: clerkUser?.id || "" },
      }
    }
  }, { enabled: !!clerkUser?.id });

  const allAppointments: Appointment[] = appointmentsData?.appointments || [];

  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const parsedDate = parseISO(dateString);
      if (!isValidDate(parsedDate)) return "Invalid Date";
      return format(parsedDate, "MMMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const mapAppointmentToDialogFormData = (appointment: Appointment): AppointmentDialogFormData & { id: string } => {
    return {
      id: appointment.id!,
      doctor: appointment.doctor || "",
      specialty: appointment.specialty || "",
      date: appointment.date,
      time: appointment.time || "",
      location: appointment.location || "",
      address: appointment.address || "",
      notes: appointment.notes || "",
      type: appointment.type || "",
      status: appointment.status || "upcoming",
      summary: appointment.summary || "",
    };
  };

  const filteredAppointments = useMemo(() => {
    return allAppointments.filter((visit) => {
      const nameMatch = (
        visit.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const typeMatch = typeFilter === "all" || visit.type === typeFilter;
      return nameMatch && typeMatch;
    });
  }, [allAppointments, searchQuery, typeFilter]);

  const upcomingVisits = useMemo(() =>
    filteredAppointments
      .filter((visit) => visit.status === "upcoming")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time))
    , [filteredAppointments]);

  const pastVisits = useMemo(() =>
    filteredAppointments
      .filter((visit) => visit.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.time.localeCompare(a.time))
    , [filteredAppointments]);

  const calendarDayVisits = useMemo(() => {
    if (!selectedDateForCalendar) return [];
    const formattedSelectedDate = format(selectedDateForCalendar, "yyyy-MM-dd");
    return allAppointments.filter(appt => appt.date === formattedSelectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [allAppointments, selectedDateForCalendar]);

  const getVisitTypeBadge = (type?: string) => {
    switch (type) {
      case "physical": return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Physical Exam</Badge>;
      case "followup": return <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">Follow-up</Badge>;
      case "checkup": return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Check-up</Badge>;
      case "telehealth": return <Badge variant="outline" className="bg-teal-50 text-teal-700 hover:bg-teal-50">Telehealth</Badge>;
      case "specialist": return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50">Specialist</Badge>;
      case "dental": return <Badge variant="outline" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-50">Dental</Badge>;
      case "therapy": return <Badge variant="outline" className="bg-pink-50 text-pink-700 hover:bg-pink-50">Therapy</Badge>;
      default: return <Badge variant="outline">{type || "Appointment"}</Badge>;
    }
  };

  const openAddAppointmentModal = () => {
    setFormModalMode('add');
    setEditingAppointment(null);
    setIsFormModalOpen(true);
  };

  const openEditAppointmentModal = (appointment: Appointment) => {
    setFormModalMode('edit');
    setEditingAppointment(mapAppointmentToDialogFormData(appointment));
    setIsFormModalOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await db.transact(db.tx.appointments[appointmentId].delete());
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    }
  };

  const handleDialogSubmit = async (data: AppointmentDialogFormData, appointmentIdToEdit?: string) => {
    if (!clerkUser?.id) {
      throw new Error("User not authenticated.");
    }

    const appointmentDataForDb = {
      ...data,
      userId: clerkUser.id,
    };

    try {
      if (appointmentIdToEdit) {
        await db.transact(db.tx.appointments[appointmentIdToEdit].update(appointmentDataForDb));
      } else {
        await db.transact(db.tx.appointments[id()].update(appointmentDataForDb));
      }
    } catch (error) {
      console.error("Failed to save appointment:", error);
      throw error;
    }
  };

  if (!isUserLoaded || isLoadingAppointments) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isSignedIn) {
    return <div className="text-center py-10">Please sign in to view your appointments.</div>;
  }

  if (appointmentsError) {
    return <div className="text-center py-10 text-red-500">Error loading appointments: {(appointmentsError as any).message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Appointments</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1" onClick={openAddAppointmentModal}>
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">New Appointment</span>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Search & Filter</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <label htmlFor="search" className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="search" type="search" placeholder="Doctor, specialty, notes..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="type-filter" className="text-sm font-medium">Visit Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="physical">Physical Exam</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="checkup">Check-up</SelectItem>
                      <SelectItem value="telehealth">Telehealth</SelectItem>
                      <SelectItem value="specialist">Specialist Visit</SelectItem>
                      <SelectItem value="dental">Dental</SelectItem>
                      <SelectItem value="therapy">Therapy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogClose asChild><Button className="w-full">Apply Filters</Button></DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingVisits.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastVisits.length})</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {upcomingVisits.length > 0 ? (
              <div className="space-y-3 pr-4">
                {upcomingVisits.map((visit) => (
                  <Card key={visit.id} className={selectedVisitId === visit.id ? "border-primary shadow-md" : "hover:shadow-sm"} >
                    <CardContent className="p-4 flex items-start justify-between">
                      <div className="cursor-pointer flex-grow" onClick={() => setSelectedVisitId(visit.id === selectedVisitId ? null : visit.id)}>
                        <div className="flex items-center gap-2">
                          <h3 className="text-md font-semibold">{visit.doctor}</h3>
                          {getVisitTypeBadge(visit.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{visit.specialty}</p>
                        <div className="flex flex-col gap-1 mt-2 text-xs">
                          <div className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /><p>{formatDateForDisplay(visit.date)} at {visit.time}</p></div>
                          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><p>{visit.location}</p></div>
                          {visit.notes && <div className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground" /><p className="truncate max-w-xs">{visit.notes}</p></div>}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditAppointmentModal(visit)}><Edit3 size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/90" onClick={() => handleDeleteAppointment(visit.id!)}><Trash2 size={14} /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">No upcoming appointments. Add one to get started!</div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="past">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {pastVisits.length > 0 ? (
              <div className="space-y-3 pr-4">
                {pastVisits.map((visit) => (
                  <Card key={visit.id} className={selectedVisitId === visit.id ? "border-primary shadow-md" : "hover:shadow-sm"} >
                    <CardContent className="p-4 flex items-start justify-between">
                      <div className="cursor-pointer flex-grow" onClick={() => setSelectedVisitId(visit.id === selectedVisitId ? null : visit.id)}>
                        <div className="flex items-center gap-2">
                          <h3 className="text-md font-semibold">{visit.doctor}</h3>
                          {getVisitTypeBadge(visit.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{visit.specialty}</p>
                        <div className="flex flex-col gap-1 mt-2 text-xs">
                          <div className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /><p>{formatDateForDisplay(visit.date)} at {visit.time}</p></div>
                          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><p>{visit.location}</p></div>
                          {visit.summary && <div className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5 text-muted-foreground" /><p className="italic truncate max-w-xs">Summary: {visit.summary}</p></div>}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        {visit.status === "completed" &&
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit Summary or Status" onClick={() => openEditAppointmentModal(visit)}><Edit3 size={14} /></Button>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">No past appointments found.</div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="md:w-1/3 lg:w-1/4">
              <Calendar
                mode="single"
                selected={selectedDateForCalendar}
                onSelect={setSelectedDateForCalendar}
                className="rounded-md border self-start"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-3">
                Appointments on {selectedDateForCalendar ? format(selectedDateForCalendar, "MMMM d, yyyy") : "selected date"}
              </h3>
              {calendarDayVisits.length > 0 ? (
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  <div className="space-y-3 pr-4">
                    {calendarDayVisits.map((visit) => (
                      <Card key={visit.id} className={selectedVisitId === visit.id ? "border-primary shadow-md" : "hover:shadow-sm"} >
                        <CardContent className="p-4 flex items-start justify-between">
                          <div className="cursor-pointer flex-grow" onClick={() => setSelectedVisitId(visit.id === selectedVisitId ? null : visit.id)}>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold">{visit.doctor}</h3>
                              {getVisitTypeBadge(visit.type)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{visit.specialty}</p>
                            <div className="flex flex-col gap-1 mt-2 text-xs">
                              <div className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /><p>Time: {visit.time}</p></div>
                              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><p>{visit.location}</p></div>
                              {visit.notes && <div className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground" /><p className="truncate max-w-xs">{visit.notes}</p></div>}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1 ml-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditAppointmentModal(visit)}><Edit3 size={14} /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/90" onClick={() => handleDeleteAppointment(visit.id!)}><Trash2 size={14} /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No appointments scheduled for this day.
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => {
                    openAddAppointmentModal();
                  }}>
                    Add for this date
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {clerkUser?.id && (
        <AppointmentFormDialog
          isOpen={isFormModalOpen}
          onOpenChange={setIsFormModalOpen}
          mode={formModalMode}
          initialData={editingAppointment || undefined}
          onSubmitAction={handleDialogSubmit}
          userId={clerkUser.id}
        />
      )}
    </div>
  );
}

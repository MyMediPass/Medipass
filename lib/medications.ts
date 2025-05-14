'use server';

import { createClient } from '@/lib/supabase/server';
import { differenceInDays, isValid, parseISO } from 'date-fns';

// Medication type as consumed by the UI, including calculated fields
export type Medication = {
    id: number; // Database primary key
    name: string;
    dosage: string;
    frequency: string;
    time: string;
    instructions: string;
    refillDate: string; // Expected as a string, e.g., "YYYY-MM-DD" or "Month DD, YYYY"
    daysUntilRefill: number; // Calculated on fetch/update
    status: "active" | "completed";
    pillsRemaining: number;
    totalPills: number;
    prescribedBy: string;
    startDate: string; // Expected as a string
    purpose: string;
    endDate?: string; // Expected as a string
    // user_id and created_at can be added if needed by the UI directly
};

// Data structure for the JSONB 'data' column in Supabase
// It excludes 'id' (which is a top-level DB column)
// and 'daysUntilRefill' (which is calculated).
export type StoredMedicationData = Omit<Medication, 'id' | 'daysUntilRefill'>;

// Helper function to robustly calculate daysUntilRefill
function calculateDaysUntilRefill(status: string, refillDateStr: string | undefined | null): number {
    if (status !== 'active' || !refillDateStr || refillDateStr === "N/A") {
        return 0;
    }
    // new Date() can parse "May 15, 2025" and "YYYY-MM-DD" among others.
    // For consistency, storing dates as "YYYY-MM-DD" is recommended.
    const parsedDate = new Date(refillDateStr);
    if (isValid(parsedDate)) {
        const diff = differenceInDays(parsedDate, new Date());
        return diff < 0 ? 0 : diff; // Return 0 if date is past, no negative days
    }
    console.warn('Invalid refillDate format for calculation: ' + refillDateStr);
    return 0; // Default if parsing fails or date is invalid
}

export async function getMedications(userId: string): Promise<Medication[]> {
    const supabase = await createClient(); // Uses server client
    const { data: dbRows, error } = await supabase
        .from('medications') // Ensure this is your table name
        .select('id, data') // Add 'created_at' if needed on Medication type
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching medications:', error);
        // In a real app, you might want to throw a user-friendly error or handle it differently
        throw error;
    }

    if (!dbRows) {
        return [];
    }

    return dbRows.map(row => {
        // Type assertion for the data from JSONB
        const medicationData = row.data as StoredMedicationData;
        const daysUntilRefill = calculateDaysUntilRefill(medicationData.status, medicationData.refillDate);

        return {
            id: row.id,
            ...medicationData,
            daysUntilRefill,
        };
    }); // The map should produce Medication[] items implicitly
}

export async function addMedication(userId: string, medicationDetails: StoredMedicationData): Promise<Medication> {
    const supabase = await createClient();

    const { data: insertedRow, error } = await supabase
        .from('medications')
        .insert([{ user_id: userId, data: medicationDetails }])
        .select('id, data') // Select 'created_at' if needed for the returned Medication object
        .single();

    if (error) {
        console.error('Error adding medication:', error);
        throw error;
    }
    if (!insertedRow) {
        throw new Error('Failed to add medication, no data returned from Supabase.');
    }

    const storedData = insertedRow.data as StoredMedicationData;
    const daysUntilRefill = calculateDaysUntilRefill(storedData.status, storedData.refillDate);

    return {
        id: insertedRow.id,
        ...storedData,
        daysUntilRefill,
        // created_at: insertedRow.created_at, // if you add created_at to Medication type
    };
}

export async function updateMedication(medicationId: number, updates: Partial<StoredMedicationData>): Promise<Medication> {
    const supabase = await createClient();

    // Fetch the current medication data to merge updates, ensuring atomicity if possible or handling carefully
    const { data: currentRow, error: fetchError } = await supabase
        .from('medications')
        .select('id, data') // Add 'created_at', 'user_id' if they are part of Medication type and needed
        .eq('id', medicationId)
        .single();

    if (fetchError || !currentRow) {
        console.error('Error fetching medication for update or medication not found:', fetchError);
        throw fetchError || new Error('Medication not found for update.');
    }

    const currentStoredData = currentRow.data as StoredMedicationData;
    const newDataToStore: StoredMedicationData = { ...currentStoredData, ...updates };

    const { data: updatedRow, error: updateError } = await supabase
        .from('medications')
        .update({ data: newDataToStore })
        .eq('id', medicationId)
        .select('id, data') // Select 'created_at' if needed
        .single();

    if (updateError) {
        console.error('Error updating medication:', updateError);
        throw updateError;
    }
    if (!updatedRow) {
        throw new Error('Failed to update medication, no data returned from Supabase.');
    }

    const returnedStoredData = updatedRow.data as StoredMedicationData;
    const daysUntilRefill = calculateDaysUntilRefill(returnedStoredData.status, returnedStoredData.refillDate);

    return {
        id: updatedRow.id,
        ...returnedStoredData,
        daysUntilRefill,
        // created_at: updatedRow.created_at, // if you add created_at to Medication type
    };
} 
'use server'

import { addMedication, StoredMedicationData, updateMedication, Medication } from "@/lib/medications";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface AddMedicationResult {
    success: boolean;
    medication?: StoredMedicationData; // Or the full Medication type if you prefer to return the calculated one
    error?: string;
}

interface UpdateMedicationResult {
    success: boolean;
    medication?: Medication; // Return the full Medication type with calculated fields
    error?: string;
}

export async function handleAddMedication(medicationData: StoredMedicationData, id?: number): Promise<AddMedicationResult | UpdateMedicationResult> {
    const user = await getUser();

    if (!user) {
        return { success: false, error: "User not authenticated." };
    }

    try {
        if (id) {
            // This is an update
            const updatedMedication = await updateMedication(id, medicationData);
            revalidatePath('/(protected)/medications');
            return { success: true, medication: updatedMedication };
        } else {
            // This is an add
            const newMedication = await addMedication(user.id, medicationData);
            revalidatePath('/(protected)/medications');
            return { success: true, medication: newMedication };
        }
    } catch (error) {
        console.error(`Error in ${id ? 'updating' : 'adding'} medication server action:`, error);
        let errorMessage = `Failed to ${id ? 'update' : 'add'} medication.`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}

export async function handleTakeMedication(medicationId: number): Promise<UpdateMedicationResult> {
    const user = await getUser(); // Ensure user is authenticated for this action too
    if (!user) {
        return { success: false, error: "User not authenticated." };
    }

    try {
        // Fetch the current medication to get its data, including pillsRemaining
        // This step is implicitly handled by our updateMedication which fetches first
        // For a pure "take" action, we might fetch, then update if we needed more complex logic before decrementing.
        // However, updateMedication will receive the ID and the partial data to update.

        // We need to know the current pillsRemaining to decrement it.
        // The updateMedication function in lib/medications.ts handles fetching the existing data and merging.
        // So, we can call it with the desired change directly.
        // Let's adjust lib/medications.ts's updateMedication if it doesn't support decrementing easily,
        // or add a specific function there. For now, assuming updateMedication can take a function or handle it.

        // Simpler approach: Fetch here, then call update. This is less atomic but clearer for this specific action.
        const supabase = await createClient(); // from @/lib/supabase/server, used by lib/medications too
        const { data: currentRow, error: fetchError } = await supabase
            .from('medications')
            .select('id, data')
            .eq('user_id', user.id) // Ensure we only fetch the user's medication
            .eq('id', medicationId)
            .single();

        if (fetchError || !currentRow) {
            console.error('Error fetching medication for taking or medication not found:', fetchError);
            return { success: false, error: "Medication not found or could not be fetched." };
        }

        const currentStoredData = currentRow.data as StoredMedicationData;

        if (currentStoredData.pillsRemaining <= 0) {
            return { success: false, error: "No pills remaining to take." };
        }

        const newPillsRemaining = currentStoredData.pillsRemaining - 1;
        const updatedData: Partial<StoredMedicationData> = { pillsRemaining: newPillsRemaining };

        // If taking the last pill makes the medication completed, update status and endDate
        if (newPillsRemaining === 0 && currentStoredData.status === 'active') {
            updatedData.status = 'completed';
            updatedData.endDate = new Date().toISOString().split('T')[0]; // Set endDate to today YYYY-MM-DD
        }

        const updatedMedication = await updateMedication(medicationId, updatedData);

        revalidatePath('/(protected)/medications');

        return { success: true, medication: updatedMedication };

    } catch (error) {
        console.error("Error in handleTakeMedication server action:", error);
        let errorMessage = "Failed to record medication dose.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}

// You can add other actions like handleUpdateMedication (for "Take") here later 
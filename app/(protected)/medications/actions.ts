'use server'

import { addMedication, StoredMedicationData } from "@/lib/medications";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface AddMedicationResult {
    success: boolean;
    medication?: StoredMedicationData; // Or the full Medication type if you prefer to return the calculated one
    error?: string;
}

export async function handleAddMedication(medicationData: StoredMedicationData): Promise<AddMedicationResult> {
    const user = await getUser();

    if (!user) {
        return { success: false, error: "User not authenticated." };
    }

    try {
        // All fields in StoredMedicationData are expected to be provided by the form
        // except id and daysUntilRefill which are handled by the backend/database or calculated.
        const newMedication = await addMedication(user.id, medicationData);

        revalidatePath('/(protected)/medications'); // Revalidate the page to show the new medication

        // The addMedication function already returns the new medication object including its db ID
        // We are returning StoredMedicationData from the action for now, but could return the full Medication type
        return { success: true, medication: newMedication };
    } catch (error) {
        console.error("Error in handleAddMedication server action:", error);
        let errorMessage = "Failed to add medication.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}

// You can add other actions like handleUpdateMedication (for "Take") here later 
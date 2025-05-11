import { getHealthNotes, Note } from "./health-notes"
import { getHealthVitals, VitalData, getHistoricalVitalData, HistoricalData } from "./health-vitals"
import { getFamilyHistory, FamilyMember } from "./family-history"
import { getMedications, Medication } from "./medications"
import { getProfile, Profile } from "./profile"

export type LLMContext = {
    profile: Profile
    healthNotes: Note[]
    healthVitals: VitalData[]
    historicalVitalData: HistoricalData
    familyHistory: FamilyMember[]
    medications: Medication[]
    // We'll add more data types here as we extract them from other pages
}

export function buildLLMContext(userId: string): LLMContext {
    // Collect all the data we need for the LLM context
    const profile = getProfile(userId)
    const healthNotes = getHealthNotes(userId)
    const healthVitals = getHealthVitals(userId)
    const historicalVitalData = getHistoricalVitalData(userId)
    const familyHistory = getFamilyHistory(userId)
    const medications = getMedications(userId)

    // Return the combined context
    return {
        profile,
        healthNotes,
        healthVitals,
        historicalVitalData,
        familyHistory,
        medications,
        // Add more data as we extract it from other pages
    }
} 
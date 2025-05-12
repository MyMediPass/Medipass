import { inngest } from './client';
import { extractPdfContents } from './extractPdfContents';
import { createClient } from '@supabase/supabase-js';

// Define the event payload structure for better type safety
interface FileAnalysisPayload {
    filePathInBucket: string;
    originalFileName: string;
    contentType: string;
    userId?: string | null;
}

export const fileAnalysisRequested = inngest.createFunction(
    { id: 'file-analysis-requested', name: 'File Analysis Requested' },
    { event: 'file/analysis.requested' },
    async ({ event, step }) => {
        const { filePathInBucket, originalFileName, contentType, userId } = event.data as FileAnalysisPayload;

        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Extract PDF contents
        const extractedData = await step.run('extract-pdf-contents', async () => {
            console.log(`[Inngest Function] Extracting contents from ${originalFileName}`);
            return await extractPdfContents(filePathInBucket);
        });

        // Save extracted data to database
        await step.run('save-extracted-data', async () => {
            // 1. Upsert patient
            const patient = extractedData.patient;
            let patientId: string | null = null;
            if (patient) {
                // Try to find patient by name, dob, and sex
                const { data: existingPatients, error: findPatientError } = await supabase
                    .from('patients')
                    .select('id')
                    .eq('name', patient.name)
                    .eq('dob', patient.dob)
                    .eq('sex', patient.sex)
                    .limit(1);
                if (findPatientError) throw new Error(`Failed to search for patient: ${findPatientError.message}`);
                if (existingPatients && existingPatients.length > 0) {
                    patientId = existingPatients[0].id;
                } else {
                    // Insert new patient
                    const { data: newPatient, error: insertPatientError } = await supabase
                        .from('patients')
                        .insert({
                            name: patient.name,
                            patient_id: patient.id,
                            age: patient.age,
                            dob: patient.dob,
                            sex: patient.sex
                        })
                        .select('id')
                        .single();
                    if (insertPatientError) throw new Error(`Failed to insert patient: ${insertPatientError.message}`);
                    patientId = newPatient.id;
                }
            }

            // 2. Insert lab_report
            const now = new Date().toISOString();
            const { data: labReport, error: insertLabReportError } = await supabase
                .from('lab_reports')
                .insert({
                    user_id: userId,
                    patient_id: patientId,
                    created_at: now,
                    report_date: extractedData.report_metadata?.collected || null,
                    source: 'ai',
                    status: 'processed',
                    original_filename: originalFileName,
                    extracted_data: extractedData,
                    file_path: filePathInBucket,
                    metadata: extractedData.report_metadata
                })
                .select('id')
                .single();
            if (insertLabReportError) throw new Error(`Failed to insert lab_report: ${insertLabReportError.message}`);
            const reportId = labReport.id;

            // 3. Insert panels
            if (Array.isArray(extractedData.panels)) {
                for (const panel of extractedData.panels) {
                    const { data: panelRow, error: insertPanelError } = await supabase
                        .from('panels')
                        .insert({
                            report_id: reportId,
                            name: panel.name,
                            reported_at: panel.reported || null,
                            lab_name: extractedData.report_metadata?.lab?.name || null,
                            status: panel.status
                        })
                        .select('id')
                        .single();
                    if (insertPanelError) throw new Error(`Failed to insert panel: ${insertPanelError.message}`);
                    const panelId = panelRow.id;

                    // 4. Insert test_results
                    if (Array.isArray(panel.results)) {
                        for (const result of panel.results) {
                            const { error: insertResultError } = await supabase
                                .from('test_results')
                                .insert({
                                    panel_id: panelId,
                                    test_name: result.test,
                                    result_value: result.result?.toString() ?? null,
                                    units: result.units ?? null,
                                    flag: result.flag ?? null,
                                    reference_range: result.reference_range ?? null,
                                    is_calculated: typeof result.result === 'string' && result.result.includes('calc'),
                                    note: result.note ?? null,
                                    created_at: panel.reported || new Date().toISOString()
                                });
                            if (insertResultError) throw new Error(`Failed to insert test_result: ${insertResultError.message}`);
                        }
                    }
                }
            }

            return { message: 'Data saved successfully', patientId, reportId };
        });

        return {
            eventName: event.name,
            success: true,
            processedFile: originalFileName,
            extractedData
        };
    }
);
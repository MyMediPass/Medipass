import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase'; // Import the service role client
// import { inngest } from '@/inngest/client'; // Remove Inngest client import
import { getUser } from '@/lib/auth';
import { extractPdfContents, ExtractedPdfData } from '@/inngest/extractPdfContents'; // Import PDF extraction utilities
import { createClient } from '@supabase/supabase-js'; // Import Supabase client for database operations

export async function POST(request: NextRequest) {
    try {
        // Get user session
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
        }

        const fileName = file.name;
        const fileType = file.type;
        const fileBuffer = Buffer.from(await file.arrayBuffer()); // Get file content as buffer

        // 1. Upload file to Supabase
        const supabaseAdmin = createSupabaseServiceRoleClient();
        const bucketName = 'bucket'; // Your specified bucket name
        // Sanitize filename to prevent path traversal issues, though Supabase handles this well.
        // Create a unique path for the file to avoid overwrites and ensure organization.
        const supabaseFilePath = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(supabaseFilePath, fileBuffer, {
                contentType: fileType,
                upsert: false, // true to overwrite if file exists, false to error
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({ error: `Supabase upload failed: ${uploadError.message}` }, { status: 500 });
        }

        console.log('File uploaded to Supabase:', uploadData?.path);

        // 2. Extract PDF contents
        console.log(`[API Route] Extracting contents from ${fileName}`);
        const extractedData: ExtractedPdfData = await extractPdfContents(supabaseFilePath);

        // 3. Save extracted data to database
        // Initialize Supabase client for database operations (can reuse supabaseAdmin if configured for db access)
        // For this example, we'll stick to how it was in the inngest function, creating a new client
        // or ensuring supabaseAdmin has db access rights with service role.
        // Re-using supabaseAdmin from createSupabaseServiceRoleClient() is generally fine if it's set up for both storage and db.
        const supabase = supabaseAdmin; // Using the existing service role client for database operations

        // Upsert patient
        const patient = extractedData.patient;
        let patientId: string | null = null;
        if (patient) {
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
                if (newPatient) patientId = newPatient.id;
            }
        }

        // Insert lab_report
        const now = new Date().toISOString();
        const { data: labReport, error: insertLabReportError } = await supabase
            .from('lab_reports')
            .insert({
                user_id: user.id, // Use user.id from session
                patient_id: patientId,
                created_at: now,
                report_date: extractedData.report_metadata?.collected || null,
                source: 'ai',
                status: 'processed',
                original_filename: fileName, // Use fileName from request
                extracted_data: extractedData as any, // Cast to any if type issues persist with Supabase types
                file_path: supabaseFilePath, // Use supabaseFilePath
                metadata: extractedData.report_metadata as any // Cast to any if type issues persist
            })
            .select('id')
            .single();
        if (insertLabReportError) throw new Error(`Failed to insert lab_report: ${insertLabReportError.message}`);
        const reportId = labReport?.id;

        // Insert panels
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
                const panelId = panelRow?.id;

                // Insert test_results
                if (Array.isArray(panel.results)) {
                    for (const result of panel.results) {
                        const { error: insertResultError } = await supabase
                            .from('test_results')
                            .insert({
                                panel_id: panelId,
                                test_name: result.test,
                                result_value: result.result?.toString() ?? null,
                                units: result.units ?? null, // Added units field
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

        console.log('Data saved to database successfully. Report ID:', reportId);

        return NextResponse.json({
            message: 'File uploaded, processed, and data saved successfully.',
            fileName,
            supabaseFilePath: uploadData?.path,
            reportId: reportId,
            // extractedData // Optionally return extractedData if needed by the client
        });
    } catch (error: any) {
        console.error('Operation failed:', error);
        return NextResponse.json({ error: `Operation failed: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
} 
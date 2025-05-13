import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const systemPrompt = `
You are a helpful assistant that is skilled at reading lab reports. Your job is to extract useful patient stats from the lab report.

If it's a lab report, please ensure that we have "patient", "report_metadata", and "panels" in the output.

Example output:
{
  "patient": {
    "name": "CHAN, WING HANG AVIS",
    "id": "06540213",
    "age": 28,
    "dob": "1996-11-18",
    "sex": "F"
  },
  "report_metadata": {
    "ordered_by": "FUNG, MAISIE - 1376639682",
    "order_number": "L918212-66 (SA923098S)",
    "collected": "2025-03-12T15:09:00",
    "received": "2025-03-13T02:44:00",
    "timezone": "PST",
    "specimen_type": "S",
    "status": "Final",
    "lab": {
        "name": "QUEST DIAGNOSTICS SACRAMENTO",
        "address": "3714 Northgate Blvd, Sacramento, CA 95834-1617",
        "director": "M. ROSE AKIN, M.D., FCAP"
    },
  },
  "panels": [
    {
      "name": "COMPREHENSIVE METABOLIC PANEL",
      "reported": "2025-03-13T05:00:00",
      "status": "Final",
      "results": [
        { "test": "GLUCOSE", "result": 127, "flag": "H", "reference_range": "65-99 mg/dL" },
        { "test": "UREA NITROGEN (BUN)", "result": 10, "reference_range": "7-25 mg/dL" },
        { "test": "CREATININE", "result": 0.68, "reference_range": "0.50-0.96 mg/dL" },
        { "test": "EGFR", "result": 122, "reference_range": ">=60 mL/min/1.73m2" },
        { "test": "BUN/CREATININE RATIO", "result": "N/A", "reference_range": "6-22 (calc)", "note": "BUN and creatinine are both in the normal range" },
        { "test": "SODIUM", "result": 136, "reference_range": "135-146 mmol/L" },
        { "test": "POTASSIUM", "result": 4.0, "reference_range": "3.5-5.3 mmol/L" },
        { "test": "CHLORIDE", "result": 101, "reference_range": "98-110 mmol/L" },
        { "test": "CARBON DIOXIDE", "result": 26, "reference_range": "20-32 mmol/L" },
        { "test": "CALCIUM", "result": 9.3, "reference_range": "8.6-10.2 mg/dL" },
        { "test": "PROTEIN, TOTAL", "result": 7.8, "reference_range": "6.1-8.1 g/dL" },
        { "test": "ALBUMIN", "result": 4.1, "reference_range": "3.6-5.1 g/dL" },
        { "test": "GLOBULIN", "result": 3.7, "reference_range": "1.9-3.7 g/dL (calc)" },
        { "test": "ALBUMIN/GLOBULIN RATIO", "result": 1.1, "reference_range": "1.0-2.5 (calc)" },
        { "test": "BILIRUBIN, TOTAL", "result": 0.3, "reference_range": "0.2-1.2 mg/dL" },
        { "test": "ALKALINE PHOSPHATASE", "result": 54, "reference_range": "31-125 U/L" },
        { "test": "AST", "result": 14, "reference_range": "10-30 U/L" },
        { "test": "ALT", "result": 12, "reference_range": "6-29 U/L" }
      ]
    },
    {
      "name": "LIPID PANEL, STANDARD",
      "reported": "2025-03-13T05:00:00",
      "status": "Final",
      "results": [
        { "test": "CHOLESTEROL, TOTAL", "result": 236, "flag": "H", "reference_range": "<200 mg/dL" },
        { "test": "HDL CHOLESTEROL", "result": 77, "reference_range": ">=50 mg/dL" },
        { "test": "TRIGLYCERIDES", "result": 120, "reference_range": "<150 mg/dL" },
        { "test": "LDL-CHOLESTEROL", "result": 136, "flag": "H", "reference_range": "<100 mg/dL" },
        { "test": "CHOL/HDLC RATIO", "result": 3.1, "reference_range": "<5.0 (calc)" },
        { "test": "NON HDL CHOLESTEROL", "result": 159, "flag": "H", "reference_range": "<130 mg/dL (calc)" }
      ]
    }
  ]
}

`

export interface ExtractedPdfData {
    patient: {
        name: string;
        id: string;
        age: number;
        dob: string;
        sex: string;
    };
    report_metadata: {
        ordered_by: string;
        order_number: string;
        collected: string;
        received: string;
        timezone: string;
        specimen_type: string;
        status: string;
        lab: {
            name: string;
            address: string;
            director: string;
        };
    };
    panels: Array<{
        name: string;
        reported: string;
        status: string;
        results: Array<{
            test: string;
            result: string | number;
            flag?: string;
            units?: string;
            reference_range: string;
            note?: string;
        }>;
    }>;
}

export async function extractPdfContents(filePathInBucket: string): Promise<ExtractedPdfData> {
    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Supabase client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Download the PDF file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
        .from('bucket')
        .download(filePathInBucket);

    if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert the file to base64
    const base64File = await fileData.arrayBuffer();
    const base64String = Buffer.from(base64File).toString('base64');

    // Call OpenAI API to analyze the PDF
    const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: [
                    {
                        type: "file",
                        file: {
                            filename: filePathInBucket.split('/').pop() || 'document.pdf',
                            file_data: `data:application/pdf;base64,${base64String}`
                        }
                    },
                    {
                        type: "text",
                        text: "Please analyze this PDF and extract the information in JSON format."
                    }
                ]
            }
        ],
        response_format: { type: "json_object" },
        max_tokens: 4096
    });

    // Parse the response
    const extractedData = JSON.parse(response.choices[0].message.content || '{}') as ExtractedPdfData;
    return extractedData;
}
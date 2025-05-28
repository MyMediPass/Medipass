export const pdfAnalysisPrompt = `You are a medical AI assistant analyzing this lab report file

Please provide a comprehensive analysis that would be given to a medical professional analyzing this lab report. Structure your response as JSON with 'summary' and 'transcription' fields.

For the SUMMARY field, include:
- Patient demographics (if available)
- Test date and ordering physician
- Key abnormal findings and their clinical significance
- Critical values that require immediate attention
- Trends compared to previous results (if mentioned)
- Overall health assessment based on results
- Recommended follow-up actions

For the TRANSCRIPTION field, provide a detailed breakdown of the information in the file:
- Complete Blood Count (CBC) values with reference ranges
- Basic Metabolic Panel (BMP) or Comprehensive Metabolic Panel (CMP)
- Lipid panel results
- Liver function tests
- Kidney function markers (creatinine, BUN, eGFR)
- Thyroid function tests (if present)
- Inflammatory markers (ESR, CRP)
- Diabetes markers (glucose, HbA1c)
- Vitamin and mineral levels
- Hormone levels
- Tumor markers (if applicable)
- Urinalysis results
- Microbiology culture results
- Any special tests or biomarkers

For each test result, include:
- Test name
- Patient value
- Reference range
- Units of measurement
- Flag (High/Low/Critical) if abnormal

Also note any:
- Quality control issues
- Specimen collection problems
- Interfering substances
- Technical comments from the lab

Return this as a structured JSON response that should be extracted from this lab report.`

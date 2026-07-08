
// ---- Globals shim: standalone React + lucide (loaded via <script> in index.html) ----
const { useState, useMemo, useEffect, useRef } = React;
const {
  LayoutDashboard, FileText, Pill, AlertTriangle, ClipboardCheck, GraduationCap,
  ListChecks, ShieldCheck, ScanLine, ChevronRight, X, Check, CircleAlert,
  Activity, FlaskConical, Clock, Lock, Unlock, BookOpen, Stethoscope
} = lucide;

/* ====== INLINED DATA (fictional, training only) ====== */
// Data layer — fictional patients, meds, scenarios, quiz bank
// ALL FICTIONAL. No real patient information.

const PATIENTS = [
  {
    id: "P01", room: "412-A", mrn: "FX-0041201", name: "Robert Alvarez", age: 64, sex: "M",
    dx: "Type 2 DM, Hypertension, CAD", acuity: 3, provider: "Dr. Okafor",
    code: "Full Code", isolation: "None", fallRisk: "High (Morse 55)", diet: "Carb-controlled 1800",
    activity: "Up with assist", allergies: ["Penicillin (hives)", "Shellfish (anaphylaxis)"],
    alerts: ["High fall risk", "Insulin — high-alert med", "Renal: hold metformin if contrast"],
    setting: "Med-Surg",
    vitals: { bp: "158/92", hr: 88, rr: 18, temp: "98.4°F", spo2: "96% RA", pain: "3/10", glucose: "212 mg/dL" },
    labs: [
      { name: "Glucose", val: "212", unit: "mg/dL", flag: "H", ref: "70–110" },
      { name: "K+", val: "4.1", unit: "mEq/L", flag: "", ref: "3.5–5.0" },
      { name: "Creatinine", val: "1.9", unit: "mg/dL", flag: "H", ref: "0.6–1.3" },
      { name: "A1c", val: "9.2", unit: "%", flag: "H", ref: "<5.7" },
    ],
  },
  {
    id: "P02", room: "418-B", mrn: "FX-0041802", name: "Diane Whitfield", age: 77, sex: "F",
    dx: "Atrial fibrillation, CHF", acuity: 4, provider: "Dr. Reyes",
    code: "DNR/DNI", isolation: "None", fallRisk: "High (Morse 60)", diet: "2g Na, fluid restrict 1.5L",
    activity: "Bedrest", allergies: ["Sulfa (rash)"],
    alerts: ["Anticoagulant — high-alert", "Hold warfarin if INR > 3.5", "Fluid restriction"],
    setting: "Med-Surg",
    vitals: { bp: "104/61", hr: 72, rr: 20, temp: "98.1°F", spo2: "94% 2L NC", pain: "1/10", glucose: "—" },
    labs: [
      { name: "INR", val: "3.8", unit: "", flag: "H", ref: "2.0–3.0 (target)" },
      { name: "BNP", val: "640", unit: "pg/mL", flag: "H", ref: "<100" },
      { name: "Hgb", val: "10.1", unit: "g/dL", flag: "L", ref: "12–16" },
      { name: "K+", val: "3.3", unit: "mEq/L", flag: "L", ref: "3.5–5.0" },
    ],
  },
  {
    id: "P03", room: "405-A", mrn: "FX-0040503", name: "Marcus Lindqvist", age: 52, sex: "M",
    dx: "Post-op day 1, ORIF right hip", acuity: 3, provider: "Dr. Bashir",
    code: "Full Code", isolation: "Contact (MRSA hx)", fallRisk: "High", diet: "Regular, advance as tol",
    activity: "Up to chair with PT", allergies: ["Codeine (nausea)"],
    alerts: ["Opioid — high-alert", "Hold opioid if RR < 12 or sedated", "Contact precautions"],
    setting: "Surgical",
    vitals: { bp: "128/78", hr: 96, rr: 11, temp: "100.8°F", spo2: "93% RA", pain: "8/10", glucose: "—" },
    labs: [
      { name: "WBC", val: "13.2", unit: "K/uL", flag: "H", ref: "4.5–11" },
      { name: "Hgb", val: "9.4", unit: "g/dL", flag: "L", ref: "13–17" },
    ],
  },
  {
    id: "P04", room: "Psych-7", mrn: "FX-0070704", name: "Talia Brennan", age: 29, sex: "F",
    dx: "Major depressive disorder, suicidal ideation", acuity: 4, provider: "Dr. Mehta",
    code: "Full Code", isolation: "None", fallRisk: "Low", diet: "Regular (supervised)",
    activity: "Unit only, 1:1 observation", allergies: ["NKDA"],
    alerts: ["Suicide precautions — 1:1", "Remove sharps/ligature risks", "Psych med adherence"],
    setting: "Psychiatric",
    vitals: { bp: "118/74", hr: 80, rr: 16, temp: "98.6°F", spo2: "99% RA", pain: "0/10", glucose: "—" },
    labs: [
      { name: "TSH", val: "2.1", unit: "uIU/mL", flag: "", ref: "0.4–4.0" },
      { name: "Lithium", val: "—", unit: "", flag: "", ref: "0.6–1.2 (if ordered)" },
    ],
  },
  {
    id: "P05", room: "SNF-22", mrn: "FX-0220905", name: "Eleanor Pham", age: 84, sex: "F",
    dx: "COPD, dementia, recurrent UTI", acuity: 2, provider: "Dr. Calloway",
    code: "DNR", isolation: "None", fallRisk: "High", diet: "Mechanical soft, aspiration precautions",
    activity: "Wheelchair, 2-assist", allergies: ["Levofloxacin (tendon pain)"],
    alerts: ["Aspiration risk", "Multiple meds — reconcile", "Dementia — reorient, consent via POA"],
    setting: "Skilled Nursing",
    vitals: { bp: "138/80", hr: 84, rr: 22, temp: "99.4°F", spo2: "91% RA", pain: "2/10", glucose: "—" },
    labs: [
      { name: "WBC", val: "11.8", unit: "K/uL", flag: "H", ref: "4.5–11" },
      { name: "UA", val: "+nitrites", unit: "", flag: "H", ref: "neg" },
    ],
  },
];

// Medication orders keyed by patient id
const MED_ORDERS = {
  P01: [
    { id: "M01a", name: "Insulin glargine (Lantus)", dose: "22 units", route: "Subcut", freq: "Daily at HS", type: "scheduled", highAlert: true, indication: "Type 2 DM basal", due: "21:00", check: "glucose", note: "Long-acting — do NOT hold for low-normal; assess pattern." },
    { id: "M01b", name: "Insulin lispro (Humalog)", dose: "Sliding scale", route: "Subcut", freq: "AC & HS", type: "scheduled", highAlert: true, indication: "Glycemic control", due: "07:30", check: "glucose", note: "Glucose 212 → per scale give 4 units. Verify scale order." },
    { id: "M01c", name: "Metformin", dose: "1000 mg", route: "PO", freq: "BID with meals", type: "scheduled", highAlert: false, indication: "Type 2 DM", due: "08:00", check: "renal", note: "Creatinine 1.9 — flag provider re: renal dosing/contrast." },
    { id: "M01d", name: "Lisinopril", dose: "20 mg", route: "PO", freq: "Daily", type: "scheduled", highAlert: false, indication: "HTN", due: "08:00", check: "bp", note: "Hold if SBP < 100. Current 158 — give." },
    { id: "M01e", name: "Acetaminophen", dose: "650 mg", route: "PO", freq: "Q6H PRN pain/fever", type: "prn", highAlert: false, indication: "Mild pain", due: "PRN", check: null, note: "Max 3g/day. Reassess pain in 60 min." },
  ],
  P02: [
    { id: "M02a", name: "Warfarin", dose: "5 mg", route: "PO", freq: "Daily at 17:00", type: "scheduled", highAlert: true, indication: "AFib stroke prevention", due: "17:00", check: "inr", note: "INR 3.8 (>3.5 threshold). HOLD and notify provider." },
    { id: "M02b", name: "Furosemide", dose: "40 mg", route: "IV", freq: "BID", type: "scheduled", highAlert: false, indication: "CHF / fluid overload", due: "09:00", check: "k", note: "K+ 3.3 low — furosemide wastes K+. Flag provider, monitor." },
    { id: "M02c", name: "Metoprolol", dose: "25 mg", route: "PO", freq: "BID", type: "scheduled", highAlert: false, indication: "Rate control AFib", due: "09:00", check: "hr", note: "Hold if HR < 60 or SBP < 100. HR 72 — give." },
    { id: "M02d", name: "Potassium chloride", dose: "20 mEq", route: "PO", freq: "Daily", type: "scheduled", highAlert: false, indication: "Hypokalemia", due: "09:00", check: "k", note: "Give with food. Recheck K+ per order." },
  ],
  P03: [
    { id: "M03a", name: "Hydromorphone (Dilaudid)", dose: "0.5 mg", route: "IV", freq: "Q3H PRN severe pain", type: "prn", highAlert: true, indication: "Post-op pain", due: "PRN", check: "rr", note: "RR 11 (<12 threshold). HOLD opioid, reassess, notify provider." },
    { id: "M03b", name: "Cefazolin", dose: "1 g", route: "IV", freq: "Q8H", type: "scheduled", highAlert: false, indication: "Surgical prophylaxis", due: "10:00", check: "temp", note: "Temp 100.8 — continue, monitor WBC/site." },
    { id: "M03c", name: "Enoxaparin", dose: "40 mg", route: "Subcut", freq: "Daily", type: "scheduled", highAlert: true, indication: "DVT prophylaxis", due: "10:00", check: null, note: "Rotate abdominal sites, do not aspirate or expel bubble." },
    { id: "M03d", name: "Acetaminophen", dose: "1000 mg", route: "PO", freq: "Q6H scheduled", type: "scheduled", highAlert: false, indication: "Multimodal pain", due: "10:00", check: null, note: "Scheduled non-opioid — give to spare opioids." },
  ],
  P04: [
    { id: "M04a", name: "Sertraline", dose: "100 mg", route: "PO", freq: "Daily AM", type: "scheduled", highAlert: false, indication: "MDD", due: "08:00", check: null, note: "Observe swallowing (suicide precautions — no cheeking)." },
    { id: "M04b", name: "Trazodone", dose: "50 mg", route: "PO", freq: "QHS PRN insomnia", type: "prn", highAlert: false, indication: "Insomnia", due: "PRN", check: null, note: "Fall risk if up at night — assist." },
    { id: "M04c", name: "Lorazepam", dose: "1 mg", route: "PO", freq: "Q6H PRN agitation", type: "prn", highAlert: false, indication: "Acute agitation", due: "PRN", check: "rr", note: "Controlled substance — count & cosign. Assess sedation." },
  ],
  P05: [
    { id: "M05a", name: "Ceftriaxone", dose: "1 g", route: "IV", freq: "Daily", type: "scheduled", highAlert: false, indication: "UTI", due: "10:00", check: null, note: "Confirm not the levofloxacin she reacts to. Different class — OK." },
    { id: "M05b", name: "Tiotropium (Spiriva)", dose: "1 cap", route: "Inhaled", freq: "Daily", type: "scheduled", highAlert: false, indication: "COPD maintenance", due: "09:00", check: null, note: "HandiHaler — not swallowed. Teach technique to caregiver." },
    { id: "M05c", name: "Albuterol", dose: "2.5 mg neb", route: "Inhaled", freq: "Q6H PRN SOB", type: "prn", highAlert: false, indication: "Bronchospasm", due: "PRN", check: "hr", note: "May raise HR. Reassess SpO2/work of breathing." },
    { id: "M05d", name: "Donepezil", dose: "10 mg", route: "PO", freq: "QHS", type: "scheduled", highAlert: false, indication: "Dementia", due: "21:00", check: null, note: "Aspiration risk — upright, mech soft, verify swallow." },
  ],
};

// The Rights of Medication Administration
const RIGHTS = [
  { key: "patient", label: "Right Patient", hook: "Two identifiers — name + DOB/MRN, scanned not assumed." },
  { key: "medication", label: "Right Medication", hook: "Scan barcode; match to active order, not the label alone." },
  { key: "dose", label: "Right Dose", hook: "Recalculate; question odd doses (e.g. 3 tabs)." },
  { key: "route", label: "Right Route", hook: "PO ≠ IV. Wrong route can kill." },
  { key: "time", label: "Right Time", hook: "Within 30–60 min window per policy." },
  { key: "documentation", label: "Right Documentation", hook: "Chart AFTER giving, never before." },
  { key: "indication", label: "Right Indication", hook: "Why is this ordered? Does it still apply?" },
  { key: "response", label: "Right Response", hook: "Reassess: did it work? PRN effectiveness." },
  { key: "education", label: "Right Education", hook: "Patient knows what & why." },
  { key: "refuse", label: "Right to Refuse", hook: "Document refusal + teaching + provider notice." },
];

// Medication error scenarios
const SCENARIOS = [
  {
    id: "S1", title: "The opioid and the slow breaths", patient: "Marcus Lindqvist (P03)", setting: "Surgical",
    stem: "Post-op day 1. Patient rates pain 8/10 and requests his PRN hydromorphone 0.5 mg IV. You note RR 11, patient drowsy but rousable, SpO2 93% on room air.",
    assessFirst: "Respiratory status: rate, depth, sedation level (RASS/POSS), SpO2.",
    action: "HOLD",
    actionDetail: "Do not give the opioid. RR 11 is below the safe threshold (<12) and the patient is sedated — classic pre-respiratory-depression picture.",
    document: "RR 11, sedation level, SpO2 93% RA, pain score, that opioid was held for respiratory parameters, provider notified, and non-pharmacologic measures offered.",
    notify: "Yes — notify provider now for respiratory depression risk; ask about non-opioid multimodal options or naloxone availability.",
    teaching: "Explain why the dose is held; reposition, encourage incentive spirometer, ice, repositioning.",
    followup: "Recheck RR/sedation/SpO2 in 15–30 min; reassess pain with non-opioid measures.",
    distractors: ["GIVE — patient's pain is severe and he has the right to pain control", "GIVE half the dose to be safe", "REFUSE and tell patient nothing can be done"],
  },
  {
    id: "S2", title: "INR over the line", patient: "Diane Whitfield (P02)", setting: "Med-Surg",
    stem: "Warfarin 5 mg PO is due at 17:00. Today's INR resulted at 3.8 (target 2.0–3.0). Patient has a small new bruise on her forearm.",
    assessFirst: "Review INR trend, bleeding signs (bruising, gums, stool, urine), and the order's hold parameters.",
    action: "HOLD",
    actionDetail: "INR 3.8 exceeds the 3.5 hold threshold and there are early bleeding signs. Hold and clarify dose with provider.",
    document: "INR value, bleeding assessment (forearm bruise), medication held per parameters, provider notification and any new order.",
    notify: "Yes — notify provider for supratherapeutic INR and bleeding; anticipate dose adjustment or vitamin K.",
    teaching: "Teach bleeding precautions: soft toothbrush, electric razor, report dark stools; consistent vitamin K intake.",
    followup: "Monitor for bleeding, recheck INR per new order.",
    distractors: ["GIVE — it's a scheduled dose and skipping causes clots", "GIVE and just document the bruise", "REFUSE to chart anything until next shift"],
  },
  {
    id: "S3", title: "Two identifiers, one surprise", patient: "Room 418 (P02)", setting: "Med-Surg",
    stem: "You enter 418 with metoprolol for Diane Whitfield. The patient in the bed says 'yes that's me' when you say her name, but the wristband scan won't pull up and the name on the band reads a different patient.",
    assessFirst: "Stop. Verify identity with TWO identifiers — never rely on a patient saying 'yes'.",
    action: "CLARIFY",
    actionDetail: "Do NOT give. A verbal 'yes' is not an identifier. The mismatched band means possible wrong patient/wrong room. Resolve before any med.",
    document: "After resolving: correct patient identified, no med given to wrong patient, and how the discrepancy was corrected.",
    notify: "Notify charge nurse re: wristband/room discrepancy; correct armband per policy.",
    teaching: "Explain why you always check the band even when they answer to the name.",
    followup: "Confirm right patient, re-scan, then proceed.",
    distractors: ["GIVE — she confirmed her name verbally", "GIVE since you're already in the room", "Override the scanner and document later"],
  },
  {
    id: "S4", title: "The penicillin allergy", patient: "Robert Alvarez (P01)", setting: "Med-Surg",
    stem: "A new order appears for amoxicillin. The chart lists Penicillin allergy: hives. The eMAR fires an allergy alert.",
    assessFirst: "Review the allergy, reaction type, and cross-reactivity. Amoxicillin IS a penicillin.",
    action: "CLARIFY",
    actionDetail: "Do not give. Amoxicillin is in the penicillin class — direct allergy conflict. Clarify with provider for an alternative.",
    document: "Allergy alert, that medication was held for documented penicillin allergy, provider notified, alternative obtained.",
    notify: "Yes — notify prescriber of the allergy conflict for a different antibiotic.",
    teaching: "Confirm with patient the reaction history; teach to always state allergies.",
    followup: "Verify new antibiotic ordered and given.",
    distractors: ["GIVE — hives is a mild reaction", "GIVE with diphenhydramine ready", "Remove the allergy from the chart so the alert stops"],
  },
  {
    id: "S5", title: "Glucose before insulin", patient: "Robert Alvarez (P01)", setting: "Med-Surg",
    stem: "Humalog sliding scale is due before breakfast. You realize no fingerstick glucose has been obtained this morning.",
    assessFirst: "Obtain the point-of-care glucose FIRST — sliding scale dose depends on it.",
    action: "CLARIFY",
    actionDetail: "Do not give sliding-scale insulin without a current glucose. Check glucose, then dose per the ordered scale.",
    document: "Glucose value, dose given per scale, site, and any hypoglycemia teaching.",
    notify: "Notify provider only if glucose is critically high/low or scale doesn't cover the value.",
    teaching: "Teach signs of hypoglycemia; eat after rapid-acting insulin.",
    followup: "Reassess glucose and for hypoglycemia per protocol.",
    distractors: ["GIVE the usual amount you gave yesterday", "GIVE the highest scale dose to be safe", "Skip the dose entirely without checking"],
  },
  {
    id: "S6", title: "Held for low pulse", patient: "Diane Whitfield (P02)", setting: "Med-Surg",
    stem: "Digoxin 0.125 mg is ordered. Before giving, you take an apical pulse for a full minute: 54 and regular.",
    assessFirst: "Apical pulse for one full minute; review hold parameter (usually <60).",
    action: "HOLD",
    actionDetail: "Hold digoxin for apical HR < 60. Assess for toxicity (nausea, visual halos) and check level if ordered.",
    document: "Apical HR 54, digoxin held per parameter, toxicity assessment, provider notified.",
    notify: "Yes — notify provider of bradycardia; review digoxin level/potassium.",
    teaching: "Teach to report nausea, yellow-green vision, take own pulse.",
    followup: "Recheck HR, monitor for toxicity.",
    distractors: ["GIVE — 54 is close enough to 60", "GIVE because it was given yesterday", "REFUSE and don't tell the provider"],
  },
];

// Documentation grading exemplars
const DOC_EXERCISES = [
  {
    id: "D1",
    prompt: "Patient Marcus (P03) reports pain 8/10 in right hip 45 min after you repositioned and gave scheduled acetaminophen. Write a focused pain reassessment note.",
    rubric: ["Objective + subjective pain data", "Timing of reassessment", "Intervention(s) done", "Patient response", "Plan / provider notification if unrelieved", "No opinion/blame, approved terms"],
    poor: "Pt still in pain, seems like he just wants drugs. Will watch.",
    poorWhy: "Charts opinion/judgment ('wants drugs'), vague, no data, no plan.",
    better: "Pt reports pain 8/10 right hip. Acetaminophen given earlier. Repositioned. Will reassess.",
    betterWhy: "Has data but missing timing, response, and clear plan/escalation.",
    excellent: "1015: Pt reports R hip pain 8/10, grimacing, guarding R leg. Acetaminophen 1000 mg PO given 0930. Repositioned, ice applied, leg elevated. At 1015 pain unchanged at 8/10. Dr. Bashir notified at 1018 of unrelieved pain and RR 11; awaiting orders. Non-opioid measures continued. Will reassess in 30 min.",
    excellentWhy: "Timed, objective + subjective, interventions, response, provider notification, and plan. Legally defensible.",
  },
  {
    id: "D2",
    prompt: "Patient Robert (P01) refuses his evening Lantus insulin, stating 'I feel fine, I don't need it tonight.' Write a refusal-of-care note.",
    rubric: ["Exact refusal in patient's words", "Education provided about risk", "Patient's understanding/capacity", "Provider notified", "No coercion, no false charting"],
    poor: "Pt refused insulin. Not my problem if his sugar goes up.",
    poorWhy: "Unprofessional, blames patient, no education, no notification, no quote.",
    better: "Pt refused Lantus tonight. Educated him. Provider aware.",
    betterWhy: "Better structure but lacks the patient's own words, specifics of teaching, and capacity assessment.",
    excellent: "2105: Lantus 22 units subcut due; pt declined, stating 'I feel fine, I don't need it tonight.' Educated re: basal insulin need despite feeling well and risk of hyperglycemia/DKA. Pt verbalized understanding, alert & oriented x4, declined. Dr. Okafor notified 2110. Glucose monitoring continued per order. Will re-offer and reassess.",
    excellentWhy: "Direct quote, education, capacity, notification, monitoring plan — protects patient and nurse.",
  },
];

const QUIZ = [
  { q: "A medication is due and the patient's wristband won't scan. What should the nurse do FIRST?", type: "mc", choices: ["Give the med and document later", "Verify identity using two identifiers before giving", "Ask the patient if they are the right person", "Skip the medication"], answer: 1, rationale: "BCMA scanning is a safety barrier. If it fails, verify TWO identifiers (name + DOB/MRN) before administering — a verbal 'yes' is not an identifier." },
  { q: "Before giving metoprolol, the nurse should check which parameter?", type: "mc", choices: ["Blood glucose", "Apical pulse and blood pressure", "INR", "Respiratory rate only"], answer: 1, rationale: "Beta-blockers lower HR and BP. Hold for HR <60 or SBP <100 per typical parameters." },
  { q: "Which findings require holding a scheduled opioid? (Select all that apply)", type: "sata", choices: ["RR of 10", "Patient sedated/difficult to rouse", "Pain rated 8/10", "SpO2 88%"], answer: [0,1,3], rationale: "Respiratory depression and oversedation are contraindications. Severe pain alone does not justify giving if breathing is unsafe." },
  { q: "INR is 3.8 (target 2–3) and warfarin is due. The nurse should:", type: "mc", choices: ["Give the dose as scheduled", "Hold and notify the provider", "Give half the dose", "Document and give"], answer: 1, rationale: "Supratherapeutic INR raises bleeding risk. Hold per parameters and notify the provider." },
  { q: "Which is the BEST charting of a fall?", type: "mc", choices: ["Pt fell because CNA left bed rail down", "Pt found on floor next to bed at 0300, alert, denies pain, no visible injury; provider notified", "Pt had a bad fall, seems okay", "Pt fell, will monitor"], answer: 1, rationale: "Chart objective facts ('found on floor'), assessment, and notification. Never assign blame or speculate on cause." },
  { q: "A nurse must document a held medication. Which element is REQUIRED?", type: "mc", choices: ["A guess at why the provider ordered it", "The reason it was held and provider notification", "The opinion that the order was wrong", "Nothing — held meds aren't charted"], answer: 1, rationale: "Document the specific reason held (e.g., HR 54) and provider notification. Held meds are always charted." },
  { q: "Which abbreviations should be AVOIDED for safety? (Select all that apply)", type: "sata", choices: ["U (for units)", "mg", "QD", "mL", "IU"], answer: [0,2,4], rationale: "'U', 'QD', and 'IU' are on the Do-Not-Use list (mistaken for 0, qid, IV). Write 'units', 'daily', 'international units'." },
  { q: "Sliding-scale insulin is due. What must the nurse do first?", type: "mc", choices: ["Give the same as yesterday", "Obtain a current blood glucose", "Give the maximum scale dose", "Notify the provider"], answer: 1, rationale: "The dose depends on a current glucose. Always check before dosing sliding scale." },
  { q: "A patient refuses a medication. The nurse should document all EXCEPT:", type: "mc", choices: ["The refusal in the patient's words", "Education provided", "Provider notification", "That the nurse gave it anyway to be safe"], answer: 3, rationale: "Never chart false information or give against a competent patient's refusal. Document refusal, teaching, capacity, and notification." },
  { q: "Which is within an LVN/LPN scope in California (under RN/MD direction) — generally?", type: "mc", choices: ["Independently develop the nursing care plan", "Administer many oral/subcut/IM medications and reinforce teaching", "Perform initial IV push of high-alert meds without certification", "Take telephone orders for chemotherapy independently"], answer: 1, rationale: "LVNs administer many meds and reinforce teaching under direction. Scope varies by facility policy and certification — always verify." },
  { q: "What should be documented IMMEDIATELY?", type: "mc", choices: ["End-of-shift summary", "A change in patient condition and provider notification", "Routine vitals that are normal", "Discharge teaching planned for tomorrow"], answer: 1, rationale: "Changes in condition, critical findings, and notifications are charted right away — timely documentation is a legal and safety priority." },
  { q: "SBAR stands for:", type: "mc", choices: ["Situation, Background, Assessment, Recommendation", "Symptom, Background, Action, Result", "Status, Brief, Alert, Report", "Subjective, Baseline, Action, Reassess"], answer: 0, rationale: "SBAR = Situation, Background, Assessment, Recommendation — a structured handoff/communication framework." },
  { q: "Furosemide is ordered. Which lab most needs review before/after?", type: "mc", choices: ["INR", "Potassium", "TSH", "A1c"], answer: 1, rationale: "Loop diuretics waste potassium — monitor K+ to prevent hypokalemia and arrhythmias." },
  { q: "A controlled substance count shows a discrepancy. The nurse should:", type: "mc", choices: ["Assume it's fine and move on", "Stop, recount with a witness, and report per policy", "Document it next shift", "Adjust the count to match"], answer: 1, rationale: "Narcotic discrepancies require immediate recount with a witness and reporting — never falsify counts." },
  { q: "Which note best follows 'objective over subjective'?", type: "mc", choices: ["Patient is anxious and dramatic", "Patient HR 110, RR 24, states 'I can't catch my breath,' diaphoretic", "Patient seems fine", "Patient is overreacting to pain"], answer: 1, rationale: "Objective, measurable findings plus the patient's quoted words — no labels or judgment." },
  { q: "Aspiration precautions for Eleanor (P05) include:", type: "mc", choices: ["Lay flat for meds", "Upright positioning, verify swallow, mechanical soft diet", "Crush all meds into water and give fast", "Give meds during coughing"], answer: 1, rationale: "Upright position, appropriate texture, and verified swallowing reduce aspiration risk. Verify which meds may be crushed." },
];



/* ============================ THEME ============================ */
const C = {
  ink: "#0E1822", panel: "#15212E", panel2: "#1B2A39", line: "#26384A",
  teal: "#2DD4BF", tealDim: "#0F766E", amber: "#F5A524", red: "#F2496B",
  text: "#E6EEF5", sub: "#8FA6B8", green: "#34D399",
};
const mono = "'JetBrains Mono','SF Mono',ui-monospace,monospace";
const sans = "'Inter',system-ui,-apple-system,sans-serif";

const flagColor = (f) => (f === "H" ? C.red : f === "L" ? C.amber : C.sub);

/* ============================ SHELL ============================ */
const NAV = [
  { id: "board", label: "Board", icon: LayoutDashboard },
  { id: "chart", label: "Chart", icon: FileText },
  { id: "emar", label: "eMAR", icon: Pill },
  { id: "scenarios", label: "Safety", icon: AlertTriangle },
  { id: "docgrade", label: "Charting", icon: ClipboardCheck },
  { id: "quiz", label: "Quiz", icon: ListChecks },
  { id: "learn", label: "Learn", icon: GraduationCap },
];

function App() {
  const [tab, setTab] = useState("board");
  const [activePt, setActivePt] = useState(PATIENTS[0].id);
  const patient = PATIENTS.find((p) => p.id === activePt);

  return (
    <div style={{ minHeight: "100vh", background: C.ink, color: C.text, fontFamily: sans }}>
      <style>{`
        *{box-sizing:border-box} button{font-family:inherit;cursor:pointer}
        ::-webkit-scrollbar{width:8px;height:8px}
        ::-webkit-scrollbar-thumb{background:${C.line};border-radius:8px}
        .focusable:focus-visible{outline:2px solid ${C.teal};outline-offset:2px}
        @keyframes scanline{0%{top:0}100%{top:100%}}
        @keyframes pop{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}
        @media (prefers-reduced-motion: reduce){*{animation:none!important}}
      `}</style>

      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${C.line}`, background: C.panel, padding: "12px 18px",
        display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.tealDim,
            display: "grid", placeItems: "center" }}>
            <Stethoscope size={18} color={C.teal} />
          </div>
          <div>
            <div style={{ fontWeight: 700, letterSpacing: .3, fontSize: 15 }}>CHARTWELL <span style={{ color: C.teal }}>Sim</span></div>
            <div style={{ fontSize: 10, color: C.sub, fontFamily: mono }}>CLINICAL DOCUMENTATION + MED-PASS TRAINER · CA</div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, color: C.amber, fontFamily: mono, border: `1px solid ${C.line}`,
            padding: "4px 8px", borderRadius: 6 }}>⚠ FICTIONAL DATA — TRAINING ONLY</span>
          <PatientPicker activePt={activePt} setActivePt={setActivePt} />
        </div>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
        {/* Sidebar */}
        <nav style={{ width: 72, borderRight: `1px solid ${C.line}`, background: C.panel,
          padding: "12px 0", display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 56, height: "calc(100vh - 56px)" }}>
          {NAV.map((n) => {
            const Icon = n.icon; const on = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} className="focusable"
                style={{ background: on ? C.panel2 : "transparent", border: "none",
                  borderLeft: `3px solid ${on ? C.teal : "transparent"}`, color: on ? C.teal : C.sub,
                  padding: "10px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10 }}>
                <Icon size={20} /><span style={{ fontWeight: 600 }}>{n.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main */}
        <main style={{ flex: 1, padding: 20, maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          {tab === "board" && <Board setActivePt={setActivePt} setTab={setTab} />}
          {tab === "chart" && <Chart patient={patient} />}
          {tab === "emar" && <EMAR patient={patient} />}
          {tab === "scenarios" && <Scenarios />}
          {tab === "docgrade" && <DocGrade />}
          {tab === "quiz" && <Quiz />}
          {tab === "learn" && <Learn />}
        </main>
      </div>
    </div>
  );
}

/* ============================ SHARED UI ============================ */
function PatientPicker({ activePt, setActivePt }) {
  const p = PATIENTS.find((x) => x.id === activePt);
  return (
    <select value={activePt} onChange={(e) => setActivePt(e.target.value)} className="focusable"
      style={{ background: C.panel2, color: C.text, border: `1px solid ${C.line}`, borderRadius: 8,
        padding: "6px 10px", fontFamily: mono, fontSize: 12 }}>
      {PATIENTS.map((p) => <option key={p.id} value={p.id}>{p.room} · {p.name}</option>)}
    </select>
  );
}

const Card = ({ children, style }) => (
  <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, ...style }}>{children}</div>
);
const Pillb = ({ children, color = C.sub, bg }) => (
  <span style={{ fontSize: 11, fontFamily: mono, color, background: bg || "transparent",
    border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" }}>{children}</span>
);
const SectionTitle = ({ icon: Icon, children, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      {Icon && <Icon size={20} color={C.teal} />}
      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>{children}</h2>
    </div>
    {sub && <p style={{ margin: "5px 0 0 29px", color: C.sub, fontSize: 13 }}>{sub}</p>}
  </div>
);

/* ============================ BOARD ============================ */
function Board({ setActivePt, setTab }) {
  return (
    <div>
      <SectionTitle icon={LayoutDashboard} sub="Your assignment this shift. Tap a patient to open their chart. Think of it like air-traffic control — the sickest planes (highest acuity) land first.">
        Patient Assignment Board
      </SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 14 }}>
        {PATIENTS.map((p) => (
          <Card key={p.id} style={{ padding: 14, animation: "pop .25s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.teal }}>{p.room} · {p.setting}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.sub }}>{p.age} {p.sex} · {p.dx}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.sub, marginTop: 2 }}>MRN {p.mrn}</div>
              </div>
              <Acuity n={p.acuity} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              <Pillb color={p.code.includes("DNR") ? C.amber : C.green}>{p.code}</Pillb>
              <Pillb color={C.amber}>Fall: {p.fallRisk.split(" ")[0]}</Pillb>
              {p.isolation !== "None" && <Pillb color={C.red}>{p.isolation}</Pillb>}
            </div>

            <div style={{ marginTop: 10, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
              <div style={{ fontSize: 10, color: C.sub, fontFamily: mono, marginBottom: 5 }}>ALERTS</div>
              {p.alerts.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, marginBottom: 3 }}>
                  <CircleAlert size={13} color={C.red} style={{ flexShrink: 0 }} /> {a}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button className="focusable" onClick={() => { setActivePt(p.id); setTab("chart"); }}
                style={{ flex: 1, background: C.panel2, color: C.text, border: `1px solid ${C.line}`,
                  borderRadius: 8, padding: "8px 0", fontSize: 13, fontWeight: 600 }}>Open Chart</button>
              <button className="focusable" onClick={() => { setActivePt(p.id); setTab("emar"); }}
                style={{ flex: 1, background: C.tealDim, color: C.text, border: "none",
                  borderRadius: 8, padding: "8px 0", fontSize: 13, fontWeight: 600 }}>Med Pass</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
function Acuity({ n }) {
  const col = n >= 4 ? C.red : n === 3 ? C.amber : C.green;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: col }}>{n}</div>
      <div style={{ fontSize: 9, color: C.sub, fontFamily: mono }}>ACUITY</div>
    </div>
  );
}

/* ============================ CHART ============================ */
const CHART_TABS = ["Face Sheet", "Allergies", "Orders", "Meds", "Labs", "Vitals", "Assessment", "Care Plan", "SBAR"];
function Chart({ patient }) {
  const [t, setT] = useState("Face Sheet");
  const meds = MED_ORDERS[patient.id] || [];
  return (
    <div>
      <SectionTitle icon={FileText} sub={`${patient.name} · ${patient.room} · MRN ${patient.mrn}`}>Patient Chart</SectionTitle>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {CHART_TABS.map((x) => (
          <button key={x} onClick={() => setT(x)} className="focusable"
            style={{ background: t === x ? C.tealDim : C.panel, color: t === x ? C.text : C.sub,
              border: `1px solid ${C.line}`, borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 600 }}>{x}</button>
        ))}
      </div>

      <Card style={{ padding: 18 }}>
        {t === "Face Sheet" && <FaceSheet p={patient} />}
        {t === "Allergies" && <Allergies p={patient} />}
        {t === "Orders" && <Orders meds={meds} />}
        {t === "Meds" && <MedList meds={meds} />}
        {t === "Labs" && <Labs p={patient} />}
        {t === "Vitals" && <Vitals p={patient} />}
        {t === "Assessment" && <Assessment p={patient} />}
        {t === "Care Plan" && <CarePlan p={patient} />}
        {t === "SBAR" && <SBAR p={patient} />}
      </Card>
    </div>
  );
}
const Row = ({ k, v, c }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.line}` }}>
    <span style={{ color: C.sub, fontSize: 13 }}>{k}</span>
    <span style={{ fontWeight: 600, fontSize: 13, color: c || C.text, textAlign: "right" }}>{v}</span>
  </div>
);
function FaceSheet({ p }) {
  return (<div>
    <Row k="Name" v={p.name} /><Row k="Age / Sex" v={`${p.age} / ${p.sex}`} />
    <Row k="Room" v={p.room} /><Row k="Provider" v={p.provider} />
    <Row k="Primary Dx" v={p.dx} /><Row k="Code Status" v={p.code} c={p.code.includes("DNR") ? C.amber : C.green} />
    <Row k="Isolation" v={p.isolation} c={p.isolation !== "None" ? C.red : C.text} />
    <Row k="Fall Risk" v={p.fallRisk} c={C.amber} /><Row k="Diet" v={p.diet} />
    <Row k="Activity" v={p.activity} />
  </div>);
}
function Allergies({ p }) {
  return (<div>
    {p.allergies.map((a, i) => (
      <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 11px", marginBottom: 7,
        background: a === "NKDA" ? C.panel2 : "#3a1320", border: `1px solid ${a === "NKDA" ? C.line : C.red}`, borderRadius: 8 }}>
        <AlertTriangle size={16} color={a === "NKDA" ? C.sub : C.red} />
        <span style={{ fontWeight: 600 }}>{a}</span>
      </div>
    ))}
    <p style={{ color: C.sub, fontSize: 12.5, marginTop: 8 }}>Memory hook: <b style={{ color: C.text }}>"Allergy band = red band."</b> A documented reaction type (hives vs anaphylaxis) changes how urgently you escalate a conflicting order.</p>
  </div>);
}
function Orders({ meds }) {
  return (<div>
    {meds.map((m) => (
      <div key={m.id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600 }}>{m.name} {m.dose}</span>
          <Pillb color={C.teal}>{m.route} · {m.freq}</Pillb>
        </div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>Indication: {m.indication}</div>
      </div>
    ))}
  </div>);
}
function MedList({ meds }) {
  return (<div>
    {meds.map((m) => (
      <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
        <Pill size={15} color={m.highAlert ? C.red : C.sub} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{m.name} <span style={{ color: C.sub, fontWeight: 400 }}>{m.dose}</span></div>
          <div style={{ fontSize: 11.5, color: C.sub }}>{m.route} · {m.freq} · {m.type.toUpperCase()}</div>
        </div>
        {m.highAlert && <Pillb color={C.red}>HIGH-ALERT</Pillb>}
      </div>
    ))}
  </div>);
}
function Labs({ p }) {
  return (<div style={{ fontFamily: mono, fontSize: 13 }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, color: C.sub, fontSize: 11, paddingBottom: 6, borderBottom: `1px solid ${C.line}` }}>
      <span>TEST</span><span>RESULT</span><span>REF</span>
    </div>
    {p.labs.map((l, i) => (
      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.line}`, alignItems: "center" }}>
        <span style={{ color: C.text }}>{l.name}</span>
        <span style={{ color: flagColor(l.flag), fontWeight: 700 }}>{l.val}{l.unit && " " + l.unit} {l.flag && <b>{l.flag}</b>}</span>
        <span style={{ color: C.sub, fontSize: 11 }}>{l.ref}</span>
      </div>
    ))}
  </div>);
}
function Vitals({ p }) {
  const v = p.vitals;
  const items = [
    ["BP", v.bp, "mmHg"], ["HR", v.hr, "bpm"], ["RR", v.rr, "/min"],
    ["Temp", v.temp, ""], ["SpO2", v.spo2, ""], ["Pain", v.pain, ""], ["Glucose", v.glucose, ""],
  ];
  return (<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10 }}>
    {items.map(([k, val, u]) => (
      <div key={k} style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
        <div style={{ fontSize: 10, color: C.sub, fontFamily: mono }}>{k}</div>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: mono, color: C.text }}>{val}</div>
        <div style={{ fontSize: 9, color: C.sub }}>{u}</div>
      </div>
    ))}
  </div>);
}
function Assessment({ p }) {
  return (<div>
    <p style={{ color: C.sub, fontSize: 13, marginTop: 0 }}>Charting-by-exception starter. Document what's abnormal; confirm the rest is within defined limits (WDL).</p>
    {[
      ["Neuro", "Alert & oriented; document GCS / mental status if change."],
      ["Resp", `RR ${p.vitals.rr}, SpO2 ${p.vitals.spo2}. Note work of breathing, breath sounds.`],
      ["Cardiac", `HR ${p.vitals.hr}, BP ${p.vitals.bp}. Rhythm, edema, pulses.`],
      ["Skin", "Inspect bony prominences; stage any wound; Braden if at risk."],
      ["Pain", `Current ${p.vitals.pain}. Reassess after intervention.`],
    ].map(([s, d]) => (
      <div key={s} style={{ padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
        <b style={{ color: C.teal }}>{s}: </b><span style={{ fontSize: 13 }}>{d}</span>
      </div>
    ))}
  </div>);
}
function CarePlan({ p }) {
  return (<div>
    <p style={{ color: C.sub, fontSize: 13, marginTop: 0 }}>ADPIE frame: a diagnosis → goal → interventions → evaluation.</p>
    <Row k="Nursing Dx (example)" v={p.alerts[0]} />
    <Row k="Goal" v="Patient remains free of injury this shift" />
    <Row k="Intervention" v="Hourly rounding, bed low/locked, call light in reach" />
    <Row k="Evaluation" v="Reassess each round; chart outcome" />
  </div>);
}
function SBAR({ p }) {
  return (<div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
    <p style={{ color: C.sub, marginTop: 0 }}>Practice calling the provider with this structure. Memory hook: <b style={{ color: C.text }}>"Some Bored Animals Run."</b></p>
    <p><b style={{ color: C.teal }}>S</b>ituation: "This is [you], RN on [unit]. Calling about {p.name}, {p.room}, who has {p.alerts[0].toLowerCase()}."</p>
    <p><b style={{ color: C.teal }}>B</b>ackground: "{p.age} {p.sex} admitted for {p.dx}."</p>
    <p><b style={{ color: C.teal }}>A</b>ssessment: "Vitals: BP {p.vitals.bp}, HR {p.vitals.hr}, RR {p.vitals.rr}, SpO2 {p.vitals.spo2}. I'm concerned about..."</p>
    <p><b style={{ color: C.teal }}>R</b>ecommendation: "I'd like an order for... / Can you come assess?"</p>
  </div>);
}

/* ============================ eMAR + FIVE RIGHTS GATE ============================ */
function EMAR({ patient }) {
  const meds = MED_ORDERS[patient.id] || [];
  const [active, setActive] = useState(null);
  const [log, setLog] = useState([]); // {medId, outcome}
  const record = (medId, outcome) => setLog((l) => [...l.filter((x) => x.medId !== medId), { medId, outcome }]);

  return (
    <div>
      <SectionTitle icon={Pill} sub={`${patient.name} · ${patient.room}. Select a medication to run the Five-Rights safety gate. You cannot administer until each gate clears — just like real barcode scanning.`}>
        eMAR — Medication Administration
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: active ? "1fr 1fr" : "1fr", gap: 14 }}>
        <Card style={{ padding: 14 }}>
          <div style={{ fontSize: 11, color: C.sub, fontFamily: mono, marginBottom: 8 }}>DUE THIS SHIFT</div>
          {meds.map((m) => {
            const entry = log.find((x) => x.medId === m.id);
            return (
              <button key={m.id} onClick={() => setActive(m)} className="focusable"
                style={{ width: "100%", textAlign: "left", background: active?.id === m.id ? C.panel2 : "transparent",
                  border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8, color: C.text }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.name} <span style={{ color: C.sub, fontWeight: 400 }}>{m.dose}</span></div>
                    <div style={{ fontSize: 11.5, color: C.sub }}>{m.route} · {m.freq} · due {m.due}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {m.highAlert && <Pillb color={C.red}>HIGH-ALERT</Pillb>}
                    {entry && <OutcomeBadge o={entry.outcome} />}
                    <ChevronRight size={16} color={C.sub} />
                  </div>
                </div>
              </button>
            );
          })}
        </Card>

        {active && <FiveRights key={active.id} med={active} patient={patient}
          onDone={(o) => record(active.id, o)} onClose={() => setActive(null)} />}
      </div>
    </div>
  );
}
function OutcomeBadge({ o }) {
  const map = { given: [C.green, "GIVEN"], held: [C.amber, "HELD"], refused: [C.sub, "REFUSED"], error: [C.red, "ERROR CAUGHT"] };
  const [c, t] = map[o] || [C.sub, o];
  return <Pillb color={c}>{t}</Pillb>;
}

function FiveRights({ med, patient, onDone, onClose }) {
  // Determine the safety verdict for this med
  const verdict = useMemo(() => getVerdict(med, patient), [med, patient]);
  const [step, setStep] = useState(0); // 0 scan patient,1 scan med,2 rights checklist,3 verdict
  const [checked, setChecked] = useState({});
  const [scanPt, setScanPt] = useState(false);
  const [scanMed, setScanMed] = useState(false);

  const rightsToConfirm = RIGHTS.slice(0, 7);
  const allChecked = rightsToConfirm.every((r) => checked[r.key]);

  return (
    <Card style={{ padding: 16, animation: "pop .2s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 700 }}>{med.name} {med.dose}</div>
        <button onClick={onClose} className="focusable" style={{ background: "transparent", border: "none", color: C.sub }}><X size={18} /></button>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["Scan ID", "Scan Med", "5 Rights", "Decision"].map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 4, borderRadius: 4, background: i <= step ? C.teal : C.line }} />
            <div style={{ fontSize: 9, color: i <= step ? C.teal : C.sub, marginTop: 4, fontFamily: mono }}>{s}</div>
          </div>
        ))}
      </div>

      {step === 0 && (
        <GateScan label="Scan patient wristband" sub={`Verify TWO identifiers: ${patient.name} · ${patient.mrn}`}
          done={scanPt} onScan={() => setScanPt(true)} onNext={() => setStep(1)}
          hint="A wristband scan replaces guesswork. Never administer on a verbal 'yes' alone." />
      )}
      {step === 1 && (
        <GateScan label="Scan medication barcode" sub={`${med.name} ${med.dose} · ${med.route}`}
          done={scanMed} onScan={() => setScanMed(true)} onNext={() => setStep(2)}
          hint="Barcode catches wrong-drug/wrong-dose before it reaches the patient." />
      )}

      {step === 2 && (
        <div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 10 }}>Confirm each right. Tap to check.</div>
          {rightsToConfirm.map((r) => (
            <button key={r.key} className="focusable" onClick={() => setChecked((c) => ({ ...c, [r.key]: !c[r.key] }))}
              style={{ width: "100%", textAlign: "left", display: "flex", gap: 10, alignItems: "center",
                background: checked[r.key] ? "#0e2e29" : C.panel2, border: `1px solid ${checked[r.key] ? C.teal : C.line}`,
                borderRadius: 9, padding: "9px 11px", marginBottom: 7, color: C.text }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: `1px solid ${checked[r.key] ? C.teal : C.sub}`,
                display: "grid", placeItems: "center", flexShrink: 0, background: checked[r.key] ? C.teal : "transparent" }}>
                {checked[r.key] && <Check size={14} color={C.ink} />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.label}</div>
                <div style={{ fontSize: 11.5, color: C.sub }}>{r.hook}</div>
              </div>
            </button>
          ))}
          <button disabled={!allChecked} onClick={() => setStep(3)} className="focusable"
            style={{ width: "100%", marginTop: 6, background: allChecked ? C.tealDim : C.line,
              color: allChecked ? C.text : C.sub, border: "none", borderRadius: 9, padding: "11px 0",
              fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {allChecked ? <Unlock size={16} /> : <Lock size={16} />} {allChecked ? "Proceed to decision" : "Confirm all rights to unlock"}
          </button>
        </div>
      )}

      {step === 3 && <Verdict med={med} verdict={verdict} onDone={onDone} />}
    </Card>
  );
}
function GateScan({ label, sub, done, onScan, onNext, hint }) {
  return (
    <div>
      <div style={{ position: "relative", height: 130, borderRadius: 12, overflow: "hidden",
        border: `1px solid ${done ? C.teal : C.line}`, background: C.ink, display: "grid", placeItems: "center" }}>
        {!done && <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: C.teal, animation: "scanline 1.6s linear infinite", boxShadow: `0 0 12px ${C.teal}` }} />}
        {done ? <div style={{ textAlign: "center" }}><Check size={36} color={C.green} /><div style={{ color: C.green, fontFamily: mono, fontSize: 12, marginTop: 6 }}>MATCH CONFIRMED</div></div>
          : <ScanLine size={40} color={C.sub} />}
      </div>
      <div style={{ fontWeight: 700, marginTop: 12 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: C.sub, fontFamily: mono }}>{sub}</div>
      <div style={{ fontSize: 12, color: C.sub, marginTop: 8, display: "flex", gap: 6 }}><CircleAlert size={14} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />{hint}</div>
      {!done ? (
        <button onClick={onScan} className="focusable" style={{ width: "100%", marginTop: 12, background: C.tealDim, color: C.text, border: "none", borderRadius: 9, padding: "11px 0", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <ScanLine size={16} /> Scan
        </button>
      ) : (
        <button onClick={onNext} className="focusable" style={{ width: "100%", marginTop: 12, background: C.panel2, color: C.text, border: `1px solid ${C.line}`, borderRadius: 9, padding: "11px 0", fontWeight: 700 }}>Continue →</button>
      )}
    </div>
  );
}
function getVerdict(med, patient) {
  // returns {safe:bool, action, reason, document, notify}
  const v = patient.vitals;
  const rr = v.rr;
  const hr = v.hr;
  const sbp = parseInt(v.bp);
  const inr = (patient.labs.find((l) => l.name === "INR") || {}).val;
  const glu = v.glucose;

  if (med.check === "rr" && rr < 12)
    return { safe: false, action: "HOLD", reason: `RR ${rr} is below the safe threshold (<12) for this opioid. Holding prevents respiratory depression.`,
      document: "RR, sedation level, SpO2, dose held for respiratory parameters, provider notified.", notify: true };
  if (med.check === "inr" && parseFloat(inr) > 3.5)
    return { safe: false, action: "HOLD", reason: `INR ${inr} exceeds the 3.5 hold threshold. Supratherapeutic — bleeding risk.`,
      document: "INR value, bleeding assessment, dose held per parameter, provider notified.", notify: true };
  if (med.check === "hr" && hr < 60)
    return { safe: false, action: "HOLD", reason: `HR ${hr} is below 60. Hold rate-lowering med and reassess.`,
      document: "Apical HR, dose held, provider notified.", notify: true };
  if (med.check === "bp" && sbp < 100)
    return { safe: false, action: "HOLD", reason: `SBP ${sbp} below 100. Hold antihypertensive.`,
      document: "BP, dose held per parameter, provider notified.", notify: true };
  if (med.check === "glucose" && (glu === "—" || !glu))
    return { safe: false, action: "CLARIFY", reason: "No current glucose — sliding-scale dose depends on it. Obtain fingerstick first.",
      document: "Glucose value once obtained, dose per scale.", notify: false };

  return { safe: true, action: "GIVE", reason: med.note || "Parameters within range — safe to administer after the Five Rights.",
    document: "Time, dose, route, site, and patient response. Chart AFTER giving.", notify: false };
}
function Verdict({ med, verdict, onDone }) {
  const [choice, setChoice] = useState(null);
  const correct = verdict.action;
  const options = ["GIVE", "HOLD", "CLARIFY", "REFUSE"];
  const made = choice !== null;
  const right = choice === correct;

  return (
    <div>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 6 }}>Clinical decision — what do you do with this order right now?</div>
      <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 9, padding: 11, fontSize: 12.5, marginBottom: 12 }}>
        <b style={{ color: C.teal }}>Indication:</b> {med.indication} · <b style={{ color: C.teal }}>Note:</b> {med.note}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {options.map((o) => (
          <button key={o} disabled={made} onClick={() => setChoice(o)} className="focusable"
            style={{ background: made ? (o === correct ? "#0e2e29" : o === choice ? "#3a1320" : C.panel2) : C.panel2,
              border: `1px solid ${made && o === correct ? C.green : made && o === choice ? C.red : C.line}`,
              color: C.text, borderRadius: 9, padding: "12px 0", fontWeight: 700 }}>{o}</button>
        ))}
      </div>

      {made && (
        <div style={{ marginTop: 12, animation: "pop .2s ease" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: right ? C.green : C.red, fontWeight: 700 }}>
            {right ? <Check size={18} /> : <X size={18} />} {right ? "Correct" : `Best action: ${correct}`}
          </div>
          <p style={{ fontSize: 13, marginTop: 8 }}>{verdict.reason}</p>
          <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 9, padding: 11, fontSize: 12.5 }}>
            <div style={{ marginBottom: 6 }}><b style={{ color: C.teal }}>Document:</b> {verdict.document}</div>
            <div><b style={{ color: C.teal }}>Notify provider:</b> {verdict.notify ? "Yes — escalate now." : "Only if findings worsen / order unclear."}</div>
          </div>
          <button onClick={() => onDone(right ? (correct === "GIVE" ? "given" : correct === "HOLD" ? "held" : "error") : "error")}
            className="focusable" style={{ width: "100%", marginTop: 12, background: C.tealDim, color: C.text, border: "none", borderRadius: 9, padding: "11px 0", fontWeight: 700 }}>
            Log outcome & finish
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================ SCENARIOS ============================ */
function Scenarios() {
  const [i, setI] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [pick, setPick] = useState(null);
  const s = SCENARIOS[i];
  const opts = useMemo(() => shuffle([s.action, ...s.distractors.map(d => d.split(" ")[0])].filter((v, idx, a) => a.indexOf(v) === idx)), [i]);

  const go = (n) => { setI(n); setReveal(false); setPick(null); };

  return (
    <div>
      <SectionTitle icon={AlertTriangle} sub="Real bedside dilemmas. Decide give / hold / clarify / refuse, then see what to assess, chart, and escalate.">
        Medication Safety Scenarios
      </SectionTitle>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {SCENARIOS.map((_, idx) => (
          <button key={idx} onClick={() => go(idx)} className="focusable"
            style={{ width: 34, height: 34, borderRadius: 8, fontFamily: mono, fontWeight: 700,
              background: idx === i ? C.tealDim : C.panel, border: `1px solid ${C.line}`, color: idx === i ? C.text : C.sub }}>{idx + 1}</button>
        ))}
      </div>

      <Card style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{s.title}</h3>
          <Pillb color={C.teal}>{s.setting}</Pillb>
        </div>
        <div style={{ fontSize: 12, color: C.sub, fontFamily: mono, marginTop: 3 }}>{s.patient}</div>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 12 }}>{s.stem}</p>

        <div style={{ fontSize: 12, color: C.sub, marginBottom: 7 }}>Your call:</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["GIVE", "HOLD", "CLARIFY", "REFUSE"].map((o) => {
            const done = pick !== null;
            const isAns = o === s.action;
            return (
              <button key={o} disabled={done} onClick={() => { setPick(o); setReveal(true); }} className="focusable"
                style={{ flex: "1 1 120px", padding: "11px 0", borderRadius: 9, fontWeight: 700,
                  background: done ? (isAns ? "#0e2e29" : o === pick ? "#3a1320" : C.panel2) : C.panel2,
                  border: `1px solid ${done && isAns ? C.green : done && o === pick ? C.red : C.line}`, color: C.text }}>{o}</button>
            );
          })}
        </div>

        {reveal && (
          <div style={{ marginTop: 16, animation: "pop .2s ease" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", color: pick === s.action ? C.green : C.red, fontWeight: 700, marginBottom: 10 }}>
              {pick === s.action ? <Check size={18} /> : <X size={18} />} Best action: {s.action} — {s.actionDetail}
            </div>
            {[["Assess first", s.assessFirst], ["Document", s.document], ["Notify provider", s.notify],
              ["Patient teaching", s.teaching], ["Follow-up / reassess", s.followup]].map(([k, val]) => (
              <div key={k} style={{ padding: "8px 0", borderBottom: `1px solid ${C.line}`, fontSize: 13 }}>
                <b style={{ color: C.teal }}>{k}: </b>{val}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <button onClick={() => go(Math.max(0, i - 1))} disabled={i === 0} className="focusable"
            style={{ background: C.panel2, color: i === 0 ? C.sub : C.text, border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 16px" }}>← Prev</button>
          <button onClick={() => go(Math.min(SCENARIOS.length - 1, i + 1))} disabled={i === SCENARIOS.length - 1} className="focusable"
            style={{ background: C.tealDim, color: C.text, border: "none", borderRadius: 8, padding: "8px 16px" }}>Next →</button>
        </div>
      </Card>
    </div>
  );
}
function shuffle(a) { return [...a].sort(() => Math.random() - 0.5); }

/* ============================ DOC GRADING ============================ */
function DocGrade() {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [graded, setGraded] = useState(null);
  const [show, setShow] = useState(false);
  const ex = DOC_EXERCISES[i];

  const grade = () => {
    const t = text.toLowerCase();
    const hits = {
      objective: /\d|bp|hr|rr|spo2|\/10|mg|units/.test(t),
      timed: /\d{1,2}[:.]?\d{2}|0\d{3}|am|pm/.test(t),
      quote: /"|'|stat(es|ed)|reports|declin/.test(t),
      notify: /notif|provider|dr\.|md|called/.test(t),
      plan: /reassess|monitor|will |follow|continue/.test(t),
      noOpinion: !/(seems|wants drugs|dramatic|overreact|not my problem|lazy|fine\b)/.test(t),
    };
    const score = Object.values(hits).filter(Boolean).length;
    setGraded({ hits, score, max: Object.keys(hits).length });
  };

  const next = () => { setI((i + 1) % DOC_EXERCISES.length); setText(""); setGraded(null); setShow(false); };

  const fb = [
    ["objective", "Objective/measurable data (numbers, scores)"],
    ["timed", "Timestamp included"],
    ["quote", "Patient's words / direct report"],
    ["notify", "Provider notification documented"],
    ["plan", "Reassessment / plan stated"],
    ["noOpinion", "No opinion, blame, or vague labels"],
  ];

  return (
    <div>
      <SectionTitle icon={ClipboardCheck} sub="Write the note, then get scored on legal-defensible elements. Compare against poor / better / excellent exemplars.">
        Documentation Practice & Grading
      </SectionTitle>
      <Card style={{ padding: 18 }}>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 0 }}>{ex.prompt}</p>
        <div style={{ fontSize: 11, color: C.sub, fontFamily: mono, marginBottom: 6 }}>RUBRIC TARGETS</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {ex.rubric.map((r) => <Pillb key={r} color={C.sub}>{r}</Pillb>)}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your nursing note here… (try including a time, objective data, the patient's words, what you did, and your plan)"
          className="focusable" style={{ width: "100%", minHeight: 120, background: C.ink, color: C.text,
            border: `1px solid ${C.line}`, borderRadius: 10, padding: 12, fontFamily: mono, fontSize: 13, resize: "vertical" }} />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={grade} disabled={!text.trim()} className="focusable"
            style={{ background: C.tealDim, color: C.text, border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700 }}>Grade my note</button>
          <button onClick={() => setShow((s) => !s)} className="focusable"
            style={{ background: C.panel2, color: C.text, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 18px" }}>{show ? "Hide" : "Show"} exemplars</button>
          <button onClick={next} className="focusable" style={{ marginLeft: "auto", background: C.panel2, color: C.text, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 18px" }}>Next exercise →</button>
        </div>

        {graded && (
          <div style={{ marginTop: 14, animation: "pop .2s ease" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Score: <span style={{ color: graded.score >= 5 ? C.green : graded.score >= 3 ? C.amber : C.red }}>{graded.score}/{graded.max}</span></div>
            {fb.map(([key, label]) => (
              <div key={key} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, padding: "4px 0" }}>
                {graded.hits[key] ? <Check size={15} color={C.green} /> : <X size={15} color={C.red} />} {label}
              </div>
            ))}
            <p style={{ fontSize: 12.5, color: C.sub, marginTop: 8 }}>This is a heuristic check to build habits — the real test is whether another nurse could safely act on your note.</p>
          </div>
        )}

        {show && (
          <div style={{ marginTop: 14 }}>
            {[["Poor", ex.poor, ex.poorWhy, C.red], ["Better", ex.better, ex.betterWhy, C.amber], ["Excellent", ex.excellent, ex.excellentWhy, C.green]].map(([lvl, txt, why, col]) => (
              <div key={lvl} style={{ marginBottom: 10, border: `1px solid ${col}55`, borderRadius: 10, padding: 12 }}>
                <Pillb color={col}>{lvl}</Pillb>
                <p style={{ fontFamily: mono, fontSize: 12.5, margin: "8px 0 4px", lineHeight: 1.5 }}>{txt}</p>
                <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>↳ {why}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================ QUIZ ============================ */
function Quiz() {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = QUIZ[i];
  const isSata = q.type === "sata";

  const toggle = (idx) => {
    if (submitted) return;
    if (isSata) setSel((s) => s.includes(idx) ? s.filter((x) => x !== idx) : [...s, idx]);
    else setSel([idx]);
  };
  const check = () => {
    const correct = isSata
      ? JSON.stringify([...sel].sort()) === JSON.stringify([...q.answer].sort())
      : sel[0] === q.answer;
    if (correct) setScore((s) => s + 1);
    setSubmitted(true);
  };
  const next = () => {
    if (i + 1 >= QUIZ.length) { setDone(true); return; }
    setI(i + 1); setSel([]); setSubmitted(false);
  };
  const restart = () => { setI(0); setSel([]); setSubmitted(false); setScore(0); setDone(false); };

  const ansArr = isSata ? q.answer : [q.answer];

  if (done) return (
    <div>
      <SectionTitle icon={ListChecks}>Quiz Complete</SectionTitle>
      <Card style={{ padding: 30, textAlign: "center" }}>
        <div style={{ fontSize: 44, fontWeight: 800, fontFamily: mono, color: score / QUIZ.length >= 0.8 ? C.green : C.amber }}>
          {score}/{QUIZ.length}
        </div>
        <div style={{ color: C.sub, marginTop: 6 }}>{Math.round((score / QUIZ.length) * 100)}% · NCLEX passing benchmark is roughly 75–80%.</div>
        <button onClick={restart} className="focusable" style={{ marginTop: 18, background: C.tealDim, color: C.text, border: "none", borderRadius: 9, padding: "11px 26px", fontWeight: 700 }}>Restart</button>
      </Card>
    </div>
  );

  return (
    <div>
      <SectionTitle icon={ListChecks} sub={`NCLEX/HESI-style. Question ${i + 1} of ${QUIZ.length} · Score ${score}`}>Quiz Bank</SectionTitle>
      <Card style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Pillb color={isSata ? C.amber : C.teal}>{isSata ? "SELECT ALL THAT APPLY" : "MULTIPLE CHOICE"}</Pillb>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.sub }}>Q{i + 1}/{QUIZ.length}</div>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{q.q}</p>

        {q.choices.map((c, idx) => {
          const picked = sel.includes(idx);
          const isCorrect = ansArr.includes(idx);
          let bg = C.panel2, bd = C.line;
          if (submitted) {
            if (isCorrect) { bg = "#0e2e29"; bd = C.green; }
            else if (picked) { bg = "#3a1320"; bd = C.red; }
          } else if (picked) { bd = C.teal; bg = "#0e2e29"; }
          return (
            <button key={idx} onClick={() => toggle(idx)} className="focusable"
              style={{ width: "100%", textAlign: "left", display: "flex", gap: 10, alignItems: "center",
                background: bg, border: `1px solid ${bd}`, borderRadius: 9, padding: "11px 13px", marginBottom: 8, color: C.text }}>
              <div style={{ width: 20, height: 20, borderRadius: isSata ? 6 : 10, border: `1px solid ${picked || (submitted && isCorrect) ? C.teal : C.sub}`,
                flexShrink: 0, display: "grid", placeItems: "center", background: (picked || (submitted && isCorrect)) ? C.teal : "transparent" }}>
                {(picked || (submitted && isCorrect)) && <Check size={13} color={C.ink} />}
              </div>
              <span style={{ fontSize: 13.5 }}>{c}</span>
            </button>
          );
        })}

        {submitted && (
          <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 10, padding: 13, marginTop: 6, fontSize: 13, lineHeight: 1.6, animation: "pop .2s ease" }}>
            <b style={{ color: C.teal }}>Rationale: </b>{q.rationale}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          {!submitted ? (
            <button onClick={check} disabled={sel.length === 0} className="focusable"
              style={{ background: sel.length ? C.tealDim : C.line, color: sel.length ? C.text : C.sub, border: "none", borderRadius: 9, padding: "10px 24px", fontWeight: 700 }}>Submit</button>
          ) : (
            <button onClick={next} className="focusable" style={{ background: C.tealDim, color: C.text, border: "none", borderRadius: 9, padding: "10px 24px", fontWeight: 700 }}>
              {i + 1 >= QUIZ.length ? "See results" : "Next question →"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ============================ LEARN ============================ */
const LESSONS = [
  { t: "The 10 Rights — memory hook", icon: ShieldCheck, body: "Think \"PMDR-T\" for the core five: Patient, Medication, Dose, Route, Time. Then the modern additions — Documentation, Indication, Response, Education, Refusal. Mnemonic: \"Please May Doctors Recommend Treatment, Documenting Including Right Education & Refusal.\" The five extra rights are what separate a task-doer from a thinking nurse." },
  { t: "How to read a med order", icon: BookOpen, body: "Order = Drug + Dose + Route + Frequency + Indication (+ parameters). Example: 'Metoprolol 25 mg PO BID, hold if HR<60 or SBP<100.' The HOLD parameter is your safety net — always look for it. If any piece is missing or ambiguous, that's a CLARIFY, not a guess." },
  { t: "When to chart immediately", icon: Clock, body: "Chart in real time for: a change in condition, a critical lab, a fall/event, provider notification, restraint use, and refusal of care. Analogy: it's like a flight recorder — if it isn't captured at the moment, the timeline can't be reconstructed. 'Not charted = not done' in court." },
  { t: "Charting by exception", icon: FileText, body: "Document what's abnormal in detail; confirm the rest is 'within defined limits.' Saves time but the trap is skipping a real finding. Never write 'patient is fine' — it's vague and indefensible. Replace with objective data: 'Lungs clear bilaterally, RR 16, SpO2 98% RA.'" },
  { t: "Objective vs subjective", icon: Activity, body: "Subjective = what the patient says, in quotes ('I feel dizzy'). Objective = what you measure/observe (BP 96/58, diaphoretic). Never chart labels like 'dramatic' or 'drug-seeking' — those are opinions and legally damaging. Data, plus the patient's own words." },
  { t: "SBAR for provider calls", icon: Stethoscope, body: "Situation, Background, Assessment, Recommendation. Hook: \"Some Bored Animals Run.\" It forces you to lead with the point and end with a clear ask, so the provider can act fast. Have vitals, labs, and the order/parameter in front of you before you dial." },
  { t: "High-alert meds", icon: AlertTriangle, body: "Insulin, anticoagulants (warfarin/heparin), opioids, and concentrated electrolytes cause the most serious errors. These often need an independent double-check. Memory hook: 'I-A-O' — Insulin, Anticoagulants, Opioids — the trio to slow down for." },
  { t: "Scope & policy (California)", icon: ShieldCheck, body: "LVN/LPN practice is directed by an RN/MD and bounded by the Nursing Practice Act and facility policy; RNs can assess, plan, and perform a wider range independently. When unsure: facility policy and your board's scope decision tree win over habit. Protect PHI (HIPAA), honor patient rights and refusal, and report up the chain of command. Incident reports document events for the facility — but you do NOT chart 'incident report filed' in the medical record." },
];
function Learn() {
  const [open, setOpen] = useState(0);
  return (
    <div>
      <SectionTitle icon={GraduationCap} sub="Bite-size, mnemonic-heavy lessons. Built for review on the go.">Learning & Memory Tools</SectionTitle>
      {LESSONS.map((l, i) => {
        const Icon = l.icon; const on = open === i;
        return (
          <Card key={i} style={{ marginBottom: 10, overflow: "hidden" }}>
            <button onClick={() => setOpen(on ? -1 : i)} className="focusable"
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "14px 16px", background: "transparent", border: "none", color: C.text }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.panel2, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon size={17} color={C.teal} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 14.5, flex: 1, textAlign: "left" }}>{l.t}</span>
              <ChevronRight size={18} color={C.sub} style={{ transform: on ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
            </button>
            {on && <div style={{ padding: "0 16px 16px 59px", fontSize: 13.5, lineHeight: 1.7, color: C.text, animation: "pop .2s ease" }}>{l.body}</div>}
          </Card>
        );
      })}
      <Card style={{ padding: 16, marginTop: 6, borderColor: C.tealDim }}>
        <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 8 }}>
          <ShieldCheck size={18} color={C.teal} />
          <b>The 9 safety rules — repeat them like a mantra</b>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
          {["Assess before you act", "Verify before you administer", "Document after care is performed", "Reassess after interventions",
            "Notify the provider for unsafe findings", "Follow facility policy", "Stay within scope of practice",
            "Protect patient confidentiality", "When in doubt, clarify the order"].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 13, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 10px" }}>
              <Check size={14} color={C.green} style={{ flexShrink: 0 }} /> {r}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
// ---- Mount ----
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));

// ---- PWA install prompt wiring (Android/Chrome) ----
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("install-btn");
  if (btn) btn.style.display = "flex";
});
window.__installApp = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  const btn = document.getElementById("install-btn");
  if (btn) btn.style.display = "none";
};

// ---- Register service worker for offline use ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

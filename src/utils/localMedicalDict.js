// Local medical term dictionary — no API key required
// Korean colloquial → medical term mapping

const PATTERNS = [
  // Pain locations
  { re: /오른쪽\s*윗?\s*배/g, term: 'RUQ pain', field: 'cc' },
  { re: /왼쪽\s*윗?\s*배/g, term: 'LUQ pain', field: 'cc' },
  { re: /오른쪽\s*아랫?\s*배/g, term: 'RLQ pain', field: 'cc' },
  { re: /왼쪽\s*아랫?\s*배/g, term: 'LLQ pain', field: 'cc' },
  { re: /명치/g, term: 'Epigastric pain', field: 'cc' },
  { re: /배꼽\s*주[위변]/g, term: 'Periumbilical pain', field: 'cc' },
  { re: /온?\s*배\s*(전체|다)\s*(아프|아파)/g, term: 'Diffuse abdominal pain', field: 'cc' },
  { re: /배\s*(가|가\s*)아프|배\s*아파|복통/g, term: 'Abdominal pain', field: 'cc' },
  { re: /가슴\s*(이|이\s*)아프|가슴\s*아파|흉통/g, term: 'Chest pain', field: 'cc' },
  { re: /머리\s*(가|가\s*)아프|머리\s*아파|두통/g, term: 'Headache', field: 'cc' },
  { re: /허리\s*(가|가\s*)아프|허리\s*아파|요통/g, term: 'Low back pain', field: 'cc' },
  { re: /목\s*(이|이\s*)아프|목\s*아파|인후통/g, term: 'Sore throat', field: 'cc' },
  { re: /어깨\s*(가|가\s*)아프|어깨\s*아파/g, term: 'Shoulder pain', field: 'cc' },
  { re: /무릎\s*(이|이\s*)아프|무릎\s*아파/g, term: 'Knee pain', field: 'cc' },
  { re: /옆구리\s*(가|가\s*)아프|옆구리\s*아파/g, term: 'Flank pain', field: 'cc' },
  { re: /골반\s*(이|이\s*)아프|골반\s*아파/g, term: 'Pelvic pain', field: 'cc' },

  // Symptoms
  { re: /열\s*(이\s*)?(나|있|높)/g, term: 'Fever', field: 'cc' },
  { re: /오한/g, term: 'Chills', field: 'associatedSx' },
  { re: /기침/g, term: 'Cough', field: 'cc' },
  { re: /가래/g, term: 'Sputum', field: 'associatedSx' },
  { re: /콧물/g, term: 'Rhinorrhea', field: 'associatedSx' },
  { re: /코막힘|코\s*막히/g, term: 'Nasal congestion', field: 'associatedSx' },
  { re: /숨\s*(이\s*)?(차|가빠|못\s*쉬)|호흡\s*곤란/g, term: 'Dyspnea', field: 'cc' },
  { re: /어지러|어지럼|현기증/g, term: 'Dizziness', field: 'cc' },
  { re: /메스꺼|구역/g, term: 'Nausea', field: 'associatedSx' },
  { re: /토하|구토/g, term: 'Vomiting', field: 'associatedSx' },
  { re: /설사/g, term: 'Diarrhea', field: 'associatedSx' },
  { re: /변비/g, term: 'Constipation', field: 'associatedSx' },
  { re: /혈변|피\s*(가\s*)?(섞인|나오는)\s*변/g, term: 'Hematochezia', field: 'associatedSx' },
  { re: /소변\s*(이\s*)?안\s*나|배뇨\s*곤란/g, term: 'Dysuria', field: 'associatedSx' },
  { re: /혈뇨|소변\s*에?\s*피/g, term: 'Hematuria', field: 'associatedSx' },
  { re: /소변\s*(을\s*)?자주/g, term: 'Frequency', field: 'associatedSx' },
  { re: /부종|부어|붓/g, term: 'Edema', field: 'associatedSx' },
  { re: /발진|두드러기/g, term: 'Rash / Urticaria', field: 'associatedSx' },
  { re: /가려|소양감/g, term: 'Pruritus', field: 'associatedSx' },
  { re: /식욕\s*(이\s*)?없|밥\s*(을\s*)?못\s*먹|식욕\s*부진/g, term: 'Anorexia', field: 'associatedSx' },
  { re: /체중\s*(이\s*)?줄|살\s*(이\s*)?빠|체중\s*감소/g, term: 'Weight loss', field: 'associatedSx' },
  { re: /피곤|피로|기운\s*(이\s*)?없/g, term: 'Fatigue / Malaise', field: 'associatedSx' },
  { re: /잠\s*(을\s*)?못\s*자|불면/g, term: 'Insomnia', field: 'associatedSx' },
  { re: /땀\s*(이\s*)?많이|식은\s*땀|야간\s*발한/g, term: 'Night sweats', field: 'associatedSx' },
  { re: /눈\s*(이\s*)?노랗|황달/g, term: 'Jaundice', field: 'associatedSx' },
  { re: /밥\s*먹으면\s*체|식후.*불편|소화\s*(가\s*)?안/g, term: 'Postprandial indigestion', field: 'associatedSx' },
  { re: /속\s*(이\s*)?쓰리|속쓰림/g, term: 'Heartburn / GERD', field: 'associatedSx' },
  { re: /가스\s*(가\s*)?차|복부\s*팽만|배\s*(가\s*)?빵빵/g, term: 'Abdominal distension', field: 'associatedSx' },

  // Duration / Onset
  { re: /(\d+)\s*일\s*전\s*(부터|에)/g, term: (m) => `Onset: ${m[1]} days ago`, field: 'presentIllness' },
  { re: /(\d+)\s*주\s*전\s*(부터|에)/g, term: (m) => `Onset: ${m[1]} weeks ago`, field: 'presentIllness' },
  { re: /(\d+)\s*달\s*전\s*(부터|에)/g, term: (m) => `Onset: ${m[1]} months ago`, field: 'presentIllness' },
  { re: /(\d+)\s*개월\s*전\s*(부터|에)/g, term: (m) => `Onset: ${m[1]} months ago`, field: 'presentIllness' },
  { re: /오늘\s*(부터|아침)/g, term: 'Onset: today', field: 'presentIllness' },
  { re: /어제\s*(부터)?/g, term: 'Onset: yesterday', field: 'presentIllness' },
  { re: /갑자기|갑작스럽/g, term: 'Sudden onset', field: 'presentIllness' },
  { re: /점점|서서히/g, term: 'Gradual onset', field: 'presentIllness' },

  // Diagnosis / Conditions
  { re: /담석/g, term: 'Cholelithiasis', field: 'diagnosis' },
  { re: /담낭염/g, term: 'Cholecystitis', field: 'diagnosis' },
  { re: /맹장염|충수염/g, term: 'Appendicitis', field: 'diagnosis' },
  { re: /폐렴/g, term: 'Pneumonia', field: 'diagnosis' },
  { re: /당뇨/g, term: 'DM (Diabetes Mellitus)', field: 'pastHx' },
  { re: /고혈압|혈압\s*(이\s*)?높/g, term: 'HTN (Hypertension)', field: 'pastHx' },
  { re: /천식/g, term: 'Asthma', field: 'pastHx' },
  { re: /간염/g, term: 'Hepatitis', field: 'pastHx' },
  { re: /결핵/g, term: 'Tuberculosis', field: 'pastHx' },
  { re: /암|종양/g, term: 'Malignancy', field: 'pastHx' },
  { re: /뇌졸중|중풍/g, term: 'CVA (Cerebrovascular Accident)', field: 'pastHx' },
  { re: /심근경색/g, term: 'MI (Myocardial Infarction)', field: 'pastHx' },
  { re: /갑상선/g, term: 'Thyroid disease', field: 'pastHx' },
  { re: /위염/g, term: 'Gastritis', field: 'diagnosis' },
  { re: /위궤양/g, term: 'Gastric ulcer', field: 'diagnosis' },
  { re: /장염/g, term: 'Enteritis', field: 'diagnosis' },
  { re: /요로\s*감염/g, term: 'UTI (Urinary Tract Infection)', field: 'diagnosis' },
  { re: /대상\s*포진/g, term: 'Herpes Zoster', field: 'diagnosis' },
  { re: /탈장|헤르니아/g, term: 'Hernia', field: 'diagnosis' },

  // Plan
  { re: /수술\s*(하러|예정|해야|받으러)/g, term: 'Op. scheduled', field: 'plan' },
  { re: /입원/g, term: 'Admission', field: 'plan' },
  { re: /퇴원/g, term: 'Discharge', field: 'plan' },
  { re: /검사\s*(해야|받아야|예정)/g, term: 'Work-up planned', field: 'plan' },
  { re: /CT\s*(찍|촬영)/g, term: 'CT scan ordered', field: 'plan' },
  { re: /엑스레이|X-?ray|x-?ray/g, term: 'X-ray ordered', field: 'plan' },
  { re: /피\s*검사|혈액\s*검사/g, term: 'Lab work-up', field: 'plan' },
  { re: /초음파/g, term: 'Ultrasonography', field: 'plan' },
  { re: /내시경/g, term: 'Endoscopy', field: 'plan' },

  // Allergies
  { re: /알[러레]르기\s*(없|no)/g, term: 'NKA (No Known Allergies)', field: 'pastHx' },
  { re: /알[러레]르기\s*(있|yes)/g, term: 'Allergy (+)', field: 'pastHx' },
]

export function convertLocal(transcript) {
  if (!transcript || !transcript.trim()) return null

  const result = {
    cc: [],
    presentIllness: [],
    associatedSx: [],
    pastHx: [],
    diagnosis: [],
    plan: [],
    notes: [],
  }

  for (const pattern of PATTERNS) {
    const matches = [...transcript.matchAll(pattern.re)]
    if (matches.length > 0) {
      for (const match of matches) {
        const term = typeof pattern.term === 'function' ? pattern.term(match) : pattern.term
        if (!result[pattern.field].includes(term)) {
          result[pattern.field].push(term)
        }
      }
    }
  }

  // Always include the full transcript in notes so nothing is lost
  // Split into sentences and put unmatched content into notes
  const matchedSpans = []
  for (const pattern of PATTERNS) {
    for (const m of transcript.matchAll(new RegExp(pattern.re.source, 'g'))) {
      matchedSpans.push([m.index, m.index + m[0].length])
    }
  }

  // Collect unmatched text segments as general notes
  const sentences = transcript.split(/[.。,，!！?？\n]+/).map(s => s.trim()).filter(Boolean)
  const extraNotes = []
  for (const sentence of sentences) {
    const idx = transcript.indexOf(sentence)
    const isMatched = matchedSpans.some(([s, e]) => idx >= s && idx < e || (idx + sentence.length > s && idx < e))
    if (!isMatched && sentence.length > 1) {
      extraNotes.push(sentence)
    }
  }

  // If nothing was matched by patterns, put everything into notes
  const hasResults = Object.values(result).some(arr => arr.length > 0)
  if (!hasResults) {
    return {
      cc: '',
      presentIllness: '',
      associatedSx: '',
      pastHx: '',
      diagnosis: '',
      plan: '',
      notes: transcript.trim(),
    }
  }

  // Combine matched terms + unmatched content in notes
  const allNotes = [...result.notes, ...extraNotes].filter(Boolean)

  return {
    cc: result.cc.join(', '),
    presentIllness: result.presentIllness.join(', '),
    associatedSx: result.associatedSx.join(', '),
    pastHx: result.pastHx.join(', '),
    diagnosis: result.diagnosis.join(', '),
    plan: result.plan.join(', '),
    notes: allNotes.length > 0 ? allNotes.join(' / ') : '',
  }
}

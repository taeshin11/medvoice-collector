import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const COLUMNS = [
  { key: 'patientId', label: 'Patient ID' },
  { key: 'name', label: 'Name' },
  { key: 'date', label: 'Date' },
  { key: 'cc', label: 'C.C' },
  { key: 'presentIllness', label: 'Present Illness' },
  { key: 'associatedSx', label: 'Associated Sx' },
  { key: 'pastHx', label: 'Past Hx' },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'plan', label: 'Plan' },
  { key: 'notes', label: 'Notes' },
]

export { COLUMNS }

function patientsToRows(patients) {
  return patients.map(p => {
    const row = {}
    COLUMNS.forEach(c => { row[c.label] = p[c.key] || '' })
    return row
  })
}

export function exportXlsx(patients) {
  const rows = patientsToRows(patients)
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'SPINAI MedVoice')

  // Add watermark row at top
  XLSX.utils.sheet_add_aoa(ws, [['SPINAI MedVoice Collector - Medical Voice Data']], { origin: 'A1' })
  XLSX.utils.sheet_add_json(ws, rows, { origin: 'A2', skipHeader: false })

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `MedVoice_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export function exportCsv(patients) {
  const rows = patientsToRows(patients)
  const ws = XLSX.utils.json_to_sheet(rows)
  const csv = XLSX.utils.sheet_to_csv(ws)
  const csvWithWatermark = 'SPINAI MedVoice Collector\n' + csv
  saveAs(new Blob([csvWithWatermark], { type: 'text/csv;charset=utf-8' }), `MedVoice_${new Date().toISOString().slice(0, 10)}.csv`)
}

export function copyToClipboard(patients) {
  const rows = patientsToRows(patients)
  const headers = COLUMNS.map(c => c.label).join('\t')
  const body = rows.map(r => COLUMNS.map(c => r[c.label]).join('\t')).join('\n')
  return navigator.clipboard.writeText(headers + '\n' + body)
}

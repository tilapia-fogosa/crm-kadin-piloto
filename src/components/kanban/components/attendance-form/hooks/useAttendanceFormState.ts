
import { useState } from "react"

export function useAttendanceFormState() {
  console.log('Inicializando hook useAttendanceFormState')
  
  const [selectedResult, setSelectedResult] = useState<'matriculado' | 'negociacao' | 'perdido' | undefined>(undefined)
  const [showSaleForm, setShowSaleForm] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [observations, setObservations] = useState("")
  const [qualityScore, setQualityScore] = useState<string>("")
  const [nextContactDate, setNextContactDate] = useState<Date>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [notes, setNotes] = useState("") 
  const [notesValidationError, setNotesValidationError] = useState(false)
  const [studentName, setStudentName] = useState("")
  const [studentNameValidationError, setStudentNameValidationError] = useState(false)

  return {
    selectedResult,
    showSaleForm,
    selectedReasons,
    observations,
    qualityScore,
    nextContactDate,
    notes,
    notesValidationError,
    studentName,
    studentNameValidationError,
    isProcessing,
    setSelectedResult,
    setShowSaleForm,
    setSelectedReasons,
    setObservations,
    setQualityScore,
    setNextContactDate,
    setIsProcessing,
    setNotes,
    setNotesValidationError,
    setStudentName,
    setStudentNameValidationError
  }
}

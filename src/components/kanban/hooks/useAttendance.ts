
import { Attendance } from "../types"
import { useState } from "react"

export function useAttendance() {
  const [isLoading, setIsLoading] = useState(false)

  const registerAttendance = async (attendance: Attendance) => {
    setIsLoading(true)
    try {
      // TODO: Implementar a lógica de registro do atendimento no backend
      console.log('Registrando atendimento:', attendance)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulação de delay
    } finally {
      setIsLoading(false)
    }
  }

  return {
    registerAttendance,
    isLoading
  }
}

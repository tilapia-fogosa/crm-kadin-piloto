
import { KanbanCard } from "../../types"
import { ClientData } from "../types/kanbanTypes"

export function transformStudentToKanbanCard(student: ClientData): KanbanCard {
  console.log('Transforming student to KanbanCard:', student)
  
  return {
    id: student.id,
    clientName: student.name,
    leadSource: student.lead_source,
    phoneNumber: student.phone_number,
    createdAt: student.created_at,
    activities: [],
    labels: []
  }
}

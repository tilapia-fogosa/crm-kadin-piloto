
import { KanbanCard, ClientData } from "../types/kanbanTypes"

export function transformStudentToKanbanCard(student: ClientData): KanbanCard {
  console.log('Transforming student to KanbanCard:', student)
  
  return {
    id: student.id,
    clientName: student.clientName,
    leadSource: student.leadSource,
    phoneNumber: student.phoneNumber,
    createdAt: student.createdAt,
    activities: [],
    labels: []
  }
}

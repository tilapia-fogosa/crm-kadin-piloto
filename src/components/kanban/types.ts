export type KanbanColumn = {
  id: string
  title: string
  cards: KanbanCard[]
}

export type KanbanCard = {
  id: string
  clientName: string
  leadSource: string
  phoneNumber: string
  createdAt: string
  nextContactDate?: string
  activities?: string[]
  labels?: string[]
}

export type ContactAttempt = {
  type: 'phone' | 'whatsapp' | 'whatsapp-call'
  nextContactDate: Date
  cardId: string
}

export type EffectiveContact = {
  type: 'phone' | 'whatsapp' | 'whatsapp-call'
  contactDate: Date
  notes: string
  observations: string
  cardId: string
  nextContactDate?: Date
}

export type Scheduling = {
  scheduledDate: Date
  notes: string
  cardId: string
  valorizacaoDiaAnterior: boolean
  nextContactDate?: Date
}


import { useState } from "react"
import { ContactAttemptForm } from "./ContactAttemptForm"
import { EffectiveContactForm } from "./EffectiveContactForm"
import { SchedulingForm } from "./SchedulingForm"
import { AttendanceForm } from "./components/attendance-form"
import { useContactAttempt } from "./hooks/useContactAttempt"
import { useAttendanceSubmission } from "./hooks/useAttendanceSubmission"
import { LossModal } from "./components/loss/LossModal"
import { ContactAttempt, EffectiveContact, Scheduling, Attendance } from "./types"
import { PreSaleForm } from "./PreSaleForm"

interface ActivityDetailsProps {
  selectedActivity: string | null
  cardId: string
  clientName: string
  onRegisterAttempt: (attempt: ContactAttempt) => Promise<void>
  onRegisterEffectiveContact: (contact: EffectiveContact) => Promise<void>
  onRegisterScheduling?: (scheduling: Scheduling) => Promise<void>
  onRegisterAttendance?: (attendance: Attendance) => Promise<void>
  onLossSubmit?: (reasons: string[], observations?: string) => Promise<void>
  isSubmitting?: boolean
}

export function ActivityDetails({
  selectedActivity,
  cardId,
  clientName,
  onRegisterAttempt,
  onRegisterEffectiveContact,
  onRegisterScheduling,
  onRegisterAttendance,
  onLossSubmit,
  isSubmitting = false
}: ActivityDetailsProps) {
  console.log('ActivityDetails - Renderizando com atividade selecionada:', selectedActivity)
  
  return (
    <div className="border-l pl-4">
      <h3 className="font-semibold mb-2">Detalhes da Atividade</h3>
      {selectedActivity === 'tentativa-contato' ? (
        <ContactAttemptForm
          onSubmit={onRegisterAttempt}
          cardId={cardId}
          onLossSubmit={onLossSubmit}
          isDisabled={isSubmitting}
        />
      ) : selectedActivity === 'contato-efetivo' ? (
        <EffectiveContactForm
          onSubmit={onRegisterEffectiveContact}
          cardId={cardId}
          onLossSubmit={onLossSubmit}
          isDisabled={isSubmitting}
        />
      ) : selectedActivity === 'agendamento' && onRegisterScheduling ? (
        <SchedulingForm
          onSubmit={onRegisterScheduling}
          cardId={cardId}
          isDisabled={isSubmitting}
        />
      ) : selectedActivity === 'atendimento' && onRegisterAttendance ? (
        <AttendanceForm
          onSubmit={onRegisterAttendance}
          cardId={cardId}
          clientName={clientName}
          isDisabled={isSubmitting}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Selecione uma atividade para ver as opções
        </p>
      )}
    </div>
  )
}

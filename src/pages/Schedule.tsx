
import { AppointmentScheduler } from "@/components/appointments/AppointmentScheduler"

export default function SchedulePage() {
  const handleSlotSelect = (date: Date) => {
    console.log('Slot selecionado na página:', date)
    // Aqui podemos adicionar lógica adicional específica da página
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Agenda</h1>
      <AppointmentScheduler 
        onSelectSlot={handleSlotSelect}
        simplified={false}
      />
    </div>
  )
}

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { KanbanCard } from "./KanbanCard"
import { ContactAttemptForm } from "./ContactAttemptForm"
import { KanbanColumn, KanbanCard as KanbanCardType, ContactAttempt } from "./types"

const initialColumns: KanbanColumn[] = [
  {
    id: "novo-cadastro",
    title: "Novo Cadastro",
    cards: [
      {
        id: "1",
        clientName: "João Silva",
        leadSource: "Site",
        phoneNumber: "5511999999999",
        activities: ["Primeiro Contato"],
        labels: ["novo-lead"],
      },
      {
        id: "2",
        clientName: "Maria Santos",
        leadSource: "Indicação",
        phoneNumber: "5511988888888",
        activities: ["Aguardando Retorno"],
        labels: ["follow-up"],
      },
    ],
  },
  {
    id: "tentativa-contato",
    title: "Em tentativa de Contato",
    cards: [
      {
        id: "3",
        clientName: "Pedro Oliveira",
        leadSource: "Instagram",
        phoneNumber: "5511977777777",
        activities: ["Segunda Tentativa"],
        labels: ["em-andamento"],
      },
    ],
  },
  {
    id: "contato-efetivo",
    title: "Contato Efetivo",
    cards: [
      {
        id: "4",
        clientName: "Ana Costa",
        leadSource: "Facebook",
        phoneNumber: "5511966666666",
        activities: ["Interesse Confirmado"],
        labels: ["qualificado"],
      },
    ],
  },
  {
    id: "atendimento-agendado",
    title: "Atendimento Agendado",
    cards: [
      {
        id: "5",
        clientName: "Carlos Ferreira",
        leadSource: "Google Ads",
        phoneNumber: "5511955555555",
        activities: ["Consulta Marcada"],
        labels: ["agendado"],
      },
    ],
  },
  {
    id: "atendimento-realizado",
    title: "Atendimento Realizado",
    cards: [
      {
        id: "6",
        clientName: "Lucia Mendes",
        leadSource: "LinkedIn",
        phoneNumber: "5511944444444",
        activities: ["Pós Atendimento"],
        labels: ["finalizado"],
      },
    ],
  },
]

export function KanbanBoard() {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDateSelect = (event: React.MouseEvent, date: Date) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedDate(date)
    setIsCalendarOpen(false)
  }

  const handleWhatsAppClick = (e: React.MouseEvent, phoneNumber: string) => {
    e.stopPropagation()
    const formattedNumber = phoneNumber.replace(/\D/g, '')
    window.open(`https://api.whatsapp.com/send?phone=${formattedNumber}`, '_blank')
  }

  const activities = [
    { id: 'tentativa', label: 'Tentativa de Contato' },
    { id: 'efetivo', label: 'Contato Efetivo' },
    { id: 'agendamento', label: 'Agendamento' },
    { id: 'atendimento', label: 'Atendimento' },
  ]

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId)
  }

  const handleRegisterAttempt = (attempt: ContactAttempt) => {
    console.log("Registering attempt:", attempt)
    
    setColumns(prevColumns => {
      const newColumns = [...prevColumns]
      
      // Find the card in the "Novo Cadastro" column
      const novoCadastroColumn = newColumns.find(col => col.id === "novo-cadastro")
      const cardIndex = novoCadastroColumn?.cards.findIndex(card => card.id === attempt.cardId)
      
      if (novoCadastroColumn && cardIndex !== undefined && cardIndex !== -1) {
        const card = novoCadastroColumn.cards[cardIndex]
        
        // Remove card from "Novo Cadastro"
        novoCadastroColumn.cards.splice(cardIndex, 1)
        
        // Add activity to card
        const updatedCard = {
          ...card,
          activities: [
            ...(card.activities || []),
            `Tentativa de Contato - ${format(attempt.nextContactDate, "dd/MM/yyyy HH:mm")}`
          ]
        }
        
        // Add card to "Em tentativa de Contato"
        const tentativaColumn = newColumns.find(col => col.id === "tentativa-contato")
        if (tentativaColumn) {
          tentativaColumn.cards.push(updatedCard)
        }
      }
      
      return newColumns
    })

    toast({
      title: "Tentativa registrada",
      description: "O lead foi movido para 'Em tentativa de Contato'",
    })

    // Close the dialog by clearing the selected card
    setSelectedCard(null)
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel do Consultor</h1>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && handleDateSelect({} as React.MouseEvent, date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex w-80 flex-none flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{column.title}</h2>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                {column.cards.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {column.cards.map((card) => (
                <Dialog key={card.id} open={selectedCard?.id === card.id} onOpenChange={(open) => !open && setSelectedCard(null)}>
                  <DialogTrigger asChild>
                    <div onClick={() => setSelectedCard(card)}>
                      <KanbanCard
                        card={card}
                        onClick={() => setSelectedCard(card)}
                        onWhatsAppClick={(e) => handleWhatsAppClick(e, card.phoneNumber)}
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                      <DialogTitle>Atividades - {card.clientName}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        {activities.map((activity) => (
                          <Button
                            key={activity.id}
                            variant="outline"
                            className={cn(
                              "justify-start",
                              selectedActivity === activity.id && "bg-primary/10"
                            )}
                            onClick={() => handleActivitySelect(activity.id)}
                          >
                            {activity.label}
                          </Button>
                        ))}
                      </div>
                      <div className="border-l pl-4">
                        {selectedActivity === 'tentativa' ? (
                          <ContactAttemptForm
                            onSubmit={handleRegisterAttempt}
                            cardId={card.id}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Selecione uma atividade para ver as opções
                          </p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Calendar as CalendarIcon, Phone, WhatsappIcon } from "lucide-react"

type KanbanColumn = {
  id: string
  title: string
  cards: KanbanCard[]
}

type KanbanCard = {
  id: string
  clientName: string
  leadSource: string
  phoneNumber: string
  activities?: string[]
  labels?: string[]
}

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
  const [columns] = useState<KanbanColumn[]>(initialColumns)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)

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
                <Dialog key={card.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:bg-accent/5">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{card.clientName}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Origem: {card.leadSource}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0"
                              onClick={(e) => handleWhatsAppClick(e, card.phoneNumber)}
                            >
                              <WhatsappIcon className="h-4 w-4 text-green-500" />
                            </Button>
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{card.phoneNumber}</span>
                          </div>
                          {card.activities && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Última atividade:
                              </p>
                              <p className="text-sm">
                                {card.activities[card.activities.length - 1]}
                              </p>
                            </div>
                          )}
                          {card.labels && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {card.labels.map((label) => (
                                <span
                                  key={label}
                                  className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Atividades - {card.clientName}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        {activities.map((activity) => (
                          <Button
                            key={activity.id}
                            variant="outline"
                            className="justify-start"
                            onClick={() => setSelectedCard(card)}
                          >
                            {activity.label}
                          </Button>
                        ))}
                      </div>
                      <div className="border-l pl-4">
                        <p className="text-sm text-muted-foreground">
                          Selecione uma atividade para ver as opções
                        </p>
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
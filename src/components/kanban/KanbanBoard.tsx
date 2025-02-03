import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

type KanbanColumn = {
  id: string
  title: string
  cards: KanbanCard[]
}

type KanbanCard = {
  id: string
  title: string
  description: string
  dueDate?: Date
  labels?: string[]
}

const initialColumns: KanbanColumn[] = [
  {
    id: "primeiro-contato",
    title: "Primeiro Contato",
    cards: [
      {
        id: "1",
        title: "Apresentação Inicial",
        description: "Fazer apresentação inicial da empresa e serviços",
        dueDate: new Date("2024-03-20"),
        labels: ["novo-lead", "prioridade-alta"],
      },
      {
        id: "2",
        title: "Qualificação do Lead",
        description: "Verificar interesse e potencial do cliente",
        dueDate: new Date("2024-03-21"),
        labels: ["qualificação"],
      },
    ],
  },
  {
    id: "em-negociacao",
    title: "Em Negociação",
    cards: [
      {
        id: "3",
        title: "Proposta Comercial",
        description: "Elaborar e enviar proposta comercial personalizada",
        dueDate: new Date("2024-03-22"),
        labels: ["proposta", "em-andamento"],
      },
      {
        id: "4",
        title: "Follow-up",
        description: "Acompanhamento da proposta enviada",
        dueDate: new Date("2024-03-23"),
        labels: ["follow-up"],
      },
    ],
  },
  {
    id: "fechamento",
    title: "Fechamento",
    cards: [
      {
        id: "5",
        title: "Negociação Final",
        description: "Ajustes finais e alinhamento de expectativas",
        dueDate: new Date("2024-03-24"),
        labels: ["negociação", "prioridade-alta"],
      },
      {
        id: "6",
        title: "Contrato",
        description: "Preparação e envio do contrato para assinatura",
        dueDate: new Date("2024-03-25"),
        labels: ["documentação"],
      },
    ],
  },
  {
    id: "pos-venda",
    title: "Pós-Venda",
    cards: [
      {
        id: "7",
        title: "Onboarding",
        description: "Processo de integração do novo cliente",
        dueDate: new Date("2024-03-26"),
        labels: ["onboarding", "cliente-novo"],
      },
      {
        id: "8",
        title: "Acompanhamento",
        description: "Monitoramento da satisfação do cliente",
        dueDate: new Date("2024-03-27"),
        labels: ["satisfação"],
      },
    ],
  },
]

export function KanbanBoard() {
  const [columns] = useState<KanbanColumn[]>(initialColumns)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleDateSelect = (event: React.MouseEvent, date: Date) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedDate(date)
    setIsCalendarOpen(false)
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
                <Card key={card.id}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                    {card.dueDate && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Due: {format(card.dueDate, "PPP")}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard
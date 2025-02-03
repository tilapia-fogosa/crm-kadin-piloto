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
    id: "todo",
    title: "To Do",
    cards: [
      {
        id: "1",
        title: "Implement authentication",
        description: "Add user authentication using JWT",
        dueDate: new Date("2024-03-20"),
        labels: ["feature", "high-priority"],
      },
      {
        id: "2",
        title: "Design dashboard",
        description: "Create wireframes for the main dashboard",
        dueDate: new Date("2024-03-25"),
        labels: ["design"],
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    cards: [
      {
        id: "3",
        title: "API integration",
        description: "Integrate with external payment API",
        dueDate: new Date("2024-03-18"),
        labels: ["feature", "backend"],
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      {
        id: "4",
        title: "Setup project",
        description: "Initialize project with Vite and React",
        dueDate: new Date("2024-03-15"),
        labels: ["setup"],
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
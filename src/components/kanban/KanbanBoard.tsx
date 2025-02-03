import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { addDays, format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"

interface Lead {
  id: string
  name: string
  contact: string
  source: string
  status: "novo" | "contatado" | "agendado" | "atendido"
}

interface Activity {
  id: string
  leadId: string
  type: "tentativa" | "contato" | "agendamento" | "atendimento"
  contactType?: "telefone" | "whatsapp" | "ligacao_whatsapp"
  nextContactDate?: Date
  createdAt: Date
  notes?: string
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "João Silva",
    contact: "(11) 99999-9999",
    source: "Site",
    status: "novo",
  },
  {
    id: "2",
    name: "Maria Santos",
    contact: "(11) 88888-8888",
    source: "Instagram",
    status: "contatado",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    contact: "(11) 77777-7777",
    source: "Facebook",
    status: "agendado",
  },
]

const columns = [
  { id: "novo", title: "Novo Cadastro" },
  { id: "contatado", title: "Contato Efetivo" },
  { id: "agendado", title: "Atendimento Agendado" },
  { id: "atendido", title: "Atendimento Realizado" },
]

const activities = [
  { id: "tentativa", title: "Tentativa de Contato" },
  { id: "contato", title: "Contato Efetivo" },
  { id: "agendamento", title: "Agendamento" },
  { id: "atendimento", title: "Atendimento" },
]

export function KanbanBoard() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [contactType, setContactType] = useState<string>("")
  const [nextContactDate, setNextContactDate] = useState<Date>(addDays(new Date(), 1))

  const handleActivityClick = (activityType: string) => {
    setSelectedActivity(activityType)
    console.log(`Activity ${activityType} selected for lead ${selectedLead?.id}`)
  }

  const handleSaveActivity = () => {
    console.log("Saving activity:", {
      leadId: selectedLead?.id,
      type: selectedActivity,
      contactType,
      nextContactDate,
    })
    // Here we would save the activity to the database
  }

  const renderActivityContent = () => {
    if (selectedActivity === "tentativa") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Contato</Label>
            <RadioGroup
              value={contactType}
              onValueChange={setContactType}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="telefone" id="telefone" />
                <Label htmlFor="telefone">Ligação Telefônica</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <Label htmlFor="whatsapp">WhatsApp</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ligacao_whatsapp" id="ligacao_whatsapp" />
                <Label htmlFor="ligacao_whatsapp">Ligação WhatsApp</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Próximo Contato</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !nextContactDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextContactDate ? format(nextContactDate, "PPP") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={nextContactDate}
                  onSelect={(date) => date && setNextContactDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleSaveActivity} className="w-full">
            Salvar Atividade
          </Button>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Kanban de Leads</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex min-w-[320px] flex-col gap-4 rounded-lg bg-muted/50 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{column.title}</h3>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold">
                {mockLeads.filter((lead) => lead.status === column.id).length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {mockLeads
                .filter((lead) => lead.status === column.id)
                .map((lead) => (
                  <Dialog key={lead.id}>
                    <DialogTrigger asChild>
                      <Card
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{lead.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                          <p>{lead.contact}</p>
                          <p>Origem: {lead.source}</p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                      <DialogHeader>
                        <DialogTitle>Atividades - {lead.name}</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-[200px,1fr] gap-4 py-4">
                        <div className="space-y-2">
                          {activities.map((activity) => (
                            <Button
                              key={activity.id}
                              onClick={() => handleActivityClick(activity.id)}
                              variant={selectedActivity === activity.id ? "default" : "outline"}
                              className="w-full justify-start"
                            >
                              {activity.title}
                            </Button>
                          ))}
                        </div>
                        <div className="border-l pl-4">
                          {renderActivityContent()}
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
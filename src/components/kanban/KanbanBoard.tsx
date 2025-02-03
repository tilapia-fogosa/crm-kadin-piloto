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
import { addDays, format, set } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Lead {
  id: string
  name: string
  contact: string
  source: string
  status: "ligacao_mensagem" | "em_tentativa" | "contatado" | "agendado" | "atendido"
  tentativeCount: number
  nextContactDate?: Date
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
    status: "ligacao_mensagem",
    tentativeCount: 2,
    nextContactDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Example next contact date
  },
  {
    id: "2",
    name: "Maria Santos",
    contact: "(11) 88888-8888",
    source: "Instagram",
    status: "contatado",
    tentativeCount: 1,
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    contact: "(11) 77777-7777",
    source: "Facebook",
    status: "agendado",
    tentativeCount: 0,
  },
]

const columns = [
  { id: "ligacao_mensagem", title: "Ligação/Mensagem" },
  { id: "em_tentativa", title: "Em Tentativa de Contato" },
  { id: "contatado", title: "Contato Efetivo" },
  { id: "agendado", title: "Agendamento" },
  { id: "atendido", title: "Atendimento" },
]

const activities = [
  { id: "tentativa", title: "Tentativa de Contato" },
  { id: "contato", title: "Contato Efetivo" },
  { id: "agendamento", title: "Agendamento" },
  { id: "atendimento", title: "Atendimento" },
]

const hours = Array.from({ length: 24 }, (_, i) => 
  i.toString().padStart(2, '0')
)

const minutes = Array.from({ length: 60 }, (_, i) => 
  i.toString().padStart(2, '0')
)

export function KanbanBoard() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [contactType, setContactType] = useState<string>("")
  const [nextContactDate, setNextContactDate] = useState<Date>(() => {
    const now = new Date()
    const nextDay = addDays(now, 1)
    return set(nextDay, { hours: now.getHours() < 12 ? 14 : 8, minutes: 0 })
  })
  const [selectedHour, setSelectedHour] = useState(() => {
    const now = new Date()
    return now.getHours() < 12 ? "14" : "08"
  })
  const [selectedMinute, setSelectedMinute] = useState("00")

  const handleActivityClick = (activityType: string) => {
    setSelectedActivity(activityType)
    console.log(`Activity ${activityType} selected for lead ${selectedLead?.id}`)
  }

  const handleSaveActivity = () => {
    if (selectedLead && selectedActivity === "tentativa") {
      // Here we would save the activity to the database
      console.log("Saving activity:", {
        leadId: selectedLead.id,
        type: selectedActivity,
        contactType,
        nextContactDate: set(nextContactDate, {
          hours: parseInt(selectedHour),
          minutes: parseInt(selectedMinute)
        }),
      })
      
      // Update lead status
      selectedLead.status = "em_tentativa"
      selectedLead.tentativeCount += 1
      selectedLead.nextContactDate = nextContactDate; // Update next contact date

      // Close dialog after saving
      setSelectedLead(null)
      setSelectedActivity(null)
      setContactType("")
    }
  }

  const getNextContactColor = (date: Date) => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date < now) {
      return 'bg-red-100'
    }
    
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.getHours() > now.getHours() ? 'bg-yellow-100' : 'bg-red-100'
    }
    
    if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'bg-green-100'
    }
    
    return 'bg-red-100'
  }

  const renderActivityContent = () => {
    if (selectedActivity === "tentativa") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="whatsapp">Mensagem WhatsApp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ligacao_whatsapp" id="ligacao_whatsapp" />
                  <Label htmlFor="ligacao_whatsapp">Ligação WhatsApp</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Próximo Contato</Label>
              <div className="flex flex-col gap-2">
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
                      {nextContactDate ? format(nextContactDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
                    <Calendar
                      mode="single"
                      selected={nextContactDate}
                      onSelect={(date, e) => {
                        e?.preventDefault()
                        e?.stopPropagation()
                        if (date) {
                          setNextContactDate(date)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <div className="flex gap-2 items-center">
                  <Clock className="h-4 w-4" />
                  <Select value={selectedHour} onValueChange={setSelectedHour}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>:</span>
                  <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Minuto" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
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
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{lead.name}</CardTitle>
                            {lead.nextContactDate && (
                              <div className={cn("text-xs p-1 rounded", getNextContactColor(lead.nextContactDate))}>
                                <div>Próx. Contato</div>
                                <div>{format(lead.nextContactDate, "dd/MM HH:mm")}</div>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                          <p>{lead.contact}</p>
                          <p>Origem: {lead.source}</p>
                          {lead.tentativeCount > 0 && (
                            <p className="mt-2 text-xs font-medium text-orange-500">
                              {lead.tentativeCount} tentativa{lead.tentativeCount > 1 ? 's' : ''} de contato
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]" onClick={(e) => e.stopPropagation()}>
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

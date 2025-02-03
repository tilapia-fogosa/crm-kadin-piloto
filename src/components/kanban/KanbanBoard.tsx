import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Lead {
  id: string
  name: string
  contact: string
  source: string
  status: "novo" | "contatado" | "agendado" | "atendido"
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

export function KanbanBoard() {
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
                  <Card key={lead.id}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{lead.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                      <p>{lead.contact}</p>
                      <p>Origem: {lead.source}</p>
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
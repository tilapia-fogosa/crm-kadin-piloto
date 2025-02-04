import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import { LeadFormFields } from "@/components/leads/lead-form-fields"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { LeadFormData, leadFormSchema } from "@/types/lead-form"

// Simulated data from Kanban board
const initialClients = [
  {
    id: "1",
    name: "João Silva",
    phoneNumber: "5511999999999",
    leadSource: "Site",
  },
  {
    id: "2",
    name: "Maria Santos",
    phoneNumber: "5511988888888",
    leadSource: "Indicação",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    phoneNumber: "5511977777777",
    leadSource: "Instagram",
  },
]

export default function ClientsPage() {
  const [clients, setClients] = useState(initialClients)
  const [selectedClient, setSelectedClient] = useState<any>(null)

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  })

  const handleDelete = (clientId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      setClients((prev) => prev.filter((client) => client.id !== clientId))
      toast({
        title: "Cliente excluído",
        description: "O cliente foi removido com sucesso.",
      })
    }
  }

  const handleEdit = (client: any) => {
    setSelectedClient(client)
    form.reset({
      name: client.name,
      phoneNumber: client.phoneNumber.replace(/\D/g, ""),
      leadSource: client.leadSource,
    })
  }

  const onSubmit = (values: LeadFormData) => {
    if (!selectedClient) return

    setClients((prev) =>
      prev.map((client) =>
        client.id === selectedClient.id
          ? {
              ...client,
              name: values.name,
              phoneNumber: values.phoneNumber,
              leadSource: values.leadSource,
            }
          : client
      )
    )

    toast({
      title: "Cliente atualizado",
      description: "As informações do cliente foram atualizadas com sucesso.",
    })
    setSelectedClient(null)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Todos os Clientes</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome Completo</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Origem do Lead</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.phoneNumber}</TableCell>
                <TableCell>{client.leadSource}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Dialog open={selectedClient?.id === client.id} onOpenChange={(open) => !open && setSelectedClient(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <LeadFormFields form={form} />
                          <Button type="submit">Salvar Alterações</Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
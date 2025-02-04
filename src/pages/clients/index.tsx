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
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<any>(null)

  const { data: clients, isLoading } = useQuery({
    queryKey: ['all-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone_number,
          lead_source,
          observations,
          status
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  })

  const handleDelete = async (clientId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao tentar excluir o cliente.",
        });
        return;
      }

      toast({
        title: "Cliente excluído",
        description: "O cliente foi removido com sucesso.",
      });
    }
  }

  const handleEdit = (client: any) => {
    setSelectedClient(client)
    form.reset({
      name: client.name,
      phoneNumber: client.phone_number.replace(/\D/g, ""),
      leadSource: client.lead_source,
      observations: client.observations || "",
    })
  }

  const onSubmit = async (values: LeadFormData) => {
    if (!selectedClient) return;

    const { error } = await supabase
      .from('clients')
      .update({
        name: values.name,
        phone_number: values.phoneNumber,
        lead_source: values.leadSource,
        observations: values.observations,
      })
      .eq('id', selectedClient.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao tentar atualizar o cliente.",
      });
      return;
    }

    toast({
      title: "Cliente atualizado",
      description: "As informações do cliente foram atualizadas com sucesso.",
    });
    setSelectedClient(null);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>;
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.phone_number}</TableCell>
                <TableCell>{client.lead_source}</TableCell>
                <TableCell>{client.status}</TableCell>
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
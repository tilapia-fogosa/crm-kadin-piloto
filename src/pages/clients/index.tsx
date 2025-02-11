
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LeadFormData, leadFormSchema } from "@/types/lead-form"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ClientsTable } from "@/components/clients/clients-table"

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const queryClient = useQueryClient()

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
    try {
      console.log('Deleting client:', clientId)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (deleteError) {
        console.error('Error deleting client:', deleteError)
        throw deleteError
      }

      await queryClient.invalidateQueries({ queryKey: ['all-clients'] })

      toast({
        title: "Cliente excluído",
        description: "O cliente foi removido com sucesso.",
      })
    } catch (error) {
      console.error('Error in handleDelete:', error)
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao tentar excluir o cliente.",
      })
    } finally {
      setClientToDelete(null)
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

    await queryClient.invalidateQueries({ queryKey: ['all-clients'] })

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
      <ClientsTable
        clients={clients || []}
        selectedClient={selectedClient}
        clientToDelete={clientToDelete}
        form={form}
        onEdit={handleEdit}
        onDelete={handleDelete}
        setSelectedClient={setSelectedClient}
        setClientToDelete={setClientToDelete}
      />
    </div>
  )
}

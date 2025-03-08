import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LeadFormData, leadFormSchema } from "@/types/lead-form"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ClientsTable } from "@/components/clients/clients-table"
import { useLocation } from "react-router-dom"
import { UnitSelector } from "@/components/UnitSelector"
import { useUnit } from "@/contexts/UnitContext"
import { Input } from "@/components/ui/input"
import { useClientFiltering } from "@/hooks/useClientFiltering"
import { ClientsPagination } from "@/components/clients/ClientsPagination"

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const queryClient = useQueryClient()
  const location = useLocation()
  const { selectedUnitId, isLoading: isLoadingUnit } = useUnit()

  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['all-clients', selectedUnitId],
    queryFn: async () => {
      if (!selectedUnitId) return [];

      console.log('Fetching clients for unit:', selectedUnitId);
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone_number,
          lead_source,
          observations,
          status,
          created_at
        `)
        .eq('active', true)
        .eq('unit_id', selectedUnitId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedUnitId
  });

  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    paginatedClients,
    totalPages,
    totalResults
  } = useClientFiltering(clients)

  useEffect(() => {
    console.log("Clients page mounted or route changed, refetching data...")
    refetch()
  }, [location.pathname, refetch])

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  })

  const handleDelete = async (clientId: string) => {
    try {
      console.log('Inativando client:', clientId)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      // Ao invés de deletar, apenas marca como inativo
      const { error: updateError } = await supabase
        .from('clients')
        .update({ active: false })
        .eq('id', clientId)

      if (updateError) {
        console.error('Error inactivating client:', updateError)
        throw updateError
      }

      await queryClient.invalidateQueries({ queryKey: ['all-clients'] })

      toast({
        title: "Cliente inativado",
        description: "O cliente foi inativado com sucesso.",
      })
    } catch (error) {
      console.error('Error in handleDelete:', error)
      toast({
        variant: "destructive",
        title: "Erro ao inativar",
        description: "Ocorreu um erro ao tentar inativar o cliente.",
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Todos os Clientes</h1>
        <UnitSelector />
      </div>
      
      {isLoadingUnit ? (
        <div>Carregando...</div>
      ) : !selectedUnitId ? (
        <div>Selecione uma unidade para ver os clientes</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                type="search"
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Total: {totalResults} clientes
            </div>
          </div>

          <ClientsTable
            clients={paginatedClients}
            selectedClient={selectedClient}
            clientToDelete={clientToDelete}
            form={form}
            onEdit={handleEdit}
            onDelete={handleDelete}
            setSelectedClient={setSelectedClient}
            setClientToDelete={setClientToDelete}
            onSubmit={onSubmit}
          />

          {totalPages > 1 && (
            <ClientsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  )
}

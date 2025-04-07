
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ClientsTable } from "@/components/clients/clients-table"
import { useLocation } from "react-router-dom"
import { UnitSelector } from "@/components/UnitSelector"
import { useUnit } from "@/contexts/UnitContext"
import { Input } from "@/components/ui/input"
import { useClientFiltering } from "@/hooks/useClientFiltering"
import { ClientsPagination } from "@/components/clients/ClientsPagination"
import { ClientFilterDialog } from "@/components/clients/ClientFilterDialog"
import { Search } from "lucide-react"

export default function ClientsPage() {
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const queryClient = useQueryClient()
  const location = useLocation()
  const { selectedUnitId, isLoading: isLoadingUnit } = useUnit()

  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['all-clients', selectedUnitId],
    queryFn: async () => {
      if (!selectedUnitId) return [];

      console.log('Fetching clients for unit:', selectedUnitId);
      
      // Modificada a query para incluir as atividades do cliente
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone_number,
          email,
          lead_source,
          observations,
          status,
          created_at,
          original_ad,
          original_adset,
          registration_name,
          client_activities (
            id,
            tipo_contato,
            tipo_atividade,
            notes,
            created_at,
            next_contact_date,
            active
          )
        `)
        .eq('active', true)
        .eq('unit_id', selectedUnitId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Log para depuração
      console.log(`Recebidos ${data?.length} clientes com atividades`);
      
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
    totalResults,
    filters,
    applyFilters,
    resetFilters,
    isFilterActive,
    filterOptions
  } = useClientFiltering(clients)

  useEffect(() => {
    console.log("Clients page mounted or route changed, refetching data...")
    refetch()
  }, [location.pathname, refetch])

  const handleDelete = async (clientId: string) => {
    try {
      console.log('Inativando client:', clientId)
      
      const { error: updateError } = await supabase
        .from('clients')
        .update({ active: false })
        .eq('id', clientId)

      if (updateError) throw updateError

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

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[250px] pl-8 md:w-[300px]"
                />
              </div>
              
              <ClientFilterDialog 
                filters={filters}
                filterOptions={filterOptions}
                applyFilters={applyFilters}
                resetFilters={resetFilters}
                isFilterActive={isFilterActive}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              Total: {totalResults} clientes
            </div>
          </div>

          <ClientsTable
            clients={paginatedClients}
            clientToDelete={clientToDelete}
            onDelete={handleDelete}
            setClientToDelete={setClientToDelete}
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

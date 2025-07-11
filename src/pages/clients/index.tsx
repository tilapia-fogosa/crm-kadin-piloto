import { useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useUnit } from "@/contexts/UnitContext"
import { useServerSideClientFiltering } from "@/hooks/useServerSideClientFiltering"
import { ClientsHeader } from "@/components/clients/ClientsHeader"
import { ClientsFilters } from "@/components/clients/ClientsFilters"
import { ClientsContent } from "@/components/clients/ClientsContent"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/components/kanban/utils/hooks/useDebounce"

export default function ClientsPage() {
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const [rawSearch, setRawSearch] = useState<string>("")
  const queryClient = useQueryClient()
  const { selectedUnitId } = useUnit()

  console.log('🔍 [ClientsPage] Renderizando com selectedUnitId:', selectedUnitId);

  // Usar hook de paginação server-side
  const {
    clients,
    totalCount,
    isLoading,
    isError,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    filters,
    applyFilters,
    resetFilters,
    isFilterActive,
    filterOptions,
    refetch
  } = useServerSideClientFiltering(selectedUnitId)

  // Aplicar debounce na busca para evitar múltiplas consultas
  const debouncedSearch = useDebounce(rawSearch, 500)

  // Aplicar o valor com debounce ao hook de filtragem
  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      console.log('🔍 [ClientsPage] Aplicando busca com debounce:', debouncedSearch)
      setSearchTerm(debouncedSearch)
    }
  }, [debouncedSearch, searchTerm, setSearchTerm])

  console.log('📊 [ClientsPage] Estado da paginação server-side:', {
    isLoading,
    isError,
    clientsCount: clients.length,
    totalCount,
    currentPage,
    totalPages,
    error: error?.message
  });

  // Handler para forçar atualização - useCallback para evitar re-renders
  const handleForceRefresh = useCallback(async () => {
    console.log('🔄 [ClientsPage] Forçando atualização dos dados...');
    
    try {
      // Limpar todos os caches relacionados
      await queryClient.invalidateQueries({ queryKey: ['clients-paginated'] });
      await queryClient.invalidateQueries({ queryKey: ['client-filter-options'] });
      
      // Refetch forçado
      await refetch();
      
      toast({
        title: "Dados atualizados",
        description: "Os dados foram recarregados com sucesso.",
      });
    } catch (error) {
      console.error('❌ [ClientsPage] Erro ao forçar atualização:', error);
      toast({
        variant: "destructive",
        title: "Erro na atualização",
        description: "Não foi possível atualizar os dados.",
      });
    }
  }, [queryClient, refetch]);

  // Handler para deletar cliente - useCallback para evitar re-renders
  const handleDelete = useCallback(async (clientId: string) => {
    try {
      console.log('🗑️ [ClientsPage] Inativando cliente:', clientId)
      
      const { error: updateError } = await supabase
        .from('clients')
        .update({ active: false })
        .eq('id', clientId)

      if (updateError) throw updateError

      await queryClient.invalidateQueries({ queryKey: ['clients-paginated'] })

      toast({
        title: "Cliente inativado",
        description: "O cliente foi inativado com sucesso.",
      })
    } catch (error) {
      console.error('❌ [ClientsPage] Erro ao inativar:', error)
      toast({
        variant: "destructive",
        title: "Erro ao inativar",
        description: "Ocorreu um erro ao tentar inativar o cliente.",
      })
    } finally {
      setClientToDelete(null)
    }
  }, [queryClient])

  // Handler para mudança na busca - useCallback para evitar re-renders
  const handleSearchChange = useCallback((value: string) => {
    setRawSearch(value)
  }, [])

  // Tratamento de erro
  if (isError) {
    console.error('💥 [ClientsPage] Componente em estado de erro:', error);
    return (
      <div className="container mx-auto py-10">
        <ClientsHeader onForceRefresh={handleForceRefresh} />
        
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-600 text-center">
            <h3 className="text-lg font-semibold">Erro ao carregar clientes</h3>
            <p className="text-sm">{error?.message || 'Erro desconhecido'}</p>
          </div>
          
          <Button onClick={handleForceRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    console.log('⏳ [ClientsPage] Componente em estado de carregamento');
    return (
      <div className="container mx-auto py-10">
        <ClientsHeader onForceRefresh={handleForceRefresh} />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Carregando clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎯 [ClientsPage] Renderizando conteúdo final:', {
    totalClients: totalCount,
    currentPageCount: clients?.length || 0,
    currentPage,
    totalPages,
    hasSearchTerm: !!searchTerm
  });

  return (
    <div className="container mx-auto py-10">
      <ClientsHeader onForceRefresh={handleForceRefresh} />
      
      <div className="space-y-4">
        <ClientsFilters
          rawSearch={rawSearch}
          onSearchChange={handleSearchChange}
          filters={filters}
          filterOptions={filterOptions}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
          isFilterActive={isFilterActive}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={isLoading}
        />

        <ClientsContent
          clients={clients}
          clientToDelete={clientToDelete}
          onDelete={handleDelete}
          setClientToDelete={setClientToDelete}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isFilterActive={isFilterActive}
          searchTerm={searchTerm}
          resetFilters={resetFilters}
          onForceRefresh={handleForceRefresh}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

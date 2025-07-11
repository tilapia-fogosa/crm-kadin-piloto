import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ClientsTable } from "@/components/clients/clients-table"
import { UnitSelector } from "@/components/UnitSelector"
import { useUnit } from "@/contexts/UnitContext"
import { Input } from "@/components/ui/input"
import { useServerSideClientFiltering } from "@/hooks/useServerSideClientFiltering"
import { ClientsPagination } from "@/components/clients/ClientsPagination"
import { ClientFilterDialog } from "@/components/clients/ClientFilterDialog"
import { Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ClientsPage() {
  const [clientToDelete, setClientToDelete] = useState<any>(null)
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

  console.log('📊 [ClientsPage] Estado da paginação server-side:', {
    isLoading,
    isError,
    clientsCount: clients.length,
    totalCount,
    currentPage,
    totalPages,
    error: error?.message
  });

  // Handler para forçar atualização
  const handleForceRefresh = async () => {
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
  };

  const handleDelete = async (clientId: string) => {
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
  }

  // Tratamento de erro
  if (isError) {
    console.error('💥 [ClientsPage] Componente em estado de erro:', error);
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Todos os Clientes</h1>
          <UnitSelector />
        </div>
        
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Todos os Clientes</h1>
          <UnitSelector />
        </div>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Todos os Clientes</h1>
        <div className="flex items-center gap-2">
          <UnitSelector />
          <Button onClick={handleForceRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>
      
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
            Total: {totalCount} clientes encontrados
            {isLoading ? '' : ` (Página ${currentPage} de ${totalPages})`}
          </div>
        </div>

        {/* Mostrar mensagem se não há clientes ou se não há dados com filtros */}
        {totalCount === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              {isFilterActive || searchTerm ? 'Nenhum resultado para os filtros aplicados' : 'Nenhum cliente encontrado'}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {isFilterActive || searchTerm 
                ? 'Tente alterar os filtros de busca ou limpar todos os filtros.'
                : 'Não há clientes cadastrados para esta unidade ou todos estão inativos.'}
            </p>
            <Button 
              onClick={isFilterActive || searchTerm ? resetFilters : handleForceRefresh} 
              variant="outline" 
              className="mt-4"
            >
              {isFilterActive || searchTerm ? (
                <>Limpar Filtros</>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar Novamente
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <ClientsTable
              clients={clients}
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
          </>
        )}
      </div>
    </div>
  )
}

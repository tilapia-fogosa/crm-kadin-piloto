
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ClientsTable } from "@/components/clients/clients-table"
import { UnitSelector } from "@/components/UnitSelector"
import { useUnit } from "@/contexts/UnitContext"
import { Input } from "@/components/ui/input"
import { useClientFiltering } from "@/hooks/useClientFiltering"
import { ClientsPagination } from "@/components/clients/ClientsPagination"
import { ClientFilterDialog } from "@/components/clients/ClientFilterDialog"
import { Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ClientsPage() {
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const queryClient = useQueryClient()
  const { selectedUnitId } = useUnit()

  console.log('🔍 [ClientsPage] Renderizando com selectedUnitId:', selectedUnitId);

  // Query principal com logs detalhados e tratamento de erro
  const { 
    data: clients, 
    isLoading, 
    error,
    refetch,
    isError 
  } = useQuery({
    queryKey: ['all-clients', selectedUnitId],
    queryFn: async () => {
      console.log('🚀 [ClientsPage Query] Iniciando busca de clientes');
      console.log('🏢 [ClientsPage Query] Unit ID:', selectedUnitId);
      
      if (!selectedUnitId) {
        console.error('❌ [ClientsPage Query] selectedUnitId é null/undefined');
        throw new Error('Unidade não selecionada');
      }

      try {
        // Query simplificada primeiro, sem joins complexos
        console.log('📊 [ClientsPage Query] Executando query básica...');
        
        const { data, error, count } = await supabase
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
            active,
            unit_id
          `, { count: 'exact' })
          .eq('active', true)
          .eq('unit_id', selectedUnitId)
          .order('created_at', { ascending: false });

        console.log('📋 [ClientsPage Query] Response details:', {
          hasError: !!error,
          dataLength: data?.length || 0,
          totalCount: count,
          errorMessage: error?.message
        });

        if (error) {
          console.error('❌ [ClientsPage Query] Erro do Supabase:', error);
          throw new Error(`Erro na consulta: ${error.message}`);
        }

        if (!data) {
          console.warn('⚠️ [ClientsPage Query] Data é null, retornando array vazio');
          return [];
        }

        console.log('✅ [ClientsPage Query] Dados recebidos com sucesso:', {
          totalClients: data.length,
          firstClient: data[0]?.name || 'N/A',
          unitId: selectedUnitId
        });

        // Log amostra dos primeiros 3 clientes para debug
        data.slice(0, 3).forEach((client, index) => {
          console.log(`📝 [ClientsPage Query] Cliente ${index + 1}:`, {
            id: client.id,
            name: client.name,
            status: client.status,
            created_at: client.created_at
          });
        });

        return data;
      } catch (queryError) {
        console.error('💥 [ClientsPage Query] Erro capturado:', queryError);
        throw queryError;
      }
    },
    enabled: !!selectedUnitId, // Só executa se tiver selectedUnitId
    retry: 3, // Tentar 3 vezes em caso de erro
    staleTime: 0, // Sempre buscar dados frescos
    gcTime: 0, // Não usar cache
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Logs de estado da query
  console.log('📊 [ClientsPage] Estado da query:', {
    isLoading,
    isError,
    hasData: !!clients,
    dataLength: clients?.length || 0,
    error: error?.message
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
  } = useClientFiltering(clients || [])

  // Handler para forçar atualização
  const handleForceRefresh = async () => {
    console.log('🔄 [ClientsPage] Forçando atualização dos dados...');
    
    try {
      // Limpar todos os caches relacionados
      await queryClient.invalidateQueries({ queryKey: ['all-clients'] });
      await queryClient.removeQueries({ queryKey: ['all-clients'] });
      
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

      await queryClient.invalidateQueries({ queryKey: ['all-clients'] })

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
    totalClients: clients?.length || 0,
    paginatedCount: paginatedClients?.length || 0,
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
            Total: {totalResults} clientes encontrados
            {clients && ` (${clients.length} total na unidade)`}
          </div>
        </div>

        {/* Mostrar mensagem se não há clientes */}
        {(!clients || clients.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold text-gray-700">Nenhum cliente encontrado</h3>
            <p className="text-sm text-gray-500 mt-2">
              Não há clientes cadastrados para esta unidade ou todos estão inativos.
            </p>
            <Button onClick={handleForceRefresh} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Novamente
            </Button>
          </div>
        ) : paginatedClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold text-gray-700">Nenhum resultado para os filtros aplicados</h3>
            <p className="text-sm text-gray-500 mt-2">
              Tente alterar os filtros de busca ou limpar todos os filtros.
            </p>
            <Button onClick={resetFilters} variant="outline" className="mt-4">
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}

import React from "react"
import { ClientsTable } from "@/components/clients/clients-table"
import { ClientsPagination } from "@/components/clients/ClientsPagination"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ClientsContentProps {
  clients: any[]
  clientToDelete: any
  onDelete: (clientId: string) => void
  setClientToDelete: (client: any) => void
  totalCount: number
  totalPages: number
  currentPage: number
  setCurrentPage: (page: number) => void
  isFilterActive: boolean
  searchTerm: string
  resetFilters: () => void
  onForceRefresh: () => void
  isLoading: boolean
}

export const ClientsContent = React.memo(({
  clients,
  clientToDelete,
  onDelete,
  setClientToDelete,
  totalCount,
  totalPages,
  currentPage,
  setCurrentPage,
  isFilterActive,
  searchTerm,
  resetFilters,
  onForceRefresh,
  isLoading
}: ClientsContentProps) => {
  console.log('📋 [ClientsContent] Renderizando conteúdo')
  
  // Mostrar mensagem se não há clientes ou se não há dados com filtros
  if (totalCount === 0 && !isLoading) {
    return (
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
          onClick={isFilterActive || searchTerm ? resetFilters : onForceRefresh} 
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
    )
  }
  
  return (
    <>
      <ClientsTable
        clients={clients}
        clientToDelete={clientToDelete}
        onDelete={onDelete}
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
  )
})

ClientsContent.displayName = "ClientsContent"
import React from "react"
import { Input } from "@/components/ui/input"
import { ClientFilterDialog } from "@/components/clients/ClientFilterDialog"
import { Search } from "lucide-react"

interface ClientsFiltersProps {
  rawSearch: string
  onSearchChange: (value: string) => void
  filters: any
  filterOptions: any
  applyFilters: (filters: any) => void
  resetFilters: () => void
  isFilterActive: boolean
  totalCount: number
  currentPage: number
  totalPages: number
  isLoading: boolean
}

export const ClientsFilters = React.memo(({
  rawSearch,
  onSearchChange,
  filters,
  filterOptions,
  applyFilters,
  resetFilters,
  isFilterActive,
  totalCount,
  currentPage,
  totalPages,
  isLoading
}: ClientsFiltersProps) => {
  console.log('🔍 [ClientsFilters] Renderizando filtros')
  
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou telefone..."
            value={rawSearch}
            onChange={(e) => onSearchChange(e.target.value)}
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
  )
})

ClientsFilters.displayName = "ClientsFilters"
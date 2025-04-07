
import { useState, useEffect } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FilterIcon } from "lucide-react"
import { FilterDialogContent } from "./filters/FilterDialogContent"
import { FilterBadge } from "./filters/FilterBadge"

// Tipo de filtros - Atualizado para compatibilidade com useClientFiltering
type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

type ClientFilters = {
  dateRange: DateRange | null
  status: string | null
  leadSource: string | null
  originalAd: string | null
  registrationName: string | null
}

type FilterOptions = {
  statuses: string[]
  leadSources: string[]
  originalAds: string[]
  registrationNames: string[]
}

interface ClientFilterDialogProps {
  filters: ClientFilters
  filterOptions: FilterOptions
  applyFilters: (filters: ClientFilters) => void
  resetFilters: () => void
  isFilterActive: boolean
}

/**
 * Componente principal de filtro de clientes
 * Gerencia o diálogo de filtros e exibe o badge com filtros ativos
 */
export function ClientFilterDialog({
  filters,
  filterOptions,
  applyFilters,
  resetFilters,
  isFilterActive
}: ClientFilterDialogProps) {
  const [open, setOpen] = useState(false)
  
  // Contagem de filtros ativos
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.dateRange?.from) count++
    if (filters.status) count++
    if (filters.leadSource) count++
    if (filters.originalAd) count++
    if (filters.registrationName) count++
    return count
  }
  
  const activeFilterCount = getActiveFilterCount()

  // Log para depuração
  useEffect(() => {
    console.log("ClientFilterDialog: Estado atual", { 
      filters, 
      isFilterActive, 
      activeFilterCount 
    })
  }, [filters, isFilterActive, activeFilterCount])

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </DialogTrigger>
        
        <FilterDialogContent
          filters={filters}
          filterOptions={filterOptions}
          onApplyFilters={applyFilters}
          onClearFilters={() => {
            console.log("Limpando filtros no diálogo")
          }}
          onClose={() => setOpen(false)}
        />
      </Dialog>

      {/* Badge de filtros ativos */}
      {isFilterActive && (
        <FilterBadge 
          count={activeFilterCount} 
          onClear={resetFilters} 
        />
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DateRangeFilter } from "./DateRangeFilter"
import { SelectFilter } from "./SelectFilter"
import { parseFormDate } from "@/utils/date"

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

interface FilterDialogContentProps {
  filters: ClientFilters
  filterOptions: FilterOptions
  onApplyFilters: (filters: ClientFilters) => void
  onClearFilters: () => void
  onClose: () => void
}

/**
 * Componente que contém o conteúdo do diálogo de filtros
 */
export function FilterDialogContent({
  filters,
  filterOptions,
  onApplyFilters,
  onClearFilters,
  onClose,
}: FilterDialogContentProps) {
  console.log("FilterDialogContent: Renderizando com filtros", filters)
  
  // Clonar os filtros para permitir edição local
  const [localFilters, setLocalFilters] = useState<ClientFilters>(filters)
  
  // Atualizar estado local quando os filtros externos mudarem
  useEffect(() => {
    console.log("FilterDialogContent: Atualizando filtros locais", filters)
    setLocalFilters(filters)
  }, [filters])
  
  // Atualizar o filtro de data quando os inputs mudarem
  const handleDateChange = (from: string, to: string) => {
    console.log("Atualizando filtro de data:", { from, to })
    
    const fromDateObj = parseFormDate(from)
    const toDateObj = parseFormDate(to)
    
    setLocalFilters({
      ...localFilters,
      dateRange: {
        from: fromDateObj,
        to: toDateObj
      }
    })
  }
  
  const handleApplyFilters = () => {
    console.log("Aplicando filtros:", localFilters)
    onApplyFilters(localFilters)
    onClose()
  }
  
  const handleClearFilters = () => {
    console.log("Limpando filtros")
    const emptyFilters: ClientFilters = {
      dateRange: null,
      status: null,
      leadSource: null,
      originalAd: null,
      registrationName: null
    }
    setLocalFilters(emptyFilters)
  }

  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle>Filtros avançados</DialogTitle>
      </DialogHeader>
      
      <div className="py-4 space-y-4">
        {/* Filtro por período (created_at) */}
        <DateRangeFilter 
          dateRange={localFilters.dateRange} 
          onDateChange={handleDateChange} 
        />

        {/* Filtro por Status */}
        <SelectFilter
          label="Status"
          value={localFilters.status}
          onChange={(value) => {
            setLocalFilters({
              ...localFilters,
              status: value
            })
          }}
          options={filterOptions.statuses}
          placeholder="Selecione um status"
        />

        {/* Filtro por Origem (lead_source) */}
        <SelectFilter
          label="Origem do Lead"
          value={localFilters.leadSource}
          onChange={(value) => {
            setLocalFilters({
              ...localFilters,
              leadSource: value
            })
          }}
          options={filterOptions.leadSources}
          placeholder="Selecione uma origem"
        />

        {/* Filtro por Anúncio (original_ad) */}
        <SelectFilter
          label="Anúncio"
          value={localFilters.originalAd}
          onChange={(value) => {
            setLocalFilters({
              ...localFilters,
              originalAd: value
            })
          }}
          options={filterOptions.originalAds}
          placeholder="Selecione um anúncio"
        />

        {/* Filtro por Responsável (registration_name) */}
        <SelectFilter
          label="Responsável pelo Cadastro"
          value={localFilters.registrationName}
          onChange={(value) => {
            setLocalFilters({
              ...localFilters,
              registrationName: value
            })
          }}
          options={filterOptions.registrationNames}
          placeholder="Selecione um responsável"
        />
      </div>

      <DialogFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClearFilters}>
          Limpar Filtros
        </Button>
        <Button onClick={handleApplyFilters}>
          Aplicar Filtros
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}


import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterIcon, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { formatDateForInput, parseFormDate } from "@/utils/dateUtils"

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

export function ClientFilterDialog({
  filters,
  filterOptions,
  applyFilters,
  resetFilters,
  isFilterActive
}: ClientFilterDialogProps) {
  // Estado local para os filtros (permitindo cancelar mudanças)
  const [localFilters, setLocalFilters] = useState<ClientFilters>(filters)
  const [open, setOpen] = useState(false)
  
  // Estados para inputs de data
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")

  // Atualizar estado local quando os filtros externos mudarem
  useEffect(() => {
    console.log("ClientFilterDialog: Atualizando filtros locais", filters)
    setLocalFilters(filters)
    
    // Atualizar inputs de data
    if (filters.dateRange?.from) {
      setFromDate(formatDateForInput(filters.dateRange.from))
    } else {
      setFromDate("")
    }
    
    if (filters.dateRange?.to) {
      setToDate(formatDateForInput(filters.dateRange.to))
    } else {
      setToDate("")
    }
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

  // Manipulador para aplicar os filtros
  const handleApplyFilters = () => {
    console.log("Aplicando filtros:", localFilters)
    applyFilters(localFilters)
    setOpen(false)
  }

  // Manipulador para limpar os filtros
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
    setFromDate("")
    setToDate("")
  }

  // Manipulador para resetar os filtros (botão externo)
  const handleResetFilters = () => {
    console.log("Resetando filtros")
    resetFilters()
  }

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

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Filtros avançados</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Filtro por período (created_at) - Usando inputs HTML simples */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Período de cadastro</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">De</Label>
                  <Input 
                    id="date-from"
                    type="date" 
                    value={fromDate} 
                    onChange={(e) => {
                      const newValue = e.target.value
                      setFromDate(newValue)
                      handleDateChange(newValue, toDate)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Até</Label>
                  <Input 
                    id="date-to"
                    type="date" 
                    value={toDate} 
                    onChange={(e) => {
                      const newValue = e.target.value
                      setToDate(newValue)
                      handleDateChange(fromDate, newValue)
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Filtro por Status */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={localFilters.status || "all"}
                onValueChange={(value) => {
                  console.log("Novo status selecionado:", value)
                  setLocalFilters({
                    ...localFilters,
                    status: value === "all" ? null : value
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filterOptions.statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Origem (lead_source) */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Origem do Lead</Label>
              <Select
                value={localFilters.leadSource || "all"}
                onValueChange={(value) => {
                  console.log("Nova origem selecionada:", value)
                  setLocalFilters({
                    ...localFilters,
                    leadSource: value === "all" ? null : value
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {filterOptions.leadSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Anúncio (original_ad) */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Anúncio</Label>
              <Select
                value={localFilters.originalAd || "all"}
                onValueChange={(value) => {
                  console.log("Novo anúncio selecionado:", value)
                  setLocalFilters({
                    ...localFilters,
                    originalAd: value === "all" ? null : value
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um anúncio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filterOptions.originalAds.map((ad) => (
                    <SelectItem key={ad} value={ad}>
                      {ad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Responsável (registration_name) */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Responsável pelo Cadastro</Label>
              <Select
                value={localFilters.registrationName || "all"}
                onValueChange={(value) => {
                  console.log("Novo responsável selecionado:", value)
                  setLocalFilters({
                    ...localFilters,
                    registrationName: value === "all" ? null : value
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filterOptions.registrationNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
      </Dialog>

      {isFilterActive && (
        <>
          <Badge variant="secondary" className="flex items-center gap-1">
            {activeFilterCount} {activeFilterCount === 1 ? 'filtro ativo' : 'filtros ativos'}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 rounded-full p-0 ml-1" 
              onClick={handleResetFilters}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Limpar filtros</span>
            </Button>
          </Badge>
        </>
      )}
    </div>
  )
}

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, FilterIcon, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

// Tipo de filtros - Atualizado para compatibilidade com react-day-picker
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Atualizar estado local quando os filtros externos mudarem
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Formatador de data para exibição
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "dd/MM/yyyy", { locale: ptBR })
  }

  // Obter descrição do intervalo de datas selecionado
  const getDateRangeText = () => {
    if (!localFilters.dateRange?.from) return "Selecionar período"
    
    const fromText = formatDate(localFilters.dateRange.from)
    const toText = localFilters.dateRange.to ? formatDate(localFilters.dateRange.to) : formatDate(localFilters.dateRange.from)
    
    return `${fromText} - ${toText}`
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
            {/* Filtro por período (created_at) */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Período de cadastro</label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {getDateRangeText()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={localFilters.dateRange || { from: undefined, to: undefined }}
                    onSelect={(range) => {
                      setLocalFilters({
                        ...localFilters,
                        dateRange: range || null
                      })
                      if (range?.from && range?.to) {
                        setIsDatePickerOpen(false)
                      }
                    }}
                    locale={ptBR}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro por Status */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={localFilters.status || ""}
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  status: value || null
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
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
              <label className="text-sm font-medium">Origem do Lead</label>
              <Select
                value={localFilters.leadSource || ""}
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  leadSource: value || null
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
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
              <label className="text-sm font-medium">Anúncio</label>
              <Select
                value={localFilters.originalAd || ""}
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  originalAd: value || null
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um anúncio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
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
              <label className="text-sm font-medium">Responsável pelo Cadastro</label>
              <Select
                value={localFilters.registrationName || ""}
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  registrationName: value || null
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
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

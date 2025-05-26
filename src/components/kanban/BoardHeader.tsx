
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RefreshCw, Search, Loader2 } from "lucide-react"
import { ActivityDashboard } from "./ActivityDashboard"
import { CalendarDashboard } from "./CalendarDashboard"
import { Input } from "@/components/ui/input"
import { MultiUnitSelector } from "./components/calendar/MultiUnitSelector"
import { useState, useEffect } from "react"
import { useDebounce } from "./utils/hooks/useDebounce"

interface BoardHeaderProps {
  showPendingOnly: boolean
  setShowPendingOnly: (value: boolean) => void
  onRefresh: () => void
  searchTerm: string
  setSearchTerm: (value: string) => void
  availableUnits: { unit_id: string; units: { id: string; name: string } }[]
  selectedUnitIds: string[]
  setSelectedUnitIds: (unitIds: string[]) => void
  isMultiUnit: boolean
  isSearching?: boolean
}

export function BoardHeader({
  showPendingOnly,
  setShowPendingOnly,
  onRefresh,
  searchTerm,
  setSearchTerm,
  availableUnits,
  selectedUnitIds,
  setSelectedUnitIds,
  isMultiUnit,
  isSearching = false
}: BoardHeaderProps) {
  const [rawSearch, setRawSearch] = useState(searchTerm)
  const debouncedSearchTerm = useDebounce(rawSearch, 500)

  console.log('🔍 [BoardHeader] Raw search:', rawSearch)
  console.log('🔍 [BoardHeader] Debounced search:', debouncedSearchTerm)
  console.log('🏢 [BoardHeader] Unidades selecionadas:', selectedUnitIds)
  console.log('🏢 [BoardHeader] Usuário multi-unidade:', isMultiUnit)
  
  // Sincronizar o termo de pesquisa debounced com o estado pai
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      console.log('🔍 [BoardHeader] Atualizando searchTerm pai com valor debounced:', debouncedSearchTerm)
      setSearchTerm(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, searchTerm, setSearchTerm])

  // Sincronizar rawSearch quando searchTerm muda externamente
  useEffect(() => {
    if (searchTerm !== rawSearch && searchTerm !== debouncedSearchTerm) {
      console.log('🔍 [BoardHeader] Sincronizando rawSearch com searchTerm externo:', searchTerm)
      setRawSearch(searchTerm)
    }
  }, [searchTerm, rawSearch, debouncedSearchTerm])
  
  return (
    <div className="flex flex-col bg-[#311D64] p-4 gap-4">
      <div className="grid grid-cols-4 items-center">
        <div className="col-span-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Painel do Consultor</h1>
          
          {/* Mostra o seletor de unidade apenas se o usuário tiver acesso a múltiplas unidades */}
          {isMultiUnit && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">Unidades:</span>
                <MultiUnitSelector 
                  units={availableUnits}
                  selectedUnitIds={selectedUnitIds}
                  onChange={setSelectedUnitIds}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="col-span-2 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="pending-mode"
              checked={showPendingOnly}
              onCheckedChange={setShowPendingOnly}
            />
            <Label htmlFor="pending-mode" className="text-white">Mostrar apenas pendentes</Label>
          </div>

          <div className="flex items-center space-x-2">
            <ActivityDashboard />
            <CalendarDashboard selectedUnitIds={selectedUnitIds} />
            
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="col-span-1">
          {/* Espaço reservado para futuros elementos */}
        </div>
      </div>
      
      {/* Campo de pesquisa otimizado com debounce */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
        <Input
          type="text"
          placeholder="Pesquise o contato por nome ou telefone"
          value={rawSearch}
          onChange={(e) => {
            console.log('🔍 [BoardHeader] Input onChange:', e.target.value)
            setRawSearch(e.target.value)
          }}
          className="pl-10 pr-10 bg-white/10 text-white placeholder:text-gray-400 border-gray-700 focus-visible:ring-primary/50"
        />
      </div>
    </div>
  )
}

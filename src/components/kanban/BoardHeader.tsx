
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RefreshCw, Search, Loader2, Volume2 } from "lucide-react"
import { ActivityDashboard } from "./ActivityDashboard"
import { CalendarDashboard } from "./CalendarDashboard"
import { Input } from "@/components/ui/input"
import { MultiUnitSelector } from "./components/calendar/MultiUnitSelector"
import { useState, useCallback, memo, useEffect } from "react"
import { useDebounce } from "./utils/hooks/useDebounce"
import { UserUnit } from "./hooks/useUserUnit"
import { useNotification } from "@/contexts/NotificationContext"
import { UserProductivityPanel } from "./components/UserProductivityPanel"
import { useUserProductivityStats } from "@/hooks/useUserProductivityStats"

interface BoardHeaderProps {
  showPendingOnly: boolean
  setShowPendingOnly: (value: boolean) => void
  onRefresh: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  availableUnits: UserUnit[]
  selectedUnitIds: string[]
  setSelectedUnitIds: (unitIds: string[]) => void
  isMultiUnit: boolean
  isSearching?: boolean
  onOpenClient: (clientId: string) => void
}

function BoardHeaderComponent({
  showPendingOnly,
  setShowPendingOnly,
  onRefresh,
  searchTerm,
  onSearchChange,
  availableUnits,
  selectedUnitIds,
  setSelectedUnitIds,
  isMultiUnit,
  isSearching = false,
  onOpenClient
}: BoardHeaderProps) {
  // Hook para sistema global de notificações
  const { soundEnabled, setSoundEnabled, testSound, isAudioSupported } = useNotification();
  
  // Hook para estatísticas de produtividade
  const { stats, isLoading: isLoadingStats } = useUserProductivityStats({ selectedUnitIds });
  
  console.log('🔍 [BoardHeader] Renderizando com searchTerm:', searchTerm)
  console.log('📊 [BoardHeader] Stats de produtividade:', stats)
  
  // Estado local apenas para o input (responsividade imediata)
  const [rawSearch, setRawSearch] = useState(searchTerm)
  console.log('🔍 [BoardHeader] rawSearch atual:', rawSearch)
  
  // Debounce do valor digitado
  const debouncedSearchTerm = useDebounce(rawSearch, 500)
  console.log('🔍 [BoardHeader] debouncedSearchTerm:', debouncedSearchTerm)

  // CORREÇÃO: Quando o valor debounced muda, notifica o pai via useEffect
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      console.log('🔍 [BoardHeader] Propagando debouncedSearchTerm para pai:', debouncedSearchTerm)
      onSearchChange(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, searchTerm, onSearchChange])

  // Handler otimizado para mudanças no input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    console.log('🔍 [BoardHeader] Input onChange:', newValue)
    setRawSearch(newValue)
  }, [])
  
  return (
    <div className="flex flex-col bg-[#311D64] p-4 gap-4">
      {/* Linha 1: Controles + Painel de Produtividade */}
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* 8 colunas: Controles à esquerda */}
        <div className="col-span-8 flex flex-col gap-3">
          {/* Seletor de unidades (se multi-unit) */}
          {isMultiUnit && (
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">Unidades:</span>
              <MultiUnitSelector 
                units={availableUnits}
                selectedUnitIds={selectedUnitIds}
                onChange={setSelectedUnitIds}
              />
            </div>
          )}

          {/* Linha de switches e botões */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Switches */}
            <div className="flex items-center space-x-2">
              <Switch
                id="pending-mode"
                checked={showPendingOnly}
                onCheckedChange={setShowPendingOnly}
              />
              <Label htmlFor="pending-mode" className="text-white text-sm">Mostrar apenas pendentes</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="sound-mode"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
              <Label htmlFor="sound-mode" className="text-white text-sm">Som para novos leads</Label>
              {soundEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-1 h-6 w-6"
                  onClick={testSound}
                  title="Testar som"
                >
                  <Volume2 className="h-3 w-3" />
                </Button>
              )}
              {!isAudioSupported && soundEnabled && (
                <span className="text-yellow-300 text-xs">⚠️</span>
              )}
            </div>

            {/* Botões */}
            <div className="flex items-center space-x-2">
              <ActivityDashboard />
              <CalendarDashboard selectedUnitIds={selectedUnitIds} onOpenClient={onOpenClient} />
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 4 colunas: Painel de Produtividade à direita */}
        <div className="col-span-4">
          <UserProductivityPanel stats={stats} isLoading={isLoadingStats} />
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
          onChange={handleInputChange}
          className="pl-10 pr-10 bg-white/10 text-white placeholder:text-gray-400 border-gray-700 focus-visible:ring-primary/50"
        />
      </div>
    </div>
  )
}

// Memoizar o componente para evitar re-renders desnecessários
export const BoardHeader = memo(BoardHeaderComponent, (prevProps, nextProps) => {
  // Re-render apenas se props importantes mudaram
  return (
    prevProps.showPendingOnly === nextProps.showPendingOnly &&
    prevProps.searchTerm === nextProps.searchTerm &&
    prevProps.isSearching === nextProps.isSearching &&
    prevProps.selectedUnitIds.length === nextProps.selectedUnitIds.length &&
    JSON.stringify(prevProps.selectedUnitIds) === JSON.stringify(nextProps.selectedUnitIds) &&
    prevProps.isMultiUnit === nextProps.isMultiUnit
  )
})

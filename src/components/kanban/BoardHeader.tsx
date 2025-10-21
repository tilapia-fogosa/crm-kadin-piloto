
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
import { useCanFilterByUsers } from "@/hooks/useCanFilterByUsers"
import { useUnitUsers } from "@/hooks/useUnitUsers"

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
  
  // Estado para filtro de usuários
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Verificar se pode filtrar por usuários
  const { canFilterByUsers } = useCanFilterByUsers({ selectedUnitIds });
  
  // Buscar usuários disponíveis (só se tiver permissão)
  const { data: availableUsers = [] } = useUnitUsers({ 
    selectedUnitIds, 
    enabled: canFilterByUsers 
  });
  
  // Hook para estatísticas de produtividade com filtro de usuários
  // SEGURANÇA: A função RPC 'get_user_productivity_stats' garante que:
  // - Consultores (canFilterByUsers=false) sempre veem apenas seus próprios dados
  // - Franqueados/Admins (canFilterByUsers=true) podem filtrar ou ver todos
  // - "Todos usuários" (selectedUserIds=undefined) inclui usuários bloqueados quando autorizado
  const { stats, isLoading: isLoadingStats } = useUserProductivityStats({ 
    selectedUnitIds,
    selectedUserIds: canFilterByUsers ? selectedUserIds : undefined
  });
  
  console.log('🔍 [BoardHeader] Renderizando com searchTerm:', searchTerm)
  console.log('📊 [BoardHeader] Stats de produtividade:', stats)
  console.log('🔐 [BoardHeader] canFilterByUsers:', canFilterByUsers)
  console.log('👥 [BoardHeader] selectedUserIds:', selectedUserIds)
  
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
    <div className="flex flex-col bg-[#311D64] w-full -mt-6 -ml-6 -mr-6">
      <div className="flex items-start gap-6 p-4">
        {/* Área de Controles (largura fixa 448px) */}
        <div className="flex flex-col gap-3" style={{ width: '448px' }}>
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

          {/* Linha 1: Switches verticais + Botões horizontais */}
          <div className="flex items-start gap-4">
            {/* Switches empilhados verticalmente */}
            <div className="flex flex-col gap-2">
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
            </div>

            {/* Botões lado a lado */}
            <div className="flex items-center gap-2">
              <ActivityDashboard />
              <CalendarDashboard selectedUnitIds={selectedUnitIds} onOpenClient={onOpenClient} />
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Campo de pesquisa (mesma largura 448px) */}
          <div className="relative w-full">
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

        {/* Painel de Produtividade (flex-1 para preencher resto) */}
        <div className="flex-1">
          <UserProductivityPanel 
            stats={stats} 
            isLoading={isLoadingStats}
            canFilterByUsers={canFilterByUsers}
            selectedUserIds={selectedUserIds}
            onUsersChange={setSelectedUserIds}
            availableUsers={availableUsers}
          />
        </div>
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

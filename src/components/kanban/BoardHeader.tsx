/**
 * Header simplificado do Kanban
 * 
 * Contém apenas:
 * - Switch "Mostrar apenas pendentes"
 * - Switch "Som para novos leads" (com botão de teste)
 * - Botão "Painel de Atividade" (ActivityDashboard)
 * - Botão "Agenda de Leads" (CalendarDashboard)
 * - Campo de pesquisa por nome ou telefone
 */

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, Loader2, Volume2 } from "lucide-react"
import { ActivityDashboard } from "./ActivityDashboard"
import { CalendarDashboard } from "./CalendarDashboard"
import { Input } from "@/components/ui/input"
import { useState, useCallback, memo, useEffect } from "react"
import { useDebounce } from "./utils/hooks/useDebounce"
import { useNotification } from "@/contexts/NotificationContext"

interface BoardHeaderProps {
  showPendingOnly: boolean
  setShowPendingOnly: (value: boolean) => void
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedUnitIds: string[]
  isSearching?: boolean
  onOpenClient: (clientId: string) => void
}

function BoardHeaderComponent({
  showPendingOnly,
  setShowPendingOnly,
  searchTerm,
  onSearchChange,
  selectedUnitIds,
  isSearching = false,
  onOpenClient
}: BoardHeaderProps) {
  const { soundEnabled, setSoundEnabled, testSound, isAudioSupported } = useNotification();

  // Estado local para o input (responsividade imediata)
  const [rawSearch, setRawSearch] = useState(searchTerm)
  const debouncedSearchTerm = useDebounce(rawSearch, 500)

  // Propaga valor debounced para o pai
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      console.log('🔍 [BoardHeader] Propagando busca:', debouncedSearchTerm)
      onSearchChange(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, searchTerm, onSearchChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRawSearch(e.target.value)
  }, [])

  return (
    <div className="flex flex-col bg-[#311D64] w-full">
      <div className="flex items-center gap-6 p-4 flex-wrap">
        {/* Switches empilhados */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center space-x-1.5">
            <Switch
              id="pending-mode"
              checked={showPendingOnly}
              onCheckedChange={setShowPendingOnly}
              className="scale-75 origin-left"
            />
            <Label htmlFor="pending-mode" className="text-white text-xs">Mostrar apenas pendentes</Label>
          </div>

          <div className="flex items-center space-x-1.5">
            <Switch
              id="sound-mode"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
              className="scale-75 origin-left"
            />
            <Label htmlFor="sound-mode" className="text-white text-xs">Som para novos leads</Label>
            {soundEnabled && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-0.5 h-5 w-5"
                onClick={testSound}
                title="Testar som"
              >
                <Volume2 className="h-2.5 w-2.5" />
              </Button>
            )}
            {!isAudioSupported && soundEnabled && (
              <span className="text-yellow-300 text-xs">⚠️</span>
            )}
          </div>
        </div>

        {/* Botões de atividade e agenda */}
        <div className="flex items-center gap-2">
          <ActivityDashboard />
          <CalendarDashboard selectedUnitIds={selectedUnitIds} onOpenClient={onOpenClient} />
        </div>

        {/* Campo de pesquisa */}
        <div className="relative flex-1 min-w-[250px]">
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
    </div>
  )
}

export const BoardHeader = memo(BoardHeaderComponent, (prevProps, nextProps) => {
  return (
    prevProps.showPendingOnly === nextProps.showPendingOnly &&
    prevProps.searchTerm === nextProps.searchTerm &&
    prevProps.isSearching === nextProps.isSearching
  )
})

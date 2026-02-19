import { useInfiniteClientData } from "./hooks/useInfiniteClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { transformInfiniteClientsToColumnData, shouldLoadMore } from "./utils/columnUtils"
import { useState, useEffect, useCallback, useRef } from "react"
import { useLocation } from "react-router-dom"
import { BoardHeader } from "./BoardHeader"
import { InfiniteKanbanColumn } from "./components/column/InfiniteKanbanColumn"
import { useUserUnit } from "./hooks/useUserUnit"
import { RealtimeMonitor } from "./components/debug/RealtimeMonitor"
import { useNotification } from "@/contexts/NotificationContext"

export function KanbanBoard() {
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  
  // Hook para sistema global de notificações
  const { soundEnabled, setSoundEnabled } = useNotification();
  
  console.log('📊 [KanbanBoard] Renderizando com searchTerm:', searchTerm)
  
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit();
  const isMultiUnit = userUnits && userUnits.length > 1;
  
  const { 
    data: infiniteData, 
    isLoading, 
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch 
  } = useInfiniteClientData(
    selectedUnitIds, 
    searchTerm, 
    showPendingOnly,
    { limit: 400 } // Limite maior para garantir dados suficientes
  );
  
  const { registerAttempt, registerEffectiveContact, deleteActivity } = useActivityOperations();
  const { handleWhatsAppClick } = useWhatsApp();
  const location = useLocation();

  // CORREÇÃO: Handler estável para mudanças de pesquisa com useCallback
  const handleSearchChange = useCallback((term: string) => {
    console.log('📊 [KanbanBoard] handleSearchChange chamado com:', term)
    setSearchTerm(term)
  }, [])

  // Inicializa a seleção de unidades quando as unidades são carregadas - usando nova estrutura
  useEffect(() => {
    if (userUnits && userUnits.length > 0) {
      if (userUnits.length === 1) {
        setSelectedUnitIds([userUnits[0].unit_id]);
      } else {
        setSelectedUnitIds(userUnits.map(unit => unit.unit_id));
      }
    }
  }, [userUnits]);

  useEffect(() => {
    refetch();
  }, [location.pathname, refetch]);

  // Ativar modo debug com Ctrl+Alt+D
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === 'd') {
        setIsDebugMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDebugMode]);

  // CORREÇÃO: Acessar clients corretamente de cada página
  const allClients = infiniteData?.pages?.flatMap(page => page.clients) || []
  console.log('📊 [KanbanBoard] Total de clientes encontrados:', allClients.length)

  // Auto-load more data if needed
  const checkAndLoadMore = useCallback(() => {
    if (!infiniteData?.pages || isFetchingNextPage || !hasNextPage) return

    // CORREÇÃO: Acessar clients corretamente de cada página
    const columns = transformInfiniteClientsToColumnData([allClients], 100)
    
    if (shouldLoadMore(columns, 100)) {
      fetchNextPage()
    }
  }, [infiniteData, isFetchingNextPage, hasNextPage, fetchNextPage, allClients])

  useEffect(() => {
    const timer = setTimeout(checkAndLoadMore, 1000)
    return () => clearTimeout(timer)
  }, [checkAndLoadMore])

  // Quando abrir um cliente vindo da Agenda, garante carregar páginas até encontrá-lo
  useEffect(() => {
    if (!openClientId) return
    const found = allClients.some((c: any) => c.id === openClientId)
    console.log('📊 [KanbanBoard] openClientId recebido:', openClientId, '| já carregado?', found)
    if (!found) {
      if (hasNextPage && !isFetchingNextPage) {
        console.log('📊 [KanbanBoard] Cliente não encontrado. Buscando próxima página...')
        fetchNextPage()
      } else if (!hasNextPage) {
        console.warn('⚠️ [KanbanBoard] Cliente não encontrado nas páginas carregadas e não há mais páginas.')
      }
    } else {
      console.log('✅ [KanbanBoard] Cliente encontrado nos dados carregados. A coluna deverá abrir o CardSheet.')
    }
  }, [openClientId, allClients, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading || isLoadingUnits) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>
  }
  
  const columns = transformInfiniteClientsToColumnData([allClients], 100)

  return (
    <div className="flex flex-col h-full">
      <BoardHeader 
        showPendingOnly={showPendingOnly}
        setShowPendingOnly={setShowPendingOnly}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedUnitIds={selectedUnitIds}
        isSearching={isFetching && !isFetchingNextPage}
        onOpenClient={(id) => setOpenClientId(id)}
      />

      {/* Scrollable container for kanban columns */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto pb-4">
          <div 
            className="grid gap-2 w-full"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(160px, 1fr))` }}
          >
            {columns.map((column, index) => (
              <div 
                key={column.id}
                className="min-w-0"
              >
                <InfiniteKanbanColumn
                  column={column}
                  index={index}
                  onWhatsAppClick={handleWhatsAppClick}
                  onRegisterAttempt={registerAttempt}
                  onRegisterEffectiveContact={registerEffectiveContact}
                  onDeleteActivity={deleteActivity}
                  onLoadMore={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                      fetchNextPage()
                    }
                  }}
                  isLoading={isFetchingNextPage}
                  hasNextPage={hasNextPage}
                  openClientId={openClientId || undefined}
                  onOpenedFromAgenda={() => setOpenClientId(null)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Monitor de diagnóstico - ativado com Ctrl+Alt+D */}
      <RealtimeMonitor enabled={isDebugMode} />
    </div>
  );
}

export default KanbanBoard;


import { useInfiniteClientData } from "./hooks/useInfiniteClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { transformInfiniteClientsToColumnData, shouldLoadMore } from "./utils/columnUtils"
import { useState, useEffect, useCallback } from "react"
import { useLocation } from "react-router-dom"
import { BoardHeader } from "./BoardHeader"
import { InfiniteKanbanColumn } from "./components/column/InfiniteKanbanColumn"
import { useUserUnit } from "./hooks/useUserUnit"
import { RealtimeMonitor } from "./components/debug/RealtimeMonitor"

export function KanbanBoard() {
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDebugMode, setIsDebugMode] = useState(false);
  
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

  // Inicializa a seleção de unidades quando as unidades são carregadas
  useEffect(() => {
    console.log("🏢 [KanbanBoard] Inicializando seleção de unidade");
    if (userUnits && userUnits.length > 0) {
      console.log("🏢 [KanbanBoard] Usuário tem acesso a", userUnits.length, "unidades");
      
      if (userUnits.length === 1) {
        setSelectedUnitIds([userUnits[0].unit_id]);
      } else {
        setSelectedUnitIds(userUnits.map(unit => unit.unit_id));
      }
    }
  }, [userUnits]);

  useEffect(() => {
    console.log("🔄 [KanbanBoard] Kanban Board mounted ou rota mudou, refazendo busca de dados...");
    refetch();
  }, [location.pathname, refetch]);

  // Ativar modo debug com Ctrl+Alt+D
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === 'd') {
        setIsDebugMode(prev => !prev);
        console.log("🐛 [KanbanBoard] Modo debug " + (!isDebugMode ? "ativado" : "desativado"));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDebugMode]);

  // Auto-load more data if needed
  const checkAndLoadMore = useCallback(() => {
    if (!infiniteData?.pages || isFetchingNextPage || !hasNextPage) return

    // CORREÇÃO: Acessar clients corretamente de cada página
    const allClients = infiniteData.pages.flatMap(page => page.clients)
    const columns = transformInfiniteClientsToColumnData([allClients], 100)
    
    if (shouldLoadMore(columns, 100)) {
      console.log('📊 [KanbanBoard] Auto-carregando mais dados para atingir mínimo por coluna')
      fetchNextPage()
    }
  }, [infiniteData, isFetchingNextPage, hasNextPage, fetchNextPage])

  useEffect(() => {
    const timer = setTimeout(checkAndLoadMore, 1000)
    return () => clearTimeout(timer)
  }, [checkAndLoadMore])

  if (isLoading || isLoadingUnits) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>
  }

  // CORREÇÃO: Acessar clients corretamente de cada página
  const allClients = infiniteData?.pages?.flatMap(page => page.clients) || []
  
  console.log('📊 [KanbanBoard] Total de páginas carregadas:', infiniteData?.pages?.length || 0)
  console.log('📊 [KanbanBoard] Total de clientes ativos carregados:', allClients.length)
  
  const columns = transformInfiniteClientsToColumnData([allClients], 100)
  
  // Estatísticas por coluna para logs (reduzidas)
  if (isDebugMode) {
    const columnStats = columns.map(col => ({
      title: col.title,
      count: col.cards.length
    })).filter(stat => stat.count > 0)
    
    console.log('📊 [KanbanBoard] Estatísticas por coluna:', columnStats)
  }

  return (
    <div className="flex flex-col h-full">
      <BoardHeader 
        showPendingOnly={showPendingOnly}
        setShowPendingOnly={setShowPendingOnly}
        onRefresh={() => refetch()}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        availableUnits={userUnits || []}
        selectedUnitIds={selectedUnitIds}
        setSelectedUnitIds={setSelectedUnitIds}
        isMultiUnit={isMultiUnit || false}
        isSearching={isFetching && !isFetchingNextPage}
      />

      {/* Scrollable container for kanban columns */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto pb-4">
          <div 
            className="flex gap-4 min-w-fit"
            style={{ minWidth: `${columns.length * 336}px` }}
          >
            {columns.map((column, index) => (
              <div 
                key={column.id}
                className="flex-shrink-0 w-[320px]"
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
                      console.log('📊 [KanbanBoard] Carregando mais da coluna:', column.title)
                      fetchNextPage()
                    }
                  }}
                  isLoading={isFetchingNextPage}
                  hasNextPage={hasNextPage}
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

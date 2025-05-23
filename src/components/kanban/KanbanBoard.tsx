
import { useInfiniteClientData } from "./hooks/useInfiniteClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { transformInfiniteClientsToColumnData, shouldLoadMore } from "./utils/columnUtils"
import { useState, useEffect, useCallback } from "react"
import { useLocation } from "react-router-dom"
import { BoardHeader } from "./BoardHeader"
import { InfiniteKanbanColumn } from "./components/column/InfiniteKanbanColumn"
import { useUserUnit } from "./hooks/useUserUnit"

export function KanbanBoard() {
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit();
  const isMultiUnit = userUnits && userUnits.length > 1;
  
  const { 
    data: infiniteData, 
    isLoading, 
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
    console.log("Inicializando seleção de unidade");
    if (userUnits && userUnits.length > 0) {
      console.log("Usuário tem acesso a", userUnits.length, "unidades");
      
      if (userUnits.length === 1) {
        setSelectedUnitIds([userUnits[0].unit_id]);
      } else {
        setSelectedUnitIds(userUnits.map(unit => unit.unit_id));
      }
    }
  }, [userUnits]);

  useEffect(() => {
    console.log("Kanban Board mounted or route changed, refetching data...");
    refetch();
  }, [location.pathname, refetch]);

  // Auto-load more data if needed
  const checkAndLoadMore = useCallback(() => {
    if (!infiniteData?.pages || isFetchingNextPage || !hasNextPage) return

    const allClients = infiniteData.pages.map(page => page.clients)
    const columns = transformInfiniteClientsToColumnData(allClients, 100)
    
    if (shouldLoadMore(columns, 100)) {
      console.log('Auto-loading more data to reach minimum per column')
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

  const allClients = infiniteData?.pages?.map(page => page.clients) || []
  const totalCount = infiniteData?.pages?.[0]?.totalCount || 0
  
  console.log('Total de páginas carregadas:', allClients.length)
  console.log('Total geral de clientes no banco:', totalCount)
  
  const columns = transformInfiniteClientsToColumnData(allClients, 100)
  
  // Estatísticas por coluna
  const columnStats = columns.map(col => ({
    title: col.title,
    count: col.cards.length
  })).filter(stat => stat.count > 0)
  
  console.log('Estatísticas por coluna:', columnStats)

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
      />

      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <div className="text-sm text-gray-600">
          Total: {totalCount} clientes
          {columnStats.length > 0 && (
            <span className="ml-2">
              • Distribuição: {columnStats.map(s => `${s.title}: ${s.count}`).join(', ')}
            </span>
          )}
        </div>
        {isFetchingNextPage && (
          <div className="text-sm text-blue-600">
            Carregando mais dados...
          </div>
        )}
      </div>

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
                      console.log('Loading more from column:', column.title)
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
    </div>
  );
}

export default KanbanBoard;

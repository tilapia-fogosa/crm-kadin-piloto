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

export function KanbanBoard() {
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDebugMode, setIsDebugMode] = useState(false);
  
  // Refs para notificação de novos leads
  const previousClientCountRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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

  // Inicializar áudio para notificações quando som estiver habilitado
  useEffect(() => {
    if (soundEnabled && !audioRef.current) {
      try {
        audioRef.current = new Audio('/sounds/notification.mp3');
        audioRef.current.preload = 'auto';
        console.log('🔊 [KanbanBoard] Áudio inicializado');
      } catch (error) {
        console.error('🔊 [KanbanBoard] Erro ao inicializar áudio:', error);
      }
    }
  }, [soundEnabled]);
  
  // CORREÇÃO: Acessar clients corretamente de cada página
  const allClients = infiniteData?.pages?.flatMap(page => page.clients) || []
  console.log('📊 [KanbanBoard] Total de clientes encontrados:', allClients.length)

  // Detectar novos leads e tocar notificação
  useEffect(() => {
    const currentCount = allClients?.length || 0;
    
    // Se é a primeira vez ou está carregando, apenas atualiza a referência
    if (previousClientCountRef.current === 0 || isLoading) {
      previousClientCountRef.current = currentCount;
      return;
    }
    
    // Se há mais clientes que antes e som está habilitado, é um novo lead
    if (currentCount > previousClientCountRef.current && soundEnabled && audioRef.current) {
      const newLeadsCount = currentCount - previousClientCountRef.current;
      console.log('🔊 [KanbanBoard] Novo(s) lead(s) detectado(s):', newLeadsCount);
      
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play()
          .then(() => {
            console.log('🔊 [KanbanBoard] Som reproduzido com sucesso');
          })
          .catch(error => {
            console.error('🔊 [KanbanBoard] Erro ao reproduzir som:', error);
          });
      } catch (error) {
        console.error('🔊 [KanbanBoard] Erro ao tocar áudio:', error);
      }
    }
    
    // Atualizar referência
    previousClientCountRef.current = currentCount;
  }, [allClients, soundEnabled, isLoading]);

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

  if (isLoading || isLoadingUnits) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>
  }
  
  const columns = transformInfiniteClientsToColumnData([allClients], 100)

  return (
    <div className="flex flex-col h-full">
      <BoardHeader 
        showPendingOnly={showPendingOnly}
        setShowPendingOnly={setShowPendingOnly}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onRefresh={() => refetch()}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
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

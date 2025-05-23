
import { useClientData } from "./hooks/useClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { transformClientsToColumnData } from "./utils/columnUtils"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { BoardHeader } from "./BoardHeader"
import { KanbanColumn } from "./KanbanColumn"
import { useUserUnit } from "./hooks/useUserUnit"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function KanbanBoard() {
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit();
  const isMultiUnit = userUnits && userUnits.length > 1;
  
  const { data: clientsData, isLoading, refetch } = useClientData(
    selectedUnitIds, 
    searchTerm, 
    showPendingOnly,
    { page: currentPage, limit: 100 }
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUnitIds, searchTerm, showPendingOnly]);

  useEffect(() => {
    console.log("Kanban Board mounted or route changed, refetching data...");
    refetch();
  }, [location.pathname, refetch]);

  if (isLoading || isLoadingUnits) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>
  }

  const clients = clientsData?.clients || []
  const totalCount = clientsData?.totalCount || 0
  const hasNextPage = clientsData?.hasNextPage || false
  const totalPages = Math.ceil(totalCount / 100)

  console.log('Total de clientes filtrados:', clients.length)
  console.log('Total geral:', totalCount)
  console.log('Página atual:', currentPage)
  console.log('Total de páginas:', totalPages)
  
  const columns = transformClientsToColumnData(clients)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
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
      />

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <div className="text-sm text-gray-600">
          Página {currentPage} de {totalPages} - Total: {totalCount} clientes
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasNextPage}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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
                <KanbanColumn
                  column={column}
                  index={index}
                  onWhatsAppClick={handleWhatsAppClick}
                  onRegisterAttempt={registerAttempt}
                  onRegisterEffectiveContact={registerEffectiveContact}
                  onDeleteActivity={deleteActivity}
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

import { useClientData } from "./hooks/useClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { transformClientsToColumnData } from "./utils/columnUtils"
import { useState, useEffect } from "react"
import { startOfDay, isBefore, isEqual } from "date-fns"
import { useLocation } from "react-router-dom"
import { BoardHeader } from "./BoardHeader"
import { KanbanColumn } from "./KanbanColumn"
import { useUserUnit } from "./hooks/useUserUnit"

export function KanbanBoard() {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit();
  
  const isMultiUnit = userUnits && userUnits.length > 1;
  
  const { data: clients, isLoading, refetch } = useClientData(selectedUnitId);
  
  const { registerAttempt, registerEffectiveContact, deleteActivity } = useActivityOperations();
  const { handleWhatsAppClick } = useWhatsApp();
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    console.log("Inicializando seleção de unidade");
    if (userUnits && userUnits.length > 0) {
      console.log("Usuário tem acesso a", userUnits.length, "unidades");
      
      if (userUnits.length === 1) {
        setSelectedUnitId(userUnits[0].unit_id);
      } else {
        setSelectedUnitId(null);
      }
    }
  }, [userUnits]);

  useEffect(() => {
    console.log("Kanban Board mounted or route changed, refetching data...");
    refetch();
  }, [location.pathname, refetch]);

  if (isLoading || isLoadingUnits) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>
  }

  const filterBySearchTerm = (clients: any[] | null) => {
    if (!clients) return null
    
    if (!searchTerm.trim()) {
      console.log('Termo de pesquisa vazio, retornando todos os clientes')
      return clients
    }
    
    console.log('Filtrando clientes pelo termo:', searchTerm.trim())
    const normalizedSearchTerm = searchTerm.toLowerCase().trim()
    
    return clients.filter(client => {
      const matchesName = client.name?.toLowerCase().includes(normalizedSearchTerm)
      const matchesPhone = client.phone_number?.toLowerCase().includes(normalizedSearchTerm)
      
      if (matchesName || matchesPhone) {
        console.log(`Cliente '${client.name}' corresponde ao termo de pesquisa: ${searchTerm}`)
      }
      
      return matchesName || matchesPhone
    })
  }

  const filterClients = (clients: any[] | null) => {
    if (!clients) return null
    
    let filteredResults = filterBySearchTerm(clients)
    
    if (!showPendingOnly) {
      console.log('Filtro de pendentes desativado, mostrando todos os clientes após pesquisa')
      return filteredResults
    }
    
    const today = startOfDay(new Date())
    console.log('Filtrando clientes pendentes após pesquisa')

    return filteredResults.filter(client => {
      if (!client.next_contact_date) {
        console.log('Cliente sem data de próximo contato:', client.name)
        return true
      }

      const nextContactDate = startOfDay(new Date(client.next_contact_date))
      const shouldShow = isBefore(nextContactDate, today) || isEqual(nextContactDate, today)
      
      if (shouldShow) {
        console.log(`Cliente '${client.name}' pendente com próximo contato em: ${nextContactDate}`)
      }
      
      return shouldShow
    })
  }

  const filteredClients = filterClients(clients)
  console.log('Total de clientes filtrados:', filteredClients?.length)
  const columns = transformClientsToColumnData(filteredClients)

  return (
    <div className="flex flex-col h-full">
      <BoardHeader 
        showPendingOnly={showPendingOnly}
        setShowPendingOnly={setShowPendingOnly}
        onRefresh={() => refetch()}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        availableUnits={userUnits || []}
        selectedUnitId={selectedUnitId}
        setSelectedUnitId={setSelectedUnitId}
        isMultiUnit={isMultiUnit || false}
      />

      <div className="overflow-x-auto mt-4">
        <div className="flex gap-4" style={{ minWidth: `${columns.length * 336}px` }}>
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
  );
}

export default KanbanBoard;

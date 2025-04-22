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
import { DashboardButtons } from "./components/dashboard/DashboardButtons"

export function KanbanBoard() {
  // Estado para controlar a unidade selecionada
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  
  // Obter os dados do usuário e suas unidades
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit();
  
  // Verificar se o usuário tem acesso a múltiplas unidades
  const isMultiUnit = userUnits && userUnits.length > 1;
  
  // Buscar dados de clientes com a unidade selecionada
  const { data: clients, isLoading, refetch } = useClientData(selectedUnitId);
  
  const { registerAttempt, registerEffectiveContact, deleteActivity } = useActivityOperations();
  const { handleWhatsAppClick } = useWhatsApp();
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  // Inicializar com "Todas as unidades" caso o usuário tenha múltiplas unidades
  useEffect(() => {
    console.log("Inicializando seleção de unidade");
    if (userUnits && userUnits.length > 0) {
      console.log("Usuário tem acesso a", userUnits.length, "unidades");
      
      // Se tiver mais de uma unidade, começamos com null (todas as unidades)
      // Se tiver apenas uma, usamos essa unidade diretamente
      if (userUnits.length === 1) {
        setSelectedUnitId(userUnits[0].unit_id);
      } else {
        setSelectedUnitId(null); // null significa "todas as unidades"
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

  // Função para filtrar clientes por termo de pesquisa
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
      
      // Log detalhado para ajudar na depuração
      if (matchesName || matchesPhone) {
        console.log(`Cliente '${client.name}' corresponde ao termo de pesquisa: ${searchTerm}`)
      }
      
      return matchesName || matchesPhone
    })
  }

  const filterClients = (clients: any[] | null) => {
    if (!clients) return null
    
    // Primeiro filtra por termo de pesquisa
    let filteredResults = filterBySearchTerm(clients)
    
    // Depois aplica o filtro de pendentes se necessário
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
      <div className="flex justify-between mb-4 gap-4">
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
        <div className="flex-shrink-0">
          <DashboardButtons />
        </div>
      </div>
      
      <div className="overflow-x-auto w-full">
        <div className="inline-flex gap-4 p-4 min-w-max">
          {columns.map((column, index) => (
            <KanbanColumn
              key={column.id}
              column={column}
              index={index}
              onWhatsAppClick={handleWhatsAppClick}
              onRegisterAttempt={registerAttempt}
              onRegisterEffectiveContact={registerEffectiveContact}
              onDeleteActivity={deleteActivity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default KanbanBoard

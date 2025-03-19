
import { useClientData } from "./hooks/useClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { transformClientsToColumnData } from "./utils/columnUtils"
import { useState, useEffect } from "react"
import { startOfDay, isBefore, isEqual } from "date-fns"
import { useLocation } from "react-router-dom"
import { BoardHeader } from "./BoardHeader"
import { KanbanColumn } from "./KanbanColumn"

export function KanbanBoard() {
  const { data: clients, isLoading, refetch } = useClientData()
  const { registerAttempt, registerEffectiveContact, deleteActivity } = useActivityOperations()
  const { handleWhatsAppClick } = useWhatsApp()
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const location = useLocation()

  useEffect(() => {
    console.log("Kanban Board mounted or route changed, refetching data...")
    refetch()
  }, [location.pathname, refetch])

  if (isLoading) {
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
    <div className="flex flex-col w-full">
      <BoardHeader 
        showPendingOnly={showPendingOnly}
        setShowPendingOnly={setShowPendingOnly}
        onRefresh={() => refetch()}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

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

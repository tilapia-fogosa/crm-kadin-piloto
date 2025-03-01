
import { BoardHeader } from "./BoardHeader"
import { KanbanColumn } from "./KanbanColumn"
import { useClientData } from "./hooks/useClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { transformClientsToColumnData } from "./utils/columnUtils"
import { useState, useEffect } from "react"
import { startOfDay, isBefore, isEqual } from "date-fns"
import { useLocation } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PedagogicalKanban } from "./PedagogicalKanban"

export function KanbanBoard() {
  const { data: clients, isLoading, refetch } = useClientData()
  const { registerAttempt, registerEffectiveContact, deleteActivity } = useActivityOperations()
  const { handleWhatsAppClick } = useWhatsApp()
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const location = useLocation()

  useEffect(() => {
    console.log("Kanban Board mounted or route changed, refetching data...")
    refetch()
  }, [location.pathname, refetch])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>
  }

  const filterClients = (clients: any[] | null) => {
    if (!clients) return null
    
    if (!showPendingOnly) {
      console.log('Filter is OFF, showing all clients')
      return clients
    }
    
    const today = startOfDay(new Date())
    console.log('Filtering clients with showPendingOnly:', showPendingOnly)

    return clients.filter(client => {
      if (!client.next_contact_date) {
        console.log('Client with no next contact date:', client.name)
        return true
      }

      const nextContactDate = startOfDay(new Date(client.next_contact_date))
      const shouldShow = isBefore(nextContactDate, today) || isEqual(nextContactDate, today)
      console.log('Client:', client.name, 'Next contact:', nextContactDate, 'Should show:', shouldShow)
      return shouldShow
    })
  }

  const filteredClients = filterClients(clients)
  console.log('Filtered clients count:', filteredClients?.length)
  const columns = transformClientsToColumnData(filteredClients)

  return (
    <Tabs defaultValue="commercial" className="h-screen">
      <TabsList className="w-full justify-start border-b rounded-none px-4">
        <TabsTrigger value="commercial">Kanban Comercial</TabsTrigger>
        <TabsTrigger value="pedagogical">Kanban Pedagógico</TabsTrigger>
      </TabsList>
      
      <TabsContent value="commercial" className="m-0">
        <div className="flex flex-col h-[calc(100vh-40px)] max-h-[calc(100vh-40px)] overflow-hidden">
          <BoardHeader 
            showPendingOnly={showPendingOnly}
            setShowPendingOnly={setShowPendingOnly}
            onRefresh={() => refetch()}
          />

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="h-full overflow-x-auto">
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
        </div>
      </TabsContent>

      <TabsContent value="pedagogical" className="m-0 h-[calc(100vh-40px)]">
        <PedagogicalKanban />
      </TabsContent>
    </Tabs>
  )
}

export default KanbanBoard

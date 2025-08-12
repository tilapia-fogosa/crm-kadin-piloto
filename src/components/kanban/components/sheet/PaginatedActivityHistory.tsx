
import { useState, useEffect } from "react"
import { useClientActivities } from "../../hooks/useClientActivities"
import { ActivityHistory } from "../../ActivityHistory"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { ActivityData } from "../../utils/types/kanbanTypes"

interface PaginatedActivityHistoryProps {
  clientId: string
  isOpen: boolean
  onDeleteActivity: (id: string, clientId: string) => void
}

export function PaginatedActivityHistory({ 
  clientId, 
  isOpen,
  onDeleteActivity 
}: PaginatedActivityHistoryProps) {
  const [page, setPage] = useState(1)
  
  const { 
    data: activitiesData, 
    isLoading, 
    isFetching,
    refetch
  } = useClientActivities(
    clientId, 
    page, 
    10,
    isOpen
  )

  // Efeito para registrar when the data changes
  useEffect(() => {
    if (activitiesData) {
      console.log(`Dados de atividades atualizados para cliente ${clientId}, temos ${activitiesData.activities.length} atividades`);
    }
  }, [activitiesData, clientId]);

// Convert activities back to the expected string format for compatibility
const formattedActivities = activitiesData?.activities?.map((activity: ActivityData) => {
  // formato: tipo_atividade|tipo_contato|created_at|author_name|notes|id|next_contact_date|active
  return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.author_name || ''}|${activity.notes || ''}|${activity.id}|${activity.next_contact_date || ''}|${activity.active}`
}) || []

  const activities = activitiesData?.activities || []
  const hasNextPage = activitiesData?.hasNextPage || false

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      setPage(page + 1)
    }
  }

  const handleManualRefresh = () => {
    console.log("Atualizando manualmente as atividades");
    refetch();
  }

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando histórico...</span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Histórico de Atividades</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={isFetching}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isFetching && page === 1 ? (
          <div className="flex items-center justify-center p-4 opacity-70">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Atualizando...</span>
          </div>
        ) : null}

        <ActivityHistory
          activities={formattedActivities}
          onDeleteActivity={onDeleteActivity}
          clientId={clientId}
        />
      </div>
      
      {hasNextPage && (
        <div className="border-t pt-4 mt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isFetching}
            className="w-full"
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Carregando mais...
              </>
            ) : (
              'Carregar mais atividades'
            )}
          </Button>
        </div>
      )}
      
      {!hasNextPage && activities.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Todas as atividades foram carregadas
        </div>
      )}

      {activities.length === 0 && !isLoading && (
        <div className="text-center text-sm text-gray-500 p-4">
          Nenhuma atividade registrada para este cliente
        </div>
      )}
    </div>
  )
}

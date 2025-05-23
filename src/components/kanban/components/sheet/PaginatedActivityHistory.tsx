
import { useState } from "react"
import { useClientActivities } from "../../hooks/useClientActivities"
import { ActivityHistory } from "../../ActivityHistory"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PaginatedActivityHistoryProps {
  clientId: string
  onDeleteActivity: (id: string, clientId: string) => void
}

export function PaginatedActivityHistory({ 
  clientId, 
  onDeleteActivity 
}: PaginatedActivityHistoryProps) {
  const [page, setPage] = useState(1)
  const [allActivities, setAllActivities] = useState<any[]>([])
  
  const { data: activitiesData, isLoading, isFetching } = useClientActivities(
    clientId, 
    page, 
    10
  )

  // Merge new activities with existing ones when page changes
  const activities = activitiesData?.activities || []
  const hasNextPage = activitiesData?.hasNextPage || false
  
  // Convert activities back to the expected string format for compatibility
  const formattedActivities = activities.map((activity: any) => {
    return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}|${activity.next_contact_date || ''}|${activity.active}`
  })

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      setPage(page + 1)
    }
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
      <div className="flex-1 overflow-y-auto">
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
    </div>
  )
}

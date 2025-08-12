
import { useState } from "react"
import { format } from "date-fns"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Phone, Copy, X, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getActivityBadge, getContactType } from "@/components/kanban/utils/activityUtils"
import { useClientActivitiesForSheet } from "@/hooks/useClientActivitiesForSheet"
import { Skeleton } from "@/components/ui/skeleton"

// Define o tipo básico do cliente para o sheet
interface Client {
  id: string
  name: string
  phone_number: string
  lead_source: string
  email?: string
  status: string
}

interface ClientActivitySheetProps {
  client: Client | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function ClientActivitySheet({ client, isOpen, setIsOpen }: ClientActivitySheetProps) {
  console.log('🎭 [ClientActivitySheet] Renderizado para cliente:', client?.name, 'isOpen:', isOpen)
  
  const { toast } = useToast()
  
  // Usar o hook de lazy loading - só busca quando sheet está aberto
  const { 
    data: activities, 
    isLoading, 
    error,
    refetch 
  } = useClientActivitiesForSheet(client?.id, isOpen)

  // Função para copiar o número de telefone
  const handleCopyPhone = () => {
    if (!client) return
    
    navigator.clipboard.writeText(client.phone_number)
      .then(() => {
        toast({
          title: "Número copiado",
          description: "Número de telefone copiado para a área de transferência",
        })
      })
      .catch(err => {
        console.error('Erro ao copiar telefone:', err)
        toast({
          title: "Erro",
          description: "Não foi possível copiar o número de telefone",
          variant: "destructive",
        })
      })
  }

  // Função para tentar novamente em caso de erro
  const handleRetry = () => {
    console.log('🔄 [ClientActivitySheet] Tentando recarregar atividades')
    refetch()
  }

  // Formata a data para exibição
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error)
      return '-'
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4 relative">
          <SheetClose className="absolute right-0 top-0">
            <X className="h-4 w-4" />
          </SheetClose>
          <SheetTitle className="text-center">Atividades de {client?.name}</SheetTitle>
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-lg">{client?.phone_number}</span>
              <Button onClick={handleCopyPhone} size="icon" variant="ghost" className="h-8 w-8 ml-1">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {client?.email && (
              <div className="text-sm text-muted-foreground">
                Email: {client.email}
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Origem</span>
                <span className="text-sm font-medium">{client?.lead_source || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium">{client?.status || '-'}</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Histórico de Atividades</h3>
            {!isLoading && !error && (
              <Button onClick={handleRetry} size="sm" variant="ghost">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            {isLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Carregando atividades...</span>
                </div>
                {/* Skeleton loading */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full ml-10" />
                  </div>
                ))}
              </div>
            )}
            
            {error && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div className="text-center">
                  <p className="text-red-700 font-medium">Erro ao carregar atividades</p>
                  <p className="text-sm text-red-600 mt-1">
                    Não foi possível carregar as atividades deste cliente
                  </p>
                </div>
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            )}
            
            {!isLoading && !error && activities && activities.length > 0 && (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="mb-4 text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center bg-primary text-primary-foreground font-medium rounded min-w-[2rem] h-6 text-xs">
                        {getActivityBadge(activity.tipo_atividade)}
                      </span>
                      <span className="text-muted-foreground">
                        {getContactType(activity.tipo_contato)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </span>
                    </div>
                    {activity.author_name && (
                      <p className="text-sm ml-10 text-primary font-medium">
                        {activity.author_name}
                      </p>
                    )}
                    {activity.notes && (
                      <p className="text-sm text-muted-foreground ml-10">
                        {activity.notes}
                      </p>
                    )}
                    {activity.next_contact_date && (
                      <p className="text-xs text-muted-foreground ml-10">
                        Próximo contato: {formatDate(activity.next_contact_date)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && !error && activities && activities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade registrada
                </p>
                <p className="text-xs text-muted-foreground">
                  As atividades aparecerão aqui quando forem criadas
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}

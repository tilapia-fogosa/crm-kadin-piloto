
import { useEffect, useState } from "react"
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
import { Phone, Copy, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getActivityBadge, getContactType } from "@/components/kanban/utils/activityUtils"

// Define os tipos para atividades e clientes
interface ClientActivity {
  id: string
  tipo_atividade: string
  tipo_contato: string
  created_at: string
  notes: string | null
  active: boolean
  next_contact_date?: string | null
}

interface Client {
  id: string
  name: string
  phone_number: string
  lead_source: string
  email?: string
  status: string
  client_activities?: ClientActivity[]
}

interface ClientActivitySheetProps {
  client: Client | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function ClientActivitySheet({ client, isOpen, setIsOpen }: ClientActivitySheetProps) {
  const { toast } = useToast()
  const [activities, setActivities] = useState<ClientActivity[]>([])

  // Log para rastreamento do fluxo
  console.log('ClientActivitySheet renderizado para cliente:', client?.name)

  // Processar as atividades quando o cliente mudar
  useEffect(() => {
    if (client && client.client_activities) {
      // Filtra apenas atividades ativas e ordena por data (mais recente primeiro)
      const activeActivities = client.client_activities
        .filter(activity => activity.active)
        .sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      
      console.log(`${activeActivities.length} atividades ativas encontradas`)
      setActivities(activeActivities)
    } else {
      setActivities([])
    }
  }, [client])

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
          <h3 className="font-semibold mb-2">Histórico de Atividades</h3>
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
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
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma atividade registrada
              </p>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}

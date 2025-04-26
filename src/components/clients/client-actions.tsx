import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye, ArrowLeft } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNavigate } from "react-router-dom"
import { ClientActivitySheet } from "./client-activity-sheet"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ClientActionsProps {
  client: any
  clientToDelete: any
  onDelete: (clientId: string) => void
  setClientToDelete: (client: any) => void
}

export function ClientActions({
  client,
  clientToDelete,
  onDelete,
  setClientToDelete,
}: ClientActionsProps) {
  const navigate = useNavigate()
  const [isActivitySheetOpen, setIsActivitySheetOpen] = useState(false)
  const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  console.log('Rendering ClientActions for client:', client.id)

  const handleRecover = async () => {
    try {
      console.log('Iniciando recuperação do cliente:', client.id)
      
      const { error } = await supabase
        .from('clients')
        .update({ 
          status: 'novo-cadastro',
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id)

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['all-clients'] })
      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Cliente recuperado",
        description: "O cliente foi movido para novos cadastros.",
      })
      
      setIsRecoverDialogOpen(false)
    } catch (error) {
      console.error('Erro ao recuperar cliente:', error)
      toast({
        variant: "destructive",
        title: "Erro ao recuperar",
        description: "Ocorreu um erro ao tentar recuperar o cliente.",
      })
    }
  }

  const canRecover = client.status === 'perdido' || client.status === 'matriculado'

  return (
    <div className="space-x-2">
      {/* Botão de visualizar atividades */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsActivitySheetOpen(true)}
        title="Visualizar atividades"
      >
        <Eye className="h-4 w-4" />
      </Button>

      {/* Sheet para exibir atividades */}
      <ClientActivitySheet 
        client={client} 
        isOpen={isActivitySheetOpen} 
        setIsOpen={setIsActivitySheetOpen} 
      />

      {/* Botão de editar */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(`/clients/${client.id}/edit`)}
        title="Editar cliente"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      {/* Botão e dialog de excluir */}
      <AlertDialog 
        open={clientToDelete?.id === client.id} 
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setClientToDelete(client)}
          title="Excluir cliente"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(client.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Botão e dialog de recuperar */}
      {canRecover && (
        <AlertDialog 
          open={isRecoverDialogOpen} 
          onOpenChange={setIsRecoverDialogOpen}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsRecoverDialogOpen(true)}
            title="Recuperar cliente"
            className="bg-amber-50 hover:bg-amber-100 border-amber-200"
          >
            <ArrowLeft className="h-4 w-4 text-amber-600" />
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Recuperar cliente</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja recuperar este cliente? 
                Ele voltará para a etapa de novo cadastro no Painel do Consultor.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRecover}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Recuperar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

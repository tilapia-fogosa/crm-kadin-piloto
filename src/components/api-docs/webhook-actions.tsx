
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Power, 
  PowerOff 
} from "lucide-react"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Button } from "@/components/ui/button"

// Interface para o webhook
interface WebhookActionsProps {
  webhook: any;
  onUpdate: () => void;
  onEdit: (webhook: any) => void;
}

export function WebhookActions({ webhook, onUpdate, onEdit }: WebhookActionsProps) {
  // Estado para controlar a abertura/fechamento do diálogo de exclusão
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()

  // Função para ativar/desativar webhook
  const toggleActive = async () => {
    try {
      console.log('Alterando status do webhook:', webhook.id, 'para', !webhook.active)
      
      const { error } = await supabase
        .from('client_webhooks')
        .update({ active: !webhook.active })
        .eq('id', webhook.id)
      
      if (error) {
        console.error('Erro ao atualizar status do webhook:', error)
        throw error
      }
      
      toast({
        title: webhook.active ? "Webhook desativado" : "Webhook ativado",
        description: `O webhook foi ${webhook.active ? "desativado" : "ativado"} com sucesso.`,
        duration: 3000
      })
      
      // Atualiza a lista de webhooks
      onUpdate()
    } catch (error) {
      console.error('Erro ao alterar status do webhook:', error)
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do webhook.",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  // Função para desativar webhook (soft delete)
  const deleteWebhook = async () => {
    try {
      setIsDeleting(true)
      console.log('Desativando webhook (soft delete):', webhook.id)
      
      // Usar update ao invés de delete para realizar um soft delete
      const { error } = await supabase
        .from('client_webhooks')
        .update({ active: false })
        .eq('id', webhook.id)
      
      if (error) {
        console.error('Erro ao desativar webhook:', error)
        throw error
      }
      
      toast({
        title: "Webhook desativado",
        description: "O webhook foi desativado com sucesso.",
        duration: 3000
      })
      
      // Atualiza a lista de webhooks
      onUpdate()
      
      // Fecha o diálogo de confirmação
      setOpenDeleteDialog(false)
    } catch (error) {
      console.error('Erro ao desativar webhook:', error)
      toast({
        title: "Erro",
        description: "Não foi possível desativar o webhook.",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-2"
            onClick={() => onEdit(webhook)}
          >
            <Pencil className="h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2"
            onClick={toggleActive}
          >
            {webhook.active ? (
              <>
                <PowerOff className="h-4 w-4" />
                <span>Desativar</span>
              </>
            ) : (
              <>
                <Power className="h-4 w-4" />
                <span>Ativar</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive flex items-center gap-2"
            onClick={() => setOpenDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span>Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog 
        open={openDeleteDialog} 
        onOpenChange={setOpenDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar este webhook? Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                deleteWebhook()
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Desativando..." : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

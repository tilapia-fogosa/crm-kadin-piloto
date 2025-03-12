
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
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
  console.log('Rendering ClientActions for client:', client.id)

  return (
    <div className="space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(`/clients/${client.id}/edit`)}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <AlertDialog 
        open={clientToDelete?.id === client.id} 
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setClientToDelete(client)}
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
    </div>
  )
}

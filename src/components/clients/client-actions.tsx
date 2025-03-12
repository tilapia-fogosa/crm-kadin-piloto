
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { LeadFormFields } from "@/components/leads/lead-form-fields"
import { Form } from "@/components/ui/form"
import { LeadFormData } from "@/types/lead-form"
import { UseFormReturn } from "react-hook-form"

interface ClientActionsProps {
  client: any
  selectedClient: any
  clientToDelete: any
  form: UseFormReturn<LeadFormData>
  onEdit: (client: any) => void
  onDelete: (clientId: string) => void
  setSelectedClient: (client: any) => void
  setClientToDelete: (client: any) => void
  onSubmit: (values: LeadFormData) => Promise<void>
}

export function ClientActions({
  client,
  selectedClient,
  clientToDelete,
  form,
  onEdit,
  onDelete,
  setSelectedClient,
  setClientToDelete,
  onSubmit,
}: ClientActionsProps) {
  console.log('ClientActions: Form data before submit:', form.getValues())

  const handleSubmit = async (values: LeadFormData) => {
    console.log('ClientActions: Handling form submission with values:', values)
    try {
      await onSubmit(values)
      console.log('ClientActions: Form submission successful')
    } catch (error) {
      console.error('ClientActions: Error submitting form:', error)
    }
  }

  return (
    <div className="space-x-2">
      <Dialog 
        open={selectedClient?.id === client.id} 
        onOpenChange={(open) => !open && setSelectedClient(null)}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(client)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <LeadFormFields 
                form={form} 
                isEditing={true}
                clientData={{
                  meta_id: client.meta_id,
                  age_range: client.age_range,
                  original_adset: client.original_adset,
                }}
              />
              <Button type="submit">Salvar Alterações</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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

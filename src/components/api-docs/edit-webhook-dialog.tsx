
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

import { MultipleUnitSelect } from "@/components/auth/MultipleUnitSelect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EditWebhookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  webhook: any | null
  onSuccess: () => void
}

export function EditWebhookDialog({
  open,
  onOpenChange,
  webhook,
  onSuccess,
}: EditWebhookDialogProps) {
  // Estados para os campos do formulário
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [triggerStatus, setTriggerStatus] = useState("")
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()

  // Status do cliente disponíveis
  const clientStatuses = [
    { id: 'novo-cadastro', name: 'Novo Cadastro' },
    { id: 'tentativa-contato', name: 'Tentativa de Contato' },
    { id: 'contato-efetivo', name: 'Contato Efetivo' },
    { id: 'atendimento-agendado', name: 'Atendimento Agendado' },
    { id: 'atendimento-realizado', name: 'Atendimento Realizado' },
    { id: 'negociacao', name: 'Em Negociação' },
    { id: 'matriculado', name: 'Matriculado' },
    { id: 'perdido', name: 'Perdido' }
  ]

  // Efeito para carregar os dados do webhook ao abrir o diálogo
  useEffect(() => {
    if (webhook && open) {
      setUrl(webhook.url || "")
      setDescription(webhook.description || "")
      setTriggerStatus(webhook.trigger_status || "")
      setSelectedUnits(webhook.unit_ids || [])
    }
  }, [webhook, open])

  // Função para atualizar o webhook
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url || !triggerStatus) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
        duration: 3000
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      console.log('Atualizando webhook:', webhook.id, 'com unidades:', selectedUnits)
      
      const { error } = await supabase
        .from('client_webhooks')
        .update({
          url,
          description,
          trigger_status: triggerStatus,
          unit_ids: selectedUnits.length > 0 ? selectedUnits : []
        })
        .eq('id', webhook.id)
      
      if (error) throw error

      toast({
        title: "Webhook atualizado",
        description: "O webhook foi atualizado com sucesso.",
        duration: 3000
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao atualizar webhook:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o webhook.",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Webhook</DialogTitle>
          <DialogDescription>
            Atualize as configurações do webhook de notificação.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL do Webhook</Label>
              <Input
                id="edit-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito deste webhook..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-trigger-status">Status Trigger</Label>
              <Select
                value={triggerStatus}
                onValueChange={setTriggerStatus}
                required
              >
                <SelectTrigger id="edit-trigger-status">
                  <SelectValue placeholder="Selecione o status que dispara o webhook" />
                </SelectTrigger>
                <SelectContent>
                  {clientStatuses.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                O webhook será disparado quando um cliente mudar para este status.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-units">Unidades</Label>
              <MultipleUnitSelect
                selectedUnits={selectedUnits}
                onUnitsChange={setSelectedUnits}
              />
              <p className="text-sm text-gray-500">
                Selecione as unidades para as quais este webhook será aplicado. Se nenhuma for selecionada, será aplicado a todas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

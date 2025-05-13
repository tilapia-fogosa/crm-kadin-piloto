
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { WebhookActions } from "./webhook-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WebhookSectionProps {
  onCopy: (text: string) => void
}

export function WebhookSection({ onCopy }: WebhookSectionProps) {
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const { toast } = useToast()
  
  // Estado para edição de webhook
  const [editingWebhook, setEditingWebhook] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Buscar webhooks
  const { data: webhooks, refetch, isLoading: isLoadingWebhooks } = useQuery({
    queryKey: ['sale-webhooks'],
    queryFn: async () => {
      // Modificado para não fazer join com a tabela units
      const { data, error } = await supabase
        .from('sale_webhooks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  // Buscar logs
  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select(`
          *,
          sale_webhooks (url)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('sale_webhooks')
        .insert({ url, description })

      if (error) throw error

      toast({
        title: "Webhook configurado com sucesso!",
        duration: 3000
      })

      setUrl("")
      setDescription("")
      refetch()
    } catch (error) {
      console.error('Erro ao salvar webhook:', error)
      toast({
        title: "Erro ao configurar webhook",
        variant: "destructive",
        duration: 3000
      })
    }
  }
  
  // Abrir diálogo de edição
  const handleEdit = (webhook: any) => {
    setEditingWebhook(webhook)
    setIsEditDialogOpen(true)
  }
  
  // Atualizar webhook
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingWebhook || !editingWebhook.url) {
      toast({
        title: "Dados incompletos",
        description: "URL do webhook é obrigatória",
        variant: "destructive",
        duration: 3000
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const { error } = await supabase
        .from('sale_webhooks')
        .update({ 
          url: editingWebhook.url, 
          description: editingWebhook.description 
        })
        .eq('id', editingWebhook.id)
      
      if (error) throw error
      
      toast({
        title: "Webhook atualizado com sucesso!",
        duration: 3000
      })
      
      setIsEditDialogOpen(false)
      refetch()
    } catch (error) {
      console.error('Erro ao atualizar webhook:', error)
      toast({
        title: "Erro ao atualizar webhook",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Indicador de carregamento
  const isLoading = isLoadingWebhooks || isLoadingLogs;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Webhooks de Venda</h3>
        <p className="text-sm text-gray-500">
          Configure URLs para receber notificações quando uma venda for realizada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">URL do Webhook</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o propósito deste webhook..."
          />
        </div>

        <Button type="submit">Adicionar Webhook</Button>
      </form>

      <div className="space-y-4">
        <h4 className="font-medium">Webhooks Configurados</h4>
        <div className="rounded-md border">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Carregando webhooks...</p>
            </div>
          ) : webhooks && webhooks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Execução</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks?.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                    <TableCell>{webhook.description}</TableCell>
                    <TableCell>
                      <Badge variant={webhook.active ? "default" : "secondary"}>
                        {webhook.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {webhook.last_success && format(
                        new Date(webhook.last_success),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR }
                      )}
                    </TableCell>
                    <TableCell>
                      <WebhookActions 
                        webhook={webhook} 
                        onUpdate={refetch}
                        onEdit={handleEdit} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum webhook configurado.</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Logs Recentes</h4>
        <div className="rounded-md border">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Carregando logs...</p>
            </div>
          ) : logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Webhook</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead>Erro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.sale_webhooks?.url}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          log.status === 'success' ? "default" :
                          log.status === 'pending' ? "secondary" : "destructive"
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.attempt_count}</TableCell>
                    <TableCell className="text-sm text-red-600">
                      {log.error_message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum log encontrado.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Diálogo de edição para webhooks de venda */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Webhook de Venda</DialogTitle>
            <DialogDescription>
              Atualize as configurações do webhook de venda.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-url">URL do Webhook</Label>
                <Input
                  id="edit-url"
                  value={editingWebhook?.url || ""}
                  onChange={(e) => setEditingWebhook({ ...editingWebhook, url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingWebhook?.description || ""}
                  onChange={(e) => setEditingWebhook({ ...editingWebhook, description: e.target.value })}
                  placeholder="Descreva o propósito deste webhook..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
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
    </div>
  )
}

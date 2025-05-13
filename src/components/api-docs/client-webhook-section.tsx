import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultipleUnitSelect } from "@/components/auth/MultipleUnitSelect"
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
import { clientWebhookExample } from "./client-webhook-example"
import { WebhookActions } from "./webhook-actions"
import { EditWebhookDialog } from "./edit-webhook-dialog"
import { UnitNameList } from "./unit-name-list"

interface ClientWebhookSectionProps {
  onCopy: (text: string) => void
}

export function ClientWebhookSection({ onCopy }: ClientWebhookSectionProps) {
  // Estado do form
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [triggerStatus, setTriggerStatus] = useState("")
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  
  // Estado para edição de webhook
  const [editingWebhook, setEditingWebhook] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
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

  // Buscar webhooks configurados
  const { data: webhooks, refetch, isLoading: isLoadingWebhooks } = useQuery({
    queryKey: ['client-webhooks'],
    queryFn: async () => {
      console.log('Buscando webhooks de clientes');
      
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('Usuário não autenticado na busca de webhooks');
        throw new Error('Not authenticated');
      }
      
      // Modificado para não fazer join com a tabela units
      const { data, error } = await supabase
        .from('client_webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar webhooks:', error);
        throw error;
      }
      
      console.log('Webhooks carregados:', data);
      return data || [];
    }
  });

  // Buscar logs
  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['client-webhook-logs'],
    queryFn: async () => {
      console.log('Buscando logs de webhooks de clientes');
      
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('Usuário não autenticado na busca de logs');
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('client_webhook_logs')
        .select(`
          *,
          client_webhooks (url),
          clients (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar logs de webhooks:', error);
        throw error;
      }
      
      console.log('Logs carregados:', data);
      return data || [];
    }
  });

  // Função para formatar o status trigger
  const formatTriggerStatus = (status: string) => {
    const statusObj = clientStatuses.find(s => s.id === status)
    return statusObj ? statusObj.name : status
  }

  // Submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('Enviando webhook com unidades:', selectedUnits)
      
      const { error } = await supabase
        .from('client_webhooks')
        .insert({ 
          url, 
          description, 
          trigger_status: triggerStatus,
          unit_ids: selectedUnits.length > 0 ? selectedUnits : []
        })

      if (error) throw error

      toast({
        title: "Webhook configurado com sucesso!",
        duration: 3000
      })

      // Limpar formulário
      setUrl("")
      setDescription("")
      setTriggerStatus("")
      setSelectedUnits([])
      
      // Recarregar dados
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

  // Executar webhook manualmente
  const processWebhooks = async () => {
    try {
      console.log('Executando processamento manual de webhooks')
      const { data, error } = await supabase.functions.invoke('process-client-webhooks', {
        method: 'POST'
      })

      if (error) throw error

      console.log('Resultado do processamento:', data)
      toast({
        title: `Processamento concluído!`,
        description: `${data.processedCount} webhooks processados (${data.successCount} sucesso, ${data.failureCount} falhas)`,
        duration: 5000
      })
    } catch (error) {
      console.error('Erro ao processar webhooks:', error)
      toast({
        title: "Erro ao processar webhooks",
        variant: "destructive",
        description: `${error}`,
        duration: 5000
      })
    }
  }

  // Abrir diálogo de edição
  const handleEdit = (webhook: any) => {
    setEditingWebhook(webhook)
    setIsEditDialogOpen(true)
  }

  // Adicionar estado para controlar o carregamento
  const isLoading = isLoadingWebhooks || isLoadingLogs;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Webhooks de Clientes</h3>
        <p className="text-sm text-gray-500">
          Configure URLs para receber notificações quando o status de um cliente for atualizado.
        </p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
          <strong>Nota:</strong> Os webhooks de venda foram consolidados nesta funcionalidade. 
          Para receber notificações de vendas, configure um webhook com o status trigger "matriculado".
        </div>
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
        
        <div className="space-y-2">
          <Label htmlFor="trigger-status">Status Trigger</Label>
          <Select
            value={triggerStatus}
            onValueChange={setTriggerStatus}
            required
          >
            <SelectTrigger id="trigger-status">
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
          <Label htmlFor="units">Unidades</Label>
          <MultipleUnitSelect
            selectedUnits={selectedUnits}
            onUnitsChange={setSelectedUnits}
          />
          <p className="text-sm text-gray-500">
            Selecione as unidades para as quais este webhook será aplicado. Se nenhuma for selecionada, será aplicado a todas.
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Adicionar Webhook</Button>
          <Button type="button" variant="outline" onClick={processWebhooks}>
            Processar Webhooks Pendentes
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="bg-muted p-4 rounded-md">
          <h4 className="font-medium mb-2">Formato do Payload</h4>
          <div className="relative">
            <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(clientWebhookExample, null, 2)}
            </pre>
            <Button
              className="absolute top-2 right-2"
              size="sm"
              variant="secondary"
              onClick={() => onCopy(JSON.stringify(clientWebhookExample, null, 2))}
            >
              Copiar
            </Button>
          </div>
        </div>
      </div>

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
                  <TableHead>Status Trigger</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Execução</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                    <TableCell>{formatTriggerStatus(webhook.trigger_status)}</TableCell>
                    <TableCell>
                      <UnitNameList unitIds={webhook.unit_ids || []} />
                    </TableCell>
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead>Erro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-mono text-sm truncate max-w-[150px]">{log.client_webhooks?.url}</TableCell>
                    <TableCell className="truncate max-w-[150px]">{log.clients?.name}</TableCell>
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
                    <TableCell className="text-sm text-red-600 truncate max-w-[200px]">
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

      {/* Diálogo de edição de webhook */}
      <EditWebhookDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        webhook={editingWebhook}
        onSuccess={refetch}
      />
    </div>
  )
}

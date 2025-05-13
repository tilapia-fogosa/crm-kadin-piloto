
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

interface WebhookSectionProps {
  onCopy: (text: string) => void
}

export function WebhookSection({ onCopy }: WebhookSectionProps) {
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const { toast } = useToast()

  // Buscar webhooks
  const { data: webhooks, refetch } = useQuery({
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
  const { data: logs } = useQuery({
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Execução</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Logs Recentes</h4>
        <div className="rounded-md border">
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
        </div>
      </div>
    </div>
  )
}

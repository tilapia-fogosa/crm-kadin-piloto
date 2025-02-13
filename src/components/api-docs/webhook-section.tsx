
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CopyIcon } from "lucide-react"
import { webhookExample } from "./webhook-example"

interface WebhookSectionProps {
  onCopy: (text: string) => void
}

export function WebhookSection({ onCopy }: WebhookSectionProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Endpoint do Webhook</AlertTitle>
        <AlertDescription>
          POST https://hkvjdxxndapxpslovrlc.supabase.co/functions/v1/normalize-lead-source
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Campos Obrigatórios</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><code>name</code> - Nome do cliente</li>
          <li><code>phone_number</code> - Telefone do cliente (formato +5511999999999)</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6">Campos Opcionais</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><code>email</code> - Email do cliente</li>
          <li><code>lead_source</code> - Origem do lead (ex: 'fb' para Facebook, 'ig' para Instagram)</li>
          <li><code>observations</code> - Observações adicionais</li>
          <li><code>meta_id</code> - ID da campanha/anúncio do Meta</li>
          <li><code>original_ad</code> - Nome do anúncio original</li>
          <li><code>original_adset</code> - Nome do conjunto de anúncios (segmentação)</li>
          <li><code>age_range</code> - Faixa etária do cliente</li>
        </ul>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Headers Necessários</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><code>apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdmpkeHhuZGFweHBzbG92cmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NzAxNzcsImV4cCI6MjA1NDI0NjE3N30.LntEpEZtnJ20ljHh_NKUUGK3yzivjEvFAGnFTa8DSV4</code></li>
            <li><code>Content-Type: application/json</code></li>
            <li><code>Prefer: return=minimal</code></li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Exemplo de Payload</h3>
          <div className="relative">
            <pre className="bg-secondary p-4 rounded-lg">
              {JSON.stringify(webhookExample, null, 2)}
            </pre>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => onCopy(JSON.stringify(webhookExample, null, 2))}
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Normalização de Origem</h3>
          <p className="text-muted-foreground">
            O sistema normaliza automaticamente as origens do lead:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><code>fb</code> → <code>facebook</code></li>
            <li><code>ig</code> → <code>instagram</code></li>
            <li><code>website</code> → <code>website</code></li>
            <li><code>whatsapp</code> → <code>whatsapp</code></li>
            <li><code>webhook</code> → <code>webhook</code></li>
            <li><code>indicacao</code> → <code>indicacao</code></li>
            <li>Outras origens desconhecidas serão marcadas como <code>outros</code></li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Respostas da API</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Sucesso (200 OK)</h4>
              <pre className="bg-secondary p-4 rounded-lg mt-2">
{JSON.stringify({
  success: true,
  message: 'Lead registrado com sucesso',
  normalized_source: 'facebook'
}, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium">Erro - Campo Obrigatório Ausente (400 Bad Request)</h4>
              <pre className="bg-secondary p-4 rounded-lg mt-2">
{JSON.stringify({
  error: 'Campo obrigatório ausente: name',
  received_payload: {
    phone_number: '+5511999999999'
  }
}, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="font-medium">Erro do Servidor (500 Internal Server Error)</h4>
              <pre className="bg-secondary p-4 rounded-lg mt-2">
{JSON.stringify({
  error: 'Erro ao inserir lead no banco de dados',
  details: 'Detalhes do erro específico'
}, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Fluxo do Lead</h3>
          <p className="text-muted-foreground">
            Quando um lead é recebido via webhook:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>A requisição é validada para garantir que todos os campos obrigatórios estão presentes</li>
            <li>A origem do lead é normalizada (ex: 'fb' → 'facebook')</li>
            <li>O lead é registrado na tabela <code>leads</code></li>
            <li>Um trigger automático cria um registro na tabela <code>clients</code></li>
            <li>O cliente é marcado com status <code>novo-cadastro</code></li>
            <li>Os dados de campanha (meta_id, original_ad, original_adset) são preservados</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

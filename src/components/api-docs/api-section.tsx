
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { webhookExample } from "./webhook-example"
import { Button } from "@/components/ui/button"
import { CopyIcon } from "lucide-react"

export function ApiSection() {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Base URL da API</AlertTitle>
        <AlertDescription>
          https://hkvjdxxndapxpslovrlc.supabase.co/functions/v1
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Cadastro de Leads (v1)</h3>
        <p className="text-muted-foreground">POST /create-client</p>
        <p>Esta versão continuará funcionando normalmente para compatibilidade.</p>
        
        <div className="relative mt-2">
          <pre className="bg-secondary p-4 rounded-lg">
            {JSON.stringify(webhookExample, null, 2)}
          </pre>
        </div>

        <h3 className="text-xl font-semibold mt-8">Cadastro de Leads (v2)</h3>
        <p className="text-muted-foreground">POST /create-client-v2</p>
        <p>Nova versão com campos obrigatórios adicionais para registro.</p>
        
        <div className="relative mt-2">
          <pre className="bg-secondary p-4 rounded-lg">
            {JSON.stringify({
              ...webhookExample,
              registration_cpf: "123.456.789-00",
              registration_name: "Nome do Responsável"
            }, null, 2)}
          </pre>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Campos Obrigatórios v2</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>name - Nome do lead</li>
            <li>phone_number - Telefone do lead</li>
            <li>registration_cpf - CPF do responsável pelo cadastro</li>
            <li>registration_name - Nome do responsável pelo cadastro</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Headers Necessários</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><code>apikey</code> - A chave anônima do projeto Supabase</li>
            <li><code>Authorization: Bearer token</code> - Token JWT para autenticação</li>
            <li><code>Content-Type: application/json</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

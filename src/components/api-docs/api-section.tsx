
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ApiSection() {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Base URL da API</AlertTitle>
        <AlertDescription>
          https://hkvjdxxndapxpslovrlc.supabase.co/rest/v1
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Autenticação</h3>
        <p>
          Todas as requisições precisam incluir os seguintes headers:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><code>apikey</code> - A chave anônima do projeto Supabase</li>
          <li><code>Authorization: Bearer token</code> - Token JWT para autenticação (opcional para endpoints públicos)</li>
        </ul>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Endpoints Disponíveis</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">GET /leads</h4>
              <p className="text-muted-foreground">Lista todos os leads (requer autenticação)</p>
            </div>
            <div>
              <h4 className="font-medium">POST /leads</h4>
              <p className="text-muted-foreground">Cria um novo lead (endpoint público)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

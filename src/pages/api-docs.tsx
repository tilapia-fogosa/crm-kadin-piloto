
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CopyIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const ApiDocsPage = () => {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "O exemplo foi copiado para sua área de transferência.",
    })
  }

  const webhookExample = {
    name: "João Silva",
    email: "joao@email.com",
    phone_number: "+5511999999999",
    lead_source: "website",
    observations: "Cliente interessado no curso de inglês",
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Documentação API</h1>
      
      <Tabs defaultValue="webhook">
        <TabsList>
          <TabsTrigger value="webhook">Webhook de Entrada</TabsTrigger>
          <TabsTrigger value="api">API REST</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook" className="space-y-6">
          <Alert>
            <AlertTitle>Endpoint do Webhook</AlertTitle>
            <AlertDescription>
              POST https://[seu-projeto].functions.supabase.co/webhook-leads
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Campos Obrigatórios</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><code>name</code> - Nome do cliente</li>
              <li><code>email</code> - Email do cliente</li>
              <li><code>phone_number</code> - Telefone do cliente</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6">Campos Opcionais</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><code>lead_source</code> - Origem do lead</li>
              <li><code>observations</code> - Observações adicionais</li>
            </ul>

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
                  onClick={() => copyToClipboard(JSON.stringify(webhookExample, null, 2))}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Alert>
            <AlertTitle>Base URL da API</AlertTitle>
            <AlertDescription>
              https://[seu-projeto].supabase.co/rest/v1
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Autenticação</h3>
            <p>
              Todas as requisições precisam incluir os seguintes headers:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><code>apikey</code> - Sua chave de API do Supabase</li>
              <li><code>Authorization</code> - Bearer token de autenticação</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ApiDocsPage

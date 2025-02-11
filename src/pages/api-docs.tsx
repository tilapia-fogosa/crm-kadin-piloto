
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

  // Exemplo atualizado removendo campos que não existem na tabela leads
  const webhookExample = {
    name: "João Silva",
    phone_number: "+5511999999999",
    email: "joao@email.com",
    lead_source: "website",
    observations: "Cliente interessado no curso de inglês"
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Documentação API</h1>
      
      <Tabs defaultValue="webhook">
        <TabsList>
          <TabsTrigger value="webhook">Webhook de Entrada</TabsTrigger>
          <TabsTrigger value="make">Integração Make</TabsTrigger>
          <TabsTrigger value="api">API REST</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook" className="space-y-6">
          <Alert>
            <AlertTitle>Endpoint do Webhook</AlertTitle>
            <AlertDescription>
              POST https://hkvjdxxndapxpslovrlc.supabase.co/rest/v1/leads
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
              <li><code>lead_source</code> - Origem do lead</li>
              <li><code>observations</code> - Observações adicionais</li>
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
                  onClick={() => copyToClipboard(JSON.stringify(webhookExample, null, 2))}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="make" className="space-y-6">
          <Alert>
            <AlertTitle>Configurando o Make (Integromat)</AlertTitle>
            <AlertDescription>
              Siga os passos abaixo para configurar um cenário no Make que envia dados para nosso webhook
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Passo a Passo</h3>
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <p className="font-medium">Criar um novo cenário no Make</p>
                <p className="text-muted-foreground">
                  Acesse o Make e crie um novo cenário. Escolha o trigger adequado para sua necessidade 
                  (por exemplo, um formulário ou planilha).
                </p>
              </li>
              <li>
                <p className="font-medium">Adicionar módulo HTTP</p>
                <p className="text-muted-foreground">
                  Adicione um novo módulo HTTP e configure como POST request para o endpoint:
                  <code className="block bg-secondary p-2 rounded mt-2">
                    https://hkvjdxxndapxpslovrlc.supabase.co/rest/v1/leads
                  </code>
                </p>
              </li>
              <li>
                <p className="font-medium">Headers da requisição</p>
                <p className="text-muted-foreground">
                  Configure os seguintes headers:
                </p>
                <pre className="bg-secondary p-4 rounded-lg mt-2">
{`apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdmpkeHhuZGFweHBzbG92cmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NzAxNzcsImV4cCI6MjA1NDI0NjE3N30.LntEpEZtnJ20ljHh_NKUUGK3yzivjEvFAGnFTa8DSV4
Content-Type: application/json
Prefer: return=minimal`}
                </pre>
              </li>
              <li>
                <p className="font-medium">Configurar o payload</p>
                <p className="text-muted-foreground">
                  No corpo da requisição, configure um JSON com os campos necessários mapeados do seu trigger:
                </p>
                <div className="relative mt-2">
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
              </li>
            </ol>

            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Testando a Integração</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use o botão "Test" no módulo HTTP para verificar se a conexão está funcionando</li>
                <li>Confira se o status code retornado é 201 (Created)</li>
                <li>Verifique se os dados aparecem na tabela de leads do seu projeto</li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Dicas Importantes</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Teste o cenário com dados reais antes de ativar</li>
                <li>Configure tratamento de erros no Make para ser notificado em caso de falhas</li>
                <li>Monitore os logs do webhook para garantir que os dados estão chegando corretamente</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ApiDocsPage

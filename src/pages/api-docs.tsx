
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { WebhookSection } from "@/components/api-docs/webhook-section"
import { ClientWebhookSection } from "@/components/api-docs/client-webhook-section"
import { MakeSection } from "@/components/api-docs/make-section"
import { ApiSection } from "@/components/api-docs/api-section"
import { UnitsTableSection } from "@/components/api-docs/units-table-section"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ExternalLink } from "lucide-react"
import LeadSourcesTable from "@/components/leads/LeadSourcesTable"

const ApiDocsPage = () => {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "O exemplo foi copiado para sua área de transferência.",
    })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Documentação API</h1>
      
      <Tabs defaultValue="webhook">
        <TabsList>
          <TabsTrigger value="webhook">Webhooks de Venda</TabsTrigger>
          <TabsTrigger value="client-webhook">Webhooks de Clientes</TabsTrigger>
          <TabsTrigger value="make">Integração Make</TabsTrigger>
          <TabsTrigger value="api">API REST</TabsTrigger>
          <TabsTrigger value="units">Tabela de Unidades</TabsTrigger>
          <TabsTrigger value="sources">Tabela de Origens</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook">
          <WebhookSection onCopy={copyToClipboard} />
        </TabsContent>

        <TabsContent value="client-webhook">
          <ClientWebhookSection onCopy={copyToClipboard} />
        </TabsContent>

        <TabsContent value="make">
          <MakeSection onCopy={copyToClipboard} />
        </TabsContent>

        <TabsContent value="api">
          <ApiSection />
        </TabsContent>

        <TabsContent value="units">
          <UnitsTableSection />
        </TabsContent>

        <TabsContent value="sources">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Origens de Leads Disponíveis</h2>
              <Button asChild variant="outline">
                <Link to="/clients/sources" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Gerenciar Origens
                </Link>
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-2">Sobre as Origens</h3>
              <p>Esta tabela mostra todas as origens de leads configuradas no sistema. Utilize o ID da origem quando enviar leads através da API ou integrações.</p>
              <ul className="list-disc pl-6 mt-2">
                <li>O campo <code>lead_source</code> deve conter o ID da origem (coluna esquerda)</li>
                <li>Novas origens podem ser adicionadas na página <Link to="/clients/sources" className="text-primary">Gerenciar Origens</Link></li>
              </ul>
            </div>
            
            <LeadSourcesTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ApiDocsPage


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { WebhookSection } from "@/components/api-docs/webhook-section"
import { MakeSection } from "@/components/api-docs/make-section"
import { ApiSection } from "@/components/api-docs/api-section"

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
          <TabsTrigger value="webhook">Webhooks</TabsTrigger>
          <TabsTrigger value="make">Integração Make</TabsTrigger>
          <TabsTrigger value="api">API REST</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook">
          <WebhookSection onCopy={copyToClipboard} />
        </TabsContent>

        <TabsContent value="make">
          <MakeSection onCopy={copyToClipboard} />
        </TabsContent>

        <TabsContent value="api">
          <ApiSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ApiDocsPage

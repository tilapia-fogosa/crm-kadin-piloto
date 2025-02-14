
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CopyIcon } from "lucide-react"
import { webhookExample } from "./webhook-example"

interface MakeSectionProps {
  onCopy: (text: string) => void
}

export function MakeSection({ onCopy }: MakeSectionProps) {
  return (
    <div className="space-y-6">
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
              Adicione um novo módulo "HTTP Make a Request" e configure como POST request para o endpoint:
              <code className="block bg-secondary p-2 rounded mt-2">
                https://hkvjdxxndapxpslovrlc.supabase.co/functions/v1/create-client
              </code>
            </p>
          </li>
          <li>
            <p className="font-medium">Configurar os headers</p>
            <p className="text-muted-foreground">
              No módulo HTTP, configure os seguintes headers:
            </p>
            <pre className="bg-secondary p-4 rounded-lg mt-2 overflow-x-auto">
{`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdmpkeHhuZGFweHBzbG92cmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NzAxNzcsImV4cCI6MjA1NDI0NjE3N30.LntEpEZtnJ20ljHh_NKUUGK3yzivjEvFAGnFTa8DSV4
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdmpkeHhuZGFweHBzbG92cmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NzAxNzcsImV4cCI6MjA1NDI0NjE3N30.LntEpEZtnJ20ljHh_NKUUGK3yzivjEvFAGnFTa8DSV4
Content-Type: application/json
Prefer: return=minimal`}
            </pre>
          </li>
          <li>
            <p className="font-medium">Configurar o payload</p>
            <p className="text-muted-foreground">
              No corpo da requisição (Body), configure um JSON com os campos necessários mapeados do seu trigger:
            </p>
            <div className="relative mt-2">
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
          </li>
        </ol>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Testando a Integração</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use o botão "Test" no módulo HTTP para verificar se a conexão está funcionando</li>
            <li>Confira se o status code retornado é 201 (Created) ou 200 (OK)</li>
            <li>Verifique se os dados aparecem na tabela de clientes do seu projeto</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Solução de Problemas</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Se receber erro 401 (Unauthorized), verifique se os headers estão configurados corretamente, especialmente o Authorization e apikey</li>
            <li>Se receber erro 400 (Bad Request), verifique se o JSON do payload está correto e contém os campos obrigatórios</li>
            <li>Confira se está usando o método POST e não GET ou outro método</li>
            <li>Certifique-se de que a chave API está correta no header Authorization</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Dicas Importantes</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Teste o cenário com dados reais antes de ativar</li>
            <li>Configure tratamento de erros no Make para ser notificado em caso de falhas</li>
            <li>Monitore os logs do webhook para garantir que os dados estão chegando corretamente</li>
            <li>Mantenha as chaves API em local seguro e não as compartilhe</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

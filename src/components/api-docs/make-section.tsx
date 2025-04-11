
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CopyIcon, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"

const makeExample = {
  // Campos obrigatórios
  name: "João Silva",
  phone_number: "+5511999999999",
  unit_number: 1,
  registration_cpf: "123.456.789-00",
  registration_name: "Maria Silva",
  
  // Campos opcionais
  email: "joao@email.com",
  lead_source: "facebook", // ID da origem cadastrada no sistema
  observations: "Cliente interessado no curso de inglês",
  meta_id: "123456789",
  original_ad: "Anúncio Principal - Curso de Inglês",
  original_adset: "Segmentação - 25-35 anos - São Paulo",
  age_range: "25-35"
}

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
                https://hkvjdxxndapxpslovrlc.supabase.co/functions/v1/create-client-v2
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
                {JSON.stringify(makeExample, null, 2)}
              </pre>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onCopy(JSON.stringify(makeExample, null, 2))}
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
          </li>
        </ol>

        <div className="mt-6 bg-secondary p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Campos Obrigatórios</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><code>name</code> - Nome do lead</li>
            <li><code>phone_number</code> - Telefone do lead</li>
            <li><code>unit_number</code> - Número da unidade</li>
            <li><code>registration_cpf</code> - CPF do responsável pelo cadastro</li>
            <li><code>registration_name</code> - Nome do responsável pelo cadastro</li>
          </ul>
        </div>

        <div className="mt-6 bg-secondary p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Campos Opcionais</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><code>email</code> - E-mail do lead</li>
            <li><code>lead_source</code> - Origem do lead (consulte a <Link to="/clients/sources" className="text-primary font-medium flex items-center gap-1 inline-flex">Tabela de Origens <ExternalLink className="h-3 w-3" /></Link>)</li>
            <li><code>observations</code> - Observações adicionais</li>
            <li><code>meta_id</code> - ID do Meta para rastreamento</li>
            <li><code>original_ad</code> - Nome do anúncio original</li>
            <li><code>original_adset</code> - Nome do conjunto de anúncios</li>
            <li><code>age_range</code> - Faixa etária do lead</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Origens de Leads Suportadas</h3>
          <p className="text-muted-foreground mb-3">
            Para o campo <code>lead_source</code>, utilize os IDs disponíveis na página de origens. Acesse a lista completa:
          </p>
          <Button variant="outline" className="mb-4" asChild>
            <Link to="/clients/sources" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Ver Tabela de Origens
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            * Você pode adicionar novas origens de leads na página de origens, que serão automaticamente 
            reconhecidas pelo sistema.
          </p>
        </div>

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

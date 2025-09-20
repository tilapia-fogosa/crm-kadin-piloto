import { RotaProtegidaPorFuncionalidade } from "@/components/features/RotaProtegidaPorFuncionalidade";
import { ProtecaoFuncionalidade } from "@/components/features/ProtecaoFuncionalidade";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Log: Página de Automações de WhatsApp - Landing page inicial
export default function AutomacoesWhatsAppPage() {
  console.log('AutomacoesWhatsAppPage: Renderizando página de Automações de WhatsApp');
  
  return (
    <RotaProtegidaPorFuncionalidade funcionalidade="automacao_whatsapp">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Automações de WhatsApp</h1>
          <p className="text-muted-foreground">
            Configure e gerencie suas automações de WhatsApp para otimizar o atendimento aos clientes.
          </p>
        </div>

        <ProtecaoFuncionalidade funcionalidade="automacao_whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Em Desenvolvimento</CardTitle>
              <CardDescription>
                Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">🚧</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Funcionalidade em Construção</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Estamos trabalhando para trazer as melhores ferramentas de automação de WhatsApp. 
                  Em breve você poderá criar fluxos automatizados para melhorar seu atendimento.
                </p>
              </div>
            </CardContent>
          </Card>
        </ProtecaoFuncionalidade>
      </div>
    </RotaProtegidaPorFuncionalidade>
  );
}
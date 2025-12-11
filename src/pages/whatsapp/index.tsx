/**
 * Página principal do WhatsApp
 * 
 * Log: Componente raiz da página de WhatsApp
 * Etapas de renderização:
 * 1. Exibe header com título e descrição
 * 2. Renderiza Tabs com duas abas: Conversas e Configuração
 * 3. Tab "Conversas": exibe ConversationsTab (mockup estilo WhatsApp)
 * 4. Tab "Configuração": exibe ConfigurationTab (status: ativo/inativo)
 * 
 * Nota: Esta página não aparece no sidebar, acessível apenas via /whatsapp
 * 
 * Utiliza cores do sistema conforme design system
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Settings } from "lucide-react";
import { ConversationsTab } from "./components/ConversationsTab";
import { ConfigurationTab } from "./components/ConfigurationTab";

export default function WhatsAppPage() {
  console.log('WhatsAppPage: Renderizando página de WhatsApp');

  return (
    <div className="w-full max-w-full h-[calc(100vh-1rem)] flex flex-col gap-1 p-2 overflow-hidden">
      {/* Header Compacto */}
      <div className="flex-shrink-0 flex items-center gap-4">
        <h1 className="text-lg font-bold">WhatsApp</h1>
        <p className="text-muted-foreground text-[10px] hidden md:block">
          Gerencie conversas e configurações
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="conversas" className="w-full max-w-full flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full max-w-xs grid-cols-2 flex-shrink-0 h-8">
          <TabsTrigger value="conversas" className="gap-1.5 text-sm">
            <MessageCircle className="h-3.5 w-3.5" />
            Conversas
          </TabsTrigger>
          <TabsTrigger value="configuracao" className="gap-1.5 text-sm">
            <Settings className="h-3.5 w-3.5" />
            Configuração
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversas" className="w-full max-w-full flex-1 mt-1 overflow-hidden data-[state=inactive]:hidden">
          <ConversationsTab />
        </TabsContent>

        <TabsContent value="configuracao" className="w-full max-w-full flex-1 mt-1 overflow-hidden data-[state=inactive]:hidden">
          <ConfigurationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

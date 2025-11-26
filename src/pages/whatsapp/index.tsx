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
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold">WhatsApp</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie suas conversas e configurações do WhatsApp
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="conversas" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full max-w-md grid-cols-2 flex-shrink-0">
          <TabsTrigger value="conversas" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversas
          </TabsTrigger>
          <TabsTrigger value="configuracao" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversas" className="flex-1 mt-4 overflow-hidden data-[state=inactive]:hidden">
          <ConversationsTab />
        </TabsContent>

        <TabsContent value="configuracao" className="flex-1 mt-4 overflow-hidden data-[state=inactive]:hidden">
          <ConfigurationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

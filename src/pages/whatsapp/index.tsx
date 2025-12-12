import { useState } from "react";
import { MessageCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ConversationsTab } from "./components/ConversationsTab";
import { ConfigurationTab } from "./components/ConfigurationTab";

export default function WhatsAppPage() {
  console.log('WhatsAppPage: Renderizando página de WhatsApp (Sem Abas)');

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-background">
      {/* Header Ultra Compacto */}
      <div className="flex-shrink-0 h-[40px] min-h-[40px] flex items-center justify-between px-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-green-500 rounded-full p-1">
              <MessageCircle className="h-3 w-3 text-white" />
            </div>
            <h1 className="text-sm font-bold text-foreground">WhatsApp CRM</h1>
          </div>
          <div className="h-4 w-px bg-border mx-1" />
          <p className="text-[10px] text-muted-foreground hidden lg:block">
            Central de Atendimento
          </p>
        </div>

        {/* Botão de Configuração */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-full hover:bg-muted"
          onClick={() => setIsConfigOpen(true)}
          title="Configurações"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Conteúdo Principal - Layout Direto */}
      <div className="flex-1 overflow-hidden relative w-full">
        <ConversationsTab />
      </div>

      {/* Gaveta de Configuração */}
      <Sheet open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <SheetContent side="right" className="w-[90vw] sm:w-[800px] sm:max-w-[85vw] overflow-y-auto p-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle>Configurações do WhatsApp</SheetTitle>
            <SheetDescription>
              Gerencie a conexão e preferências do sistema
            </SheetDescription>
          </SheetHeader>

          <div className="p-6">
            <ConfigurationTab />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

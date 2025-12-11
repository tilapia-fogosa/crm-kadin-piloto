/**
 * Lista de conversas (sidebar esquerdo)
 * 
 * Log: Componente que renderiza a lista de conversas
 * Etapas:
 * 1. Busca conversas usando useConversations hook
 * 2. Implementa busca/filtro por nome do cliente
 * 3. Renderiza input de busca no topo
 * 4. Exibe lista de ConversationItem em ScrollArea
 * 5. Mostra loading ou mensagem de "sem conversas"
 * 
 * Utiliza cores do sistema: card, border, muted
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, MessageSquarePlus } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { useConversations } from "../hooks/useConversations";
import { NewClientDrawer } from "./NewClientDrawer";
import { SendToUnregisteredDrawer } from "./SendToUnregisteredDrawer";
import { useQueryClient } from "@tanstack/react-query";

interface ConversationListProps {
  selectedClientId: string | null;
  onSelectClient: (clientId: string, isUnregistered?: boolean) => void;
  onActivityClick: (clientId: string) => void;
  onToggleTipoAtendimento: (clientId: string, currentTipo: 'bot' | 'humano') => void;
}

export function ConversationList({ selectedClientId, onSelectClient, onActivityClick, onToggleTipoAtendimento }: ConversationListProps) {
  console.log('ConversationList: Renderizando lista de conversas');

  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showNewLeadOnly, setShowNewLeadOnly] = useState(false);
  const [showUnregisteredOnly, setShowUnregisteredOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPhoneNumber, setDrawerPhoneNumber] = useState("");
  const [sendUnregisteredDrawerOpen, setSendUnregisteredDrawerOpen] = useState(false);
  
  const { data: conversations, isLoading } = useConversations();
  const queryClient = useQueryClient();

  // Handler para abrir o drawer de cadastro
  const handleCadastrarClick = (phoneNumber: string) => {
    console.log('ConversationList: Abrindo drawer para cadastrar telefone:', phoneNumber);
    setDrawerPhoneNumber(phoneNumber);
    setDrawerOpen(true);
  };

  // Handler para quando o cadastro for bem sucedido
  const handleCadastroSuccess = () => {
    console.log('ConversationList: Cadastro bem sucedido, invalidando queries');
    queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
  };

  // Filtrar conversas pela busca
  let filteredConversations = conversations?.filter(conv =>
    conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.phoneNumber.includes(searchQuery)
  );

  // Aplicar filtros exclusivos primeiro (Novo Cadastro ou Sem Cadastro)
  if (showNewLeadOnly) {
    // Mostrar APENAS conversas de Novo Cadastro
    filteredConversations = filteredConversations?.filter(conv => !conv.isUnregistered && conv.isNewLead);
  } else if (showUnregisteredOnly) {
    // Mostrar APENAS conversas Sem Cadastro
    filteredConversations = filteredConversations?.filter(conv => conv.isUnregistered);
  } else {
    // Por padrão, EXCLUIR conversas de Novo Cadastro e Sem Cadastro
    filteredConversations = filteredConversations?.filter(conv => !conv.isNewLead && !conv.isUnregistered);
  }

  // Depois aplicar filtro de não lidas (pode ser combinado com qualquer um acima)
  if (showUnreadOnly) {
    filteredConversations = filteredConversations?.filter(conv => conv.unreadCount > 0);
  }

  // Calcular totais corretamente para cada categoria
  // Log: Contadores agora contam apenas dentro da sua categoria específica
  // - Não lidas: conta apenas conversas normais (não Novo Cadastro, não Sem Cadastro) que têm unreadCount > 0
  // - Novo Cadastro: conta clientes cadastrados que são novos leads
  // - Sem Cadastro: conta números não cadastrados
  const conversasNormais = conversations?.filter(conv => !conv.isNewLead && !conv.isUnregistered) || [];
  const totalUnread = conversasNormais.filter(conv => conv.unreadCount > 0).length;
  const totalNewLead = conversations?.filter(conv => !conv.isUnregistered && conv.isNewLead).length || 0;
  const totalUnregistered = conversations?.filter(conv => conv.isUnregistered).length || 0;

  console.log('ConversationList: Conversas filtradas:', filteredConversations?.length);
  console.log('ConversationList: Totais - Não lidas:', totalUnread, 'Novo Cadastro:', totalNewLead, 'Sem Cadastro:', totalUnregistered);

  return (
    <div className="w-full md:w-[420px] flex flex-col border-r border-border bg-card h-full">
      {/* Header com busca e filtros */}
      <div className="p-3 border-b border-border bg-card space-y-3">
        {/* Campo de busca com botão de nova mensagem */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="default"
            size="icon"
            onClick={() => setSendUnregisteredDrawerOpen(true)}
            title="Enviar mensagem para número não cadastrado"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Filtros com switches em uma linha */}
        <div className="flex items-end gap-6">
          <div className="flex flex-col items-center gap-1">
            <Label htmlFor="unread-filter" className="text-xs cursor-pointer whitespace-nowrap text-muted-foreground">
              Não lidas {totalUnread > 0 && `(${totalUnread})`}
            </Label>
            <Switch
              id="unread-filter"
              checked={showUnreadOnly}
              onCheckedChange={setShowUnreadOnly}
            />
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <Label htmlFor="newlead-filter" className="text-xs cursor-pointer whitespace-nowrap text-muted-foreground">
              Novo Cadastro {totalNewLead > 0 && `(${totalNewLead})`}
            </Label>
            <Switch
              id="newlead-filter"
              checked={showNewLeadOnly}
              onCheckedChange={setShowNewLeadOnly}
            />
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <Label htmlFor="unregistered-filter" className="text-xs cursor-pointer whitespace-nowrap text-muted-foreground">
              Sem Cadastro {totalUnregistered > 0 && `(${totalUnregistered})`}
            </Label>
            <Switch
              id="unregistered-filter"
              checked={showUnregisteredOnly}
              onCheckedChange={setShowUnregisteredOnly}
            />
          </div>
        </div>
      </div>

      {/* Lista de conversas */}
      <ScrollArea className="flex-1">
        {isLoading && (
          <div className="p-4 text-center text-muted-foreground">
            Carregando conversas...
          </div>
        )}

        {!isLoading && filteredConversations && filteredConversations.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
          </div>
        )}

        {!isLoading && filteredConversations && filteredConversations.map((conversation) => (
          <ConversationItem
            key={conversation.clientId}
            conversation={conversation}
            isSelected={selectedClientId === conversation.clientId}
            onClick={() => onSelectClient(conversation.clientId, conversation.isUnregistered)}
            onActivityClick={conversation.isUnregistered ? undefined : () => onActivityClick(conversation.clientId)}
            onToggleTipoAtendimento={conversation.isUnregistered ? undefined : () => onToggleTipoAtendimento(conversation.clientId, conversation.tipoAtendimento)}
            onCadastrarClick={handleCadastrarClick}
          />
        ))}
      </ScrollArea>

      {/* Drawer de cadastro de novo cliente */}
      <NewClientDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        phoneNumber={drawerPhoneNumber}
        onSuccess={handleCadastroSuccess}
      />

      {/* Drawer para enviar mensagem para número não cadastrado */}
      <SendToUnregisteredDrawer
        open={sendUnregisteredDrawerOpen}
        onOpenChange={setSendUnregisteredDrawerOpen}
      />
    </div>
  );
}

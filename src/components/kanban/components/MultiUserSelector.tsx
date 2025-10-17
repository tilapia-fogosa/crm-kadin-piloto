/**
 * Componente MultiUserSelector
 * 
 * @description
 * Seletor multi-usuário baseado em MultiSourceSelector (/commercial-stats)
 * Permite selecionar múltiplos usuários ou "Todos perfis"
 * 
 * @features
 * - Opção "Todos perfis" (selectedUserIds = [])
 * - Checkboxes para seleção individual
 * - Botões Confirmar/Cancelar (não fecha ao clicar nos items)
 * - Estado temporário para seleções
 * 
 * @logs
 * - Abertura do Popover
 * - Confirmação de seleção
 * - Cancelamento
 */

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface UnitUser {
  id: string;
  full_name: string;
}

interface MultiUserSelectorProps {
  availableUsers: UnitUser[];
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  isLoading?: boolean;
}

export function MultiUserSelector({ 
  availableUsers, 
  selectedUserIds, 
  onChange,
  isLoading = false
}: MultiUserSelectorProps) {
  // Estado local para seleções temporárias
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  // Sincroniza o estado temporário quando as props ou popover mudam
  useEffect(() => {
    console.log('👥 [MultiUserSelector] Sincronizando seleções:', selectedUserIds);
    setTempSelectedIds(selectedUserIds);
  }, [selectedUserIds, open]);
  
  // Verificações de segurança
  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-[180px] justify-start">
        Carregando usuários...
      </Button>
    );
  }
  
  if (!availableUsers || availableUsers.length === 0) {
    return (
      <Button variant="outline" disabled className="w-[180px] justify-start">
        Nenhum usuário disponível
      </Button>
    );
  }
  
  // Verifica se "Todos perfis" está selecionado
  const allSelected = tempSelectedIds.length === 0;
  
  // Gerencia a seleção de "Todos perfis"
  const handleSelectAll = () => {
    console.log('👥 [MultiUserSelector] Toggle "Todos perfis"');
    // Sempre volta para "Todos perfis" (array vazio)
    setTempSelectedIds([]);
  };
  
  // Gerencia a seleção individual de usuários
  const handleSelectUser = (userId: string) => {
    console.log('👥 [MultiUserSelector] Toggle usuário:', userId);
    
    let newSelected = [...tempSelectedIds];
    
    // Alternar a seleção do usuário
    if (newSelected.includes(userId)) {
      newSelected = newSelected.filter(id => id !== userId);
    } else {
      newSelected.push(userId);
    }
    
    setTempSelectedIds(newSelected);
  };
  
  // Função para aplicar as seleções
  const handleConfirm = () => {
    console.log('👥 [MultiUserSelector] Seleção confirmada:', tempSelectedIds);
    onChange(tempSelectedIds);
    setOpen(false);
  };
  
  // Função para cancelar as alterações
  const handleCancel = () => {
    console.log('👥 [MultiUserSelector] Cancelado - revertendo para:', selectedUserIds);
    setTempSelectedIds(selectedUserIds);
    setOpen(false);
  };
  
  // Evento de abertura do Popover
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      console.log('👥 [MultiUserSelector] Popover aberto');
    }
    setOpen(isOpen);
  };
  
  // Texto que mostra no botão principal
  const getButtonText = () => {
    if (selectedUserIds.length === 0) {
      return "Todos os usuários";
    }
    
    if (selectedUserIds.length === 1) {
      const selectedUser = availableUsers.find(user => user.id === selectedUserIds[0]);
      return selectedUser?.full_name || "1 usuário";
    }
    
    // Múltiplos usuários: "Nome +N"
    const firstName = availableUsers.find(user => user.id === selectedUserIds[0])?.full_name || "";
    const remaining = selectedUserIds.length - 1;
    return `${firstName} +${remaining}`;
  };
  
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[180px] justify-start text-left font-normal"
        >
          <span className="truncate">{getButtonText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <div className="p-2">
          <div className="space-y-2">
            {/* Opção "Todos perfis" separada por borda */}
            <div className="border-b pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all-users" 
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all-users"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Todos perfis
                </label>
              </div>
            </div>
            
            {/* Lista de usuários individuais com scroll */}
            <div className="max-h-[200px] overflow-auto space-y-2 py-1">
              {availableUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`user-${user.id}`} 
                    checked={tempSelectedIds.includes(user.id)}
                    onCheckedChange={() => handleSelectUser(user.id)}
                  />
                  <label
                    htmlFor={`user-${user.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {user.full_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex items-center justify-between mt-4 border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirm}
            >
              <Check className="h-4 w-4 mr-1" />
              Confirmar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ChevronDown, Users } from "lucide-react";

/**
 * Log: Interface para props do componente MultipleUserSelect
 * Define as propriedades necessárias para seleção múltipla de usuários
 */
interface MultipleUserSelectProps {
  selectedUsers: string[];
  onUsersChange: (userIds: string[]) => void;
  disabled?: boolean;
}

/**
 * Log: Componente para seleção múltipla de usuários
 * Baseado no MultipleUnitSelect mas adaptado para usuários do sistema
 * Permite selecionar múltiplos usuários usando checkboxes em dropdown
 */
export function MultipleUserSelect({ selectedUsers, onUsersChange, disabled }: MultipleUserSelectProps) {
  console.log('MultipleUserSelect renderizado com usuários selecionados:', selectedUsers);
  
  const [open, setOpen] = useState(false);

  // Query para buscar usuários disponíveis
  const { data: users, isLoading: loading } = useQuery({
    queryKey: ['users-for-multiselect'],
    queryFn: async () => {
      console.log('Buscando usuários para multi-select');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }
      
      console.log('Usuários carregados para multi-select:', data?.length);
      return data;
    },
  });

  /**
   * Log: Função para alternar seleção de usuário
   * Adiciona ou remove usuário da lista de selecionados
   */
  const toggleUser = (userId: string) => {
    console.log('Alternando seleção do usuário:', userId);
    
    const newSelectedUsers = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    
    console.log('Nova lista de usuários selecionados:', newSelectedUsers);
    onUsersChange(newSelectedUsers);
  };

  // Criar lista de nomes dos usuários selecionados para exibição
  const selectedUserNames = selectedUsers.map(userId => {
    const user = users?.find(u => u.id === userId);
    return user?.full_name || 'Usuário não encontrado';
  });

  return (
    <Select open={open} onOpenChange={setOpen}>
      <SelectTrigger 
        disabled={disabled}
        className="min-h-[2.5rem] h-auto"
      >
        <div className="flex items-center gap-2 flex-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          
          {selectedUsers.length === 0 ? (
            <span className="text-muted-foreground">Todos os usuários</span>
          ) : (
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedUserNames.map((userName, index) => (
                <Badge key={selectedUsers[index]} variant="secondary" className="text-xs">
                  {userName}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUser(selectedUsers[index]);
                    }}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectTrigger>
      
      <SelectContent>
        {loading ? (
          <div className="p-2 text-center text-muted-foreground">
            Carregando usuários...
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="p-1">
              {users?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                  onClick={() => toggleUser(user.id)}
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                  <span className="text-sm">
                    {user.full_name || 'Usuário sem nome'}
                  </span>
                </div>
              ))}
              
              {/* Indicador visual de mais conteúdo */}
              {users && users.length > 8 && (
                <div className="text-xs text-muted-foreground text-center py-2 border-t">
                  Role para ver mais usuários
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </SelectContent>
    </Select>
  );
}
/**
 * Componente de filtro multi-usuário para o painel de produtividade
 * 
 * @description
 * Permite que franqueados e admins filtrem as estatísticas de produtividade
 * por múltiplos usuários. Seleção interna com checkmarks.
 */

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";

interface UnitUser {
  id: string;
  full_name: string;
}

interface UserProductivityFilterProps {
  selectedUserIds: string[];
  onUsersChange: (userIds: string[]) => void;
  availableUsers: UnitUser[];
}

export function UserProductivityFilter({
  selectedUserIds,
  onUsersChange,
  availableUsers,
}: UserProductivityFilterProps) {
  console.log('🎯 [UserProductivityFilter] Renderizando filtro');
  console.log('🎯 [UserProductivityFilter] Usuários selecionados:', selectedUserIds);
  console.log('🎯 [UserProductivityFilter] Usuários disponíveis:', availableUsers);

  /**
   * Obtém o texto a ser exibido no SelectTrigger
   */
  const getDisplayText = () => {
    if (selectedUserIds.length === 0) return 'Todos os usuários';
    if (selectedUserIds.length === 1) {
      const user = availableUsers.find(u => u.id === selectedUserIds[0]);
      return user?.full_name || 'Usuário';
    }
    const firstUser = availableUsers.find(u => u.id === selectedUserIds[0]);
    return `${firstUser?.full_name} +${selectedUserIds.length - 1}`;
  };

  /**
   * Handler para toggle de seleção (adiciona ou remove)
   */
  const handleSelectChange = (value: string) => {
    console.log('🎯 [UserProductivityFilter] Seleção alterada:', value);
    
    if (value === "all") {
      console.log('🎯 [UserProductivityFilter] Selecionado "Todos" - limpando filtros');
      onUsersChange([]);
      return;
    }

    // Toggle: adiciona se não está, remove se já está
    if (selectedUserIds.includes(value)) {
      const newSelection = selectedUserIds.filter(id => id !== value);
      console.log('🎯 [UserProductivityFilter] Removendo usuário - nova seleção:', newSelection);
      onUsersChange(newSelection);
    } else {
      const newSelection = [...selectedUserIds, value];
      console.log('🎯 [UserProductivityFilter] Adicionando usuário - nova seleção:', newSelection);
      onUsersChange(newSelection);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-white text-xs font-medium">
        Filtro
      </Label>
      
      <Select onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[200px] bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
          <SelectValue>
            {getDisplayText()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background border-border z-50">
          {/* Opção "Todos perfis" */}
          <SelectItem value="all" className="cursor-pointer">
            <div className="flex items-center gap-2">
              {selectedUserIds.length === 0 && (
                <Check className="h-4 w-4 text-orange-500" />
              )}
              <span>Todos perfis</span>
            </div>
          </SelectItem>
          
          {/* Lista de usuários com checkmarks */}
          {availableUsers.map(user => (
            <SelectItem key={user.id} value={user.id} className="cursor-pointer">
              <div className="flex items-center gap-2">
                {selectedUserIds.includes(user.id) && (
                  <Check className="h-4 w-4 text-orange-500" />
                )}
                <span>{user.full_name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

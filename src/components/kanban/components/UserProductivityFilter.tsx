/**
 * Componente de filtro multi-usuário para o painel de produtividade
 * 
 * @description
 * Permite que franqueados e admins filtrem as estatísticas de produtividade
 * por múltiplos usuários. Apenas visível para usuários com permissão adequada.
 */

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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

  // Handler para adicionar usuário
  const handleAddUser = (userId: string) => {
    console.log('🎯 [UserProductivityFilter] Adicionando usuário:', userId);
    
    if (userId === "all") {
      console.log('🎯 [UserProductivityFilter] Selecionado "Todos" - limpando filtros');
      onUsersChange([]);
      return;
    }

    if (!selectedUserIds.includes(userId)) {
      const newSelection = [...selectedUserIds, userId];
      console.log('🎯 [UserProductivityFilter] Nova seleção:', newSelection);
      onUsersChange(newSelection);
    }
  };

  // Handler para remover usuário
  const handleRemoveUser = (userId: string) => {
    console.log('🎯 [UserProductivityFilter] Removendo usuário:', userId);
    const newSelection = selectedUserIds.filter(id => id !== userId);
    console.log('🎯 [UserProductivityFilter] Nova seleção:', newSelection);
    onUsersChange(newSelection);
  };

  // Usuários não selecionados disponíveis para adicionar
  const availableToAdd = availableUsers.filter(
    user => !selectedUserIds.includes(user.id)
  );

  return (
    <div className="mb-4 space-y-2">
      <Label className="text-white text-sm font-medium">
        Filtrar por usuário
      </Label>
      
      <div className="flex items-center gap-2 flex-wrap">
        {/* Badges dos usuários selecionados */}
        {selectedUserIds.length > 0 ? (
          <>
            {selectedUserIds.map(userId => {
              const user = availableUsers.find(u => u.id === userId);
              return (
                <Badge
                  key={userId}
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  {user?.full_name || 'Usuário desconhecido'}
                  <button
                    onClick={() => handleRemoveUser(userId)}
                    className="ml-2 hover:text-red-300 transition-colors"
                    aria-label="Remover filtro"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </>
        ) : (
          <Badge
            variant="secondary"
            className="bg-white/20 text-white"
          >
            Todos os usuários
          </Badge>
        )}

        {/* Select para adicionar mais usuários */}
        {availableToAdd.length > 0 && (
          <Select onValueChange={handleAddUser}>
            <SelectTrigger className="w-[200px] bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
              <SelectValue placeholder="Adicionar filtro..." />
            </SelectTrigger>
            <SelectContent>
              {selectedUserIds.length > 0 && (
                <SelectItem value="all">Todos os usuários</SelectItem>
              )}
              {availableToAdd.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

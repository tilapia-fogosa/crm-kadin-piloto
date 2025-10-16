/**
 * Componente de filtro multi-usuário para o painel de produtividade
 * 
 * @description
 * Permite que franqueados e admins filtrem as estatísticas de produtividade
 * por múltiplos usuários. Usa MultiUserSelector (padrão /commercial-stats).
 */

import { Label } from "@/components/ui/label";
import { MultiUserSelector } from "./MultiUserSelector";

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
  console.log('🎯 [UserProductivityFilter] Renderizando com MultiUserSelector');
  console.log('🎯 [UserProductivityFilter] Usuários selecionados:', selectedUserIds);
  console.log('🎯 [UserProductivityFilter] Usuários disponíveis:', availableUsers);

  return (
    <div className="space-y-2">
      <Label className="text-white text-xs font-medium">
        Filtro
      </Label>
      
      <MultiUserSelector
        availableUsers={availableUsers}
        selectedUserIds={selectedUserIds}
        onChange={onUsersChange}
      />
    </div>
  );
}

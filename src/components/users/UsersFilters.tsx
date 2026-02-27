import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

/** Lista fixa de funções disponíveis no sistema */
const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'consultor', label: 'Consultor' },
  { value: 'franqueado', label: 'Franqueado' },
  { value: 'educador', label: 'Educador' },
  { value: 'gestor_pedagogico', label: 'Gestor Pedagógico' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'estagiario', label: 'Estagiário' },
  { value: 'sala', label: 'Sala' },
  { value: 'sdr', label: 'SDR' },
];

interface UsersFiltersProps {
  searchName: string;
  setSearchName: (v: string) => void;
  searchEmail: string;
  setSearchEmail: (v: string) => void;
  filterUnit: string;
  setFilterUnit: (v: string) => void;
  filterRole: string;
  setFilterRole: (v: string) => void;
  uniqueUnits: string[];
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Componente de filtros para a página de usuários.
 * Exibe inputs de texto para nome/email e selects para unidade/função.
 */
export function UsersFilters({
  searchName, setSearchName,
  searchEmail, setSearchEmail,
  filterUnit, setFilterUnit,
  filterRole, setFilterRole,
  uniqueUnits,
  clearFilters,
  hasActiveFilters,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
      {/* Filtro por nome */}
      <div className="flex flex-col gap-1 min-w-[180px] flex-1">
        <label className="text-xs font-medium text-muted-foreground">Nome</label>
        <Input
          placeholder="Buscar por nome..."
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
        />
      </div>

      {/* Filtro por email */}
      <div className="flex flex-col gap-1 min-w-[180px] flex-1">
        <label className="text-xs font-medium text-muted-foreground">Email</label>
        <Input
          placeholder="Buscar por email..."
          value={searchEmail}
          onChange={e => setSearchEmail(e.target.value)}
        />
      </div>

      {/* Filtro por unidade */}
      <div className="flex flex-col gap-1 min-w-[180px]">
        <label className="text-xs font-medium text-muted-foreground">Unidade</label>
        <Select value={filterUnit} onValueChange={setFilterUnit}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {uniqueUnits.map(unit => (
              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por função */}
      <div className="flex flex-col gap-1 min-w-[180px]">
        <label className="text-xs font-medium text-muted-foreground">Função</label>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {ROLES.map(role => (
              <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botão limpar filtros */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="mb-0.5">
          <X className="mr-1 h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}

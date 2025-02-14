
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "./types";
import { useUnits } from "@/hooks/useUnits";

interface UserFormFieldsProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedUnits: string[];
  setSelectedUnits: (units: string[]) => void;
  isEditing: boolean;
  isAdmin: boolean;
}

export function UserFormFields({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  selectedUnits,
  setSelectedUnits,
  isEditing,
  isAdmin,
}: UserFormFieldsProps) {
  const { data: units } = useUnits();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      {!isEditing && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">Perfil de Acesso</Label>
        <Select 
          value={role} 
          onValueChange={(value: UserRole) => setRole(value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um perfil" />
          </SelectTrigger>
          <SelectContent>
            {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
            <SelectItem value="consultor">Consultor</SelectItem>
            <SelectItem value="franqueado">Franqueado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Unidades (selecione uma ou mais)</Label>
        <div className="grid grid-cols-2 gap-2">
          {units?.map((unit) => (
            <Button
              key={unit.id}
              type="button"
              variant={selectedUnits.includes(unit.id) ? "default" : "outline"}
              className="w-full"
              onClick={() => {
                setSelectedUnits(prev => {
                  if (prev.includes(unit.id)) {
                    return prev.filter(id => id !== unit.id);
                  }
                  return [...prev, unit.id];
                });
              }}
            >
              {unit.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

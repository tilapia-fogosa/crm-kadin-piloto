
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { UnitUserActions } from "./unit-user-actions";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface UnitUser {
  id: string;
  active: boolean;
  role: string;
  user_id: string;
  user: {
    full_name: string;
    email: string;
  };
  accessInfo?: {
    last_sign_in_at: string | null;
    has_first_access: boolean;
  } | null;
}

interface UnitUsersTableProps {
  unitId: string;
  onEdit: (user: UnitUser) => void;
}

export function UnitUsersTable({ unitId, onEdit }: UnitUsersTableProps) {
  const { data: users, isLoading } = useQuery({
    queryKey: ['unit-users', unitId],
    queryFn: async () => {
      console.log('Buscando usuários da unidade:', unitId);
      
      const { data: unitUsers, error: unitUsersError } = await supabase
        .from('unit_users')
        .select(`
          id,
          active,
          role,
          user_id,
          user:profiles!unit_users_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq('unit_id', unitId)
        .order('created_at', { ascending: false });

      if (unitUsersError) {
        console.error('Erro ao buscar usuários:', unitUsersError);
        throw unitUsersError;
      }

      // Buscar informações de acesso para cada usuário
      const usersWithAccess = await Promise.all(
        unitUsers.map(async (unitUser) => {
          const { data: accessInfo, error: accessError } = await supabase
            .rpc('get_user_access_info', { user_id: unitUser.user_id });

          if (accessError) {
            console.error('Erro ao buscar info de acesso:', accessError);
            return { ...unitUser, accessInfo: null };
          }

          return { ...unitUser, accessInfo: accessInfo[0] };
        })
      );

      return usersWithAccess as UnitUser[];
    },
  });

  if (isLoading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Primeiro Acesso</TableHead>
            <TableHead>Último Acesso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.user.full_name}</TableCell>
              <TableCell>{user.user.email}</TableCell>
              <TableCell className="capitalize">{user.role}</TableCell>
              <TableCell>
                <Badge variant={user.active ? "default" : "destructive"}>
                  {user.active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.accessInfo?.has_first_access ? "Sim" : "Não"}
              </TableCell>
              <TableCell>
                {user.accessInfo?.last_sign_in_at 
                  ? format(new Date(user.accessInfo.last_sign_in_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <UnitUserActions 
                  user={user}
                  onEdit={() => onEdit(user)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

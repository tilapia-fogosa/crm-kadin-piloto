
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserActions } from "./user-actions";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  full_name: string;
  email: string;
  access_blocked: boolean;
  email_confirmed: boolean;
  unit_users: Array<{
    role: string;
    unit: {
      name: string;
    };
  }>;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Unidades</TableHead>
            <TableHead>Funções</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {user.access_blocked ? (
                    <Badge variant="destructive">Bloqueado</Badge>
                  ) : user.email_confirmed ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Pendente</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.unit_users.map(u => u.unit.name).join(", ")}
              </TableCell>
              <TableCell>
                {user.unit_users.map(u => u.role).join(", ")}
              </TableCell>
              <TableCell className="text-right">
                <UserActions user={user} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

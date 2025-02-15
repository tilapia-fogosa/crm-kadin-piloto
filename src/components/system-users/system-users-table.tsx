import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SystemUserWithUnits } from "@/types/system-user";
import { Badge } from "@/components/ui/badge";
import { SystemUserActions } from "./system-user-actions";
interface SystemUsersTableProps {
  users: SystemUserWithUnits[];
  isLoading: boolean;
}
export function SystemUsersTable({
  users,
  isLoading
}: SystemUsersTableProps) {
  if (isLoading) {
    return <div>Carregando usuários...</div>;
  }
  return <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Unidades</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone || "-"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {user.units.map(unitUser => <Badge key={unitUser.id} variant="secondary" className="bg-orange-500 hover:bg-orange-400">
                      {unitUser.unit?.name} ({unitUser.role})
                    </Badge>)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <SystemUserActions user={user} />
              </TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </div>;
}
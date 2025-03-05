
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnrollmentActions } from "./EnrollmentActions";
import { Student } from "@/types/enrollment";

interface EnrollmentsTableProps {
  enrollments: (Student & {
    clients: {
      lead_source: string;
      phone_number: string;
    };
  })[];
  isLoading: boolean;
}

export function EnrollmentsTable({ enrollments, isLoading }: EnrollmentsTableProps) {
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Aluno</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Origem do Lead</TableHead>
            <TableHead>Status Comercial</TableHead>
            <TableHead>Status Pedagógico</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id}>
              <TableCell>{enrollment.full_name}</TableCell>
              <TableCell>{enrollment.clients.phone_number}</TableCell>
              <TableCell>{enrollment.clients.lead_source}</TableCell>
              <TableCell>
                {enrollment.commercial_data_completed ? "Completo" : "Pendente"}
              </TableCell>
              <TableCell>
                {enrollment.pedagogical_data_completed ? "Completo" : "Pendente"}
              </TableCell>
              <TableCell>
                {format(new Date(enrollment.created_at), "dd/MM/yyyy HH:mm")}
              </TableCell>
              <TableCell className="text-right">
                <EnrollmentActions enrollment={enrollment} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

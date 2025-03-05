
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
import { Badge } from "@/components/ui/badge";

interface EnrollmentsTableProps {
  enrollments: (Student & {
    clients: {
      name: string;
      lead_source: string;
      phone_number: string;
      status: string;
    };
  })[];
  isLoading: boolean;
}

function getCompletionStatus(student: Student) {
  if (!student.commercial_data_completed && !student.pedagogical_data_completed) {
    return "Pendente";
  }
  if (student.commercial_data_completed && student.pedagogical_data_completed) {
    return "Completo";
  }
  return "Em Andamento";
}

function getStatusColor(status: string) {
  switch (status) {
    case "Completo":
      return "bg-green-500";
    case "Em Andamento":
      return "bg-yellow-500";
    default:
      return "bg-red-500";
  }
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
            <TableHead>Status do Cadastro</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id}>
              <TableCell>
                {enrollment.full_name ? (
                  enrollment.full_name
                ) : (
                  <span className="text-red-500 font-medium">
                    CLIENTE: {enrollment.clients.name}
                  </span>
                )}
              </TableCell>
              <TableCell>{enrollment.clients.phone_number}</TableCell>
              <TableCell>{enrollment.clients.lead_source}</TableCell>
              <TableCell>
                <Badge
                  className={`${getStatusColor(
                    getCompletionStatus(enrollment)
                  )} text-white`}
                >
                  {getCompletionStatus(enrollment)}
                </Badge>
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

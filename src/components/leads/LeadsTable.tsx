import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";

const leads = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    course: "Engenharia de Software",
    status: "Novo",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(11) 88888-8888",
    course: "Administração",
    status: "Em Contato",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    email: "pedro@email.com",
    phone: "(11) 77777-7777",
    course: "Ciência da Computação",
    status: "Matriculado",
  },
];

export function LeadsTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Curso</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">
                <div>
                  <p>{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                </div>
              </TableCell>
              <TableCell>{lead.course}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    lead.status === "Novo"
                      ? "default"
                      : lead.status === "Em Contato"
                      ? "secondary"
                      : "success"
                  }
                >
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
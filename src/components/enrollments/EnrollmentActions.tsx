
import { Button } from "@/components/ui/button";
import { Student } from "@/types/enrollment";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnrollmentActionsProps {
  enrollment: Student & {
    clients: {
      name: string;
      lead_source: string;
      phone_number: string;
      status: string;
    };
  };
}

export function EnrollmentActions({ enrollment }: EnrollmentActionsProps) {
  const navigate = useNavigate();

  const handleContinueEnrollment = () => {
    console.log('Continuando matrícula:', enrollment.id);
    navigate(`/enrollments/edit/${enrollment.id}`);
  };

  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        onClick={handleContinueEnrollment}
        className="flex items-center gap-2"
      >
        <Pencil className="h-4 w-4" />
        {enrollment.status === 'pre_matricula' ? 'Continuar Cadastro' : 'Editar Cadastro'}
      </Button>
    </div>
  );
}

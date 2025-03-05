
import { Button } from "@/components/ui/button";
import { Student } from "@/types/enrollment";
import { Pencil } from "lucide-react";

interface EnrollmentActionsProps {
  enrollment: Student & {
    clients: {
      lead_source: string;
      phone_number: string;
    };
  };
}

export function EnrollmentActions({ enrollment }: EnrollmentActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="icon">
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}

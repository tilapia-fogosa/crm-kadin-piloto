
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollments } from "@/hooks/useEnrollments";
import { UnitSelector } from "@/components/UnitSelector";
import { EnrollmentsTable } from "@/components/enrollments/EnrollmentsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUnit } from "@/contexts/UnitContext";
import { EnrollmentFormProvider } from "@/components/enrollments/EnrollmentFormProvider";
import { EnrollmentFormSteps } from "@/components/enrollments/EnrollmentFormSteps";
import { useState } from "react";

export default function EnrollmentsPage() {
  const { selectedUnitId } = useUnit();
  const { data: enrollments, isLoading } = useEnrollments();
  const [isCreating, setIsCreating] = useState(false);

  if (!selectedUnitId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4">Selecione uma unidade para ver as matrículas</p>
        <UnitSelector />
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Nova Matrícula</h1>
          <Button variant="outline" onClick={() => setIsCreating(false)}>
            Voltar
          </Button>
        </div>
        <EnrollmentFormProvider>
          <EnrollmentFormSteps />
        </EnrollmentFormProvider>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Matrículas</h1>
        <div className="flex items-center gap-4">
          <UnitSelector />
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Matrícula
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pre_matricula" className="w-full">
        <TabsList>
          <TabsTrigger value="pre_matricula">Pré-matrículas</TabsTrigger>
          <TabsTrigger value="matricula_completa">Matrículas Completas</TabsTrigger>
        </TabsList>

        <TabsContent value="pre_matricula">
          <EnrollmentsTable 
            enrollments={enrollments?.filter(e => e.status === 'pre_matricula') || []}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="matricula_completa">
          <EnrollmentsTable 
            enrollments={enrollments?.filter(e => e.status === 'matricula_completa') || []}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

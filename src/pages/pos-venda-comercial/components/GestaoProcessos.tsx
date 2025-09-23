import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessTable } from "./ProcessTable";

export function GestaoProcessos() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acompanhamento de Processos Pós-Matrícula</CardTitle>
          <CardDescription>
            Gerencie e acompanhe o progresso dos processos iniciados após as matrículas realizadas.
            Cada linha representa uma matrícula e suas respectivas etapas de acompanhamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProcessTable />
        </CardContent>
      </Card>
    </div>
  );
}
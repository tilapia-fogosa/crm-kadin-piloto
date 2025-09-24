import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ProcessTable } from "./ProcessTable";
import { ConfiguracaoAtividadesModal } from "./ConfiguracaoAtividadesModal";

export function GestaoProcessos() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Acompanhamento de Processos Pós-Matrícula</CardTitle>
              <CardDescription>
                Gerencie e acompanhe o progresso dos processos iniciados após as matrículas realizadas.
                Cada linha representa uma matrícula e suas respectivas etapas de acompanhamento.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsConfigModalOpen(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ProcessTable />
        </CardContent>
      </Card>

      <ConfiguracaoAtividadesModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
}
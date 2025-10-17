import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User, DollarSign, GraduationCap, Phone, Calendar, CheckCircle2, Circle } from "lucide-react";
import { PedagogicalDataButton } from "./PedagogicalDataButton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePosVendaActivities } from "../hooks/usePosVendaActivities";
import { useDynamicActivities } from "../hooks/useDynamicActivities";
import { DadosCadastraisModal } from "./DadosCadastraisModal";
import { DadosComercialModal } from "./DadosComercialModal";
import { DadosPedagogicosModal } from "./DadosPedagogicosModal";
import { AtividadeDinamicaCell } from "./AtividadeDinamicaCell";
import { CommercialDataButton } from "./CommercialDataButton";

export function ProcessTable() {
  const { activities, isLoading } = usePosVendaActivities();
  const { dynamicActivities } = useDynamicActivities();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'cadastrais' | 'comerciais' | 'pedagogicos' | null>(null);

  const openModal = (activityId: string, type: 'cadastrais' | 'comerciais' | 'pedagogicos') => {
    setSelectedActivity(activityId);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedActivity(null);
    setModalType(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhuma matrícula encontrada</h3>
        <p className="text-muted-foreground">
          Os processos de pós-venda aparecerão aqui quando houver matrículas registradas.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data Matrícula</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead className="text-center w-[120px]">Dados Cadastrais</TableHead>
              <TableHead className="text-center w-[120px]">Dados Comerciais</TableHead>
              <TableHead className="text-center w-[120px]">Dados Pedagógicos</TableHead>
              {dynamicActivities.map(activity => (
                <TableHead key={activity.id} className="text-center min-w-[40px] max-w-[60px] px-1 text-xs">
                  {activity.nome}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{activity.client_name}</div>
                    {activity.full_name && activity.full_name !== activity.client_name && (
                      <div className="text-sm text-muted-foreground">
                        Aluno: {activity.full_name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(activity.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{activity.created_by_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center w-[120px]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(activity.id, 'cadastrais')}
                    className="gap-1 px-2 py-1"
                  >
                    <User className="h-4 w-4" />
                    {activity.cpf ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
                  </Button>
                </TableCell>
                <TableCell className="text-center w-[120px]">
                  <CommercialDataButton activityId={activity.id} onOpenModal={() => openModal(activity.id, 'comerciais')} />
                </TableCell>
                <TableCell className="text-center w-[120px]">
                  <PedagogicalDataButton 
                    activityId={activity.id} 
                    onOpenModal={() => openModal(activity.id, 'pedagogicos')} 
                  />
                </TableCell>
                {dynamicActivities.map(dynamicActivity => (
                  <TableCell key={dynamicActivity.id} className="text-center px-1 w-[50px]">
                    <AtividadeDinamicaCell
                      atividadePosVendaId={activity.id}
                      atividadeConfigId={dynamicActivity.id}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modais */}
      {selectedActivity && modalType === 'cadastrais' && (
        <DadosCadastraisModal
          isOpen={true}
          onClose={closeModal}
          activityId={selectedActivity}
        />
      )}
      
      {selectedActivity && modalType === 'comerciais' && (
        <DadosComercialModal
          isOpen={true}
          onClose={closeModal}
          activityId={selectedActivity}
        />
      )}
      
      {selectedActivity && modalType === 'pedagogicos' && (
        <DadosPedagogicosModal
          isOpen={true}
          onClose={closeModal}
          activityId={selectedActivity}
        />
      )}
    </>
  );
}
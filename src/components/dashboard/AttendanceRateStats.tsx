
import { useAttendanceRateStats } from "@/hooks/useAttendanceRateStats";
import { AttendanceRateCard } from "./AttendanceRateCard";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceRateStatsProps {
  unitIds: string[];
}

export function AttendanceRateStats({ unitIds }: AttendanceRateStatsProps) {
  console.log('AttendanceRateStats renderizado com unitIds:', unitIds);
  
  const { data: attendanceStats, isLoading, error } = useAttendanceRateStats(unitIds);

  if (isLoading) {
    console.log('AttendanceRateStats carregando...');
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Taxa de Comparecimento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('AttendanceRateStats erro:', error);
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Taxa de Comparecimento</h2>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-700">Erro ao carregar dados de taxa de comparecimento</p>
        </div>
      </div>
    );
  }

  if (!attendanceStats) {
    console.log('AttendanceRateStats sem dados');
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Taxa de Comparecimento</h2>
        <div className="p-4 border rounded-lg bg-gray-50">
          <p className="text-gray-600">Nenhum dado disponível para as unidades selecionadas</p>
        </div>
      </div>
    );
  }

  console.log('AttendanceRateStats dados carregados:', attendanceStats);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Taxa de Comparecimento</h2>
      <p className="text-sm text-gray-600">
        Mede a taxa de conversão de agendamentos para atendimentos efetivos por usuário
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AttendanceRateCard
          period="1 mês"
          data={attendanceStats.oneMonth}
        />
        <AttendanceRateCard
          period="3 meses"
          data={attendanceStats.threeMonths}
        />
        <AttendanceRateCard
          period="6 meses"
          data={attendanceStats.sixMonths}
        />
        <AttendanceRateCard
          period="12 meses"
          data={attendanceStats.twelveMonths}
        />
      </div>
    </div>
  );
}

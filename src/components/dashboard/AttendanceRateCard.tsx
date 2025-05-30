
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AttendanceRatePeriod } from "@/hooks/useAttendanceRateStats";

interface AttendanceRateCardProps {
  period: string;
  data: AttendanceRatePeriod;
}

export function AttendanceRateCard({ period, data }: AttendanceRateCardProps) {
  console.log(`AttendanceRateCard ${period}:`, data);

  // Calcular diferença percentual em relação ao período anterior
  const currentRate = data.overallAttendanceRate;
  const previousRate = data.comparison.overallAttendanceRate;
  const percentageDifference = currentRate - previousRate;
  
  // Determinar ícone e cor da tendência
  const getTrendIcon = () => {
    if (percentageDifference > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (percentageDifference < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    if (percentageDifference > 0) return "text-green-600";
    if (percentageDifference < 0) return "text-red-600";
    return "text-gray-600";
  };

  // Filtrar apenas usuários que têm agendamentos (evitar divisão por zero)
  const usersWithSchedulings = data.userStats.filter(user => user.schedulings > 0);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">
          {period}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Taxa geral */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {currentRate.toFixed(1)}%
            </span>
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`text-sm ${getTrendColor()}`}>
                {percentageDifference > 0 ? '+' : ''}{percentageDifference.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {data.totalAttendances} de {data.totalSchedulings} agendamentos
          </p>
        </div>

        {/* Lista de usuários */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase">
            Por Usuário
          </h4>
          
          {usersWithSchedulings.length > 0 ? (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {usersWithSchedulings
                .sort((a, b) => b.attendanceRate - a.attendanceRate) // Ordenar por taxa decrescente
                .map((user) => (
                  <div key={user.user_id} className="text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate" title={user.user_name}>
                        {user.user_name}
                      </span>
                      <span className="text-gray-600">
                        {user.attendanceRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {user.attendances}/{user.schedulings} agendamentos
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              Nenhum agendamento no período
            </p>
          )}
        </div>

        {/* Comparação com período anterior */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Período anterior: {previousRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            ({data.comparison.totalAttendances}/{data.comparison.totalSchedulings} agendamentos)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

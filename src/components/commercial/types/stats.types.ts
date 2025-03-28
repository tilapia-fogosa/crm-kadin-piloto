
import { DailyStats } from "../../kanban/types/activity-dashboard.types";

// Interface específica para estatísticas por usuário
export interface UserStats extends Omit<DailyStats, 'date'> {
  user_id: string;
  user_name: string;
}

// Interface específica para stats por unidade
export interface UnitStats extends Omit<DailyStats, 'date'> {
  unit_id: string;
  unit_name: string;
}


import { TotalStats } from "../../kanban/types/activity-dashboard.types";

export interface BaseStats {
  newClients: number;
  contactAttempts: number;
  effectiveContacts: number;
  scheduledVisits: number;
  awaitingVisits: number;
  completedVisits: number;
  enrollments: number;
  ceConversionRate: number;
  agConversionRate: number;
  atConversionRate: number;
  maConversionRate: number;
}

export interface UnitStats extends BaseStats {
  unit_id: string;
  unit_name: string;
}

export interface UserStats extends BaseStats {
  user_id: string;
  user_name: string;
}

export interface CommercialTableProps {
  selectedSource: string;
  selectedMonth: string;
  selectedYear: string;
  selectedUnitId: string | null;
  totals: TotalStats | null;
}


import { BaseStats } from "./stats.types";

export interface RegistrationSourceStats extends BaseStats {
  registrationName: string;
  leadSource: string;
}

export interface RegistrationGroup {
  registrationName: string;
  sources: RegistrationSourceStats[];
  totals: BaseStats;
}

export interface TableSortConfig {
  field: keyof RegistrationSourceStats;
  direction: 'asc' | 'desc';
}

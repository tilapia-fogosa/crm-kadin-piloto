
export interface DailyStats {
  date: Date;
  newClients: number;
  contactAttempts: number;
  effectiveContacts: number;
  ceConversionRate: number;
  scheduledVisits: number;
  agConversionRate: number;
  awaitingVisits: number;
  completedVisits: number;
  atConversionRate: number;
  enrollments: number;
  maConversionRate: number;
  leadSource?: string;
}

export interface TotalStats {
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

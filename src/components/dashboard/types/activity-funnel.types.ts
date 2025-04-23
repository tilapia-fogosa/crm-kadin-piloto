
export interface FunnelPeriodStats {
  totalContacts: number;
  effectiveContacts: number;
  scheduledVisits: number;
  completedVisits: number;
  enrollments: number;
  effectiveContactsRate: number;
  scheduledVisitsRate: number;
  completedVisitsRate: number;
  enrollmentsRate: number;
}

export interface FunnelStatsResponse {
  current: FunnelPeriodStats;
  comparison: FunnelPeriodStats;
}

export interface ActivityFunnelPeriod {
  totalContacts: number;
  effectiveContacts: number;
  scheduledVisits: number;
  completedVisits: number;
  enrollments: number;
  effectiveContactsRate: number;
  scheduledVisitsRate: number;
  completedVisitsRate: number;
  enrollmentsRate: number;
  comparison: {
    totalContacts: number;
    effectiveContacts: number;
    scheduledVisits: number;
    completedVisits: number;
    enrollments: number;
    effectiveContactsRate: number;
    scheduledVisitsRate: number;
    completedVisitsRate: number;
    enrollmentsRate: number;
  };
}

export interface ActivityFunnelData {
  oneMonth: ActivityFunnelPeriod;
  threeMonths: ActivityFunnelPeriod;
  sixMonths: ActivityFunnelPeriod;
  twelveMonths: ActivityFunnelPeriod;
}

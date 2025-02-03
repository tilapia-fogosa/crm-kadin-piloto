export type LeadStatus = 'active' | 'inactive' | 'pending' | 'converted';

export interface Lead {
  id: string;
  name: string;
  status: LeadStatus;
}
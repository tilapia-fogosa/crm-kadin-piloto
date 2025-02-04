export type LeadStatus = 'active' | 'inactive' | 'pending' | 'converted';

export interface Lead {
  id: string;
  name: string;
  status: LeadStatus;
  phoneNumber: string;
  leadSource: string;
  observations?: string;
  ageRange?: string;
  metaId?: string;
  originalAd?: string;
}

export interface LeadSource {
  id: string;
  name: string;
}
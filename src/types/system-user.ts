
export type SystemUserRole = 'admin' | 'franqueador' | 'franqueado' | 'consultor';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemUserUnit {
  id: string;
  user_id: string;
  unit_id: string;
  role: SystemUserRole;
  active: boolean;
  unit?: {
    name: string;
  };
}

export interface SystemUserWithUnits extends SystemUser {
  units: SystemUserUnit[];
}

export interface SystemUserFormData {
  name: string;
  email: string;
  phone: string;
  units: {
    unit_id: string;
    role: SystemUserRole;
  }[];
}

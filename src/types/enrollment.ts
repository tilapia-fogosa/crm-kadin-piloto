
export type StudentStatus = 'pre_matricula' | 'matricula_completa';

export type Gender = 'masculino' | 'feminino';

export type MaritalStatus = 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'outro';

export interface Student {
  id: string;
  full_name: string;
  cpf: string;
  rg?: string;
  birth_date: Date;
  gender?: Gender;
  marital_status?: MaritalStatus;
  birth_city?: string;
  birth_state?: string;
  education_level?: string;
  profession?: string;
  ssp?: string;
  address_postal_code: string;
  address_street: string;
  address_number: string;
  address_complement?: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  landline_phone?: string;
  mobile_phone?: string;
  alternative_phone?: string;
  email?: string;
  photo_url?: string;
  photo_thumbnail_url?: string;
  is_own_financial_responsible: boolean;
  status?: StudentStatus;
  commercial_data_completed: boolean;
  pedagogical_data_completed: boolean;
  client_id: string;
  unit_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface FinancialResponsible {
  id: string;
  student_id: string;
  full_name: string;
  profession: string;
  birth_date: Date;
  cpf: string;
  email: string;
  mobile_phone: string;
  postal_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  observations?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PedagogicalEnrollment {
  id: string;
  student_id: string;
  kit_version_id?: string;
  class_id?: string;
  inaugural_class_date?: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
}


export interface Unit {
  id: string;
  name: string;
  company_name: string;
  cnpj: string;
  trading_name?: string;
  region_id?: string;
  enrollment_fee?: number;
  material_fee?: number;
  monthly_fee?: number;
  email?: string;
  phone?: string;
  legal_representative?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  unit_number: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

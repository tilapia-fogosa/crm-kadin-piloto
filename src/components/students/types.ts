
export interface Student {
  id: string
  client_id: string
  full_name: string
  cpf: string
  rg?: string
  birth_date: Date
  address_postal_code: string
  address_street: string
  address_number: string
  address_complement?: string
  address_neighborhood: string
  address_city: string
  address_state: string
  photo_url?: string
  photo_thumbnail_url?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface StudentFormData {
  full_name: string
  cpf: string
  rg?: string
  birth_date: Date
  address_postal_code: string
  address_street: string
  address_number: string
  address_complement?: string
  address_neighborhood: string
  address_city: string
  address_state: string
}

export interface AddressViaCEP {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
}

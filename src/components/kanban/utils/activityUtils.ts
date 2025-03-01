
export const getActivityBadge = (tipo_atividade: string) => {
  switch (tipo_atividade) {
    case 'Tentativa de Contato':
      return 'TE'
    case 'Contato Efetivo':
      return 'CE'
    case 'Agendamento':
      return 'AG'
    case 'Atendimento':
      return 'AT'
    case 'Matrícula':
      return 'MT'
    default:
      return ''
  }
}

export const getContactType = (tipo_contato: string) => {
  switch (tipo_contato) {
    case 'phone':
      return 'Ligação Telefônica'
    case 'whatsapp':
      return 'Mensagem WhatsApp'
    case 'whatsapp-call':
      return 'Ligação WhatsApp'
    default:
      return tipo_contato
  }
}

export const activities = [
  { id: 'Tentativa de Contato', label: 'Tentativa de Contato', badge: 'TE' },
  { id: 'Contato Efetivo', label: 'Contato Efetivo', badge: 'CE' },
  { id: 'Agendamento', label: 'Agendamento', badge: 'AG' },
  { id: 'Atendimento', label: 'Atendimento', badge: 'AT' },
]

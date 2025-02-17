
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
};

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
  { id: 'tentativa-de-contato', label: 'Tentativa de Contato', badge: 'TE' },
  { id: 'contato-efetivo', label: 'Contato Efetivo', badge: 'CE' },
  { id: 'agendamento', label: 'Agendamento', badge: 'AG' },
  { id: 'atendimento', label: 'Atendimento', badge: 'AT' },
]

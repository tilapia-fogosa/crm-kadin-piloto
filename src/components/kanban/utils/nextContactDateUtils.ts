
import { 
  advanceBusinessDays, 
  adjustToBusinessHours,
  getNextBusinessPeriod
} from "@/utils/date/utils";

/**
 * Calcula data/hora para o próximo período de atendimento
 * @param updateDateAndTime Função para atualizar data/hora
 */
export const handleNextPeriod = (updateDateAndTime: (date: Date) => void) => {
  console.log("Botão Próx.Período clicado");
  const now = new Date();
  
  // Calculando próximo período de atendimento
  const nextPeriod = getNextBusinessPeriod(now);
  
  // Atualizando data e hora
  updateDateAndTime(nextPeriod);
};

/**
 * Calcula data/hora para o dia seguinte
 * @param updateDateAndTime Função para atualizar data/hora
 */
export const handleTomorrow = (updateDateAndTime: (date: Date) => void) => {
  console.log("Botão Amanhã clicado");
  const now = new Date();
  
  // Avançando para amanhã, considerando dias úteis
  let tomorrow = advanceBusinessDays(now, 1);
  
  // Mantendo o mesmo horário da data atual, mas ajustando para horário comercial
  tomorrow.setHours(now.getHours(), now.getMinutes(), 0, 0);
  tomorrow = adjustToBusinessHours(tomorrow);
  
  // Atualizando data e hora
  updateDateAndTime(tomorrow);
};

/**
 * Calcula data/hora para daqui a dois dias
 * @param updateDateAndTime Função para atualizar data/hora
 */
export const handleTwoDays = (updateDateAndTime: (date: Date) => void) => {
  console.log("Botão Em 2 Dias clicado");
  const now = new Date();
  
  // Avançando 2 dias, considerando dias úteis
  let inTwoDays = advanceBusinessDays(now, 2);
  
  // Mantendo o mesmo horário da data atual, mas ajustando para horário comercial
  inTwoDays.setHours(now.getHours(), now.getMinutes(), 0, 0);
  inTwoDays = adjustToBusinessHours(inTwoDays);
  
  // Atualizando data e hora
  updateDateAndTime(inTwoDays);
};

/**
 * Define um horário específico para a data atual ou selecionada
 * @param hours Hora desejada
 * @param minutes Minutos desejados
 * @param dateValue Valor atual da data
 * @param setDateValue Função para atualizar valor da data
 * @param onDateChange Função para atualizar data/hora completa
 */
export const handleTimeClick = (
  hours: number, 
  minutes: number, 
  dateValue: string,
  setDateValue: (value: string) => void,
  onDateChange: (date: Date) => void,
  formatDateForInput: (date: Date) => string
) => {
  console.log(`Botão de horário ${hours}:${minutes} clicado`);
  
  if (!dateValue) {
    console.log("Data não selecionada, usando data atual");
    const now = new Date();
    setDateValue(formatDateForInput(now));
    
    const newDate = new Date(now);
    newDate.setHours(hours, minutes, 0, 0);
    
    // Atualizando data e hora
    onDateChange(newDate);
  } else {
    try {
      const [year, month, day] = dateValue.split('-').map(Number);
      const newDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      onDateChange(newDate);
      
      console.log(`Horário definido para ${hours}:${minutes}`, newDate);
    } catch (error) {
      console.error('Erro ao processar data/hora:', error);
    }
  }
};

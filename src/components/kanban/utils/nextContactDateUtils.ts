
import { format } from "date-fns";

/**
 * Manipula o clique em botões de horário específicos
 */
export function handleTimeClick(
  hours: number, 
  minutes: number, 
  dateValue: string, 
  setDateValue: (value: string) => void,
  onDateChange: (date: Date) => void,
  formatDateForInput: (date: Date) => string
) {
  console.log(`Botão de horário ${hours}:${minutes} clicado`);
  
  // Formatando o horário no formato HH:mm
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  // Se não houver data selecionada, usar a data atual
  if (!dateValue) {
    console.log("Data não selecionada, usando data atual");
    const now = new Date();
    setDateValue(formatDateForInput(now));
  }
}

/**
 * Define o próximo período para contato (manhã/tarde/noite)
 */
export function handleNextPeriod(updateDateAndTime: (date: Date) => void) {
  console.log("Botão 'Próximo Período' clicado");
  const now = new Date();
  const currentHour = now.getHours();
  
  // Cria uma nova data com base no horário atual
  const newDate = new Date();
  
  // Definir próximo período com base no horário atual
  if (currentHour < 12) {
    // Se for manhã, passar para tarde (13h)
    newDate.setHours(13, 0, 0, 0);
  } else if (currentHour < 18) {
    // Se for tarde, passar para noite (18h)
    newDate.setHours(18, 0, 0, 0);
  } else {
    // Se for noite, passar para manhã do próximo dia (9h)
    newDate.setDate(newDate.getDate() + 1);
    newDate.setHours(9, 0, 0, 0);
  }
  
  updateDateAndTime(newDate);
}

/**
 * Define o próximo contato para amanhã
 */
export function handleTomorrow(updateDateAndTime: (date: Date) => void) {
  console.log("Botão 'Amanhã' clicado");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  updateDateAndTime(tomorrow);
}

/**
 * Define o próximo contato para daqui a 2 dias
 */
export function handleTwoDays(updateDateAndTime: (date: Date) => void) {
  console.log("Botão 'Em 2 Dias' clicado");
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(9, 0, 0, 0);
  
  updateDateAndTime(dayAfterTomorrow);
}

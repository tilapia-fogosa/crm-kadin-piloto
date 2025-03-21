
export function useWhatsApp() {
  const handleWhatsAppClick = (e: React.MouseEvent, phoneNumber: string) => {
    console.log('useWhatsApp - Abrindo WhatsApp para o número:', phoneNumber);
    e.stopPropagation();
    // Formata o número removendo caracteres não-numéricos
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    console.log('useWhatsApp - Número formatado:', formattedNumber);
    
    // Abre o WhatsApp com o número formatado
    window.open(`https://api.whatsapp.com/send?phone=${formattedNumber}`, '_blank');
  }

  return { handleWhatsAppClick };
}

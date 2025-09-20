// Log: Hook para gerenciar estatísticas mock das automações
export function useAutomationStats() {
  console.log('useAutomationStats: Carregando estatísticas mock das automações');
  
  // Mock de dados realistas para demonstração
  const stats = {
    tentativa_contato: {
      created: 3,
      active: 2,
      dispatches: 127,
    },
    contato_efetivo: {
      created: 2,
      active: 2,
      dispatches: 89,
    },
    agendamento: {
      created: 4,
      active: 3,
      dispatches: 256,
    },
    atendimento: {
      created: 1,
      active: 1,
      dispatches: 45,
    },
    matricula: {
      created: 2,
      active: 1,
      dispatches: 32,
    },
    perdido: {
      created: 1,
      active: 0,
      dispatches: 18,
    },
  };

  console.log('useAutomationStats: Estatísticas carregadas', stats);
  
  return stats;
}
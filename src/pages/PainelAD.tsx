
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ConsultorDailyPanel } from '@/components/consultor-painel/ConsultorDailyPanel';
import { useAuth } from '@/contexts/AuthContext';

export default function PainelAD() {
  // Log para indicar carregamento inicial da página
  console.log('[PAINEL AD] Página iniciada');

  const { session } = useAuth();
  
  // Formatador de datas para padrão brasileiro
  const formatDate = (date: Date) => {
    return format(date, 'MMMM yyyy', { locale: ptBR });
  };

  // Data atual para o título
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span className="text-2xl">🎯</span> 
          Painel de Atividades Diárias do Consultor Comercial
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe diariamente suas atividades com clientes
        </p>
      </div>

      {/* Componente principal do painel */}
      <ConsultorDailyPanel userId={session?.user?.id} />
    </div>
  );
}

import React from 'react';
import { useFuncionalidadesUnidade, TipoFuncionalidade } from '@/hooks/useFuncionalidadesUnidade';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface ProtecaoFuncionalidadeProps {
  /** Funcionalidade necessária para renderizar o conteúdo */
  funcionalidade: TipoFuncionalidade;
  
  /** Funcionalidades alternativas (OR) - pelo menos uma deve estar ativa */
  funcionalidadesAlternativas?: TipoFuncionalidade[];
  
  /** Funcionalidades obrigatórias (AND) - todas devem estar ativas */
  funcionalidadesObrigatorias?: TipoFuncionalidade[];
  
  /** Conteúdo a ser renderizado se a funcionalidade estiver ativa */
  children: React.ReactNode;
  
  /** Componente de fallback personalizado */
  fallback?: React.ReactNode;
  
  /** Mostrar mensagem de funcionalidade não disponível */
  mostrarMensagem?: boolean;
  
  /** Mensagem personalizada quando funcionalidade não disponível */
  mensagem?: string;
}

/**
 * Componente para proteger funcionalidades baseado nas configurações da unidade
 * Log: Implementação de proteção condicional de funcionalidades
 */
export function ProtecaoFuncionalidade({
  funcionalidade,
  funcionalidadesAlternativas = [],
  funcionalidadesObrigatorias = [],
  children,
  fallback,
  mostrarMensagem = true,
  mensagem
}: ProtecaoFuncionalidadeProps) {
  const { 
    temFuncionalidade, 
    temAlgumaFuncionalidade, 
    temTodasFuncionalidades,
    isLoading 
  } = useFuncionalidadesUnidade();

  // Log de verificação
  console.log('ProtecaoFuncionalidade - Verificando acesso:', {
    funcionalidade,
    funcionalidadesAlternativas,
    funcionalidadesObrigatorias,
    isLoading
  });

  // Aguardar carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Verificando permissões...
        </span>
      </div>
    );
  }

  // Verificar funcionalidade principal
  const temFuncionalidadePrincipal = temFuncionalidade(funcionalidade);
  
  // Verificar funcionalidades alternativas (se definidas)
  const temAlternativas = funcionalidadesAlternativas.length > 0 
    ? temAlgumaFuncionalidade(funcionalidadesAlternativas)
    : true; // Se não há alternativas, considera como atendido
  
  // Verificar funcionalidades obrigatórias (se definidas)
  const temObrigatorias = funcionalidadesObrigatorias.length > 0
    ? temTodasFuncionalidades(funcionalidadesObrigatorias)
    : true; // Se não há obrigatórias, considera como atendido

  // Lógica de acesso: (funcionalidade principal OU alternativas) E obrigatórias
  const temAcesso = (temFuncionalidadePrincipal || temAlternativas) && temObrigatorias;

  console.log('ProtecaoFuncionalidade - Resultado da verificação:', {
    temFuncionalidadePrincipal,
    temAlternativas,
    temObrigatorias,
    temAcesso
  });

  // Se tem acesso, renderiza o conteúdo
  if (temAcesso) {
    return <>{children}</>;
  }

  // Se tem fallback personalizado, usa ele
  if (fallback) {
    return <>{fallback}</>;
  }

  // Se não deve mostrar mensagem, não renderiza nada
  if (!mostrarMensagem) {
    return null;
  }

  // Renderiza mensagem padrão ou personalizada
  const mensagemFinal = mensagem || getFuncionalidadeDisplayName(funcionalidade);

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <Lock className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <strong>Funcionalidade não disponível:</strong> {mensagemFinal}
        <br />
        <span className="text-sm text-amber-600">
          Entre em contato com o administrador para habilitar esta funcionalidade.
        </span>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Utilitário para converter tipo de funcionalidade em nome amigável
 */
function getFuncionalidadeDisplayName(tipo: TipoFuncionalidade): string {
  const nomes: Record<TipoFuncionalidade, string> = {
    'assistente_whatsapp': 'Assistente WhatsApp',
    'google_agenda': 'Integração com Google Agenda',
    'relatorios_avancados': 'Relatórios Avançados',
    'integracao_telefonia_net2phone': 'Integração de Telefonia Net2Phone',
    'automacao_whatsapp': 'Automações de WhatsApp',
    'pos_venda_comercial': 'Pós-venda Comercial'
  };

  return nomes[tipo] || tipo;
}
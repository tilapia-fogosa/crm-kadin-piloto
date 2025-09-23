import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFuncionalidadesUnidade, TipoFuncionalidade } from '@/hooks/useFuncionalidadesUnidade';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RotaProtegidaPorFuncionalidadeProps {
  /** Funcionalidade necessária para acessar a rota */
  funcionalidade: TipoFuncionalidade;
  
  /** Funcionalidades alternativas (OR) - pelo menos uma deve estar ativa */
  funcionalidadesAlternativas?: TipoFuncionalidade[];
  
  /** Funcionalidades obrigatórias (AND) - todas devem estar ativas */
  funcionalidadesObrigatorias?: TipoFuncionalidade[];
  
  /** Componente a ser renderizado se a funcionalidade estiver ativa */
  children: React.ReactNode;
  
  /** Rota para redirecionar se não tiver acesso */
  redirecionarPara?: string;
  
  /** Mostrar página de acesso negado ao invés de redirecionar */
  mostrarAcessoNegado?: boolean;
}

/**
 * Componente para proteger rotas baseado nas funcionalidades da unidade
 * Log: Implementação de proteção de rotas por funcionalidade
 */
export function RotaProtegidaPorFuncionalidade({
  funcionalidade,
  funcionalidadesAlternativas = [],
  funcionalidadesObrigatorias = [],
  children,
  redirecionarPara = '/',
  mostrarAcessoNegado = true
}: RotaProtegidaPorFuncionalidadeProps) {
  const { 
    temFuncionalidade, 
    temAlgumaFuncionalidade, 
    temTodasFuncionalidades,
    isLoading,
    unitId
  } = useFuncionalidadesUnidade();

  // Log de verificação de rota
  console.log('RotaProtegidaPorFuncionalidade - Verificando acesso à rota:', {
    funcionalidade,
    funcionalidadesAlternativas,
    funcionalidadesObrigatorias,
    unitId,
    isLoading
  });

  // Aguardar carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-medium">Verificando permissões de acesso...</p>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto verificamos se você tem acesso a esta funcionalidade.
          </p>
        </div>
      </div>
    );
  }

  // Verificar funcionalidade principal
  const temFuncionalidadePrincipal = temFuncionalidade(funcionalidade);
  
  // Verificar funcionalidades alternativas (se definidas)
  const temAlternativas = funcionalidadesAlternativas.length > 0 
    ? temAlgumaFuncionalidade(funcionalidadesAlternativas)
    : true;
  
  // Verificar funcionalidades obrigatórias (se definidas)
  const temObrigatorias = funcionalidadesObrigatorias.length > 0
    ? temTodasFuncionalidades(funcionalidadesObrigatorias)
    : true;

  // Lógica de acesso: (funcionalidade principal OU alternativas) E obrigatórias
  const temAcesso = (temFuncionalidadePrincipal || temAlternativas) && temObrigatorias;

  console.log('RotaProtegidaPorFuncionalidade - Resultado da verificação:', {
    temFuncionalidadePrincipal,
    temAlternativas,
    temObrigatorias,
    temAcesso
  });

  // Se tem acesso, renderiza o conteúdo da rota
  if (temAcesso) {
    return <>{children}</>;
  }

  // Se deve redirecionar ao invés de mostrar página de acesso negado
  if (!mostrarAcessoNegado) {
    console.log('Redirecionando para:', redirecionarPara);
    return <Navigate to={redirecionarPara} replace />;
  }

  // Renderizar página de acesso negado
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <Alert className="border-red-200 bg-red-50">
          <Lock className="h-5 w-5 text-red-600" />
          <AlertDescription>
            <div className="space-y-4 text-red-800">
              <div>
                <h3 className="font-semibold text-lg mb-2">Acesso Restrito</h3>
                <p>
                  Esta funcionalidade não está disponível para sua unidade.
                </p>
                <p className="text-sm mt-2">
                  <strong>Funcionalidade necessária:</strong> {getFuncionalidadeDisplayName(funcionalidade)}
                </p>
              </div>
              
              {funcionalidadesAlternativas.length > 0 && (
                <div className="text-sm">
                  <p><strong>Ou uma destas funcionalidades:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    {funcionalidadesAlternativas.map(alt => (
                      <li key={alt}>{getFuncionalidadeDisplayName(alt)}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {funcionalidadesObrigatorias.length > 0 && (
                <div className="text-sm">
                  <p><strong>Também é necessário:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    {funcionalidadesObrigatorias.map(obr => (
                      <li key={obr}>{getFuncionalidadeDisplayName(obr)}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="pt-2">
                <p className="text-sm text-red-600">
                  Entre em contato com o administrador do sistema para solicitar 
                  o acesso a esta funcionalidade.
                </p>
              </div>
              
              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
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
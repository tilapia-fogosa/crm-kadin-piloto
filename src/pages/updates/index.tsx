
import React, { useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUpdates } from '@/contexts/UpdatesContext';
import { SystemUpdate } from '@/types/updates';

// Mapear tipo de atualização para um texto amigável
const updateTypeLabels: Record<string, string> = {
  'melhoria': 'Melhoria',
  'implementacao': 'Implementação',
  'correcao': 'Correção'
};

// Mapear tipo de atualização para uma cor de badge
const updateTypeColors: Record<string, string> = {
  'melhoria': 'bg-blue-500',
  'implementacao': 'bg-green-500',
  'correcao': 'bg-amber-500'
};

// Componente para mostrar uma única atualização
function UpdateItem({ 
  update, 
  onRead 
}: { 
  update: SystemUpdate; 
  onRead: (id: string) => void;
}) {
  console.log('Renderizando item de atualização:', update.id, update.title);
  
  const handleClick = () => {
    if (!update.read) {
      onRead(update.id);
    }
  };
  
  // Formatar data da criação para exibição
  const formattedDate = format(
    new Date(update.created_at), 
    "dd 'de' MMMM 'de' yyyy", 
    { locale: ptBR }
  );
  
  return (
    <Card 
      className={cn(
        "transition-all duration-200 mb-4",
        !update.read && "border-l-4 border-l-blue-500 shadow-md"
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold flex items-center">
              {update.title}
              {!update.read && (
                <Badge className="ml-2 bg-blue-500 text-white">
                  Novo
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate}
            </CardDescription>
          </div>
          <Badge className={updateTypeColors[update.type]}>
            {updateTypeLabels[update.type]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="text-sm whitespace-pre-line" 
          dangerouslySetInnerHTML={{ __html: update.description.replace(/\n/g, '<br />') }}
        />
      </CardContent>
    </Card>
  );
}

// Componente de paginação
function Pagination({ 
  currentPage, 
  totalPages, 
  goToPage 
}: { 
  currentPage: number; 
  totalPages: number; 
  goToPage: (page: number) => void;
}) {
  console.log('Renderizando paginação:', { currentPage, totalPages });
  
  return (
    <div className="flex items-center justify-center mt-6 space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <span className="text-sm px-4">
        Página {currentPage} de {Math.max(1, totalPages)}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Página principal de atualizações
export default function UpdatesPage() {
  console.log('Renderizando página de atualizações');
  
  const { 
    updates, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    hasUnreadUpdates,
    pagination
  } = useUpdates();
  
  // Marcar todas as atualizações visíveis como lidas automaticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      // Marcar todas as atualizações não lidas como lidas após 5 segundos
      updates.forEach(update => {
        if (!update.read) {
          markAsRead(update.id);
        }
      });
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [updates]);
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Melhorias e Novidades</h1>
        
        {hasUnreadUpdates && (
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
          >
            Marcar todas como lidas
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Carregando atualizações...</p>
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-8">
          <p>Não há atualizações para mostrar.</p>
        </div>
      ) : (
        <div>
          {updates.map(update => (
            <UpdateItem 
              key={update.id} 
              update={update} 
              onRead={markAsRead} 
            />
          ))}
          
          {pagination.totalPages > 1 && (
            <Pagination 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              goToPage={pagination.goToPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Função auxiliar para combinação condicional de classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

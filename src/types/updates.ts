
/**
 * Tipos para a funcionalidade de Melhorias e Novidades
 * 
 * Esta funcionalidade permite aos usuários verem atualizações do sistema
 * e aos administradores gerenciarem essas atualizações.
 */

// Tipos de atualizações
export type UpdateType = 'melhoria' | 'implementacao' | 'correcao';

// Interface para representar uma atualização do sistema
export interface SystemUpdate {
  id: string;
  title: string;
  description: string;
  type: UpdateType;
  build_version?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  active: boolean;
  published: boolean; // Novo campo para indicar se está publicado
  read?: boolean; // Propriedade calculada no frontend
}

// Interface para o contexto de atualizações
export interface UpdatesContextType {
  updates: SystemUpdate[];
  hasUnreadUpdates: boolean;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (updateId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUpdates: () => Promise<void>;
  draftCount?: number; // Contador de rascunhos para admins
  // Funções administrativas
  createUpdate?: (update: Omit<SystemUpdate, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'active' | 'published' | 'read'>) => Promise<void>;
  updateUpdate?: (id: string, update: Partial<SystemUpdate>) => Promise<void>;
  deleteUpdate?: (id: string) => Promise<void>;
  publishUpdate?: (id: string) => Promise<void>;
  unpublishUpdate?: (id: string) => Promise<void>;
  pagination: {
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
  }
}

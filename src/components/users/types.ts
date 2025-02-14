
export interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser?: {
    id: string;
    user_id: string;
    profiles: {
      full_name: string | null;
    };
    user_roles: {
      role: 'admin' | 'consultor' | 'franqueado';
    }[];
    units: {
      id: string;
      name: string;
    }[];
  } | null;
}

export type UserRole = 'admin' | 'consultor' | 'franqueado';

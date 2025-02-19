
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Ban, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  full_name: string;
  email: string;
  access_blocked: boolean;
  email_confirmed: boolean;
}

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggleBlock = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          access_blocked: !user.access_blocked,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Sucesso",
        description: user.access_blocked 
          ? "Usuário desbloqueado com sucesso" 
          : "Usuário bloqueado com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao alterar o status do usuário.",
      });
    } finally {
      setIsLoading(false);
      setShowBlockDialog(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          must_change_password: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Senha resetada com sucesso. O usuário precisará alterar a senha no próximo acesso.",
      });
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao resetar a senha.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEmail = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          email_confirmed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Sucesso",
        description: "Email confirmado com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao confirmar email:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao confirmar o email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      {!user.email_confirmed && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleConfirmEmail}
          disabled={isLoading}
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={handleResetPassword}
        disabled={isLoading}
      >
        <Lock className="h-4 w-4" />
      </Button>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <Button
          variant={user.access_blocked ? "outline" : "destructive"}
          size="icon"
          onClick={() => setShowBlockDialog(true)}
          disabled={isLoading}
        >
          {user.access_blocked ? (
            <Unlock className="h-4 w-4" />
          ) : (
            <Ban className="h-4 w-4" />
          )}
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
            <AlertDialogDescription>
              {user.access_blocked
                ? "Tem certeza que deseja desbloquear este usuário?"
                : "Tem certeza que deseja bloquear este usuário? Ele não poderá mais acessar o sistema."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleBlock}
              className={user.access_blocked ? "" : "bg-destructive hover:bg-destructive/90"}
            >
              {user.access_blocked ? "Desbloquear" : "Bloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

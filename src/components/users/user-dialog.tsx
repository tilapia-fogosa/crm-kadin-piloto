
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { UserFormFields } from "./user-form-fields";
import { useUserOperations } from "./hooks/useUserOperations";
import { UserDialogProps } from "./types";

export function UserDialog({ open, onOpenChange, editingUser }: UserDialogProps) {
  const { data: profile } = useProfile();
  const isAdmin = profile?.role === 'admin';

  const {
    email,
    setEmail,
    name,
    setName,
    password,
    setPassword,
    selectedUnits,
    setSelectedUnits,
    role,
    setRole,
    handleSubmit
  } = useUserOperations(() => onOpenChange(false));

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.profiles?.full_name || '');
      setRole(editingUser.user_roles?.[0]?.role || '');
      setSelectedUnits(editingUser.units?.map(unit => unit.id) || []);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
      setSelectedUnits([]);
    }
  }, [editingUser, setName, setEmail, setPassword, setRole, setSelectedUnits]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => handleSubmit(e, isAdmin, editingUser)} className="space-y-4">
          <UserFormFields
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            role={role}
            setRole={setRole}
            selectedUnits={selectedUnits}
            setSelectedUnits={setSelectedUnits}
            isEditing={!!editingUser}
            isAdmin={isAdmin}
          />
          <div className="flex justify-end">
            <Button type="submit">
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

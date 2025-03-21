
import { AdminRoute } from "@/components/auth/AdminRoute";
import { UserAccountsManager } from "@/components/users/UserAccountsManager";

export default function UserManagementPage() {
  return (
    <AdminRoute>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Gestão Avançada de Usuários</h1>
        <p className="text-gray-600 mb-8">
          Esta página permite realizar operações administrativas avançadas em contas de usuário.
          Use com cautela, pois algumas operações não podem ser desfeitas.
        </p>
        
        <UserAccountsManager />
      </div>
    </AdminRoute>
  );
}

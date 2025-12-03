/**
 * App.tsx - Componente raiz da aplicação
 * 
 * @version 2.0.1 - Cache rebuild forçado para resolver erro do React Query
 * @description Força o Vite a reprocessar as dependências do @tanstack/react-query
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "./components/ui/sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { UnitProvider } from "./contexts/UnitContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ProtectedLayout from "./components/layouts/ProtectedLayout";
import PublicLayout from "./components/layouts/PublicLayout";
import LoginPage from "./pages/auth/LoginPage";
import NotFound from "@/pages/NotFound";
import { UpdatesProvider } from "./contexts/UpdatesContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Toaster } from "./components/ui/toaster";

// Page imports 
import Index from "@/pages/Index";
import Kanban from "@/pages/Kanban";
import AuthCallback from "@/pages/auth/callback";
import NewClient from "@/pages/clients/new";
import ClientsPage from "@/pages/clients/index";
import LeadSourcesPage from "@/pages/clients/sources";
import UsersPage from "@/pages/users/index";
import EnrollmentsPage from "@/pages/Enrollments";
import ApiDocsPage from "@/pages/api-docs";
import CommercialStats from "@/pages/CommercialStats";
import EditClientPage from "@/pages/clients/edit";
import SchedulePage from "@/pages/Schedule";
import UserManagementPage from "@/pages/admin/user-management";
import FuncionalidadesUnidadePage from "@/pages/admin/funcionalidades-unidade";
import UpdatesPage from "@/pages/updates/index";
import UpdatesAdminPage from "@/pages/updates/admin";
import ChangePassword from "@/pages/auth/ChangePassword";
import RelatoriosAvancadosPage from "@/pages/relatorios-avancados";
import AutomacoesWhatsAppPage from "@/pages/automacoes-whatsapp";
import PosVendaComercialPage from "@/pages/pos-venda-comercial/index";
import PoliticaPrivacidade from "@/pages/public/PoliticaPrivacidade";
import TermosServico from "@/pages/public/TermosServico";
import WhatsAppPage from "@/pages/whatsapp";

// Log: Criar QueryClient FORA do componente para evitar recriação
// Isso resolve o erro "Cannot read properties of null (reading 'useEffect')"
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 4 * 60 * 60 * 1000, // 4 horas
      gcTime: 5 * 60 * 60 * 1000, // 5 horas
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente App que contém o QueryClientProvider
function App() {
  console.log('Renderizando componente App');
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UpdatesProvider>
            <NotificationProvider>
              <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <Routes>
                  {/* Public routes - authentication and landing pages */}
                  <Route path="/auth" element={<LoginPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  {/* Public routes - landing pages with public layout */}
                  <Route element={<PublicLayout />}>
                    <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
                    <Route path="/termos-de-servico" element={<TermosServico />} />
                  </Route>
                  
                  {/* Root redirect */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                  } />

                  {/* Special route for password change - accessible with valid session but outside layout */}
                  <Route path="/auth/change-password" element={
                    <ProtectedRoute>
                      <ChangePassword />
                    </ProtectedRoute>
                  } />

                  {/* Protected routes with layout - wrapped with UnitProvider */}
                  <Route element={
                    <ProtectedRoute>
                      <UnitProvider>
                        <ProtectedLayout />
                      </UnitProvider>
                    </ProtectedRoute>
                  }>
                    <Route path="/dashboard" element={<Index />} />
                    <Route path="/kanban" element={<Kanban />} />
                    <Route path="/clients/new" element={<NewClient />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/clients/:id/edit" element={<EditClientPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/enrollments" element={<EnrollmentsPage />} />
                    <Route path="/sales" element={<EnrollmentsPage />} />
                    <Route path="/api-docs" element={<ApiDocsPage />} />
                    <Route path="/relatorios-avancados" element={<RelatoriosAvancadosPage />} />
                    <Route path="/commercial-stats" element={<CommercialStats />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/admin/user-management" element={<UserManagementPage />} />
                    <Route path="/admin/funcionalidades-unidade" element={<FuncionalidadesUnidadePage />} />
                    <Route path="/updates" element={<UpdatesPage />} />
                    <Route path="/updates/admin" element={<UpdatesAdminPage />} />
                    <Route path="/clients/sources" element={<LeadSourcesPage />} />
                    <Route path="/automacoes-whatsapp" element={<AutomacoesWhatsAppPage />} />
                    <Route path="/pos-venda-comercial" element={<PosVendaComercialPage />} />
                    <Route path="/whatsapp" element={<WhatsAppPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </div>
              <Toaster />
            </SidebarProvider>
            </NotificationProvider>
          </UpdatesProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


import React from "react"; // Importação explícita do React
import { BrowserRouter } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "./components/ui/sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ProtectedLayout from "./components/layouts/ProtectedLayout";
import LoginPage from "./pages/auth/LoginPage";
import NotFound from "@/pages/NotFound";
import { UpdatesProvider } from "./contexts/UpdatesContext";
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
import UpdatesPage from "@/pages/updates/index";
import UpdatesAdminPage from "@/pages/updates/admin";
import ChangePassword from "@/pages/auth/ChangePassword";

// Componente App que contém o QueryClientProvider
function App() {
  console.log('Renderizando componente App');
  
  // Criar QueryClient dentro do componente (não fora dele)
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
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UpdatesProvider>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <Routes>
                  {/* Public routes */}
                  <Route path="/auth" element={<LoginPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  {/* Root redirect */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                  } />

                  {/* Special route for password change - accessible with valid session but not inside layout */}
                  <Route path="/auth/change-password" element={
                    <ProtectedRoute>
                      <ChangePassword />
                    </ProtectedRoute>
                  } />

                  {/* Protected routes */}
                  <Route element={
                    <ProtectedRoute>
                      <ProtectedLayout />
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
                    <Route path="/commercial-stats" element={<CommercialStats />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/admin/user-management" element={<UserManagementPage />} />
                    <Route path="/updates" element={<UpdatesPage />} />
                    <Route path="/updates/admin" element={<UpdatesAdminPage />} />
                    <Route path="/clients/sources" element={<LeadSourcesPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </div>
              <Toaster />
            </SidebarProvider>
          </UpdatesProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

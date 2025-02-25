
import { BrowserRouter } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "./components/ui/sidebar";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ProtectedLayout } from "./components/layouts/ProtectedLayout";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Kanban from "@/pages/Kanban";
import NewClient from "@/pages/clients/new";
import ClientsPage from "@/pages/clients";
import LeadSourcesPage from "@/pages/clients/sources";
import ApiDocsPage from "@/pages/api-docs";
import Auth from "@/pages/Auth";
import ChangePassword from "@/pages/auth/ChangePassword";
import AuthCallback from "@/pages/auth/callback";
import UsersPage from "@/pages/users";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Rota raiz */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } />

              {/* Rota de troca de senha */}
              <Route path="/auth/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />

              {/* Layout protegido com sidebar */}
              <Route element={
                <ProtectedRoute>
                  <ProtectedLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Index />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/clients/new" element={<NewClient />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/clients/sources" element={<LeadSourcesPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/api-docs" element={<ApiDocsPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

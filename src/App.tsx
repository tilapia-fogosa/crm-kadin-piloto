import { BrowserRouter } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "./components/ui/sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ProtectedLayout from "./components/layouts/ProtectedLayout";
import LoginPage from "./pages/auth/LoginPage";
import NotFound from "@/pages/NotFound";

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
        <AuthProvider>
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
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

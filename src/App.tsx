
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Kanban from "@/pages/Kanban";
import Agenda from "@/pages/Agenda";
import NewClient from "@/pages/clients/new";
import ClientsPage from "@/pages/clients";
import LeadSourcesPage from "@/pages/clients/sources";
import ApiDocsPage from "@/pages/api-docs";
import Auth from "@/pages/Auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <>
                        <AppSidebar />
                        <SidebarInset>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/kanban" element={<Kanban />} />
                            <Route path="/agenda" element={<Agenda />} />
                            <Route path="/clients/new" element={<NewClient />} />
                            <Route path="/clients" element={<ClientsPage />} />
                            <Route path="/clients/sources" element={<LeadSourcesPage />} />
                            <Route path="/api-docs" element={<ApiDocsPage />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                          <Toaster />
                        </SidebarInset>
                      </>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;

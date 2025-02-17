
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Auth from "./pages/Auth"
import Index from "./pages/Index"
import Agenda from "./pages/Agenda"
import Kanban from "./pages/Kanban"
import NotFound from "./pages/NotFound"
import SystemUsers from "./pages/system-users"
import ApiDocs from "./pages/api-docs"
import SalesPage from "./pages/sales"
import Units from "./pages/units"
import Clients from "./pages/clients"
import NewClient from "./pages/clients/new"
import ClientSources from "./pages/clients/sources"
import LeadSources from "./pages/leads/sources"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { AppSidebar } from "./components/app-sidebar"
import { SidebarProvider } from "./components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import "./App.css"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="flex h-screen">
                    <AppSidebar />
                    <main className="flex-1 overflow-y-auto bg-secondary/10">
                      <Routes>
                        <Route index element={<Index />} />
                        <Route path="agenda" element={<Agenda />} />
                        <Route path="kanban" element={<Kanban />} />
                        <Route path="system-users" element={<SystemUsers />} />
                        <Route path="api-docs" element={<ApiDocs />} />
                        <Route path="units" element={<Units />} />
                        <Route path="sales" element={<SalesPage />} />
                        <Route path="clients">
                          <Route index element={<Clients />} />
                          <Route path="new" element={<NewClient />} />
                          <Route path="sources" element={<ClientSources />} />
                        </Route>
                        <Route path="leads">
                          <Route path="sources" element={<LeadSources />} />
                        </Route>
                      </Routes>
                    </main>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

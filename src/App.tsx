
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Auth from "./pages/Auth"
import Index from "./pages/Index"
import Agenda from "./pages/Agenda"
import Kanban from "./pages/Kanban"
import NotFound from "./pages/NotFound"
import SystemUsers from "./pages/system-users"
import ApiDocs from "./pages/api-docs"
import SalesPage from "./pages/sales"
import Units from "./pages/units"
import { Clients, NewClient, ClientSources } from "./pages/clients"
import { LeadSources } from "./pages/leads/sources"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import { AppSidebar } from "./components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="flex h-screen">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto bg-secondary/10">
                  <Routes>
                    <Route index element={<Index />} />
                    <Route path="/agenda" element={<Agenda />} />
                    <Route path="/kanban" element={<Kanban />} />
                    <Route path="/system-users" element={<SystemUsers />} />
                    <Route path="/api-docs" element={<ApiDocs />} />
                    <Route path="/units" element={<Units />} />
                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/clients">
                      <Route index element={<Clients />} />
                      <Route path="new" element={<NewClient />} />
                      <Route path="sources" element={<ClientSources />} />
                    </Route>
                    <Route path="/leads">
                      <Route path="sources" element={<LeadSources />} />
                    </Route>
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Kanban from "@/pages/Kanban";
import Agenda from "@/pages/Agenda";
import NewClient from "@/pages/clients/new";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/clients/new" element={<NewClient />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
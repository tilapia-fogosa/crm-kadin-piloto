
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { UnitProvider } from "@/contexts/UnitContext";

export default function ProtectedLayout() {
  console.log("Rendering ProtectedLayout");
  const location = useLocation();
  const isKanbanPage = location.pathname === "/kanban";
  
  return (
    <UnitProvider>
      <div className="flex min-h-screen bg-background">
        {/* Fixed sidebar */}
        <div className="fixed inset-y-0 left-0 w-60 z-50 bg-[#311D64] shadow-lg border-r border-[#452680]">
          <AppSidebar />
        </div>
        
        {/* Main content area with padding for sidebar */}
        <div className="flex-1 pl-60">
          <main className="h-full relative">
            <div className={`h-full ${isKanbanPage ? 'overflow-hidden' : 'max-w-[1400px] mx-auto'}`}>
              <div className="p-6 h-full">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </UnitProvider>
  );
}

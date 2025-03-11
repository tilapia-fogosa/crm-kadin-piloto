
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { UnitProvider } from "@/contexts/UnitContext";

export default function ProtectedLayout() {
  console.log("Rendering ProtectedLayout");
  
  return (
    <UnitProvider>
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-screen border-r border-gray-200">
          <AppSidebar />
        </div>
        
        {/* Main content area with left margin to account for sidebar */}
        <main className="flex-1 ml-60">
          <div className="max-w-[1400px] mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </UnitProvider>
  );
}

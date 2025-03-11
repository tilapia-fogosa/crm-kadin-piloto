
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { UnitProvider } from "@/contexts/UnitContext";

export default function ProtectedLayout() {
  console.log("Rendering ProtectedLayout");
  
  return (
    <UnitProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto bg-background p-4 w-full">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </UnitProvider>
  );
}

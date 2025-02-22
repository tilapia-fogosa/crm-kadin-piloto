
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { SidebarInset } from "../ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

export function ProtectedLayout() {
  return (
    <div className="flex w-full">
      <AppSidebar />
      <SidebarInset className="flex-1 overflow-x-hidden">
        <div className="flex min-h-full">
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
        <Toaster />
      </SidebarInset>
    </div>
  );
}

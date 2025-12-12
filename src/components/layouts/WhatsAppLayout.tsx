
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { UnitProvider } from "@/contexts/UnitContext";

export default function WhatsAppLayout() {
    console.log("Rendering WhatsAppLayout (Full Width)");

    return (
        <UnitProvider>
            <div className="flex min-h-screen bg-background w-full overflow-hidden">
                {/* Fixed sidebar */}
                <div className="fixed inset-y-0 left-0 w-60 z-50 bg-[#311D64] shadow-lg border-r border-[#452680]">
                    <AppSidebar />
                </div>

                {/* Main content area - SEM RESTRIÇÕES de largura ou padding */}
                <div className="flex-1 pl-60 w-full h-screen overflow-hidden">
                    <main className="h-full w-full relative p-0 m-0 overflow-hidden">
                        <Outlet />
                    </main>
                </div>
            </div>
        </UnitProvider>
    );
}

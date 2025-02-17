
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  Users,
  FileCode,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useSidebar } from "./ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Kanban", href: "/kanban", icon: KanbanSquare },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "API Docs", href: "/api-docs", icon: FileCode },
];

export function AppSidebar() {
  const { isSidebarOpen, setSidebarOpen } = useSidebar();
  const location = useLocation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sidebar = (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-[60px] items-center px-6">
        <img
          className="h-8 w-auto"
          src="/logo.png"
          alt="Logo"
        />
      </div>
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-4 px-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start")}
                asChild
              >
                <Link to={item.href}>
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden fixed z-50 left-4 top-4"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          {sidebar}
        </SheetContent>
      </Sheet>
      <div className="hidden border-r bg-background md:block w-72">
        {sidebar}
      </div>
    </>
  );
}

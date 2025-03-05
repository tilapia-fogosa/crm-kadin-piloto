
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  FileCode,
  Menu,
  Plus,
  Link2,
  LogOut,
  DollarSign,
  LineChart,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useSidebar } from "./ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Painel do Consultor", href: "/kanban", icon: KanbanSquare },
  { 
    name: "Clientes", 
    href: "/clients", 
    icon: Users,
    subItems: [
      { name: "Novo Cliente", href: "/clients/new", icon: Plus },
      { name: "Origens", href: "/clients/sources", icon: Link2 }
    ]
  },
  { name: "Vendas", href: "/sales", icon: DollarSign },
  { name: "Gestão Comercial", href: "/commercial", icon: LineChart },
  { name: "Usuários", href: "/users", icon: Users },
  { name: "API Docs", href: "/api-docs", icon: FileCode },
];

export function AppSidebar() {
  const { openMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado com sucesso",
        description: "Redirecionando para a página de login...",
      });
    }
  };

  const sidebar = (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-[60px] items-center px-6 bg-[#311D64]">
        <img
          className="h-8 w-auto"
          src="/lovable-uploads/c9bc0aec-0f40-468c-8c5e-24cb91ff0918.png"
          alt="Kad Logo"
        />
      </div>
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-4 px-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                <Button
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-white",
                    "hover:bg-[#FF6B00] hover:text-white transition-colors duration-200",
                    location.pathname === item.href && "bg-white/20 text-white hover:bg-[#FF6B00]"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.name}
                  </Link>
                </Button>
                
                {item.subItems && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Button
                        key={subItem.name}
                        variant={location.pathname === subItem.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-sm text-white",
                          "hover:bg-[#FF6B00] hover:text-white transition-colors duration-200",
                          location.pathname === subItem.href && "bg-white/20 text-white hover:bg-[#FF6B00]"
                        )}
                        asChild
                      >
                        <Link to={subItem.href}>
                          <subItem.icon className="mr-2 h-4 w-4" />
                          {subItem.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white",
            "hover:bg-[#FF6B00] hover:text-white transition-colors duration-200"
          )}
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden fixed z-50 left-4 top-4"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0 bg-[#311D64]">
          {sidebar}
        </SheetContent>
      </Sheet>
      <div className="hidden bg-[#311D64] md:block w-60 fixed h-full z-40">
        {sidebar}
      </div>
      <div className="hidden md:block w-60">
        {/* Espaçador para compensar a sidebar fixa */}
      </div>
    </>
  );
}

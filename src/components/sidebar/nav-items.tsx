
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  FileCode,
  Plus,
  Link2,
  DollarSign,
  LineChart,
  Calendar,
  Bell
} from "lucide-react";
import { UpdatesButton } from "./updates-button";

export const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Painel do Consultor", href: "/kanban", icon: KanbanSquare },
  { name: "Agenda", href: "/schedule", icon: Calendar },
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
  { name: "Indicadores Comerciais", href: "/commercial-stats", icon: LineChart },
  { name: "Usuários", href: "/users", icon: Users },
  { name: "API Docs", href: "/api-docs", icon: FileCode },
];

interface NavItemsProps {
  currentPath: string;
}

export function NavItems({ currentPath }: NavItemsProps) {
  // Adicionar logs para depuração
  console.log('Renderizando NavItems, path atual:', currentPath);

  return (
    <div className="space-y-4 px-4">
      <div className="space-y-1">
        {navigation.map((item) => (
          <div key={item.name}>
            <Button
              variant={currentPath === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-white",
                "hover:bg-[#FF6B00] hover:text-white transition-colors duration-200",
                currentPath === item.href && "bg-white/20 text-white hover:bg-[#FF6B00]"
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
                    variant={currentPath === subItem.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sm text-white",
                      "hover:bg-[#FF6B00] hover:text-white transition-colors duration-200",
                      currentPath === subItem.href && "bg-white/20 text-white hover:bg-[#FF6B00]"
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
  );
}

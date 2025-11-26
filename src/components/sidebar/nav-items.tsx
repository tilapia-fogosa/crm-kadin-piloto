
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Bell,
  BarChart3,
  Settings,
  Shield,
  Bot,
  MessageCircle
} from "lucide-react";
import { UpdatesButton } from "./updates-button";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useFuncionalidadesUnidade } from "@/hooks/useFuncionalidadesUnidade";
import { useUnreadCount } from "@/pages/whatsapp/hooks/useUnreadCount";

// Navegação geral (sempre visível)
export const generalNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Painel do Consultor", href: "/kanban", icon: KanbanSquare },
  { name: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
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
  // { name: "Vendas", href: "/sales", icon: DollarSign }, // Oculto do sidebar - acessível apenas via URL direta
  { name: "Indicadores Comerciais", href: "/commercial-stats", icon: LineChart },
  { name: "Pós-venda Comercial", href: "/pos-venda-comercial", icon: BarChart3, requiresFeature: "pos_venda_comercial" },
];

// Navegação administrativa (apenas para admins)
export const adminNavigation = [
  { name: "Usuários", href: "/users", icon: Users },
  { name: "Gestão de Funcionalidades", href: "/admin/funcionalidades-unidade", icon: Settings },
  { name: "Gestão Avançada de Usuários", href: "/admin/user-management", icon: Shield },
  { name: "API Docs", href: "/api-docs", icon: FileCode },
  { name: "Relatórios Avançados", href: "/relatorios-avancados", icon: BarChart3 },
];

interface NavItemsProps {
  currentPath: string;
}

export function NavItems({ currentPath }: NavItemsProps) {
  console.log('NavItems: Renderizando menu, path atual:', currentPath);
  
  const { isAdmin, isLoading } = useIsAdmin();
  const { temFuncionalidade } = useFuncionalidadesUnidade();
  const { unreadCount } = useUnreadCount();
  
  console.log('NavItems: Status admin:', { isAdmin, isLoading });
  console.log('NavItems: Conversas não lidas:', unreadCount);

  // Renderizar função para um item de navegação
  const renderNavItem = (item: any) => {
    // Verificar se o item requer funcionalidade específica
    if (item.requiresFeature && !temFuncionalidade(item.requiresFeature)) {
      return null;
    }

    const isWhatsApp = item.name === "WhatsApp";
    const showBadge = isWhatsApp && unreadCount > 0;

    return (
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
          <Link to={item.href} className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <item.icon className="mr-2 h-5 w-5" />
              {item.name}
            </div>
            {showBadge && (
              <Badge 
                variant="destructive" 
                className="ml-auto bg-red-500 text-white hover:bg-red-600"
              >
                {unreadCount}
              </Badge>
            )}
          </Link>
        </Button>
        
        {item.subItems && (
          <div className="ml-4 mt-1 space-y-1">
            {item.subItems.map((subItem: any) => (
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
    );
  };

  return (
    <div className="space-y-4 px-4">
      {/* Navegação Geral */}
      <div className="space-y-1">
        {generalNavigation.map(renderNavItem)}
      </div>
      
      {/* Navegação Administrativa - Apenas para Admins */}
      {!isLoading && isAdmin && (
        <>
          <div className="px-2 py-1">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Administração
            </h3>
          </div>
          <div className="space-y-1">
            {adminNavigation.map(renderNavItem)}
          </div>
        </>
      )}
    </div>
  );
}

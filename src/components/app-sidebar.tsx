
import { Link, useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar, 
  UserPlus, 
  Users, 
  Target,
  Settings,
  Home,
  BarChart3,
  FileJson,
  ArrowLeft,
  ArrowRight,
  LogOut
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logout realizado com sucesso",
        description: "Redirecionando para a tela de login...",
      })
      navigate("/auth")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      })
    }
  }

  const mainMenuItems = [
    {
      title: "Painel do Consultor",
      icon: ListTodo,
      path: "/kanban",
    },
    {
      title: "Agenda",
      icon: Calendar,
      path: "/agenda",
    },
    {
      title: "Vendas",
      icon: BarChart3,
      path: "/sales",
    },
    {
      title: "Eventos",
      icon: Calendar,
      path: "/events",
    },
    {
      title: "Unidades",
      icon: Home,
      path: "/units",
    },
    {
      title: "Usuários",
      icon: Users,
      path: "/system-users",
    },
    {
      title: "Documentação API",
      icon: FileJson,
      path: "/api-docs",
    },
    {
      title: "Minhas Configurações",
      icon: Settings,
      path: "/settings",
    },
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
  ]

  const clientMenuItems = [
    {
      title: "Cadastrar Novo",
      icon: UserPlus,
      path: "/clients/new",
    },
    {
      title: "Todos os clientes",
      icon: Users,
      path: "/clients",
    },
    {
      title: "Origem dos Clientes",
      icon: Target,
      path: "/clients/sources",
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <div className="flex items-center justify-between px-2 py-2">
          <span className={cn(
            "text-lg font-semibold text-sidebar-foreground transition-opacity duration-200",
            state === "collapsed" && "opacity-0"
          )}>
            Menu
          </span>
          <SidebarTrigger className="z-50">
            {state === "expanded" ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </SidebarTrigger>
        </div>

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu de Clientes */}
        <SidebarGroup>
          <SidebarGroupLabel>Clientes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clientMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Botão de Logout */}
        <div className="mt-auto border-t border-border">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    tooltip="Sair do sistema"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

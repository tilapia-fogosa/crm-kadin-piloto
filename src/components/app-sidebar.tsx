
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
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
  Building2,
  UserCog
} from "lucide-react"

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()

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
      path: "/",
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

  const managementMenuItems = [
    {
      title: "Unidades",
      icon: Building2,
      path: "/units",
    },
    {
      title: "Usuários",
      icon: UserCog,
      path: "/users",
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
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

        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementMenuItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  )
}


import { Link, useLocation } from "react-router-dom"
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
  SidebarProvider,
  SidebarTrigger,
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
  FileJson
} from "lucide-react"

export function AppSidebar() {
  const location = useLocation()

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

  return (
    <Sidebar>
      <SidebarContent>
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
      </SidebarContent>
    </Sidebar>
  )
}

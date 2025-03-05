import {
  LayoutDashboard,
  CalendarIcon,
  HomeIcon,
  KanbanIcon,
  LineChart,
  Settings,
  User2,
  Users,
} from "lucide-react";

import { MainNavItem, SidebarNavItem } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItemProps {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}

function MenuItem({ href, icon, children }: MenuItemProps) {
  return (
    <Link to={href}>
      <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-secondary">
        {React.createElement(icon, { className: "h-4 w-4" })}
        <span className="text-sm font-medium leading-none">{children}</span>
      </div>
    </Link>
  );
}

interface MenuSectionProps {
  title: string;
  items: SidebarNavItem[];
}

function MenuSection({ title, items }: MenuSectionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={title}>
        <AccordionTrigger className="text-sm font-medium">{title}</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-1 pl-4">
            {items.map((item) => (
              <Link key={item.href} to={item.href}>
                <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-secondary">
                  {item.icon && React.createElement(item.icon, { className: "h-4 w-4" })}
                  <span className="text-sm font-medium leading-none">{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

interface AppSidebarProps {
  mainNav?: MainNavItem[]
  sidebarNav?: SidebarNavItem[]
}

export function AppSidebar() {
  const { user } = useAuth();

  const isFranqueado = user?.role === 'franqueado';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex h-full min-w-[200px] flex-col border-r bg-secondary/50 py-4">
      <Link to="/" className="px-6">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-sm font-bold">Painel</span>
        </div>
      </Link>
      <Separator className="my-2 space-y-10" />
      <ScrollArea className="h-[calc(100vh-4rem)] py-6">
        <div className="space-y-1">
          <MenuItem href="/" icon={HomeIcon}>Dashboard</MenuItem>
          <MenuItem href="/kanban" icon={KanbanIcon}>Kanban</MenuItem>
          <MenuItem href="/agenda" icon={CalendarIcon}>Agenda</MenuItem>
          <MenuItem href="/commercial" icon={LineChart}>Gestão Comercial</MenuItem>
          {isAdmin && (
            <>
              <Separator className="my-2" />
              <p className="px-6 text-sm font-semibold">Administração</p>
              <MenuItem href="/users" icon={Users}>Usuários</MenuItem>
            </>
          )}
          {isFranqueado && (
            <>
              <Separator className="my-2" />
              <p className="px-6 text-sm font-semibold">Gerenciamento</p>
              <MenuItem href="/leads" icon={User2}>Leads</MenuItem>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

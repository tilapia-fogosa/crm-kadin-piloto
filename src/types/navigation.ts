
import { LucideIcon } from "lucide-react";

export interface MainNavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface SidebarNavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
  external?: boolean;
}

import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, LayoutDashboard, ListTodo } from "lucide-react"

export function AppSidebar() {
  const location = useLocation()

  return (
    <div className="pb-12 border-r min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            CRM Educacional
          </h2>
          <div className="space-y-1">
            <Link to="/">
              <Button
                variant={location.pathname === "/" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/kanban">
              <Button
                variant={location.pathname === "/kanban" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <ListTodo className="mr-2 h-4 w-4" />
                Kanban
              </Button>
            </Link>
            <Link to="/agenda">
              <Button
                variant={location.pathname === "/agenda" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Agenda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
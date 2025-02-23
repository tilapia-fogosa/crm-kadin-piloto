
import { Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminRoute } from "@/components/auth/AdminRoute"
import { ProtectedLayout } from "@/components/layouts/ProtectedLayout"

// Pages
import { NotFound } from "@/pages/NotFound"
import { Auth } from "@/pages/Auth"
import { Index } from "@/pages/Index"
import { Kanban } from "@/pages/Kanban"
import { Agenda } from "@/pages/Agenda"
import { ChangePassword } from "@/pages/auth/ChangePassword"

// Auth Callback
import { GoogleAuthCallback } from "@/pages/auth/callback"

// Client Routes
import { ClientList } from "@/pages/clients"
import { NewClient } from "@/pages/clients/new"
import { ClientSources } from "@/pages/clients/sources"

// Region Routes
import { RegionList } from "@/pages/regions"
import { UnitList } from "@/pages/regions/units"
import { NewUnit } from "@/pages/regions/units/new"

// Lead Routes
import { LeadSources } from "@/pages/leads/sources"

// User Routes
import { UserList } from "@/pages/users"

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<GoogleAuthCallback />} />
      <Route path="/auth/change-password" element={<ChangePassword />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/agenda" element={<Agenda />} />
          
          {/* Client Routes */}
          <Route path="/clients">
            <Route index element={<ClientList />} />
            <Route path="new" element={<NewClient />} />
            <Route path="sources" element={<ClientSources />} />
          </Route>

          {/* Region Routes */}
          <Route path="/regions">
            <Route index element={<RegionList />} />
            <Route path="units">
              <Route index element={<UnitList />} />
              <Route path="new" element={<NewUnit />} />
            </Route>
          </Route>

          {/* Lead Routes */}
          <Route path="/leads">
            <Route path="sources" element={<LeadSources />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/users" element={<UserList />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

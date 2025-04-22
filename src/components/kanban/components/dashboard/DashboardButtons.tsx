
import { ActivityDashboard } from "../../ActivityDashboard";
import { ActivityDashboardV2 } from "../../ActivityDashboardV2";
import { CalendarDashboard } from "../../CalendarDashboard";

export function DashboardButtons() {
  return (
    <div className="flex items-center gap-2">
      <ActivityDashboard />
      <ActivityDashboardV2 />
      <CalendarDashboard />
    </div>
  );
}


import LeadSourcesTable from "@/components/leads/LeadSourcesTable";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function LeadSourcesPage() {
  const queryClient = useQueryClient();
  const location = useLocation();

  // Invalidate and refetch lead sources data when component mounts or route changes
  useEffect(() => {
    console.log("Lead Sources page mounted or route changed, refetching data...")
    queryClient.invalidateQueries({ queryKey: ['leadSources'] })
  }, [location.pathname, queryClient]);

  return (
    <div className="container mx-auto py-10">
      <LeadSourcesTable />
    </div>
  );
}

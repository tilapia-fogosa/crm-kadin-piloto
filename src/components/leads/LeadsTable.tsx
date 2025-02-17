
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

type ClientStatus = "active" | "inactive" | "pending" | "converted";

const statusVariants: Record<ClientStatus, "default" | "destructive" | "secondary" | "outline"> = {
  active: "default",
  inactive: "destructive",
  pending: "secondary",
  converted: "outline"
};

const LeadsTable = ({ leads = [] }: { leads: Array<{ id: string; name: string; status: ClientStatus }> }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead.id}>
            <td>{lead.name}</td>
            <td>
              <Button variant={statusVariants[lead.status]}>
                {lead.status}
              </Button>
            </td>
            <td>
              <Button variant="outline">Edit</Button>
              <Button variant="destructive">Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default LeadsTable;

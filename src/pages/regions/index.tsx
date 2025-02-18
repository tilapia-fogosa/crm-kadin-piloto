
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function RegionsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Regiões</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nova Região
        </Button>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        {/* RegionsTable será implementado em seguida */}
      </div>
    </div>
  );
}

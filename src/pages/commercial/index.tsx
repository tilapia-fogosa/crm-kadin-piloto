
import { useState } from "react";
import { UnitSelector } from "@/components/UnitSelector";
import { CommercialStats } from "@/components/commercial/CommercialStats";

export default function CommercialPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  return (
    <div className="space-y-4 p-6 flex flex-col items-start">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-3xl font-bold tracking-tight">Gestão Comercial</h2>
        <UnitSelector />
      </div>
      <CommercialStats selectedMonth={selectedMonth} />
    </div>
  );
}

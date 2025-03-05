
import { useState } from 'react';
import { CommercialStats } from "@/components/commercial/CommercialStats";

export default function CommercialPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Gestão Comercial</h1>
      <CommercialStats selectedMonth={selectedMonth} />
    </div>
  );
}

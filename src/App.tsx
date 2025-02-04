import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Kanban from "@/pages/Kanban";
import Agenda from "@/pages/Agenda";
import NewClient from "@/pages/clients/new";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/kanban" element={<Kanban />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/clients/new" element={<NewClient />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AppSidebar } from "./components/app-sidebar"
import Index from "./pages/Index"
import Kanban from "./pages/Kanban"
import Agenda from "./pages/Agenda"
import NotFound from "./pages/NotFound"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
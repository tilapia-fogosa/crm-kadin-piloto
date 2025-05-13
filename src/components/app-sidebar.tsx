
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "./ui/sidebar";
import { NavItems } from "./sidebar/nav-items";
import { UserProfile } from "./sidebar/user-profile";
import { MobileTrigger } from "./sidebar/mobile-trigger";

export function AppSidebar() {
  const { openMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const [isClient, setIsClient] = useState(false);

  // Log de inicialização do componente
  console.log('AppSidebar: Inicializando componente');

  useEffect(() => {
    setIsClient(true);
    console.log('AppSidebar: setIsClient(true)');
  }, []);

  const sidebar = (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-[60px] items-center px-6 bg-[#311D64]">
        <img
          className="h-8 w-auto"
          src="/lovable-uploads/c9bc0aec-0f40-468c-8c5e-24cb91ff0918.png"
          alt="Kad Logo"
        />
      </div>
      <ScrollArea className="flex-1">
        <NavItems currentPath={location.pathname} />
      </ScrollArea>
      {isClient && <UserProfile />}
    </div>
  );

  if (!isClient) {
    console.log('AppSidebar: !isClient, retornando null');
    return null;
  }

  console.log('AppSidebar: Renderizando sidebar');
  return (
    <>
      <MobileTrigger open={openMobile} onOpenChange={setOpenMobile}>
        {sidebar}
      </MobileTrigger>
      <div className="hidden bg-[#311D64] md:block w-60 h-screen">
        {sidebar}
      </div>
    </>
  );
}

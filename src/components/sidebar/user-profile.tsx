
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { UpdatesButton } from "./updates-button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export function UserProfile() {
  // Adiciona log para rastrear quando este componente é montado
  console.log('UserProfile: Inicializando componente');
  
  const { session, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Log de verificação da sessão
  console.log('UserProfile: Verificando sessão', {
    hasSession: !!session,
    userName: session?.user?.user_metadata?.full_name
  });

  const handleLogout = async () => {
    console.log('UserProfile: Iniciando logout');
    await signOut();
  };

  // Função para navegar para a página de alteração de senha
  const handleChangePassword = () => {
    console.log('UserProfile: Navegando para página de alteração de senha');
    navigate('/auth/change-password');
  };

  return (
    <div className="p-4 space-y-4 border-t border-white/10">
      {/* Botão de atualizações acima do nome do usuário */}
      <UpdatesButton currentPath={location.pathname} />
      
      <div className="flex items-center justify-between">
        {session?.user?.user_metadata?.full_name && (
          <div className="text-[#FF6B00] text-sm font-medium px-2">
            {session.user.user_metadata.full_name}
          </div>
        )}
        
        {/* Menu de configurações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-[#FF6B00] hover:text-white transition-colors duration-200"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configurações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleChangePassword}>
              Alterar senha
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-white",
          "hover:bg-[#FF6B00] hover:text-white transition-colors duration-200"
        )}
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Sair
      </Button>
    </div>
  );
}

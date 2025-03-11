
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function UserProfile() {
  const { session, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="p-4 space-y-4 border-t border-white/10">
      {session?.user?.user_metadata?.full_name && (
        <div className="text-[#FF6B00] text-sm font-medium px-2">
          {session.user.user_metadata.full_name}
        </div>
      )}
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

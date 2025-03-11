
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    console.log("Processing auth callback");
    // Redirect to dashboard after successful auth
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <span className="loading">Processando autenticação...</span>
    </div>
  );
}

export default AuthCallback;

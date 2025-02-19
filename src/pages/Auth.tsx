
import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import { RequestUserDialog } from "@/components/auth/RequestUserDialog";
import { useAuthState } from "@/hooks/useAuthState";

export default function Auth() {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    setLoading,
    session,
    isCheckingSession,
    navigate,
    toast,
  } = useAuthState();

  useEffect(() => {
    if (session) {
      console.log("Usuário autenticado, redirecionando para dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [session, navigate]);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Bem-vindo</CardTitle>
          <CardDescription className="text-center">
            Entre com sua conta para acessar o sistema
          </CardDescription>
        </CardHeader>
        
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          setLoading={setLoading}
          toast={toast}
          navigate={navigate}
        />

        <div className="px-6 pb-6 pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowRequestDialog(true)}
          >
            Solicite seu Usuário Aqui
          </Button>
        </div>
      </Card>

      <RequestUserDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
      />
    </div>
  );
}

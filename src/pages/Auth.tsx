
import { useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuthState } from "@/hooks/useAuthState";

export default function Auth() {
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
    resetForm
  } = useAuthState();

  useEffect(() => {
    if (session) {
      console.log("Usuário autenticado, redirecionando para dashboard");
      navigate("/dashboard");
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
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
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
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              setLoading={setLoading}
              toast={toast}
              resetForm={resetForm}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

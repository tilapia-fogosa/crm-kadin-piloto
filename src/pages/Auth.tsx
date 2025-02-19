
import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-4">
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
      </div>
    </div>
  );
}

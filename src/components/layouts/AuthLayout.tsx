
import { SuperaLogo } from "@/components/auth/SuperaLogo";
import { Card, CardContent } from "@/components/ui/card";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <SuperaLogo />
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

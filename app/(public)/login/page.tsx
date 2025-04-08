import { LoginForm } from "@/components/login-form";
import { Hotel } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Hotel className="mx-auto h-12 w-auto" />
          <h1 className="text-3xl font-bold">Pousada Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre na sua conta para acessar o painel
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

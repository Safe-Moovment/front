import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { isDashboardAuthenticated, setDashboardAuthenticated } from "./auth";

export default function DashboardLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  if (isDashboardAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setAuthError("Ingresa correo y contrasena para acceder.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Placeholder de autenticacion: aqui se conectara el backend posteriormente.
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDashboardAuthenticated();
      setPassword("");
      navigate("/dashboard", { replace: true });
    } catch {
      setAuthError("No se pudo iniciar sesion. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0ED] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5E5E5] p-8">
        <h1 className="text-2xl font-bold text-[#2C2C2C]">Acceso al sistema</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ingresa con tu cuenta para entrar al dashboard productivo.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2C2C2C] mb-1">
              Correo
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ganadero@empresa.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2C2C2C] mb-1">
              Contrasena
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {authError ? (
            <p className="text-sm text-red-600" role="alert">
              {authError}
            </p>
          ) : null}

          <Button type="submit" className="w-full bg-[#5C7A5B] hover:bg-[#4A6249]" disabled={isSubmitting}>
            {isSubmitting ? "Validando acceso..." : "Entrar al dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}

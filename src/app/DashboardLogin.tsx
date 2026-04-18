import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Navigate, useNavigate } from "react-router";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { BrandLogo } from "./components/BrandLogo";
import {
  dashboardUserExists,
  isDashboardAuthenticated,
  registerDashboardUser,
  setDashboardAuthenticated,
  updateDashboardPassword,
  validateDashboardCredentials,
} from "./auth";

type AuthView = "login" | "register" | "reset";
type CodeFlowStep = "request" | "verify";

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email.trim());
}

export default function DashboardLogin() {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>("login");
  const [step, setStep] = useState<CodeFlowStep>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");

  if (isDashboardAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const resetMessages = () => {
    setAuthError("");
    setAuthInfo("");
  };

  const changeView = (nextView: AuthView) => {
    setView(nextView);
    setStep("request");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setVerificationCode("");
    setSentCode("");
    setPendingEmail("");
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    resetMessages();
  };

  const sendVerificationCode = async (targetEmail: string) => {
    const code = generateVerificationCode();
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSentCode(code);
    setPendingEmail(targetEmail.trim().toLowerCase());
    setStep("verify");
    setAuthInfo(`Codigo enviado al correo. Demo actual: ${code}`);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setAuthError("Ingresa correo y contrasena para acceder.");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!validateDashboardCredentials(trimmedEmail, password)) {
        setAuthError("Correo o contrasena incorrectos.");
        return;
      }

      setDashboardAuthenticated();
      setPassword("");
      navigate("/dashboard", { replace: true });
    } catch {
      setAuthError("No se pudo iniciar sesion. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRegisterCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      setAuthError("Ingresa un correo valido.");
      return;
    }

    if (dashboardUserExists(trimmedEmail)) {
      setAuthError("Ese correo ya esta registrado. Inicia sesion o restablece contrasena.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendVerificationCode(trimmedEmail);
    } catch {
      setAuthError("No se pudo enviar el codigo. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (!verificationCode || verificationCode !== sentCode) {
      setAuthError("El codigo de verificacion no coincide.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setAuthError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setAuthError("Las contrasenas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const wasRegistered = registerDashboardUser(pendingEmail, newPassword);
      if (!wasRegistered) {
        setAuthError("Ese correo ya fue registrado. Intenta iniciar sesion.");
        return;
      }

      setEmail(pendingEmail);
      setPassword("");
      setAuthInfo("Registro completado. Ahora inicia sesion.");
      setStep("request");
      setVerificationCode("");
      setSentCode("");
      setNewPassword("");
      setConfirmPassword("");
      setPendingEmail("");
      setView("login");
    } catch {
      setAuthError("No se pudo completar el registro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestResetCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      setAuthError("Ingresa un correo valido.");
      return;
    }

    if (!dashboardUserExists(trimmedEmail)) {
      setAuthError("No existe una cuenta con ese correo.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendVerificationCode(trimmedEmail);
    } catch {
      setAuthError("No se pudo enviar el codigo. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (!verificationCode || verificationCode !== sentCode) {
      setAuthError("El codigo de verificacion no coincide.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setAuthError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setAuthError("Las contrasenas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const wasUpdated = updateDashboardPassword(pendingEmail, newPassword);
      if (!wasUpdated) {
        setAuthError("No se encontro la cuenta para actualizar.");
        return;
      }

      setEmail(pendingEmail);
      setPassword("");
      setAuthInfo("Contrasena actualizada. Ahora inicia sesion.");
      setStep("request");
      setVerificationCode("");
      setSentCode("");
      setNewPassword("");
      setConfirmPassword("");
      setPendingEmail("");
      setView("login");
    } catch {
      setAuthError("No se pudo restablecer la contrasena.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0ED] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5E5E5] p-8">
        <BrandLogo className="mb-6" tone="dark" imageClassName="h-12 w-12" />
        <h1 className="text-2xl font-bold text-[#2C2C2C]">
          {view === "login" ? "Acceso al sistema" : view === "register" ? "Crear cuenta" : "Restablecer contrasena"}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {view === "login"
            ? "Ingresa con tu cuenta para entrar al dashboard productivo."
            : view === "register"
              ? "Registra tu correo, valida el codigo y crea tu contrasena."
              : "Te enviaremos un codigo de verificacion para crear una nueva contrasena."}
        </p>

        <div className="mt-6 flex gap-2 rounded-lg bg-[#F4F4F1] p-1">
          <Button type="button" variant={view === "login" ? "default" : "ghost"} className="flex-1" onClick={() => changeView("login")}>
            Iniciar sesion
          </Button>
          <Button type="button" variant={view === "register" ? "default" : "ghost"} className="flex-1" onClick={() => changeView("register")}>
            Registro
          </Button>
          <Button type="button" variant={view === "reset" ? "default" : "ghost"} className="flex-1" onClick={() => changeView("reset")}>
            Reset
          </Button>
        </div>

        {view === "login" ? (
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#5C7A5B] hover:bg-[#4A6249]" disabled={isSubmitting}>
              {isSubmitting ? "Validando acceso..." : "Entrar al dashboard"}
            </Button>
          </form>
        ) : null}

        {view === "register" && step === "request" ? (
          <form onSubmit={handleRequestRegisterCode} className="mt-6 space-y-4">
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Correo
              </label>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="ganadero@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-[#5C7A5B] hover:bg-[#4A6249]" disabled={isSubmitting}>
              {isSubmitting ? "Enviando codigo..." : "Enviar codigo de verificacion"}
            </Button>
          </form>
        ) : null}

        {view === "register" && step === "verify" ? (
          <form onSubmit={handleCompleteRegister} className="mt-6 space-y-4">
            <div>
              <label htmlFor="register-code" className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Codigo de verificacion
              </label>
              <Input
                id="register-code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.trim())}
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Nueva contrasena
              </label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Minimo 6 caracteres"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm" className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Confirmar contrasena
              </label>
              <div className="relative">
                <Input
                  id="register-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contrasena"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#5C7A5B] hover:bg-[#4A6249]" disabled={isSubmitting}>
              {isSubmitting ? "Creando cuenta..." : "Completar registro"}
            </Button>
          </form>
        ) : null}

        {view === "reset" && step === "request" ? (
          <form onSubmit={handleRequestResetCode} className="mt-6 space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Correo
              </label>
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="ganadero@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-[#5C7A5B] hover:bg-[#4A6249]" disabled={isSubmitting}>
              {isSubmitting ? "Enviando codigo..." : "Enviar codigo de restablecimiento"}
            </Button>
          </form>
        ) : null}

        {view === "reset" && step === "verify" ? (
          <form onSubmit={handleCompleteReset} className="mt-6 space-y-4">
            <div>
              <label htmlFor="reset-code" className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Codigo de verificacion
              </label>
              <Input
                id="reset-code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.trim())}
              />
            </div>

            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Nueva contrasena
              </label>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Minimo 6 caracteres"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="reset-confirm" className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Confirmar contrasena
              </label>
              <div className="relative">
                <Input
                  id="reset-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contrasena"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#5C7A5B] hover:bg-[#4A6249]" disabled={isSubmitting}>
              {isSubmitting ? "Actualizando contrasena..." : "Guardar nueva contrasena"}
            </Button>
          </form>
        ) : null}

        {authInfo ? (
          <p className="mt-4 text-sm text-[#2F6F43]" role="status">
            {authInfo}
          </p>
        ) : null}

        {authError ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {authError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

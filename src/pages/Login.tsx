import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  type CredentialResponse,
} from "@react-oauth/google";
import {
  captureReferralCodeFromUrl,
  clearStoredReferralCode,
  loginWithGoogle,
  loginWithPassword,
  readStoredReferralCode,
  useLoginForm,
} from "../features/auth";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import Loading from "../components/atoms/Loading";
import Toggle from "../components/atoms/Toggle";
import EyeIcon from "../components/atoms/icons/EyeIcon";
import EyeOffIcon from "../components/atoms/icons/EyeOffIcon";
import { brand, colors, typography } from "../config";
import { useToast } from "../shared/toast/useToast";
import { authRoutePaths, routePaths } from "../router";
import { useAuthSession } from "../features/auth";
import { AuthApiError } from "../api/auth/methods/http-error";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined;

export default function Login() {
  const navigate = useNavigate();
  const { showError, showSuccess, showToast } = useToast();
  const {
    setSession,
    isAuthenticated,
    requiresPasswordChange,
    isInitializing,
  } = useAuthSession();
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  useEffect(() => {
    captureReferralCodeFromUrl(window.location.search);
  }, []);

  useEffect(() => {
    if (isInitializing || !isAuthenticated) return;

    navigate(
      requiresPasswordChange
        ? authRoutePaths.firstAccessChangePassword
        : routePaths.dashboard,
      { replace: true },
    );
  }, [isAuthenticated, isInitializing, navigate, requiresPasswordChange]);

  const {
    form,
    updateField,
    errors,
    showPassword,
    toggleShowPassword,
    submit,
    submitting,
  } = useLoginForm({
    onSuccess: async ({ identifier, password }) => {
      try {
        const session = await loginWithPassword({
          username: identifier,
          password,
        });

        if (!session.authenticated) {
          showError(
            "Falha no login",
            "Não foi possível autenticar com estas credenciais.",
          );
          return;
        }

        setSession(session);
        showSuccess("Login realizado", `Bem-vindo, ${session.user.name}.`);

        if (session.mustChangePassword) {
          showToast({
            variant: "info",
            title: "Alteração de senha pendente",
            description:
              "Seu usuário requer troca de senha no primeiro acesso.",
          });

          navigate(authRoutePaths.firstAccessChangePassword, {
            replace: true,
          });
          return;
        }

        navigate(routePaths.dashboard, { replace: true });
      } catch (error) {
        const message =
          error instanceof AuthApiError || error instanceof Error
            ? error.message
            : "Não foi possível realizar o login. Tente novamente.";

        showError("Erro ao entrar", message);
      }
    },
  });

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      showError(
        "Falha no login",
        "Não foi possível obter as credenciais do Google.",
      );
      return;
    }

    setGoogleSubmitting(true);

    try {
      const session = await loginWithGoogle(
        credentialResponse.credential,
        readStoredReferralCode(),
      );

      if (!session.authenticated) {
        showError(
          "Falha no login",
          "Não foi possível autenticar com sua conta Google.",
        );
        return;
      }

      clearStoredReferralCode();
      setSession(session);
      showSuccess("Login realizado", `Bem-vindo, ${session.user.name}.`);

      if (session.mustChangePassword) {
        navigate(authRoutePaths.firstAccessChangePassword, { replace: true });
        return;
      }

      navigate(routePaths.dashboard, { replace: true });
    } catch (error) {
      const message =
        error instanceof AuthApiError || error instanceof Error
          ? error.message
          : "Não foi possível realizar o login com o Google. Tente novamente.";

      showError("Erro ao entrar", message);
    } finally {
      setGoogleSubmitting(false);
    }
  }

  const isBusy = submitting || googleSubmitting;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "transparent" }}
    >
      <div className="w-full max-w-md">
        {/* Logotipo */}
        <div className="flex flex-col items-center mb-8 select-none">
          <img
            src="/vaulto-logo-96.png"
            alt={brand.name}
            className="w-16 h-16 rounded-full mb-4 shadow-md"
          />
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{
              color: colors.white,
              fontFamily: typography.fontFamily,
            }}
          >
            {brand.name}
          </h1>
          <p
            className="text-sm mt-1"
            style={{
              color: colors.brown[300],
              fontFamily: typography.fontFamily,
            }}
          >
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Card */}
        <div
          className="relative rounded-2xl shadow-md border px-8 py-8"
          style={{
            borderColor: colors.brown[100],
            background: colors.black[800],
          }}
        >
          {googleSubmitting && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl"
              style={{ background: "rgba(10,8,20,0.85)" }}
            >
              <Loading size={32} />
              <p
                className="text-sm font-medium"
                style={{ color: colors.brown[100] }}
              >
                Entrando com sua conta Google...
              </p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isBusy) return;
              void submit();
            }}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Usuário */}
            <Input
              label="Usuário"
              type="text"
              placeholder="Digite seu usuário"
              value={form.identifier}
              onChange={(e) => updateField("identifier", e.target.value)}
              error={errors.identifier}
              autoComplete="username"
              autoFocus
              disabled={isBusy}
            />

            {/* Senha */}
            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              disabled={isBusy}
              trailing={
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  disabled={isBusy}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="flex items-center justify-center text-[#c5bbeb] hover:opacity-70 transition-opacity focus:outline-none disabled:opacity-40"
                >
                  {showPassword ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              }
            />

            {/* Lembrar usuário */}
            <div className="flex items-center gap-3">
              <Toggle
                checked={form.rememberMe}
                onChange={(v) => updateField("rememberMe", v)}
                aria-label="Lembrar meu usuário"
                disabled={isBusy}
              />
              <span
                className="text-sm select-none"
                style={{
                  color: colors.brown[300],
                  fontFamily: typography.fontFamily,
                  cursor: isBusy ? "not-allowed" : "pointer",
                  opacity: isBusy ? 0.6 : 1,
                }}
                onClick={() =>
                  !isBusy && updateField("rememberMe", !form.rememberMe)
                }
              >
                Lembrar meu usuário
              </span>
            </div>

            {/* Botão de entrar */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              disabled={isBusy}
              className="w-full mt-1"
            >
              Entrar
            </Button>

            <button
              type="button"
              disabled={isBusy}
              className="text-sm font-medium text-[#c5bbeb] hover:opacity-80 transition-opacity disabled:opacity-40 disabled:hover:opacity-40"
              onClick={() => navigate(authRoutePaths.passwordRecovery)}
            >
              Esqueci minha senha
            </button>
          </form>

          {GOOGLE_CLIENT_ID && (
            <>
              <div className="flex items-center gap-3 mt-6 mb-4">
                <div
                  className="h-px flex-1"
                  style={{ background: colors.brown[100] }}
                />
                <span className="text-xs" style={{ color: colors.brown[300] }}>
                  ou
                </span>
                <div
                  className="h-px flex-1"
                  style={{ background: colors.brown[100] }}
                />
              </div>

              <div
                className={`flex justify-center transition-opacity ${
                  isBusy ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (isBusy) return;
                      void handleGoogleSuccess(credentialResponse);
                    }}
                    onError={() => {
                      showError(
                        "Erro ao entrar",
                        "Não foi possível autenticar com o Google.",
                      );
                    }}
                    theme="filled_black"
                    text="signin_with"
                    shape="pill"
                  />
                </GoogleOAuthProvider>
              </div>
            </>
          )}

          <div className="flex justify-center mt-6">
            <Link
              to={authRoutePaths.landing}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c5bbeb] hover:opacity-80 transition-opacity"
            >
              <ArrowLeft size={16} />
              Voltar para o início
            </Link>
          </div>
        </div>

        {/* Rodapé */}
        <p
          className="text-center text-xs mt-6"
          style={{
            color: colors.brown[300],
            fontFamily: typography.fontFamily,
          }}
        >
          &copy; {new Date().getFullYear()} {brand.name}. Todos os direitos
          reservados.
        </p>
      </div>
    </div>
  );
}

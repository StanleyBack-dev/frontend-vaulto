import { useEffect, useRef } from "react";
import { ServerCrash } from "lucide-react";
import { apiHttp } from "../api/shared/http-client";
import { brand, colors } from "../config";

const HEALTH_CHECK_INTERVAL_MS = 15000;

export default function SystemUnstableScreen() {
  const isCheckingRef = useRef(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (isCheckingRef.current) {
        return;
      }

      isCheckingRef.current = true;
      apiHttp
        .get("/health")
        .catch(() => {})
        .finally(() => {
          isCheckingRef.current = false;
        });
    }, HEALTH_CHECK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#09090F] px-6">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <img
            src="/vaulto-logo-192.png"
            alt={brand.name}
            className="h-24 w-24 rounded-full"
          />
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(201,162,39,0.12)" }}
          >
            <ServerCrash size={32} style={{ color: colors.brown[300] }} />
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-2xl font-bold tracking-wide text-white">
            Estamos com instabilidade
          </h1>
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: colors.brown[300] }}
          >
            No momento não conseguimos nos conectar aos nossos servidores. Nossa
            equipe já foi notificada e está trabalhando para resolver isso o
            quanto antes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#C9A227] px-6 py-2.5 text-sm font-semibold text-[#2C1810] transition hover:brightness-95"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

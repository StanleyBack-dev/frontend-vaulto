import Loading from "../components/atoms/Loading";
import { brand, colors } from "../config";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#09090F]">
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-6">
          <img
            src="/vaulto-logo-192.png"
            alt={brand.name}
            className="h-32 w-32 rounded-full"
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-wide text-white">
              {brand.name}
            </h1>
            <p className="mt-2 text-sm" style={{ color: colors.brown[300] }}>
              {brand.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Loading size={32} />
          <span className="text-base font-semibold text-white">
            Carregando informações...
          </span>
        </div>
      </div>
    </div>
  );
}

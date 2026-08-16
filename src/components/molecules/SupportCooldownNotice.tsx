import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { colors } from "../../config";

interface SupportCooldownNoticeProps {
  nextAllowedAt: Date;
  onExpire: () => void;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function SupportCooldownNotice({
  nextAllowedAt,
  onExpire,
}: SupportCooldownNoticeProps) {
  const [remainingMs, setRemainingMs] = useState(
    () => nextAllowedAt.getTime() - Date.now(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const next = nextAllowedAt.getTime() - Date.now();
      setRemainingMs(next);

      if (next <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextAllowedAt, onExpire]);

  if (remainingMs <= 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#3a2f5e] bg-[#141225] px-4 py-3">
      <Clock
        size={18}
        style={{ color: colors.gold[500] }}
        className="shrink-0"
      />
      <p className="text-sm" style={{ color: colors.brown[500] }}>
        Você já enviou sua mensagem de hoje. Uma nova solicitação estará
        disponível em{" "}
        <span className="font-semibold" style={{ color: colors.gold[500] }}>
          {formatRemaining(remainingMs)}
        </span>
        .
      </p>
    </div>
  );
}

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Subscription } from "../../../api/billing/schema";
import { useAuthSession } from "../../auth/context/useAuthSession";
import { fetchMySubscription } from "../services/billing.service";

interface BillingContextValue {
  subscription: Subscription | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const BillingContext = createContext<BillingContextValue | null>(null);

interface BillingProviderProps {
  children: ReactNode;
}

export function BillingProvider({ children }: BillingProviderProps) {
  const { session } = useAuthSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchMySubscription();
      setSubscription(result);
    } catch {
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user.idUsers) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    void refresh();
  }, [session?.user.idUsers, refresh]);

  return (
    <BillingContext.Provider value={{ subscription, isLoading, refresh }}>
      {children}
    </BillingContext.Provider>
  );
}

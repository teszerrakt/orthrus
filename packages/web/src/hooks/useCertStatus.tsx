import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CertStatus } from "../types";
import { apiFetch } from "../utils/api";

interface CertStatusContextValue {
  certStatus: CertStatus | null;
  reloadCertStatus: () => Promise<void>;
}

const CertStatusContext = createContext<CertStatusContextValue | null>(null);

export function CertStatusProvider({ children }: { children: ReactNode }) {
  const [certStatus, setCertStatus] = useState<CertStatus | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await apiFetch("/cert/status");
      const body = (await res.json()) as CertStatus;
      setCertStatus(body);
    } catch {
      // Backend not ready yet — leave as null
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <CertStatusContext.Provider value={{ certStatus, reloadCertStatus: reload }}>
      {children}
    </CertStatusContext.Provider>
  );
}

export function useCertStatus(): CertStatusContextValue {
  const ctx = useContext(CertStatusContext);
  if (!ctx) throw new Error("useCertStatus must be used within <CertStatusProvider>");
  return ctx;
}

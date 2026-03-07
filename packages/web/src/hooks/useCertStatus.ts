import { useCallback, useEffect, useState } from "react";
import type { CertStatus } from "../types";
import { apiFetch } from "../utils/api";

export function useCertStatus() {
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

  return { certStatus, reloadCertStatus: reload };
}

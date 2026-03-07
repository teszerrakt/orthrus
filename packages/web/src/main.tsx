import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ConfigProvider } from "./hooks/useConfig";
import { CertStatusProvider } from "./hooks/useCertStatus";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider>
      <CertStatusProvider>
        <App />
      </CertStatusProvider>
    </ConfigProvider>
  </StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";
import { ThemeProvider } from "@/components/layout/theme-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="best-value-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

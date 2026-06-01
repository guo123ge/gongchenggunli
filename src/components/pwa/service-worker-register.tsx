"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __CSP_SW_READY__?: Promise<ServiceWorkerRegistration | null>;
  }
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    window.__CSP_SW_READY__ = navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .catch(() => {
        // PWA registration is progressive enhancement; the app remains usable if it fails.
        return null;
      });
  }, []);

  return null;
}

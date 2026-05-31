"use client";

import { useEffect, useState } from "react";
import { flushSyncQueue } from "@/db/sync-queue";

export function useOfflineSync() {
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    const update = async () => {
      setOnline(navigator.onLine);
      if (navigator.onLine) {
        await flushSyncQueue();
        setLastSync(new Date().toLocaleTimeString("zh-CN"));
      }
    };

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return { online, lastSync };
}


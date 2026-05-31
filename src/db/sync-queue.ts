"use client";

import { localDb, type SyncQueueRecord } from "./index";

export async function enqueueRequest(record: Omit<SyncQueueRecord, "id" | "createdAt" | "status">) {
  if (!localDb) return;
  await localDb.syncQueue.add({
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
  });
}

export async function flushSyncQueue() {
  if (!localDb || !navigator.onLine) return { synced: 0, failed: 0 };
  const pending = await localDb.syncQueue.where("status").equals("pending").toArray();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    await localDb.syncQueue.update(item.id, { status: "syncing" });
    try {
      await fetch(item.url, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: item.payload ? JSON.stringify(item.payload) : undefined,
      });
      await localDb.syncQueue.delete(item.id);
      synced += 1;
    } catch {
      await localDb.syncQueue.update(item.id, { status: "failed" });
      failed += 1;
    }
  }

  return { synced, failed };
}


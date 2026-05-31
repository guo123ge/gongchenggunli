"use client";

import Dexie, { type Table } from "dexie";

export type DraftRecord = {
  id: string;
  module: string;
  payload: unknown;
  updatedAt: string;
};

export type SyncQueueRecord = {
  id: string;
  method: "POST" | "PATCH" | "DELETE";
  url: string;
  payload?: unknown;
  createdAt: string;
  status: "pending" | "syncing" | "failed";
};

class ConstructionSiteDb extends Dexie {
  drafts!: Table<DraftRecord, string>;
  syncQueue!: Table<SyncQueueRecord, string>;

  constructor() {
    super("construction-site-platform");
    this.version(1).stores({
      drafts: "id,module,updatedAt",
      syncQueue: "id,status,createdAt",
    });
  }
}

export const localDb = typeof window === "undefined" ? null : new ConstructionSiteDb();


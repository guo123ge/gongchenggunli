"use client";

import { create } from "zustand";
import { localDb } from "@/db";

type DraftState = {
  saving: boolean;
  saveDraft: (id: string, module: string, payload: unknown) => Promise<void>;
};

export const useDraftStore = create<DraftState>((set) => ({
  saving: false,
  async saveDraft(id, module, payload) {
    if (!localDb) return;
    set({ saving: true });
    await localDb.drafts.put({
      id,
      module,
      payload,
      updatedAt: new Date().toISOString(),
    });
    set({ saving: false });
  },
}));


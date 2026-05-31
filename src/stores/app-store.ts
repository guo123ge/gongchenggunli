"use client";

import { create } from "zustand";

type AppState = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));


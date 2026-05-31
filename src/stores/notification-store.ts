"use client";

import { create } from "zustand";

type Notice = {
  id: string;
  title: string;
  type: "review" | "stock" | "safety" | "maintenance";
};

type NotificationState = {
  notices: Notice[];
  dismiss: (id: string) => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notices: [
    { id: "n1", title: "3 条记录等待审核", type: "review" },
    { id: "n2", title: "HRB400E 钢筋低于安全库存", type: "stock" },
  ],
  dismiss: (id) => set((state) => ({ notices: state.notices.filter((item) => item.id !== id) })),
}));


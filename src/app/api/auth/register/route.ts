import { NextResponse } from "next/server";
import { updateStore } from "@/lib/server-store";
import type { RegistrationRequest } from "@/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const displayName = String(body.displayName ?? body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const username = String(body.username ?? phone).trim();

  if (!displayName || !phone || !username) {
    return NextResponse.json({ ok: false, error: "Name, phone, and username are required." }, { status: 422 });
  }

  const created = await updateStore((data) => {
    const item: RegistrationRequest = {
      id: crypto.randomUUID(),
      username,
      displayName,
      phone,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    data.registrationRequests.unshift(item);
    return item;
  });

  return NextResponse.json({
    ok: true,
    data: {
      ...created,
      message: "Registration request submitted. A PM can assign the project role next.",
    },
  });
}

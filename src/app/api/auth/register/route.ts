import { NextResponse } from "next/server";
import { updateStore } from "@/lib/server-store";
import type { RegistrationRequest } from "@/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const displayName = String(body.displayName ?? body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const username = String(body.username ?? phone).trim();

  if (!displayName || !phone || !username) {
    return NextResponse.json({ ok: false, error: "姓名、手机号和账号不能为空。" }, { status: 422 });
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
      message: "注册申请已提交，项目经理可在审核中心分配项目角色。",
    },
  });
}

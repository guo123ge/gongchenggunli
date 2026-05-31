import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    data: {
      id: crypto.randomUUID(),
      username: body.username ?? body.phone ?? "new-user",
      message: "注册成功，等待 PM 分配项目角色",
    },
  });
}


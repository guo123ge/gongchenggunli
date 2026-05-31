import { NextResponse } from "next/server";
import { reviewSchema } from "@/lib/validators";

export async function GET() {
  const { reviewItems } = await import("@/lib/mock-data");
  return NextResponse.json({ ok: true, data: reviewItems });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "审核参数无效", details: parsed.error.flatten() }, { status: 422 });

  return NextResponse.json({
    ok: true,
    data: {
      ...parsed.data,
      status: parsed.data.action === "approve" ? "approved" : "rejected",
      reviewedAt: new Date().toISOString(),
      reviewer: "周项目",
    },
  });
}


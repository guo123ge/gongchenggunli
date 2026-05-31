import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({
    ok: true,
    data: {
      id: (await params).id,
      title: "钢筋原材复试报告",
      category: "试验资料",
      tags: ["钢筋", "复试"],
      version: "v1.0",
      status: "submitted",
    },
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, ...(await request.json().catch(() => ({}))) } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ ok: true, data: { id: (await params).id, deleted: true } });
}


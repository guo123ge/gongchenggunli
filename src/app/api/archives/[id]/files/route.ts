import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({
    ok: true,
    data: [
      { id: "file-001", archiveId: (await params).id, fileName: "复试报告.pdf", version: "v1.0", url: "/logo.svg" },
    ],
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({
    ok: true,
    data: { id: crypto.randomUUID(), archiveId: (await params).id, ...(await request.json().catch(() => ({}))) },
  });
}


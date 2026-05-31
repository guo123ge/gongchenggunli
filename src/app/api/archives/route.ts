import { NextResponse } from "next/server";

const archives = [
  { id: "ar-001", title: "地下室防水专项方案", category: "方案", tags: ["防水", "地下室"], version: "v1.2", status: "approved" },
  { id: "ar-002", title: "钢筋原材复试报告", category: "试验", tags: ["钢筋", "复试"], version: "v1.0", status: "submitted" },
];

export async function GET() {
  return NextResponse.json({ ok: true, data: archives });
}

export async function POST(request: Request) {
  return NextResponse.json({ ok: true, data: { id: crypto.randomUUID(), ...(await request.json().catch(() => ({}))), status: "submitted" } });
}


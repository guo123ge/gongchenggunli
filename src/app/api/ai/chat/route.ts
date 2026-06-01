import { NextResponse } from "next/server";
import { searchProjectKnowledge } from "@/lib/rag";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = String(body.message ?? "");
  const hits = await searchProjectKnowledge(message || "site");
  return NextResponse.json({
    ok: true,
    data: {
      reply: `Found ${hits.length} related project records. Review pending items, low-stock materials, and high-risk hazards first.`,
      hits,
    },
  });
}

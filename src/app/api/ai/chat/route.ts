import { NextResponse } from "next/server";
import { searchProjectKnowledge } from "@/lib/rag";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = String(body.message ?? "");
  const hits = searchProjectKnowledge(message || "现场");
  return NextResponse.json({
    ok: true,
    data: {
      reply: `已查询项目知识库，找到 ${hits.length} 条相关记录。建议优先查看待审记录、低库存材料和高风险隐患。`,
      hits,
    },
  });
}


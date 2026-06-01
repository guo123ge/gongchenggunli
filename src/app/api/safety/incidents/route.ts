import { NextResponse } from "next/server";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { createPrismaIncident, getPrismaIncidents } from "@/lib/prisma-repository";
import { readStore, updateStore } from "@/lib/server-store";
import type { SafetyIncident } from "@/types";

export async function GET() {
  if (isPrismaBackendEnabled()) return NextResponse.json({ ok: true, data: await getPrismaIncidents() });
  const data = await readStore();
  return NextResponse.json({ ok: true, data: data.incidents });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    const created = await createPrismaIncident(body);
    return NextResponse.json({ ok: true, data: created });
  }
  const created = await updateStore((data) => {
    const item: SafetyIncident = {
      id: crypto.randomUUID(),
      projectId: String(body.projectId ?? data.project.id),
      title: String(body.title ?? "Untitled safety incident"),
      incidentDate: String(body.incidentDate ?? new Date().toISOString().slice(0, 10)),
      level: body.level ?? body.riskLevel ?? "medium",
      description: String(body.description ?? body.title ?? "Pending incident description"),
      status: body.status ?? "submitted",
      submittedBy: String(body.submittedBy ?? "Safety Officer"),
    };
    data.incidents.unshift(item);
    return item;
  });
  return NextResponse.json({ ok: true, data: created });
}

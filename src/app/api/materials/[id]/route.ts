import { NextResponse } from "next/server";
import { readAppData } from "@/lib/app-data";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { deletePrismaMaterial, updatePrismaMaterial } from "@/lib/prisma-repository";
import { updateStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const material = data.materials.find((item) => item.id === id);
  if (!material) return NextResponse.json({ ok: false, error: "Material does not exist" }, { status: 404 });
  return NextResponse.json({ ok: true, data: material });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (isPrismaBackendEnabled()) {
    const updated = await updatePrismaMaterial(id, body);
    if (!updated) return NextResponse.json({ ok: false, error: "Material does not exist" }, { status: 404 });
    return NextResponse.json({ ok: true, data: updated });
  }
  const updated = await updateStore((data) => {
    const index = data.materials.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data.materials[index] = {
      ...data.materials[index],
      ...body,
      safetyStock: body.safetyStock === undefined ? data.materials[index].safetyStock : Number(body.safetyStock),
      currentStock: body.currentStock === undefined ? data.materials[index].currentStock : Number(body.currentStock),
      monthlyIn: body.monthlyIn === undefined ? data.materials[index].monthlyIn : Number(body.monthlyIn),
      monthlyOut: body.monthlyOut === undefined ? data.materials[index].monthlyOut : Number(body.monthlyOut),
    };
    return data.materials[index];
  });
  if (!updated) return NextResponse.json({ ok: false, error: "Material does not exist" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isPrismaBackendEnabled()) {
    const deleted = await deletePrismaMaterial(id);
    if (!deleted) return NextResponse.json({ ok: false, error: "Material does not exist" }, { status: 404 });
    return NextResponse.json({ ok: true, data: { id, deleted: true } });
  }
  const deleted = await updateStore((data) => {
    const exists = data.materials.some((item) => item.id === id);
    data.materials = data.materials.filter((item) => item.id !== id);
    data.stockIns = data.stockIns.filter((item) => item.materialId !== id);
    data.stockOuts = data.stockOuts.filter((item) => item.materialId !== id);
    return exists;
  });
  if (!deleted) return NextResponse.json({ ok: false, error: "Material does not exist" }, { status: 404 });
  return NextResponse.json({ ok: true, data: { id, deleted: true } });
}

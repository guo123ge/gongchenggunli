import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: {
      service: "施工现场综合管理平台",
      status: "正常",
      dataBackend: process.env.DATA_BACKEND ?? "json",
      primaryDomain: process.env.PUBLIC_PRIMARY_DOMAIN ?? "",
      secondaryDomain: process.env.PUBLIC_SECONDARY_DOMAIN ?? "",
      checkedAt: new Date().toISOString(),
    },
  });
}

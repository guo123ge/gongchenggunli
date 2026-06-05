import { NextResponse } from "next/server";
import { createTencentCosClient, getTencentCosConfig } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const config = getTencentCosConfig();
  if (!config) {
    return NextResponse.json({ ok: false, error: "腾讯云 COS 尚未完成配置。" }, { status: 503 });
  }

  const { key: keyParts } = await params;
  const key = keyParts.map((part) => decodeURIComponent(part)).join("/");
  if (!key || key.includes("..")) {
    return NextResponse.json({ ok: false, error: "文件路径无效。" }, { status: 400 });
  }

  const cos = createTencentCosClient(config);
  const signedUrl = cos.getObjectUrl({
    Bucket: config.bucket,
    Region: config.region,
    Key: key,
    Sign: true,
    Expires: 10 * 60,
  });

  return NextResponse.redirect(signedUrl);
}

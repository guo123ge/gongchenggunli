import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import COS from "cos-nodejs-sdk-v5";

type UploadInput = {
  file: File;
  fileName: string;
};

type UploadOutput = {
  filePath: string;
  url: string;
  storageProvider: "local" | "tencent-cos";
};

type CosConfig = {
  bucket: string;
  region: string;
  publicBaseUrl: string;
  secretId: string;
  secretKey: string;
  accessMode: "private" | "public";
};

export async function saveUploadedFile({ file, fileName }: UploadInput): Promise<UploadOutput> {
  const cosConfig = getTencentCosConfig();
  if (cosConfig) {
    return saveToTencentCos({ file, fileName }, cosConfig);
  }
  return saveToLocalDisk({ file, fileName });
}

export function getTencentCosConfig(): CosConfig | null {
  const bucket = process.env.TENCENT_COS_BUCKET?.trim();
  const region = process.env.TENCENT_COS_REGION?.trim();
  const publicBaseUrl = process.env.TENCENT_COS_PUBLIC_BASE_URL?.trim();
  const secretId = process.env.TENCENT_COS_SECRET_ID?.trim();
  const secretKey = process.env.TENCENT_COS_SECRET_KEY?.trim();
  const accessMode = process.env.TENCENT_COS_ACCESS_MODE?.trim() === "public" ? "public" : "private";

  if (!bucket || !region || !publicBaseUrl || !secretId || !secretKey) return null;
  return { bucket, region, publicBaseUrl, secretId, secretKey, accessMode };
}

export function createTencentCosClient(config: CosConfig) {
  return new COS({
    SecretId: config.secretId,
    SecretKey: config.secretKey,
  });
}

export function encodeCosKey(key: string) {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export function parseCosFilePath(filePath: string) {
  if (!filePath.startsWith("cos://")) return null;
  const withoutScheme = filePath.slice("cos://".length);
  const firstSlash = withoutScheme.indexOf("/");
  if (firstSlash <= 0) return null;
  return {
    bucket: withoutScheme.slice(0, firstSlash),
    key: withoutScheme.slice(firstSlash + 1),
  };
}

export function buildCosProxyUrl(fileName: string) {
  return `/api/storage/cos/${encodeCosKey(fileName)}`;
}

async function saveToLocalDisk({ file, fileName }: UploadInput): Promise<UploadOutput> {
  const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");
  const filePath = path.join(uploadDir, fileName);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  return {
    filePath,
    url: `/api/upload/${encodeURIComponent(fileName)}`,
    storageProvider: "local",
  };
}

async function saveToTencentCos({ file, fileName }: UploadInput, config: CosConfig): Promise<UploadOutput> {
  const cos = createTencentCosClient(config);
  const buffer = Buffer.from(await file.arrayBuffer());
  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: config.bucket,
        Region: config.region,
        Key: fileName,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      },
      (error) => {
        if (error) reject(error);
        else resolve();
      },
    );
  });

  return {
    filePath: `cos://${config.bucket}/${fileName}`,
    url: config.accessMode === "public" ? `${config.publicBaseUrl.replace(/\/$/, "")}/${encodeCosKey(fileName)}` : buildCosProxyUrl(fileName),
    storageProvider: "tencent-cos",
  };
}

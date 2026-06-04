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

export async function saveUploadedFile({ file, fileName }: UploadInput): Promise<UploadOutput> {
  if (canUseTencentCos()) {
    return saveToTencentCos({ file, fileName });
  }
  return saveToLocalDisk({ file, fileName });
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

async function saveToTencentCos({ file, fileName }: UploadInput): Promise<UploadOutput> {
  const bucket = process.env.TENCENT_COS_BUCKET?.trim();
  const region = process.env.TENCENT_COS_REGION?.trim();
  const publicBaseUrl = process.env.TENCENT_COS_PUBLIC_BASE_URL?.trim();
  const secretId = process.env.TENCENT_COS_SECRET_ID?.trim();
  const secretKey = process.env.TENCENT_COS_SECRET_KEY?.trim();

  if (!bucket || !region || !publicBaseUrl || !secretId || !secretKey) {
    return saveToLocalDisk({ file, fileName });
  }

  const cos = new COS({
    SecretId: secretId,
    SecretKey: secretKey,
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: bucket,
        Region: region,
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
    filePath: `cos://${bucket}/${fileName}`,
    url: `${publicBaseUrl.replace(/\/$/, "")}/${encodeURIComponent(fileName)}`,
    storageProvider: "tencent-cos",
  };
}

function canUseTencentCos() {
  return Boolean(
    process.env.TENCENT_COS_REGION?.trim() &&
      process.env.TENCENT_COS_BUCKET?.trim() &&
      process.env.TENCENT_COS_SECRET_ID?.trim() &&
      process.env.TENCENT_COS_SECRET_KEY?.trim() &&
      process.env.TENCENT_COS_PUBLIC_BASE_URL?.trim(),
  );
}

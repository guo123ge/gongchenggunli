const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const content = `archive verification ${Date.now()}`;
const file = new File([content], "archive-check.txt", { type: "text/plain" });
const formData = new FormData();
formData.set("file", file);

const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
  method: "POST",
  body: formData,
});
const uploadBody = await uploadResponse.json();
if (!uploadResponse.ok || !uploadBody.ok) {
  throw new Error(`upload failed: ${JSON.stringify(uploadBody)}`);
}

const downloadResponse = await fetch(`${baseUrl}${uploadBody.data.url}`);
const downloaded = await downloadResponse.text();
if (downloaded !== content) {
  throw new Error(`download mismatch: ${downloaded}`);
}

const archiveResponse = await fetch(`${baseUrl}/api/archives/ar-verify/files`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...uploadBody.data,
    version: "v1.0",
  }),
});
const archiveBody = await archiveResponse.json();
if (!archiveResponse.ok || !archiveBody.ok) {
  throw new Error(`archive file create failed: ${JSON.stringify(archiveBody)}`);
}

const listResponse = await fetch(`${baseUrl}/api/archives/ar-verify/files`);
const listBody = await listResponse.json();
const found = listBody.data.some((item) => item.id === archiveBody.data.id && item.url === uploadBody.data.url);
if (!found) {
  throw new Error("archive file was not persisted");
}

console.log(
  JSON.stringify(
    {
      ok: true,
      uploadedUrl: uploadBody.data.url,
      archiveFileId: archiveBody.data.id,
      fileCount: listBody.data.length,
    },
    null,
    2,
  ),
);


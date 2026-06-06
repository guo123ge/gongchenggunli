const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json();
  if (!response.ok || body.ok === false) throw new Error(`${path} failed: ${JSON.stringify(body)}`);
  return body.data;
}

const ocr = await requestJson("/api/ai/ocr", {
  method: "POST",
  body: JSON.stringify({ image: "" }),
});
const safety = await requestJson("/api/ai/safety-check", {
  method: "POST",
  body: JSON.stringify({ image: "" }),
});
const transcribeResponse = await fetch(`${baseUrl}/api/ai/transcribe`, {
  method: "POST",
  body: new Blob([new Uint8Array()]),
});
const transcribeBody = await transcribeResponse.json();
if (transcribeResponse.ok || transcribeBody.ok !== false || transcribeBody.reason !== "empty-audio") {
  throw new Error(`expected transcribe empty-audio failure: ${JSON.stringify(transcribeBody)}`);
}

if (ocr.provider !== "fallback") throw new Error(`expected OCR fallback provider: ${JSON.stringify(ocr)}`);
if (safety.provider !== "fallback") throw new Error(`expected safety fallback provider: ${JSON.stringify(safety)}`);

console.log(
  JSON.stringify(
    {
      ok: true,
      ocrProvider: ocr.provider,
      safetyProvider: safety.provider,
      transcribeStatus: transcribeBody.reason,
      transcribeMessage: transcribeBody.error,
    },
    null,
    2,
  ),
);

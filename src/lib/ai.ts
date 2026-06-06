type OcrResult = {
  supplier: string;
  materialName: string;
  quantity: number;
  unit: string;
  confidence: number;
};

type SafetyRiskResult = {
  riskLevel: "low" | "medium" | "high" | "critical";
  findings: string[];
  advice: string;
};

export type TranscriptionResult =
  | { ok: true; transcript: string; provider: "tencent-asr" | "openai" }
  | { ok: false; error: string; reason: "missing-api-key" | "empty-audio" | "unsupported-format" | "provider-error" };

const fallbackOcr: OcrResult = {
  supplier: "演示供应商",
  materialName: "C35 商品混凝土",
  quantity: 238,
  unit: "m3",
  confidence: 0.88,
};

const fallbackSafetyRisk: SafetyRiskResult = {
  riskLevel: "high",
  findings: ["疑似临边防护缺失", "作业材料堆放距离边缘过近"],
  advice: "请设置硬质防护栏，清理临边 1.5 米范围内材料，并上传复查照片。",
};

export async function ocrImage(base64Image: string): Promise<OcrResult & { provider: "openai" | "fallback" }> {
  if (!canUseOpenAi(base64Image)) return { ...fallbackOcr, provider: "fallback" };

  try {
    const result = await callOpenAiJson<OcrResult>({
      prompt: "Extract delivery ticket OCR fields as JSON only. Required keys: supplier, materialName, quantity, unit, confidence. confidence must be 0..1.",
      image: base64Image,
    });
    return {
      supplier: String(result.supplier ?? fallbackOcr.supplier),
      materialName: String(result.materialName ?? fallbackOcr.materialName),
      quantity: Number(result.quantity ?? fallbackOcr.quantity),
      unit: String(result.unit ?? fallbackOcr.unit),
      confidence: Number(result.confidence ?? fallbackOcr.confidence),
      provider: "openai",
    };
  } catch {
    return { ...fallbackOcr, provider: "fallback" };
  }
}

export async function analyzeSafetyRisk(base64Image: string): Promise<SafetyRiskResult & { provider: "openai" | "fallback" }> {
  if (!canUseOpenAi(base64Image)) return { ...fallbackSafetyRisk, provider: "fallback" };

  try {
    const result = await callOpenAiJson<SafetyRiskResult>({
      prompt: "Analyze this construction-site image for safety risk. Return JSON only with keys: riskLevel(low|medium|high|critical), findings(string array), advice(string).",
      image: base64Image,
    });
    return {
      riskLevel: normalizeRiskLevel(result.riskLevel),
      findings: Array.isArray(result.findings) ? result.findings.map(String).slice(0, 6) : fallbackSafetyRisk.findings,
      advice: String(result.advice ?? fallbackSafetyRisk.advice),
      provider: "openai",
    };
  } catch {
    return { ...fallbackSafetyRisk, provider: "fallback" };
  }
}

export async function extractTags(text: string) {
  return text
    .split(/[,\s，、]+/)
    .filter(Boolean)
    .slice(0, 6);
}

export async function transcribeAudio(audioBuffer: Buffer, contentType = "audio/webm"): Promise<TranscriptionResult> {
  if (audioBuffer.length === 0) {
    return { ok: false, error: "未接收到有效语音文件，请重新录音或上传音频文件。", reason: "empty-audio" };
  }

  if (canUseTencentAsr()) {
    const tencentResult = await transcribeWithTencentAsr(audioBuffer, contentType);
    if (tencentResult.ok || tencentResult.reason !== "unsupported-format" || !canUseOpenAiTranscribe()) {
      return tencentResult;
    }
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: canUseTencentAsr()
        ? "当前音频格式暂不支持腾讯云语音转写，请上传 m4a、mp3 或 wav 音频文件。"
        : "真实语音转写尚未配置，请先保存语音文件，待配置语音服务后再转写。",
      reason: canUseTencentAsr() ? "unsupported-format" : "missing-api-key",
    };
  }

  try {
    const formData = new FormData();
    formData.set("model", process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe");
    formData.set("file", new Blob([new Uint8Array(Array.from(audioBuffer.values()))], { type: "audio/webm" }), "site-audio.webm");
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });
    if (!response.ok) throw new Error(await response.text());
    const body = (await response.json()) as { text?: string };
    const transcript = body.text?.trim();
    if (!transcript) {
      return { ok: false, error: "未识别到语音内容，请确认录音清晰后重试。", reason: "provider-error" };
    }
    return { ok: true, transcript, provider: "openai" };
  } catch {
    return { ok: false, error: "语音转写服务暂不可用，语音文件已保存，可稍后重试。", reason: "provider-error" };
  }
}

async function transcribeWithTencentAsr(audioBuffer: Buffer, contentType: string): Promise<TranscriptionResult> {
  const voiceFormat = detectTencentVoiceFormat(contentType);
  if (!voiceFormat) {
    return { ok: false, error: "当前音频格式暂不支持腾讯云语音转写，请上传 m4a、mp3 或 wav 音频文件。", reason: "unsupported-format" };
  }

  try {
    const payload = {
      ProjectId: 0,
      SubServiceType: 2,
      EngSerViceType: process.env.TENCENT_ASR_ENGINE_MODEL_TYPE?.trim() || "16k_zh",
      SourceType: 1,
      VoiceFormat: voiceFormat,
      Data: audioBuffer.toString("base64"),
      DataLen: audioBuffer.length,
    };
    const response = await callTencentCloudApi("SentenceRecognition", payload);
    const transcript = String((response.Response as { Result?: unknown } | undefined)?.Result ?? "").trim();
    if (!transcript) {
      return { ok: false, error: "未识别到语音内容，请确认录音清晰后重试。", reason: "provider-error" };
    }
    return { ok: true, transcript, provider: "tencent-asr" };
  } catch {
    return { ok: false, error: "腾讯云语音转写暂不可用，语音文件已保存，可稍后重试。", reason: "provider-error" };
  }
}

async function callTencentCloudApi(action: string, payload: Record<string, unknown>) {
  const host = "asr.tencentcloudapi.com";
  const service = "asr";
  const version = "2019-06-14";
  const region = process.env.TENCENT_ASR_REGION?.trim() || "ap-shanghai";
  const secretId = process.env.TENCENT_ASR_SECRET_ID?.trim() ?? "";
  const secretKey = process.env.TENCENT_ASR_SECRET_KEY?.trim() ?? "";
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
  const body = JSON.stringify(payload);
  const hashedRequestPayload = await sha256Hex(body);
  const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\nx-tc-action:${action.toLowerCase()}\n`;
  const signedHeaders = "content-type;host;x-tc-action";
  const canonicalRequest = ["POST", "/", "", canonicalHeaders, signedHeaders, hashedRequestPayload].join("\n");
  const credentialScope = `${date}/${service}/tc3_request`;
  const stringToSign = ["TC3-HMAC-SHA256", timestamp, credentialScope, await sha256Hex(canonicalRequest)].join("\n");
  const secretDate = await hmacSha256(`TC3${secretKey}`, date);
  const secretService = await hmacSha256(secretDate, service);
  const secretSigning = await hmacSha256(secretService, "tc3_request");
  const signature = bufferToHex(await hmacSha256(secretSigning, stringToSign));
  const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${host}`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json; charset=utf-8",
      Host: host,
      "X-TC-Action": action,
      "X-TC-Timestamp": String(timestamp),
      "X-TC-Version": version,
      "X-TC-Region": region,
    },
    body,
  });
  const result = (await response.json()) as { Response?: { Error?: { Message?: string } } };
  if (!response.ok || result.Response?.Error) throw new Error(result.Response?.Error?.Message ?? "腾讯云语音接口调用失败");
  return result;
}

function detectTencentVoiceFormat(contentType: string) {
  const normalized = contentType.toLowerCase();
  if (normalized.includes("audio/mpeg") || normalized.includes("audio/mp3")) return "mp3";
  if (normalized.includes("audio/wav") || normalized.includes("audio/x-wav") || normalized.includes("audio/wave")) return "wav";
  if (normalized.includes("audio/mp4") || normalized.includes("audio/m4a") || normalized.includes("audio/x-m4a")) return "m4a";
  if (normalized.includes("audio/aac")) return "aac";
  if (normalized.includes("audio/ogg")) return "ogg-opus";
  if (normalized.includes("audio/amr")) return "amr";
  return "";
}

function canUseTencentAsr() {
  return Boolean(process.env.TENCENT_ASR_SECRET_ID?.trim() && process.env.TENCENT_ASR_SECRET_KEY?.trim());
}

function canUseOpenAiTranscribe() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

async function sha256Hex(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bufferToHex(hash);
}

async function hmacSha256(key: string | ArrayBuffer, value: string) {
  const rawKey = typeof key === "string" ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(value));
}

function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function canUseOpenAi(image: string) {
  return Boolean(process.env.OPENAI_API_KEY?.trim() && image.trim());
}

async function callOpenAiJson<T>({ prompt, image }: { prompt: string; image: string }): Promise<T> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-5-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: normalizeImageInput(image), detail: "low" },
          ],
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(await response.text());
  const body = (await response.json()) as { output_text?: string };
  return parseJsonPayload<T>(body.output_text ?? JSON.stringify(body));
}

function normalizeImageInput(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `data:image/jpeg;base64,${trimmed}`;
}

function parseJsonPayload<T>(value: string): T {
  const cleaned = value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned) as T;
}

function normalizeRiskLevel(value: unknown): SafetyRiskResult["riskLevel"] {
  if (value === "low" || value === "medium" || value === "high" || value === "critical") return value;
  return fallbackSafetyRisk.riskLevel;
}

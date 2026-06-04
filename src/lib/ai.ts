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

export async function transcribeAudio(audioBuffer: Buffer) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || audioBuffer.length === 0) {
    return "回退转写：今日完成地下室顶板混凝土浇筑，现场安全状态正常。";
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
    return body.text?.trim() || "未返回转写内容。";
  } catch {
    return "回退转写：语音转写暂不可用，请配置 OPENAI_API_KEY 后重试。";
  }
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

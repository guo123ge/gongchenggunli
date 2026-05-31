export async function ocrImage(base64Image: string) {
  void base64Image;
  return {
    supplier: "浦建商砼",
    materialName: "C35 商品混凝土",
    quantity: 238,
    unit: "m3",
    confidence: 0.88,
  };
}

export async function analyzeSafetyRisk(base64Image: string) {
  void base64Image;
  return {
    riskLevel: "high",
    findings: ["疑似临边防护缺失", "作业面材料堆放偏近"],
    advice: "设置硬质围挡，清理临边 1.5m 范围内材料，并上传复查照片。",
  };
}

export async function extractTags(text: string) {
  return text
    .split(/[，,。\s]+/)
    .filter(Boolean)
    .slice(0, 6);
}

export async function transcribeAudio(audioBuffer: Buffer) {
  void audioBuffer;
  return "语音转写占位：今日完成地下室顶板混凝土浇筑，现场安全状态正常。";
}

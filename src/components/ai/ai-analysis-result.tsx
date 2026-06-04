import { RiskBadge } from "@/components/shared/risk-badge";
import type { RiskLevel } from "@/types/enums";

type AiAnalysisResultProps = {
  result: {
    riskLevel: RiskLevel;
    findings: string[];
    advice: string;
    provider?: "openai" | "fallback";
  } | null;
};

export function AiAnalysisResult({ result }: AiAnalysisResultProps) {
  if (!result) {
    return <div className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4 text-sm text-sky-100">上传现场照片后可自动分析隐患等级，并给出整改建议。</div>;
  }

  return (
    <div className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-sky-100">智能风险分析结果</p>
        <RiskBadge level={result.riskLevel} />
      </div>
      <div className="mt-3 space-y-2 text-sm text-sky-50">
        {result.findings.map((item) => (
          <p key={item}>{`- ${item}`}</p>
        ))}
      </div>
      <p className="mt-3 rounded-xl bg-slate-950/30 p-3 text-sm text-sky-50">{result.advice}</p>
      <p className="mt-2 text-xs text-sky-200/90">数据来源：{result.provider === "openai" ? "云端模型" : "回退模型"}</p>
    </div>
  );
}

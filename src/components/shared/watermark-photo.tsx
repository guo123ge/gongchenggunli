export function WatermarkPhoto({
  src,
  projectName,
  position,
}: {
  src: string;
  projectName: string;
  position: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-panel">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={position} className="h-56 w-full object-cover p-8" />
      <div className="absolute inset-x-0 bottom-0 bg-black/70 p-3 text-xs text-white">
        {projectName} | {position} | {new Date().toLocaleString("zh-CN")} | GPS 待获取
      </div>
    </div>
  );
}


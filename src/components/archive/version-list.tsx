export function VersionList() {
  return (
    <div className="space-y-2">
      {["v1.2 当前版", "v1.1 补充签章", "v1.0 初版"].map((item) => (
        <div key={item} className="rounded-2xl border border-border bg-panel/60 p-3 text-sm">{item}</div>
      ))}
    </div>
  );
}


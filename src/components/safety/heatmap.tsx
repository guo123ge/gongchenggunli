export function Heatmap() {
  const areas = ["基坑北侧", "塔楼 A", "材料堆场", "加工棚", "生活区", "地下室 B"];
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {areas.map((area, index) => (
        <div key={area} className="rounded-2xl p-4 text-sm font-semibold text-white" style={{ background: `rgba(251, 113, 133, ${0.18 + index * 0.08})` }}>
          {area}
        </div>
      ))}
    </div>
  );
}


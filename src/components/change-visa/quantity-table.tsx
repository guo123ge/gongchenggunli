export function QuantityTable() {
  const rows = [
    { item: "夜间照明灯具", unit: "套", quantity: 12, price: 180 },
    { item: "发电机台班", unit: "台班", quantity: 3, price: 1200 },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.04] text-muted"><tr><th className="p-3 text-left">项目</th><th className="p-3 text-left">单位</th><th className="p-3 text-left">数量</th><th className="p-3 text-left">单价</th><th className="p-3 text-left">合价</th></tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row.item} className="border-t border-border"><td className="p-3">{row.item}</td><td className="p-3">{row.unit}</td><td className="p-3">{row.quantity}</td><td className="p-3">{row.price}</td><td className="p-3">{row.quantity * row.price}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}


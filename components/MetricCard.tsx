export function MetricCard({ title, value, detail }: { title: string; value: string | number; detail?: string }) {
  return (
    <div className="panel">
      <div className="card-title">{title}</div>
      <div className="metric">{value}</div>
      {detail ? <div className="small" style={{ marginTop: 8 }}>{detail}</div> : null}
    </div>
  );
}

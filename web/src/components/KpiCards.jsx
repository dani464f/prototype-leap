const KpiCards = ({ employees }) => {
  const totalEmployees = employees.length;
  const totalDevices = employees.filter((r) => r.device).length;
  const tierCounts = [1, 2, 3, 4].map((tier) => employees.filter((r) => r.tier?.currentTier === tier).length);

  const topTier4 = employees
    .filter((r) => r.tier?.currentTier === 4)
    .slice(0, 5)
    .map((r) => r.employee.name);

  return (
    <section className="kpi-grid">
      <article className="card"><h3>Employees</h3><p>{totalEmployees}</p></article>
      <article className="card"><h3>Devices</h3><p>{totalDevices}</p></article>
      <article className="card"><h3>Tier Distribution</h3>
        <p>T1 {Math.round((tierCounts[0] / totalEmployees) * 100) || 0}% · T2 {Math.round((tierCounts[1] / totalEmployees) * 100) || 0}% · T3 {Math.round((tierCounts[2] / totalEmployees) * 100) || 0}% · T4 {Math.round((tierCounts[3] / totalEmployees) * 100) || 0}%</p>
      </article>
      <article className="card"><h3>Top 5 Tier-4 Users</h3><p>{topTier4.length ? topTier4.join(', ') : 'None'}</p></article>
    </section>
  );
};

export default KpiCards;

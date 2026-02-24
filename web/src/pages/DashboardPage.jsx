import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import KpiCards from '../components/KpiCards';
import EmployeeTable from '../components/EmployeeTable';

const placeholders = [
  { title: 'Incident Correlation (Placeholder)', body: 'Link high-tier users with open incidents once ServiceNow incident data is connected.' },
  { title: 'Upgrade Recommendations (Placeholder)', body: 'Auto-generate hardware refresh recommendations for Tier 4 users with sustained high intensity.' },
  { title: 'Budget Forecast (Placeholder)', body: 'Estimate annual hardware budget impact from projected tier migration over the next 2 quarters.' }
];

const DashboardPage = () => {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ department: 'All', tier: 'All', query: '' });

  const loadData = async () => {
    const data = await api.getEmployees();
    setRows(data);
  };

  useEffect(() => { loadData(); }, []);

  const departments = useMemo(() => ['All', ...new Set(rows.map((r) => r.employee.department))], [rows]);
  const filtered = useMemo(() => rows.filter((r) => {
    const byDept = filters.department === 'All' || r.employee.department === filters.department;
    const byTier = filters.tier === 'All' || String(r.tier?.currentTier || 1) === filters.tier;
    const q = filters.query.toLowerCase();
    const byQuery = !q || r.employee.name.toLowerCase().includes(q) || r.device?.hostname.toLowerCase().includes(q);
    return byDept && byTier && byQuery;
  }), [rows, filters]);

  return (
    <div>
      <header className="page-header">
        <h2>Employee Device Performance Tiering</h2>
        <button onClick={async () => { await api.regenerateMock(); await loadData(); }}>Regenerate Mock Data</button>
      </header>
      <KpiCards employees={rows} />
      <section className="filters card">
        <select value={filters.department} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={filters.tier} onChange={(e) => setFilters((f) => ({ ...f, tier: e.target.value }))}>
          {['All', '1', '2', '3', '4'].map((t) => <option key={t} value={t}>Tier {t}</option>)}
        </select>
        <input placeholder="Search name or hostname" value={filters.query} onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))} />
      </section>
      <EmployeeTable rows={filtered} />
      <section className="placeholder-grid">
        {placeholders.map((item) => (
          <article className="card placeholder-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default DashboardPage;

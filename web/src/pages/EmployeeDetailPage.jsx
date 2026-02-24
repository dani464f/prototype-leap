import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import TelemetryChart from '../components/TelemetryChart';

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    const run = async () => {
      const detail = await api.getEmployee(id);
      setData(detail);
      const firstDevice = detail.devices?.[0];
      if (firstDevice) {
        const telemetry = await api.getTelemetry(firstDevice.id, '30m');
        setSamples(telemetry);
      }
    };
    run();
  }, [id]);

  if (!data) return <div className="card">Loading…</div>;

  const employee = data.employee;
  const device = data.devices[0];
  const tier = data.tiers[0];

  return (
    <div>
      <Link to="/">← Back to Dashboard</Link>
      <header className="page-header">
        <h2>{employee.name}</h2>
        <p>{employee.department} · {employee.role} · {employee.location}</p>
      </header>
      <section className="card">
        <h3>Device Information</h3>
        <p><strong>Hostname:</strong> {device?.hostname}</p>
        <p><strong>OS:</strong> {device?.os}</p>
        <p><strong>CPU:</strong> {device?.cpuModel}</p>
        <p><strong>GPU:</strong> {device?.gpuModel}</p>
        <p><strong>RAM:</strong> {device?.ramGb} GB</p>
      </section>
      <TelemetryChart samples={samples} />
      <section className="card">
        <h3>Tier Explanation</h3>
        <p><span className={`tier tier-${tier?.currentTier || 1}`}>Tier {tier?.currentTier || 1}</span></p>
        <p>{tier?.tierReason}</p>
        <p className="threshold-note">
          Thresholds: T1 &lt;20 + low GPU; T2 20-45; T3 45-70 or GPU≥40 & RAM≥50; T4 ≥70 or GPU≥70 or RAM≥85 & CPU≥75.
        </p>
      </section>
    </div>
  );
};

export default EmployeeDetailPage;

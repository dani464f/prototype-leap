import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

const TelemetryChart = ({ samples }) => {
  const chartData = samples.map((s) => ({
    time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: s.cpuUtilPct,
    ram: s.ramUtilPct,
    gpu: s.gpuUtilPct
  }));

  return (
    <div className="card chart-card">
      <h3>Telemetry (Last 30m)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cpu" stroke="#0070f3" dot={false} />
          <Line type="monotone" dataKey="ram" stroke="#00a870" dot={false} />
          <Line type="monotone" dataKey="gpu" stroke="#7a4cff" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TelemetryChart;

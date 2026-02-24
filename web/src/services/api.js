const API_BASE = 'http://localhost:4000/api';

export const api = {
  getEmployees: async () => (await fetch(`${API_BASE}/employees`)).json(),
  getEmployee: async (id) => (await fetch(`${API_BASE}/employees/${id}`)).json(),
  getTelemetry: async (deviceId, window = '30m') =>
    (await fetch(`${API_BASE}/devices/${deviceId}/telemetry?window=${window}`)).json(),
  getTiers: async () => (await fetch(`${API_BASE}/tiers`)).json(),
  regenerateMock: async () =>
    (await fetch(`${API_BASE}/mock/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeesCount: 24, samplesPerDevice: 30 })
    })).json()
};

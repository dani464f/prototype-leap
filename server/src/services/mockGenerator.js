import { v4 as uuidv4 } from 'uuid';
import { db, resetDb } from '../data/store.js';
import { recomputeAllTiers } from './tiering.js';

const locations = ['Austin', 'London', 'Bangalore', 'Berlin', 'Toronto'];
const gpuModels = ['Intel Iris Xe', 'NVIDIA T1000', 'NVIDIA RTX 3060', 'AMD Radeon Pro', 'NVIDIA RTX 4090'];
const cpuModels = ['Intel i5', 'Intel i7', 'AMD Ryzen 7', 'Apple M2', 'Intel Xeon'];
const osList = ['Windows 11', 'macOS Sonoma', 'Ubuntu 22.04'];

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const employeesCatalog = [
  { name: 'Avery Brooks', department: 'Operations', role: 'Office Coordinator', preferredTier: 1 },
  { name: 'Sofia Patel', department: 'Finance', role: 'AP Specialist', preferredTier: 1 },
  { name: 'Noah Kim', department: 'Sales', role: 'Account Executive', preferredTier: 2 },
  { name: 'Maya Chen', department: 'Marketing', role: 'Campaign Manager', preferredTier: 2 },
  { name: 'Lucas Silva', department: 'Engineering', role: 'Frontend Engineer', preferredTier: 3 },
  { name: 'Zara Nguyen', department: 'Data', role: 'Analytics Engineer', preferredTier: 3 },
  { name: 'Ethan Walker', department: 'Design', role: '3D Artist', preferredTier: 4 },
  { name: 'Priya Raman', department: 'Engineering', role: 'ML Engineer', preferredTier: 4 }
];

const hardwareByTier = {
  1: { ram: [8, 16], gpuPool: ['Intel Iris Xe'], cpuPool: ['Intel i5', 'Apple M2'] },
  2: { ram: [16, 24], gpuPool: ['Intel Iris Xe', 'NVIDIA T1000'], cpuPool: ['Intel i7', 'AMD Ryzen 7'] },
  3: { ram: [24, 48], gpuPool: ['NVIDIA RTX 3060', 'AMD Radeon Pro'], cpuPool: ['Intel i7', 'AMD Ryzen 7', 'Intel Xeon'] },
  4: { ram: [32, 64], gpuPool: ['NVIDIA RTX 4090', 'NVIDIA RTX 3060'], cpuPool: ['Intel Xeon', 'AMD Ryzen 7'] }
};

const buildProfile = (seedTier) => {
  const profileByTier = {
    1: { cpu: [5, 25], ram: [10, 35], gpu: [1, 10], disk: [5, 25], net: [5, 30] },
    2: { cpu: [20, 55], ram: [30, 60], gpu: [5, 25], disk: [15, 45], net: [10, 80] },
    3: { cpu: [40, 80], ram: [45, 80], gpu: [35, 70], disk: [25, 60], net: [30, 200] },
    4: { cpu: [65, 98], ram: [70, 98], gpu: [70, 99], disk: [35, 75], net: [40, 300] }
  };
  return profileByTier[seedTier];
};

export const generateMockData = ({ employeesCount = 24, samplesPerDevice = 30 } = {}) => {
  resetDb();

  for (let i = 0; i < employeesCount; i += 1) {
    const employeeId = uuidv4();
    const deviceId = uuidv4();
    const profile = employeesCatalog[i % employeesCatalog.length];
    const seedTier = profile.preferredTier;
    const hardwareProfile = hardwareByTier[seedTier];

    const cycle = Math.floor(i / employeesCatalog.length);
    const employee = {
      id: employeeId,
      name: cycle ? `${profile.name} ${cycle + 1}` : profile.name,
      department: profile.department,
      role: profile.role,
      location: pick(locations)
    };

    const device = {
      id: deviceId,
      employeeId,
      hostname: `corp-lt-${1000 + i}`,
      os: pick(osList),
      gpuModel: pick(hardwareProfile.gpuPool.length ? hardwareProfile.gpuPool : gpuModels),
      ramGb: Math.round(rand(...hardwareProfile.ram)),
      cpuModel: pick(hardwareProfile.cpuPool.length ? hardwareProfile.cpuPool : cpuModels)
    };

    db.employees.push(employee);
    db.devices.push(device);

    const telemetryProfile = buildProfile(seedTier);
    for (let s = 0; s < samplesPerDevice; s += 1) {
      const minutesAgo = samplesPerDevice - s;
      db.telemetry.push({
        id: uuidv4(),
        timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
        deviceId,
        cpuUtilPct: Number(rand(...telemetryProfile.cpu).toFixed(1)),
        ramUtilPct: Number(rand(...telemetryProfile.ram).toFixed(1)),
        gpuUtilPct: Number(rand(...telemetryProfile.gpu).toFixed(1)),
        diskUtilPct: Number(rand(...telemetryProfile.disk).toFixed(1)),
        netMbps: Number(rand(...telemetryProfile.net).toFixed(1))
      });
    }
  }

  recomputeAllTiers();

  return {
    employees: db.employees.length,
    devices: db.devices.length,
    telemetrySamples: db.telemetry.length,
    tiers: db.tiers.length
  };
};

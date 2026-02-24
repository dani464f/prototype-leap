import { v4 as uuidv4 } from 'uuid';
import { db, resetDb } from '../data/store.js';
import { recomputeAllTiers } from './tiering.js';

const depts = ['Engineering', 'Finance', 'Marketing', 'Operations', 'Sales'];
const roles = ['Analyst', 'Developer', 'Manager', 'Designer', 'Engineer'];
const locations = ['Austin', 'London', 'Bangalore', 'Berlin', 'Toronto'];
const gpuModels = ['Intel Iris Xe', 'NVIDIA T1000', 'NVIDIA RTX 3060', 'AMD Radeon Pro', 'NVIDIA RTX 4090'];
const cpuModels = ['Intel i5', 'Intel i7', 'AMD Ryzen 7', 'Apple M2', 'Intel Xeon'];
const osList = ['Windows 11', 'macOS Sonoma', 'Ubuntu 22.04'];

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

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
    const seedTier = (i % 4) + 1;

    const employee = {
      id: employeeId,
      name: `Employee ${i + 1}`,
      department: pick(depts),
      role: pick(roles),
      location: pick(locations)
    };

    const device = {
      id: deviceId,
      employeeId,
      hostname: `corp-lt-${1000 + i}`,
      os: pick(osList),
      gpuModel: pick(gpuModels),
      ramGb: Math.round(rand(8, 64)),
      cpuModel: pick(cpuModels)
    };

    db.employees.push(employee);
    db.devices.push(device);

    const profile = buildProfile(seedTier);
    for (let s = 0; s < samplesPerDevice; s += 1) {
      const minutesAgo = samplesPerDevice - s;
      db.telemetry.push({
        id: uuidv4(),
        timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
        deviceId,
        cpuUtilPct: Number(rand(...profile.cpu).toFixed(1)),
        ramUtilPct: Number(rand(...profile.ram).toFixed(1)),
        gpuUtilPct: Number(rand(...profile.gpu).toFixed(1)),
        diskUtilPct: Number(rand(...profile.disk).toFixed(1)),
        netMbps: Number(rand(...profile.net).toFixed(1))
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

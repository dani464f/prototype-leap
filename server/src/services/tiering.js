import { db } from '../data/store.js';

const DEFAULT_WINDOW_SAMPLES = 20;

export const tierThresholds = {
  tier1Max: 20,
  tier2Max: 45,
  tier3Max: 70,
  gpuTier3Min: 40,
  ramTier3Min: 50,
  gpuTier4Min: 70,
  ramTier4Min: 85,
  cpuTier4Min: 75
};

/**
 * Intensity score weights are intentionally simple for MVP tuning:
 * 30% CPU, 25% RAM, 35% GPU, 10% disk.
 */
export const computeIntensityScore = (sample) => (
  0.3 * sample.cpuUtilPct +
  0.25 * sample.ramUtilPct +
  0.35 * sample.gpuUtilPct +
  0.1 * sample.diskUtilPct
);

const avg = (samples, field) => {
  if (!samples.length) return 0;
  return samples.reduce((acc, s) => acc + Number(s[field] || 0), 0) / samples.length;
};

export const computeTierForDevice = (deviceId, windowSamples = DEFAULT_WINDOW_SAMPLES) => {
  const deviceSamples = db.telemetry
    .filter((s) => s.deviceId === deviceId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, windowSamples);

  if (!deviceSamples.length) {
    return {
      deviceId,
      currentTier: 1,
      tierReason: 'No telemetry yet; defaulted to Tier 1',
      lastUpdated: new Date().toISOString(),
      avgMetrics: { cpu: 0, ram: 0, gpu: 0, disk: 0, net: 0, intensityScore: 0 }
    };
  }

  const averages = {
    cpu: avg(deviceSamples, 'cpuUtilPct'),
    ram: avg(deviceSamples, 'ramUtilPct'),
    gpu: avg(deviceSamples, 'gpuUtilPct'),
    disk: avg(deviceSamples, 'diskUtilPct'),
    net: avg(deviceSamples, 'netMbps')
  };

  const intensityScore = computeIntensityScore({
    cpuUtilPct: averages.cpu,
    ramUtilPct: averages.ram,
    gpuUtilPct: averages.gpu,
    diskUtilPct: averages.disk
  });

  let currentTier = 2;
  let tierReason = `Balanced utilization profile (score ${intensityScore.toFixed(1)})`;

  // Tier rules (in descending order of intensity):
  // Tier 4 if score>=70 OR GPU>=70 OR (RAM>=85 AND CPU>=75)
  // Tier 3 if score 45-70 OR (GPU>=40 AND RAM>=50)
  // Tier 2 if score 20-45
  // Tier 1 if score<20 and GPU<10
  if (
    intensityScore >= tierThresholds.tier3Max ||
    averages.gpu >= tierThresholds.gpuTier4Min ||
    (averages.ram >= tierThresholds.ramTier4Min && averages.cpu >= tierThresholds.cpuTier4Min)
  ) {
    currentTier = 4;
    if (averages.gpu >= tierThresholds.gpuTier4Min) {
      tierReason = `High GPU utilization (avg ${averages.gpu.toFixed(1)}%) in recent window`;
    } else {
      tierReason = `Very high compute pressure (CPU ${averages.cpu.toFixed(1)}%, RAM ${averages.ram.toFixed(1)}%)`;
    }
  } else if (
    intensityScore >= tierThresholds.tier2Max ||
    (averages.gpu >= tierThresholds.gpuTier3Min && averages.ram >= tierThresholds.ramTier3Min)
  ) {
    currentTier = 3;
    tierReason = `Power-user pattern (score ${intensityScore.toFixed(1)}, GPU ${averages.gpu.toFixed(1)}%)`;
  } else if (intensityScore < tierThresholds.tier1Max && averages.gpu < 10) {
    currentTier = 1;
    tierReason = `Light usage profile (score ${intensityScore.toFixed(1)})`;
  }

  return {
    deviceId,
    currentTier,
    tierReason,
    lastUpdated: new Date().toISOString(),
    avgMetrics: { ...averages, intensityScore: Number(intensityScore.toFixed(2)) }
  };
};

export const recomputeAllTiers = () => {
  db.tiers = db.devices.map((device) => computeTierForDevice(device.id));
  return db.tiers;
};

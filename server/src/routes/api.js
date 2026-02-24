import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/store.js';
import { parseWindowToMs } from '../utils/time.js';
import { computeTierForDevice, recomputeAllTiers } from '../services/tiering.js';
import { generateMockData } from '../services/mockGenerator.js';
import { mapToServiceNowPayload, sendToServiceNow } from '../integrations/serviceNowStub.js';

const router = express.Router();

router.get('/employees', (_req, res) => {
  const rows = db.employees.map((employee) => {
    const device = db.devices.find((d) => d.employeeId === employee.id);
    const tier = device ? db.tiers.find((t) => t.deviceId === device.id) : null;
    return { employee, device, tier };
  });
  res.json(rows);
});

router.get('/employees/:id', (req, res) => {
  const employee = db.employees.find((e) => e.id === req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  const devices = db.devices.filter((d) => d.employeeId === employee.id);
  const tiers = devices.map((d) => db.tiers.find((t) => t.deviceId === d.id)).filter(Boolean);
  res.json({ employee, devices, tiers });
});

router.get('/devices', (_req, res) => res.json(db.devices));

router.get('/devices/:id/telemetry', (req, res) => {
  const windowMs = parseWindowToMs(req.query.window || '30m');
  const fromTs = Date.now() - windowMs;
  const samples = db.telemetry
    .filter((s) => s.deviceId === req.params.id && new Date(s.timestamp).getTime() >= fromTs)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  res.json(samples);
});

router.get('/tiers', (_req, res) => res.json(db.tiers));

router.post('/telemetry/ingest', (req, res) => {
  const payload = req.body;
  const samples = Array.isArray(payload) ? payload : [payload];

  const inserted = [];
  for (const sample of samples) {
    const entry = {
      id: uuidv4(),
      timestamp: sample.timestamp || new Date().toISOString(),
      deviceId: sample.deviceId,
      cpuUtilPct: Number(sample.cpuUtilPct || 0),
      ramUtilPct: Number(sample.ramUtilPct || 0),
      gpuUtilPct: Number(sample.gpuUtilPct || 0),
      diskUtilPct: Number(sample.diskUtilPct || 0),
      netMbps: Number(sample.netMbps || 0)
    };
    db.telemetry.push(entry);
    inserted.push(entry);
  }

  const touchedDeviceIds = [...new Set(inserted.map((s) => s.deviceId))];
  for (const deviceId of touchedDeviceIds) {
    const nextTier = computeTierForDevice(deviceId);
    db.tiers = db.tiers.filter((t) => t.deviceId !== deviceId).concat(nextTier);

    const device = db.devices.find((d) => d.id === deviceId);
    if (device) {
      const payloadToSN = mapToServiceNowPayload({
        device,
        telemetrySample: inserted.find((s) => s.deviceId === deviceId),
        tierResult: nextTier
      });
      sendToServiceNow(payloadToSN);
    }
  }

  res.status(201).json({ inserted: inserted.length, updatedTiers: touchedDeviceIds.length });
});

router.post('/mock/generate', (req, res) => {
  const result = generateMockData(req.body || {});
  res.json({ message: 'Mock data generated', ...result });
});

router.post('/tiers/recompute', (_req, res) => {
  const tiers = recomputeAllTiers();
  res.json({ updated: tiers.length });
});

export default router;

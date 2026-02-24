export const db = {
  employees: [],
  devices: [],
  telemetry: [],
  tiers: []
};

export const resetDb = () => {
  db.employees = [];
  db.devices = [];
  db.telemetry = [];
  db.tiers = [];
};

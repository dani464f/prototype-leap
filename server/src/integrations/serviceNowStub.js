/**
 * Mock mapping for ServiceNow custom tables.
 * In production, these would be sent via ServiceNow Table API endpoints.
 */
export const mapToServiceNowPayload = ({ device, telemetrySample, tierResult }) => ({
  x_company_device: {
    u_device_id: device.id,
    u_employee_id: device.employeeId,
    u_hostname: device.hostname,
    u_os: device.os,
    u_gpu_model: device.gpuModel,
    u_cpu_model: device.cpuModel,
    u_ram_gb: device.ramGb
  },
  x_company_telemetry: telemetrySample
    ? {
        u_device_id: telemetrySample.deviceId,
        u_timestamp: telemetrySample.timestamp,
        u_cpu_util_pct: telemetrySample.cpuUtilPct,
        u_ram_util_pct: telemetrySample.ramUtilPct,
        u_gpu_util_pct: telemetrySample.gpuUtilPct,
        u_disk_util_pct: telemetrySample.diskUtilPct,
        u_net_mbps: telemetrySample.netMbps
      }
    : null,
  x_company_tier_result: tierResult
    ? {
        u_device_id: tierResult.deviceId,
        u_current_tier: tierResult.currentTier,
        u_tier_reason: tierResult.tierReason,
        u_last_updated: tierResult.lastUpdated
      }
    : null
});

export const sendToServiceNow = (payload) => {
  console.log('[ServiceNowStub] Would POST payload to ServiceNow REST API:', JSON.stringify(payload, null, 2));
  return { ok: true, mocked: true };
};

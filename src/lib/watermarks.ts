export type WatermarkPayload = {
  projectName: string;
  workDate: string;
  position: string;
  gps?: string;
};

export function createWatermarkText(payload: WatermarkPayload) {
  return `${payload.projectName} | ${payload.workDate} | ${payload.position} | ${payload.gps ?? "GPS 待获取"}`;
}


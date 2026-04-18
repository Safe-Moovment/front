export type DeviceStatus = 'active' | 'warning' | 'critical';

export type DeviceApiModel = {
  id: string;
  animalId: string;
  battery: number;
  signal: number;
  status: DeviceStatus;
  lastPing: string;
  hardwareVersion: string;
  solarCharging: boolean;
  protocol: 'LoRaWAN' | 'LTE' | 'NB-IoT';
  lastSyncMode: 'Store & Forward' | 'Real-time';
  gatewayId: string;
  alertsCount: number;
};

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

function getApiBaseUrl(): string {
  return (
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
    DEFAULT_API_BASE_URL
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const rawText = await response.text();
  let payload = {} as T & { message?: string };

  if (rawText) {
    try {
      payload = JSON.parse(rawText) as T & { message?: string };
    } catch {
      payload = { message: rawText } as T & { message?: string };
    }
  }

  if (!response.ok) {
    throw new Error(payload.message || 'No se pudo completar la solicitud de dispositivos.');
  }

  return payload as T;
}

export async function fetchDevicesApi(): Promise<DeviceApiModel[]> {
  return request<DeviceApiModel[]>('/devices', { method: 'GET' });
}

export async function createDeviceApi(payload: DeviceApiModel): Promise<DeviceApiModel> {
  return request<DeviceApiModel>('/devices', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDeviceApi(
  id: string,
  payload: Partial<Omit<DeviceApiModel, 'id'>>,
): Promise<DeviceApiModel> {
  return request<DeviceApiModel>(`/devices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export type AnimalHealth = 'Excelente' | 'Buena' | 'Atención' | 'Alerta';
export type AnimalStatus = 'ok' | 'alert';

export type AnimalApiModel = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  health: AnimalHealth;
  battery: number;
  temp: number;
  lastUpdate: string;
  status: AnimalStatus;
  locationText: string;
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
    throw new Error(payload.message || 'No se pudo completar la solicitud de ganado.');
  }

  return payload as T;
}

export async function fetchAnimalsApi(): Promise<AnimalApiModel[]> {
  return request<AnimalApiModel[]>('/animals', { method: 'GET' });
}

export async function createAnimalApi(payload: AnimalApiModel): Promise<AnimalApiModel> {
  return request<AnimalApiModel>('/animals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAnimalApi(
  id: string,
  payload: Partial<Omit<AnimalApiModel, 'id'>>,
): Promise<AnimalApiModel> {
  return request<AnimalApiModel>(`/animals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

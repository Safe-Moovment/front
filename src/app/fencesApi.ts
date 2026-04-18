export type FenceApiModel = {
  id: string;
  name: string;
  area: string;
  animals: number;
  status: 'active' | 'inactive';
  violations: number;
  color: string;
  coordinates: [number, number][];
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
    throw new Error(payload.message || 'No se pudo completar la solicitud de vallas.');
  }

  return payload as T;
}

export async function fetchFencesApi(): Promise<FenceApiModel[]> {
  return request<FenceApiModel[]>('/fences', { method: 'GET' });
}

export async function createFenceApi(payload: FenceApiModel): Promise<FenceApiModel> {
  return request<FenceApiModel>('/fences', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateFenceApi(
  id: string,
  payload: Partial<Omit<FenceApiModel, 'id'>>,
): Promise<FenceApiModel> {
  return request<FenceApiModel>(`/fences/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteFenceApi(id: string): Promise<{ deleted: boolean; id: string }> {
  return request<{ deleted: boolean; id: string }>(`/fences/${id}`, {
    method: 'DELETE',
  });
}

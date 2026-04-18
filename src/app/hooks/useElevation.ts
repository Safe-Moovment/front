import { useState, useCallback, useRef } from "react";

export interface ElevationPoint {
  lat: number;
  lng: number;
  elevation: number | null;
}

interface UseElevationReturn {
  data: ElevationPoint[];
  loading: boolean;
  error: string | null;
  fetchElevations: (locations: { lat: number; lng: number }[]) => Promise<ElevationPoint[]>;
  fetchSingleElevation: (lat: number, lng: number) => Promise<number | null>;
  fetchHeadlessBatch: (locations: { lat: number; lng: number }[]) => Promise<ElevationPoint[]>;
}

const DEFAULT_API_BASE_URL = "http://localhost:3000";
const MAX_LOCATIONS_PER_REQUEST = 100;

// Simple in-memory cache keyed by "lat,lng" rounded to 4 decimals
const elevationCache = new Map<string, number>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_API_BASE_URL;
}

// Global Execution Queue to completely shield against rate spikes.
let queueChain: Promise<any> = Promise.resolve();

async function queuedFetch(locations: { lat: number; lng: number }[]): Promise<any> {
  const result = new Promise<any>((resolve, reject) => {
    queueChain = queueChain.then(async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/elevation/batch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ locations }),
        });
        if (!res.ok) {
          throw new Error(`Elevation API error: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        resolve(json);
      } catch (e) {
        reject(e);
      }
      
      await new Promise(r => setTimeout(r, 50)); 
    });
  });
  return result;
}

async function fetchBatch(
  locations: { lat: number; lng: number }[]
): Promise<ElevationPoint[]> {
  // Check cache first
  const uncached: { lat: number; lng: number; index: number }[] = [];
  const results: ElevationPoint[] = locations.map((loc) => ({
    lat: loc.lat,
    lng: loc.lng,
    elevation: elevationCache.get(cacheKey(loc.lat, loc.lng)) ?? null,
  }));

  locations.forEach((loc, i) => {
    if (!elevationCache.has(cacheKey(loc.lat, loc.lng))) {
      uncached.push({ ...loc, index: i });
    }
  });

  if (uncached.length === 0) return results;

  // Split uncached into batches of MAX_LOCATIONS_PER_REQUEST
  const batches: typeof uncached[] = [];
  for (let i = 0; i < uncached.length; i += MAX_LOCATIONS_PER_REQUEST) {
    batches.push(uncached.slice(i, i + MAX_LOCATIONS_PER_REQUEST));
  }

  for (const batch of batches) {
    const json = await queuedFetch(batch.map((l) => ({ lat: l.lat, lng: l.lng })));

    json.forEach((result: { elevation: number | null }, i: number) => {
      const originalIndex = batch[i].index;
      const elev = result.elevation;
      results[originalIndex].elevation = elev;
      if (elev !== null) {
        elevationCache.set(cacheKey(batch[i].lat, batch[i].lng), elev);
      }
    });
  }

  return results;
}

export function useElevation(): UseElevationReturn {
  const [data, setData] = useState<ElevationPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(0);

  const fetchElevations = useCallback(
    async (locations: { lat: number; lng: number }[]): Promise<ElevationPoint[]> => {
      const requestId = ++abortRef.current;
      setLoading(true);
      setError(null);

      try {
        const results = await fetchBatch(locations);
        // Only update state if this is still the latest request
        if (requestId === abortRef.current) {
          setData(results);
          setLoading(false);
        }
        return results;
      } catch (err) {
        if (requestId === abortRef.current) {
          setError(err instanceof Error ? err.message : "Error fetching elevation data");
          setLoading(false);
        }
        return [];
      }
    },
    []
  );

  const fetchSingleElevation = useCallback(
    async (lat: number, lng: number): Promise<number | null> => {
      const cached = elevationCache.get(cacheKey(lat, lng));
      if (cached !== undefined) return cached;

      try {
        const results = await fetchBatch([{ lat, lng }]);
        return results[0]?.elevation ?? null;
      } catch {
        return null; // Return silently if single point fails
      }
    },
    []
  );

  const fetchHeadlessBatch = useCallback(
    async (locations: { lat: number; lng: number }[]): Promise<ElevationPoint[]> => {
      try {
        return await fetchBatch(locations);
      } catch {
        return locations.map(loc => ({ lat: loc.lat, lng: loc.lng, elevation: null }));
      }
    },
    []
  );

  return { data, loading, error, fetchElevations, fetchSingleElevation, fetchHeadlessBatch };
}

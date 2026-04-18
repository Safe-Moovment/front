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

const OPEN_TOPO_DATA_URL = "https://api.opentopodata.org/v1/srtm30m";
const MAX_LOCATIONS_PER_REQUEST = 100;

// Simple in-memory cache keyed by "lat,lng" rounded to 4 decimals
const elevationCache = new Map<string, number>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

// Global Execution Queue to completely shield against "429 Too Many Requests"
let queueChain: Promise<any> = Promise.resolve();

async function queuedFetch(url: string): Promise<any> {
  const result = new Promise<any>((resolve, reject) => {
    queueChain = queueChain.then(async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`OpenTopoData API error: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        if (json.status !== "OK") {
          throw new Error(`OpenTopoData returned status: ${json.status}`);
        }
        resolve(json);
      } catch (e) {
        reject(e);
      }
      
      // Enforce absolute rate limit (1 req/sec max) for OpenTopoData
      await new Promise(r => setTimeout(r, 1200)); 
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
    const locString = batch.map((l) => `${l.lat},${l.lng}`).join("|");
    const url = `${OPEN_TOPO_DATA_URL}?locations=${locString}&interpolation=bilinear`;

    const json = await queuedFetch(url);

    json.results.forEach((result: { elevation: number | null; location: { lat: number; lng: number } }, i: number) => {
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

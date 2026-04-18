import { useState, useEffect, useCallback, useMemo } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Mountain,
  MapPin,
  AlertTriangle,
  Loader2,
  MousePointerClick,
  TriangleAlert,
  Layers,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useElevation, type ElevationPoint } from "../../hooks/useElevation";

import { useDashboard, Fence } from "../../context/DashboardContext";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const GRID_BOUNDS = {
  north: 20.664,
  south: 20.656,
  east: -103.345,
  west: -103.352,
};

// Generate grid points for elevation sampling
function generateGrid(
  bounds: typeof GRID_BOUNDS,
  rows: number,
  cols: number
): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  const latStep = (bounds.north - bounds.south) / rows;
  const lngStep = (bounds.east - bounds.west) / cols;

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      points.push({
        lat: bounds.south + r * latStep,
        lng: bounds.west + c * lngStep,
      });
    }
  }
  return points;
}

// Elevation-to-color mapping
function elevationToColor(
  elevation: number,
  min: number,
  max: number
): string {
  const range = max - min || 1;
  const t = Math.max(0, Math.min(1, (elevation - min) / range));

  // Green (low) → Yellow (mid) → Orange → Red (high)
  if (t < 0.25) {
    const s = t / 0.25;
    const r = Math.round(34 + s * (76 - 34));
    const g = Math.round(139 + s * (175 - 139));
    const b = Math.round(34 + s * (80 - 34));
    return `rgba(${r}, ${g}, ${b}, 0.45)`;
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25;
    const r = Math.round(76 + s * (200 - 76));
    const g = Math.round(175 + s * (200 - 175));
    const b = Math.round(80 - s * 40);
    return `rgba(${r}, ${g}, ${b}, 0.45)`;
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25;
    const r = Math.round(200 + s * (230 - 200));
    const g = Math.round(200 - s * 80);
    const b = Math.round(40 - s * 10);
    return `rgba(${r}, ${g}, ${b}, 0.45)`;
  } else {
    const s = (t - 0.75) / 0.25;
    const r = Math.round(230 + s * 25);
    const g = Math.round(120 - s * 70);
    const b = Math.round(30 + s * 15);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  }
}

// Calculate slope between adjacent elevation points in degrees
function calculateSlope(
  elevA: number,
  elevB: number,
  distanceMeters: number
): number {
  const rise = Math.abs(elevA - elevB);
  return (Math.atan(rise / distanceMeters) * 180) / Math.PI;
}

// Approximate distance between two lat/lng points in meters
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ----- Elevation Overlay Component -----
function ElevationOverlay({
  elevationGrid,
  gridRows,
  gridCols,
  stats,
}: {
  elevationGrid: ElevationPoint[];
  gridRows: number;
  gridCols: number;
  stats: { min: number; max: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || elevationGrid.length === 0) return;

    const rectangles: google.maps.Rectangle[] = [];

    const latStep =
      (GRID_BOUNDS.north - GRID_BOUNDS.south) / gridRows;
    const lngStep =
      (GRID_BOUNDS.east - GRID_BOUNDS.west) / gridCols;

    elevationGrid.forEach((point) => {
      if (point.elevation === null) return;

      const rect = new google.maps.Rectangle({
        bounds: {
          north: point.lat + latStep / 2,
          south: point.lat - latStep / 2,
          east: point.lng + lngStep / 2,
          west: point.lng - lngStep / 2,
        },
        fillColor: elevationToColor(point.elevation, stats.min, stats.max),
        fillOpacity: 0.6,
        strokeColor: elevationToColor(point.elevation, stats.min, stats.max),
        strokeOpacity: 0.2,
        strokeWeight: 0.5,
        map,
        clickable: false,
      });
      rectangles.push(rect);
    });

    return () => {
      rectangles.forEach((r) => r.setMap(null));
    };
  }, [map, elevationGrid, gridRows, gridCols, stats]);

  return null;
}

// ----- Risk Zones Component -----
function RiskZones({
  elevationGrid,
  gridRows,
  gridCols,
}: {
  elevationGrid: ElevationPoint[];
  gridRows: number;
  gridCols: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || elevationGrid.length === 0) return;

    const cols = gridCols + 1;
    const circles: google.maps.Circle[] = [];

    for (let i = 0; i < elevationGrid.length; i++) {
      const point = elevationGrid[i];
      if (point.elevation === null) continue;

      // Check neighbors (right and above)
      const col = i % cols;
      const row = Math.floor(i / cols);

      const neighbors: number[] = [];
      if (col < gridCols) neighbors.push(i + 1); // right
      if (row < gridRows) neighbors.push(i + cols); // above

      for (const ni of neighbors) {
        const neighbor = elevationGrid[ni];
        if (!neighbor || neighbor.elevation === null) continue;

        const dist = haversineDistance(
          point.lat,
          point.lng,
          neighbor.lat,
          neighbor.lng
        );
        const slope = calculateSlope(point.elevation, neighbor.elevation, dist);

        if (slope > 30) {
          const midLat = (point.lat + neighbor.lat) / 2;
          const midLng = (point.lng + neighbor.lng) / 2;

          const circle = new google.maps.Circle({
            center: { lat: midLat, lng: midLng },
            radius: 30,
            fillColor: "#B94A3E",
            fillOpacity: 0.35,
            strokeColor: "#B94A3E",
            strokeOpacity: 0.8,
            strokeWeight: 1.5,
            map,
            clickable: false,
          });
          circles.push(circle);
        }
      }
    }

    return () => {
      circles.forEach((c) => c.setMap(null));
    };
  }, [map, elevationGrid, gridRows, gridCols]);

  return null;
}

function VirtualFencesOverlay({
  fences,
}: {
  fences: Array<{
    id: string;
    status: "active" | "inactive";
    color: string;
    coordinates: [number, number][];
  }>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || fences.length === 0) return;

    const polygons: google.maps.Polygon[] = [];

    fences.forEach((fence) => {
      if (fence.coordinates.length < 3) return;

      const polygon = new google.maps.Polygon({
        map,
        paths: fence.coordinates.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: fence.color,
        strokeOpacity: fence.status === "active" ? 0.95 : 0.5,
        strokeWeight: fence.status === "active" ? 2.5 : 1.5,
        fillColor: fence.color,
        fillOpacity: fence.status === "active" ? 0.12 : 0.05,
        clickable: false,
      });

      polygons.push(polygon);
    });

    return () => {
      polygons.forEach((polygon) => polygon.setMap(null));
    };
  }, [map, fences]);

  return null;
}

function isPointInsidePolygon(
  point: { lat: number; lng: number },
  polygon: [number, number][],
): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersects =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi + Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function PanController({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
    map.setZoom(16);
  }, [map, target]);

  return null;
}

function FenceBoundsController({ fences }: { fences: Fence[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || fences.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    fences.forEach((fence) => {
      fence.coordinates.forEach(([lat, lng]) => {
        bounds.extend({ lat, lng });
        hasPoints = true;
      });
    });

    if (!hasPoints) return;

    map.fitBounds(bounds, 64);
  }, [map, fences]);

  return null;
}

export function ElevationMapView() {
  const { animals, fences, fencesLoading, fencesError, ranchContext } = useDashboard();
  const RANCH_CENTER = { lat: ranchContext.lat, lng: ranchContext.lng };

  const GRID_ROWS = 10;
  const GRID_COLS = 10;

  const { data: elevationGrid, loading, error, fetchElevations, fetchSingleElevation, fetchHeadlessBatch } =
    useElevation();

  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [animalElevations, setAnimalElevations] = useState<Record<string, number | null>>({});
  const [clickedPoint, setClickedPoint] = useState<{
    lat: number;
    lng: number;
    elevation: number | null;
  } | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [mapTypeId, setMapTypeId] = useState<string>("terrain");
  const [panTarget, setPanTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Generate grid points once
  const gridPoints = useMemo(
    () => generateGrid(GRID_BOUNDS, GRID_ROWS, GRID_COLS),
    []
  );

  // Fetch grid elevations on mount
  useEffect(() => {
    fetchElevations(gridPoints);
  }, [gridPoints, fetchElevations]);

  // Fetch animal elevations
  useEffect(() => {
    async function loadAnimalElevations() {
      if (animals.length === 0) return;
      const locations = animals.map(a => ({ lat: a.lat, lng: a.lng }));
      const results = await fetchHeadlessBatch(locations);
      
      const elevs: Record<string, number | null> = {};
      animals.forEach((animal, i) => {
        // results is strictly mapped 1:1 with locations inside fetchBatch
        elevs[animal.id] = results[i]?.elevation ?? null;
      });
      setAnimalElevations(elevs);
    }
    loadAnimalElevations();
  }, [fetchHeadlessBatch, animals]);

  // Compute statistics
  const stats = useMemo(() => {
    const validElevations = elevationGrid
      .map((p) => p.elevation)
      .filter((e): e is number => e !== null);

    if (validElevations.length === 0) {
      return { min: 0, max: 0, avg: 0, range: 0, count: 0 };
    }

    const min = Math.min(...validElevations);
    const max = Math.max(...validElevations);
    const avg = Math.round(
      validElevations.reduce((a, b) => a + b, 0) / validElevations.length
    );

    return { min, max, avg, range: max - min, count: validElevations.length };
  }, [elevationGrid]);

  // Count risk zones (slopes > 30°)
  const riskyPointIndices = useMemo(() => {
    if (elevationGrid.length === 0) return new Set<number>();
    const cols = GRID_COLS + 1;
    const riskyPoints = new Set<number>();

    for (let i = 0; i < elevationGrid.length; i++) {
      const point = elevationGrid[i];
      if (point.elevation === null) continue;

      const col = i % cols;
      const row = Math.floor(i / cols);

      const neighbors: number[] = [];
      if (col < GRID_COLS) neighbors.push(i + 1);
      if (row < GRID_ROWS) neighbors.push(i + cols);

      for (const ni of neighbors) {
        const neighbor = elevationGrid[ni];
        if (!neighbor || neighbor.elevation === null) continue;

        const dist = haversineDistance(
          point.lat, point.lng, neighbor.lat, neighbor.lng
        );
        const slope = calculateSlope(point.elevation, neighbor.elevation, dist);
        if (slope > 30) {
          riskyPoints.add(i);
          riskyPoints.add(ni);
        }
      }
    }
    return riskyPoints;
  }, [elevationGrid]);

  const riskZoneCount = riskyPointIndices.size;

  const fenceRiskSummary = useMemo(() => {
    if (fences.length === 0 || elevationGrid.length === 0) {
      return [] as Array<{
        id: string;
        name: string;
        status: "active" | "inactive";
        color: string;
        riskyPoints: number;
        sampledPoints: number;
        hasPendingRisk: boolean;
      }>;
    }

    return fences.map((fence) => {
      if (fence.coordinates.length < 3) {
        return {
          id: fence.id,
          name: fence.name,
          status: fence.status,
          color: fence.color,
          riskyPoints: 0,
          sampledPoints: 0,
          hasPendingRisk: false,
        };
      }

      let sampledPoints = 0;
      let riskyPoints = 0;

      elevationGrid.forEach((point, index) => {
        if (point.elevation === null) return;
        if (!isPointInsidePolygon({ lat: point.lat, lng: point.lng }, fence.coordinates)) {
          return;
        }

        sampledPoints += 1;
        if (riskyPointIndices.has(index)) {
          riskyPoints += 1;
        }
      });

      return {
        id: fence.id,
        name: fence.name,
        status: fence.status,
        color: fence.color,
        riskyPoints,
        sampledPoints,
        hasPendingRisk: fence.status === "active" && riskyPoints > 0,
      };
    }).sort((a, b) => Number(b.hasPendingRisk) - Number(a.hasPendingRisk));
  }, [fences, elevationGrid, riskyPointIndices]);

  const pendingFencesCount = fenceRiskSummary.filter((item) => item.hasPendingRisk).length;

  // Handle map click to show elevation at a point
  const handleMapClick = useCallback(
    async (e: { detail: { latLng: { lat: number; lng: number } | null } }) => {
      const latLng = e.detail.latLng;
      if (!latLng) return;

      const elevation = await fetchSingleElevation(latLng.lat, latLng.lng);
      setClickedPoint({ lat: latLng.lat, lng: latLng.lng, elevation });
    },
    [fetchSingleElevation]
  );

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 md:gap-6 p-3 md:p-6">
      {/* Map Area */}
      <div className="flex-1 min-w-0 h-[450px] md:h-[550px] lg:h-auto">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-[#5C7A5B]" />
                Mapa de Elevación Digital
              </div>
              <div className="flex items-center gap-2">
                {loading && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Cargando...
                  </Badge>
                )}
                {error && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Error API
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px] pb-4">
            <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-[#4A5A4D]">
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  defaultCenter={RANCH_CENTER}
                  defaultZoom={15}
                  mapId="elevation-map"
                  mapTypeId={mapTypeId}
                  gestureHandling="cooperative"
                  disableDefaultUI={false}
                  zoomControl={true}
                  mapTypeControl={false}
                  streetViewControl={false}
                  fullscreenControl={true}
                  onClick={handleMapClick}
                  style={{ width: "100%", height: "100%" }}
                >
                  {fences.length > 0 && <VirtualFencesOverlay fences={fences} />}

                  {/* Elevation overlay rectangles */}
                  {showOverlay && elevationGrid.length > 0 && (
                    <ElevationOverlay
                      elevationGrid={elevationGrid}
                      gridRows={GRID_ROWS}
                      gridCols={GRID_COLS}
                      stats={stats}
                    />
                  )}

                  {/* Risk zone circles */}
                  {showRiskZones && elevationGrid.length > 0 && (
                    <RiskZones
                      elevationGrid={elevationGrid}
                      gridRows={GRID_ROWS}
                      gridCols={GRID_COLS}
                    />
                  )}

                  <FenceBoundsController fences={fences} />
                  <PanController target={panTarget} />

                  {/* Animal markers */}
                  {animals.map((animal) => (
                    <AdvancedMarker
                      key={animal.id}
                      position={{ lat: animal.lat, lng: animal.lng }}
                      onClick={() =>
                        setSelectedAnimal(
                          selectedAnimal === animal.id ? null : animal.id
                        )
                      }
                    >
                      <Pin
                        background={
                          animal.status === "alert" ? "#B94A3E" : "#5C7A5B"
                        }
                        borderColor="#fff"
                        glyphColor="#fff"
                      />
                      {selectedAnimal === animal.id && (
                        <InfoWindow
                          position={{ lat: animal.lat, lng: animal.lng }}
                          onCloseClick={() => setSelectedAnimal(null)}
                        >
                          <div className="p-1 min-w-[140px]">
                            <p className="font-semibold text-sm text-[#2C2C2C]">
                              {animal.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Estado:{" "}
                              <span
                                className={
                                  animal.status === "alert"
                                    ? "text-[#B94A3E] font-medium"
                                    : "text-[#5C7A5B] font-medium"
                                }
                              >
                                {animal.status === "ok" ? "Normal" : "Alerta"}
                              </span>
                            </p>
                            {animalElevations[animal.id] != null && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Mountain className="h-3 w-3" />
                                Elevación:{" "}
                                <span className="font-medium text-[#2C2C2C]">
                                  {animalElevations[animal.id]}m
                                </span>
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {animal.lat.toFixed(4)}, {animal.lng.toFixed(4)}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </AdvancedMarker>
                  ))}

                  {/* Clicked-point info window */}
                  {clickedPoint && (
                    <InfoWindow
                      position={{
                        lat: clickedPoint.lat,
                        lng: clickedPoint.lng,
                      }}
                      onCloseClick={() => setClickedPoint(null)}
                    >
                      <div className="p-1 min-w-[130px]">
                        <p className="font-semibold text-sm text-[#2C2C2C] flex items-center gap-1">
                          <Mountain className="h-3.5 w-3.5 text-[#5C7A5B]" />
                          Elevación
                        </p>
                        <p className="text-lg font-bold text-[#5C7A5B] mt-1">
                          {clickedPoint.elevation !== null
                            ? `${clickedPoint.elevation}m`
                            : "N/D"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {clickedPoint.lat.toFixed(5)},{" "}
                          {clickedPoint.lng.toFixed(5)}
                        </p>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>

              {/* Map controls overlay */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                {(["terrain", "satellite", "hybrid"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMapTypeId(type)}
                    className={`px-3 py-1.5 text-xs rounded shadow-md border transition-colors capitalize ${
                      mapTypeId === type
                        ? "bg-[#5C7A5B] text-white border-[#5C7A5B]"
                        : "bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#5C7A5B]"
                    }`}
                  >
                    {type === "terrain"
                      ? "Terreno"
                      : type === "satellite"
                      ? "Satélite"
                      : "Híbrido"}
                  </button>
                ))}
              </div>

              {/* Toggle overlays */}
              <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-10">
                <button
                  onClick={() => setShowOverlay(!showOverlay)}
                  className={`px-3 py-1.5 text-xs rounded shadow-md border transition-colors flex items-center gap-1.5 ${
                    showOverlay
                      ? "bg-[#5C7A5B] text-white border-[#5C7A5B]"
                      : "bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#5C7A5B]"
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  Heatmap
                </button>
                <button
                  onClick={() => setShowRiskZones(!showRiskZones)}
                  className={`px-3 py-1.5 text-xs rounded shadow-md border transition-colors flex items-center gap-1.5 ${
                    showRiskZones
                      ? "bg-[#B94A3E] text-white border-[#B94A3E]"
                      : "bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#B94A3E]"
                  }`}
                >
                  <TriangleAlert className="h-3 w-3" />
                  Riesgos
                </button>
              </div>

              {/* Click hint */}
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-md border border-[#E5E5E5] z-10">
                <p className="text-xs text-[#6B6B6B] flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" />
                  Click para ver elevación
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Panel */}
      <div className="lg:w-96 space-y-4 md:space-y-5 overflow-y-auto pb-4">
        {/* Elevation Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mountain className="h-5 w-5 text-[#5C7A5B]" />
              Datos de Elevación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#5C7A5B]" />
                <span className="ml-2 text-sm text-[#6B6B6B]">
                  Consultando OpenTopoData...
                </span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => fetchElevations(gridPoints)}
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F0F0ED] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#2C2C2C]">
                      {stats.min}m
                    </p>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Elevación Mínima
                    </p>
                  </div>
                  <div className="bg-[#F0F0ED] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#2C2C2C]">
                      {stats.max}m
                    </p>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Elevación Máxima
                    </p>
                  </div>
                  <div className="bg-[#F0F0ED] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#5C7A5B]">
                      {stats.avg}m
                    </p>
                    <p className="text-xs text-[#6B6B6B] mt-1">Promedio</p>
                  </div>
                  <div className="bg-[#F0F0ED] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#5C7A5B]">
                      {stats.range}m
                    </p>
                    <p className="text-xs text-[#6B6B6B] mt-1">Desnivel</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E5E5]">
                  <p className="text-xs text-[#6B6B6B] mb-2">
                    Puntos muestreados
                  </p>
                  <p className="text-sm font-medium text-[#2C2C2C]">
                    {stats.count} puntos en grid {GRID_ROWS}×{GRID_COLS}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Dataset: SRTM 30m (OpenTopoData)
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Risk Zones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TriangleAlert className="h-5 w-5 text-[#B94A3E]" />
              Zonas de Riesgo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(fencesLoading || fencesError) && (
              <div className="rounded-lg border border-[#E5E5E5] bg-white p-3 text-sm">
                {fencesLoading && <p className="text-[#6B6B6B]">Cargando vallas virtuales...</p>}
                {fencesError && <p className="text-[#B94A3E]">{fencesError}</p>}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6B6B]">
                Pendientes {">"} 30°
              </span>
              <Badge
                variant={riskZoneCount > 0 ? "destructive" : "secondary"}
                className={riskZoneCount === 0 ? "bg-[#5C7A5B] text-white" : ""}
              >
                {riskZoneCount} zona{riskZoneCount !== 1 ? "s" : ""}
              </Badge>
            </div>
            {riskZoneCount > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  Se detectaron {riskZoneCount} zona(s) con pendientes
                  peligrosas para el ganado. Estas áreas están marcadas en rojo
                  en el mapa.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  No se detectaron pendientes peligrosas en el área monitoreada.
                  El terreno es seguro para el ganado.
                </p>
              </div>
            )}
            <div className="text-xs text-[#9CA3AF]">
              <p>
                Las zonas con pendientes mayores a 30° representan riesgo de
                caídas y accidentes para el ganado. Se recomienda configurar
                vallas virtuales para prevenir el acceso.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E5E5E5]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6B6B6B]">Vallas con pendiente de riesgo</span>
                <Badge
                  variant={pendingFencesCount > 0 ? "destructive" : "secondary"}
                  className={pendingFencesCount === 0 ? "bg-[#5C7A5B] text-white" : ""}
                >
                  {pendingFencesCount}
                </Badge>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {fenceRiskSummary.length === 0 && (
                  <p className="text-xs text-[#9CA3AF]">Sin vallas virtuales configuradas.</p>
                )}

                {fenceRiskSummary.map((item) => (
                  <div key={item.id} className="rounded-md border border-[#E5E5E5] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-medium text-[#2C2C2C] truncate">{item.name}</span>
                      </div>
                      <Badge
                        variant={item.hasPendingRisk ? "destructive" : "secondary"}
                        className={!item.hasPendingRisk ? "bg-[#F0F0ED] text-[#2C2C2C]" : ""}
                      >
                        {item.hasPendingRisk ? "Pendiente" : "Estable"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#6B6B6B] mt-1">
                      Riesgo: {item.riskyPoints} / {item.sampledPoints || 0} puntos
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-5 w-5 text-[#5C7A5B]" />
              Leyenda de Elevación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{
                  background:
                    "linear-gradient(to right, rgba(34,139,34,0.7), rgba(76,175,80,0.7), rgba(200,200,40,0.7), rgba(230,120,30,0.7), rgba(255,50,45,0.7))",
                }}
              />
              <div className="flex justify-between text-xs text-[#6B6B6B]">
                <span>{stats.min}m</span>
                <span>Bajo</span>
                <span>Medio</span>
                <span>Alto</span>
                <span>{stats.max}m</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E5E5] space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-[#5C7A5B]" />
                <span className="text-[#2C2C2C]">Ganado Normal</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-[#B94A3E]" />
                <span className="text-[#2C2C2C]">Ganado en Alerta</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-[#B94A3E]/40 border border-[#B94A3E]" />
                <span className="text-[#2C2C2C]">Zona de Riesgo ({">"} 30°)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animal Elevations List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-[#5C7A5B]" />
              Elevación por Animal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {animals.map((animal) => (
                <div
                  key={animal.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#F0F0ED] transition-colors cursor-pointer"
                  onClick={() => setSelectedAnimal(animal.id)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        animal.status === "alert"
                          ? "bg-[#B94A3E]"
                          : "bg-[#5C7A5B]"
                      }`}
                    />
                    <span className="text-sm font-medium text-[#2C2C2C]">
                      {animal.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Mountain className="h-3 w-3 text-[#6B6B6B]" />
                    <span className="font-medium text-[#2C2C2C]">
                      {animalElevations[animal.id] != null
                        ? `${animalElevations[animal.id]}m`
                        : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

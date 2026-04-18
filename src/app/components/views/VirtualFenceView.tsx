import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus, Edit2, Trash2, Power, Mountain, MapPin, LocateFixed } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { useState, useEffect, useMemo, useRef } from "react";
import { APIProvider, Map, useMap, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useDashboard, Fence } from "../../context/DashboardContext";
import { FenceFormPanel } from "./FenceFormPanel";
import { useElevation } from "../../hooks/useElevation";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const MAPS_LIBRARIES = ["geometry"] as const;

function FencesOverlay({ fences, selectedFenceId, onSelect, onUpdateFence, drawingMode }: { 
  fences: Fence[]; 
  selectedFenceId: string | null; 
  onSelect: (id: string) => void;
  onUpdateFence: (id: string, coords: [number, number][], area: string) => void;
  drawingMode?: boolean;
}) {
  const map = useMap();
  // Using a ref to hold instances avoids recreating polygons and breaking drag functionality
  const polyMapRef = useRef<Map<string, google.maps.Polygon>>(new window.Map());

  useEffect(() => {
    if (!map) return;

    const currentIds = new Set(fences.map(f => f.id));
    const polyMap = polyMapRef.current;

    // Remove deleted fences
    for (const [id, poly] of polyMap.entries()) {
      if (!currentIds.has(id)) {
        poly.setMap(null);
        polyMap.delete(id);
      }
    }

    fences.forEach((fence) => {
      let polygon = polyMap.get(fence.id);
      const isActive = fence.status === "active";
      const isSelected = selectedFenceId === fence.id;
      const isDrawing = drawingMode === true;

      if (!polygon) {
        polygon = new google.maps.Polygon({
          map,
          clickable: !isDrawing,
        });

        polygon.addListener("click", () => onSelect(fence.id));

        // Initialize paths
        polygon.setPaths(fence.coordinates.map(([lat, lng]) => ({ lat, lng })));
        
        // Listeners for geometry calculation
        const path = polygon.getPath();
        const handler = () => {
          const newCoords: [number, number][] = [];
          for (let i = 0; i < path.getLength(); i++) {
            newCoords.push([path.getAt(i).lat(), path.getAt(i).lng()]);
          }
          let areaStr = fence.area;
          if (google.maps.geometry?.spherical) {
            const sqMeters = google.maps.geometry.spherical.computeArea(path);
            areaStr = `${(sqMeters / 10000).toFixed(2)} hectáreas`;
          }
          onUpdateFence(fence.id, newCoords, areaStr);
        };
        
        path.addListener("set_at", handler);
        path.addListener("insert_at", handler);
        path.addListener("remove_at", handler);
        
        polyMap.set(fence.id, polygon);
      }

      // Sync appearance
      polygon.setOptions({
        strokeColor: fence.color,
        strokeOpacity: isActive ? 0.9 : 0.5,
        strokeWeight: isSelected ? 4 : 2,
        fillColor: fence.color,
        fillOpacity: isActive ? 0.25 : 0.08,
        clickable: !isDrawing,
        editable: isSelected && !isDrawing,
      });

      // Avoid overriding paths if we are editing it, to prevent drag interruptions
      if (!isSelected) {
        // Simple syncing check
        const path = polygon.getPath();
        if (path && path.getLength() !== fence.coordinates.length) {
          polygon.setPaths(fence.coordinates.map(([lat, lng]) => ({ lat, lng })));
        }
      }
    });

  }, [map, fences, selectedFenceId, onSelect, onUpdateFence, drawingMode]);

  return null;
}

function DraftOverlay({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  const polyRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!polyRef.current) {
      polyRef.current = new google.maps.Polygon({
        map,
        strokeColor: "#2A9D8F",
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: "#2A9D8F",
        fillOpacity: 0.3,
        clickable: false,
      });
    }

    polyRef.current.setPaths(coordinates.map(([lat, lng]) => ({ lat, lng })));
  }, [map, coordinates]);

  useEffect(() => {
    return () => {
      if (polyRef.current) polyRef.current.setMap(null);
    };
  }, []);

  return null;
}

function PanController({ target }: { target: { lat: number, lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && target) {
      map.panTo(target);
      map.setZoom(17); // Zoom a bit closer when locating user
    }
  }, [map, target]);
  return null;
}

function FenceBoundsController({ fences, disabled }: { fences: Fence[]; disabled?: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!map || disabled || fences.length === 0) return;

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
  }, [map, fences, disabled]);

  return null;
}

export function VirtualFenceView() {
  const {
    fences,
    animals,
    ranchContext,
    addFence,
    updateFence,
    deleteFence,
    fencesLoading,
    fencesError,
  } = useDashboard();
  
  const [selectedFence, setSelectedFence] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState<string>("terrain");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFence, setEditingFence] = useState<Fence | null>(null);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [draftCoords, setDraftCoords] = useState<[number, number][]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [elevationData, setElevationData] = useState<{ min: number; max: number; avg: number } | null>(null);
  const { fetchHeadlessBatch } = useElevation();

  const defaultRanchCenter = { lat: ranchContext.lat, lng: ranchContext.lng };
  const [panTarget, setPanTarget] = useState<{ lat: number, lng: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(true);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setIsLocatingUser(false);
      return;
    }

    const watcherId = navigator.geolocation.watchPosition(
      (pos) => {
        setPanTarget({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocatingUser(false);
      },
      () => {
        setIsLocatingUser(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadElevationData() {
      const locations = fences.flatMap((fence) =>
        fence.coordinates.map(([lat, lng]) => ({ lat, lng })),
      );

      if (locations.length === 0) {
        setElevationData(null);
        return;
      }

      const results = await fetchHeadlessBatch(locations);
      if (cancelled) return;

      const elevations = results
        .map((result) => result.elevation)
        .filter((value): value is number => value !== null);

      if (elevations.length === 0) {
        setElevationData(null);
        return;
      }

      setElevationData({
        min: Math.min(...elevations),
        max: Math.max(...elevations),
        avg: Math.round(
          elevations.reduce((acc, value) => acc + value, 0) / elevations.length,
        ),
      });
    }

    void loadElevationData();

    return () => {
      cancelled = true;
    };
  }, [fences, fetchHeadlessBatch]);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 md:gap-6 p-3 md:p-6">
      <div className="flex-1 min-w-0 h-[450px] md:h-[550px] lg:h-auto">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#5C7A5B]" />
              Mapa de Vallas Virtuales
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px] pb-4">
            <div className="relative w-full h-full min-h-[400px] rounded border border-[#4A5A4D] overflow-hidden">
              
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={MAPS_LIBRARIES}>
                <Map
                  defaultCenter={defaultRanchCenter}
                  defaultZoom={15}
                  mapId="virtual-fence-map"
                  mapTypeId={mapTypeId}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  zoomControl={true}
                  mapTypeControl={false}
                  streetViewControl={false}
                  fullscreenControl={true}
                  style={{ width: "100%", height: "100%", cursor: isDrawingMode ? "crosshair" : "default" }}
                  onClick={(e) => {
                    if (isDrawingMode) {
                      if (e.detail?.latLng) {
                        setDraftCoords(prev => [...prev, [e.detail.latLng.lat, e.detail.latLng.lng]]);
                      }
                    } else {
                      setSelectedFence(null);
                    }
                  }}
                >
                  {/* Render native google map polygons */}
                  <FencesOverlay 
                    fences={fences} 
                    selectedFenceId={selectedFence} 
                    onSelect={setSelectedFence} 
                    drawingMode={isDrawingMode}
                    onUpdateFence={(id, coords, area) => {
                      void updateFence(id, { coordinates: coords, area });
                    }}
                  />

                  {isDrawingMode && draftCoords.length > 0 && (
                    <DraftOverlay coordinates={draftCoords} />
                  )}

                  {isDrawingMode && draftCoords.map(([lat, lng], index) => (
                    <AdvancedMarker key={`draft-node-${index}-${lat}-${lng}`} position={{ lat, lng }}>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: '#2A9D8F',
                          border: '2px solid #FFFFFF',
                          boxShadow: '0 0 0 2px rgba(42,157,143,0.35)',
                        }}
                        title={`Nodo ${index + 1}`}
                      />
                    </AdvancedMarker>
                  ))}

                  {/* Render Animals overlapping fences */}
                  {animals.map((animal) => (
                    <AdvancedMarker key={animal.id} position={{ lat: animal.lat, lng: animal.lng }}>
                      <Pin
                        background={animal.status === "alert" ? "#B94A3E" : "#5C7A5B"}
                        borderColor="#fff"
                        glyphColor="#fff"
                        scale={0.8}
                      />
                    </AdvancedMarker>
                  ))}

                  <FenceBoundsController fences={fences} disabled={isLocatingUser || panTarget !== null} />
                  <PanController target={panTarget} />
                </Map>
              </APIProvider>

              {/* Map Controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                <button
                  onClick={() => {
                    if ("geolocation" in navigator) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => setPanTarget({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        () => undefined,
                        {
                          enableHighAccuracy: true,
                          maximumAge: 0,
                          timeout: 15000,
                        },
                      );
                    }
                  }}
                  className="px-3 py-1.5 text-xs rounded shadow-md border bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#5C7A5B] flex items-center justify-center gap-1 mb-1"
                  title="Centrar en mi ubicación"
                >
                  <LocateFixed className="h-3 w-3" />
                  Ubicarme
                </button>
                {(["terrain", "satellite"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMapTypeId(type)}
                    className={`px-3 py-1.5 text-xs rounded shadow-md border transition-colors capitalize ${
                      mapTypeId === type
                        ? "bg-[#5C7A5B] text-white border-[#5C7A5B]"
                        : "bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#5C7A5B]"
                    }`}
                  >
                    {type === "terrain" ? "Terreno" : "Satélite"}
                  </button>
                ))}
              </div>

              {/* Mini active fences overlay info */}
              <div className="absolute top-3 left-3 bg-white/95 px-3 py-2 rounded shadow-md border border-[#E5E5E5] text-xs max-w-[180px]">
                <p className="font-medium mb-2 text-[#2C2C2C]">Vallas Activas</p>
                {fences.filter(f => f.status === "active").map((fence) => (
                  <div key={fence.id} className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded" style={{ backgroundColor: fence.color }} />
                    <span className="text-xs text-[#6B6B6B] truncate">{fence.name}</span>
                  </div>
                ))}
                {elevationData && (
                  <div className="mt-2 pt-2 border-t border-[#E5E5E5]">
                    <div className="flex items-center gap-1 text-[#6B6B6B]">
                      <Mountain className="h-3 w-3" />
                      <span className="text-xs">Topografía</span>
                    </div>
                    <p className="text-xs text-[#2C2C2C] mt-1">
                      {elevationData.min}m - {elevationData.max}m
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons Overlay */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 mx-auto w-max">
                {isDrawingMode ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-white/90 shadow-lg text-black hover:bg-white"
                      onClick={() => {
                        setIsDrawingMode(false);
                        setDraftCoords([]);
                      }}
                    >
                      Cancelar Trazo
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 shadow-lg text-white font-medium"
                      disabled={draftCoords.length < 3}
                      onClick={() => {
                        setIsDrawingMode(false);
                        setEditingFence(null); // It's a new fence!
                        setIsFormOpen(true);
                      }}
                    >
                      Terminar y Guardar
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    className="bg-[#5C7A5B] hover:bg-[#5C7A5B]/90 shadow-lg"
                    onClick={() => {
                      setEditingFence(null);
                      setIsDrawingMode(true);
                      setDraftCoords([]);
                      setSelectedFence(null);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nueva Valla
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:w-96 space-y-4 md:space-y-6 overflow-y-auto pb-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Power className="h-5 w-5 text-[#3D5A3C]" />
              Vallas Configuradas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fences.map((fence) => (
              <Card
                key={fence.id}
                className={`border-2 hover:shadow-md transition-all cursor-pointer ${
                  selectedFence === fence.id ? "ring-2 ring-offset-2" : ""
                }`}
                style={{
                  borderColor: `${fence.color}30`,
                  ringColor: selectedFence === fence.id ? fence.color : undefined,
                }}
                onClick={() => setSelectedFence(fence.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{fence.name}</h3>
                      <p className="text-xs text-muted-foreground">{fence.id}</p>
                    </div>
                    <Switch 
                      checked={fence.status === "active"} 
                      onCheckedChange={(checked) => {
                        void updateFence(fence.id, { status: checked ? "active" : "inactive" });
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{
                        borderColor: fence.color,
                        backgroundColor: `${fence.color}40`,
                      }}
                    />
                    <Badge
                      variant={fence.status === "active" ? "default" : "secondary"}
                      className={fence.status === "active" ? "bg-[#5C7A5B]" : ""}
                    >
                      {fence.status === "active" ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Área</p>
                      <p className="font-medium">{fence.area}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Animales</p>
                      <p className="font-medium">{fence.animals}</p>
                    </div>
                  </div>

                  {fence.violations > 0 && (
                    <div className="flex items-center gap-1 text-xs text-[#B94A3E] bg-[#B94A3E]/10 p-2 rounded border border-[#B94A3E]/20">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {fence.violations} violación{fence.violations > 1 ? "es" : ""} detectada{fence.violations > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1 border-t mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFence(fence);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[#B94A3E] hover:bg-[#B94A3E]/10"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setSaveError(null);
                        try {
                          await deleteFence(fence.id);
                        } catch (error) {
                          const message = error instanceof Error ? error.message : "No se pudo eliminar la valla.";
                          setSaveError(message);
                        }
                        if (selectedFence === fence.id) setSelectedFence(null);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {(fencesLoading || fencesError || saveError) && (
          <Card>
            <CardContent className="pt-5 pb-5 text-sm">
              {fencesLoading && <p className="text-muted-foreground">Cargando vallas...</p>}
              {fencesError && <p className="text-[#B94A3E]">{fencesError}</p>}
              {saveError && <p className="text-[#B94A3E]">{saveError}</p>}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Estadísticas Generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Vallas activas</span>
              <span className="font-medium text-[#5C7A5B]">{fences.filter(f => f.status === "active").length}/{fences.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Área total monitoreada</span>
              <span className="font-medium text-[#2C2C2C]">{ranchContext.totalArea}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Violaciones hoy</span>
              <span className="font-medium text-[#B94A3E]">{fences.reduce((acc, f) => acc + f.violations, 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <FenceFormPanel
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        fence={editingFence}
        draftCoordinates={draftCoords.length > 0 ? draftCoords : undefined}
        onSave={async (data) => {
          setSaveError(null);
          try {
            if (editingFence) {
              await updateFence(editingFence.id, data);
            } else {
              await addFence(data as Fence);
              setDraftCoords([]); // clear draft after saving
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : "No se pudo guardar la valla.";
            setSaveError(message);
            throw error;
          }
        }}
      />
    </div>
  );
}

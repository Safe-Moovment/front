import { MapPin, Map as MapIcon, AlertTriangle, LocateFixed } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDashboard, Fence } from "../context/DashboardContext";
import { APIProvider, Map, useMap, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

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
      if (fence.status !== "active") return;

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

// Read-only Polygons to render the active fences natively
function HomeFencesOverlay({ fences }: { fences: Fence[] }) {
  const map = useMap();
  const polyRef = useRef<google.maps.Polygon[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear old instances
    polyRef.current.forEach(p => p.setMap(null));
    polyRef.current = [];

    fences.forEach(fence => {
      if (fence.status !== "active") return; // Only show active fences on home map

      const polygon = new google.maps.Polygon({
        map,
        paths: fence.coordinates.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: fence.color,
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: fence.color,
        fillOpacity: 0.2,
        clickable: false,
      });

      polyRef.current.push(polygon);
    });

    return () => {
      polyRef.current.forEach(p => p.setMap(null));
    };
  }, [map, fences]);

  return null;
}

export function MapView() {
  const { animals, fences, ranchContext } = useDashboard();
  const [hoveredAnimal, setHoveredAnimal] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState<string>("terrain");
  const [panTarget, setPanTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [mapApiError, setMapApiError] = useState<string | null>(
    GOOGLE_MAPS_API_KEY ? null : "No se encontro la clave de Google Maps.",
  );
  const [userAccuracy, setUserAccuracy] = useState<number | null>(null);

  const center = { lat: ranchContext.lat, lng: ranchContext.lng };

  const requestPreciseLocation = () => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPanTarget({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUserAccuracy(pos.coords.accuracy ?? null);
      },
      () => undefined,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      },
    );
  };

  if (mapApiError) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden border border-[#4A5A4D] bg-white">
        <div className="h-full flex flex-col items-center justify-center px-6 text-center gap-3">
          <AlertTriangle className="h-8 w-8 text-[#B94A3E]" />
          <h3 className="text-lg font-semibold text-[#2C2C2C]">Mapa no disponible</h3>
          <p className="text-sm text-[#6B6B6B] max-w-md">
            La pagina de inicio sigue operativa, pero no se pudo cargar Google Maps.
            Verifica API key, billing o bloqueadores de anuncios.
          </p>
          <p className="text-xs text-[#8A8A8A]">Detalle: {mapApiError}</p>

          <div className="mt-2 grid grid-cols-2 gap-3 w-full max-w-md text-sm">
            <div className="rounded border border-[#E5E5E5] p-3 bg-[#FAFAF8]">
              <p className="text-[#6B6B6B]">Animales</p>
              <p className="font-semibold text-[#2C2C2C]">{animals.length}</p>
            </div>
            <div className="rounded border border-[#E5E5E5] p-3 bg-[#FAFAF8]">
              <p className="text-[#6B6B6B]">Vallas activas</p>
              <p className="font-semibold text-[#2C2C2C]">
                {fences.filter((fence) => fence.status === "active").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-[#4A5A4D]">
      <APIProvider
        apiKey={GOOGLE_MAPS_API_KEY}
        onError={(error) => {
          const message = error instanceof Error ? error.message : "Error cargando Google Maps.";
          setMapApiError(message);
        }}
      >
        <Map
          defaultCenter={center}
          defaultZoom={15}
          mapId="dashboard-home-map"
          mapTypeId={mapTypeId}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={true}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Natively map polygons directly to topography */}
          <HomeFencesOverlay fences={fences} />
          <FenceBoundsController fences={fences} />
          <PanController target={panTarget} />

          {/* Place animals natively via AdvancedMarkers */}
          {animals.map((animal) => (
            <AdvancedMarker
              key={animal.id}
              position={{ lat: animal.lat, lng: animal.lng }}
              onClick={() => setHoveredAnimal(animal.id)}
            >
              <div 
                onMouseEnter={() => setHoveredAnimal(animal.id)}
                onMouseLeave={() => setHoveredAnimal(null)}
                className="cursor-pointer"
              >
                <Pin
                  background={animal.status === "alert" ? "#B94A3E" : "#5C7A5B"}
                  borderColor="#fff"
                  glyphColor="#fff"
                  scale={hoveredAnimal === animal.id ? 1.2 : 0.9} // Slight pop on hover
                />
              </div>

              {hoveredAnimal === animal.id && (
                <InfoWindow
                  position={{ lat: animal.lat, lng: animal.lng }}
                  onCloseClick={() => setHoveredAnimal(null)}
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
                    <p className="text-xs text-gray-400 mt-1">
                      {animal.lat.toFixed(4)}, {animal.lng.toFixed(4)}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Map Controls */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col gap-1.5 md:gap-2 z-10">
        <button
          onClick={requestPreciseLocation}
          className="px-2 md:px-3 py-1 md:py-1.5 text-xs rounded shadow-md border transition-colors flex items-center justify-center gap-1 bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#5C7A5B]"
          title="Centrar en mi ubicacion"
        >
          <LocateFixed className="h-3 w-3" />
          Ubicarme
        </button>
        <button
          onClick={() => setMapTypeId("terrain")}
          className={`px-2 md:px-3 py-1 md:py-1.5 text-xs rounded shadow-md border transition-colors flex items-center justify-center ${
            mapTypeId === "terrain"
              ? "bg-[#5C7A5B] text-white border-[#5C7A5B]"
              : "bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#5C7A5B]"
          }`}
        >
          Terreno
        </button>
        <button
          onClick={() => setMapTypeId("satellite")}
          className={`px-2 md:px-3 py-1 md:py-1.5 text-xs rounded shadow-md border transition-colors flex items-center justify-center ${
            mapTypeId === "satellite"
              ? "bg-[#5C7A5B] text-white border-[#5C7A5B]"
              : "bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#5C7A5B]"
          }`}
        >
          Satélite
        </button>
      </div>

      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white/90 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded shadow-md border border-[#E5E5E5] z-10">
        <p className="text-xs text-[#6B6B6B]">Total en monitoreo</p>
        <p className="font-semibold text-sm md:text-base text-[#2C2C2C] flex items-center gap-1">
          <MapIcon className="h-4 w-4" />
          {animals.length} animales
        </p>
        {userAccuracy !== null && (
          <p className="text-[11px] text-[#6B6B6B] mt-1">Precision GPS: {Math.round(userAccuracy)} m</p>
        )}
      </div>

      <div className="absolute bottom-2 md:bottom-12 left-2 md:left-4 bg-white/90 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded shadow-md border border-[#E5E5E5] z-10 hidden sm:block">
        <p className="text-xs md:text-sm font-medium text-[#2C2C2C]">{ranchContext.name}</p>
        <p className="text-xs text-[#6B6B6B]">Jalisco, México</p>
      </div>

      <div className="absolute bottom-2 lg:bottom-10 right-2 lg:right-16 bg-white/90 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded shadow-md border border-[#E5E5E5] space-y-1 md:space-y-1.5 z-10 mt-12 sm:mt-0">
        <p className="text-xs font-medium text-[#6B6B6B] mb-1 md:mb-2">Leyenda Activa</p>
        <div className="flex items-center gap-1.5 md:gap-2 text-xs">
          <div className="w-2.5 md:w-3 h-2.5 md:h-3 bg-[#5C7A5B] rounded" />
          <span className="text-[#2C2C2C]">Normal</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 text-xs">
          <div className="w-2.5 md:w-3 h-2.5 md:h-3 bg-[#B94A3E] rounded" />
          <span className="text-[#2C2C2C]">Alerta</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 text-xs pt-1 border-t border-[#E5E5E5]">
          <div className="w-2.5 md:w-3 h-2.5 md:h-3 border-2 border-[#5C7A5B] rounded" />
          <span className="text-[#2C2C2C] hidden sm:inline">Valla Proyectada</span>
          <span className="text-[#2C2C2C] sm:hidden">Valla</span>
        </div>
      </div>
    </div>
  );
}

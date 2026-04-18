import { MapPin, Mountain } from "lucide-react";
import { useState, useEffect } from "react";

// Función para simular elevación basada en coordenadas (zona de Jalisco: 1550-1650m)
const calculateSimulatedElevation = (lat: number, lng: number): number => {
  // Usar coordenadas para generar variación topográfica realista
  const latVariation = (lat - 20.65) * 1000; // Variación norte-sur
  const lngVariation = (lng + 103.35) * 800; // Variación este-oeste
  const noise = Math.sin(lat * 100) * Math.cos(lng * 100) * 15; // Variación natural

  const baseElevation = 1590; // Elevación base de Jalisco
  const elevation = baseElevation + latVariation + lngVariation + noise;

  return Math.round(Math.max(1550, Math.min(1650, elevation))); // Límites realistas
};

const animals = [
  { id: "001", lat: 20.6597, lng: -103.3496, status: "ok" },
  { id: "102", lat: 20.6587, lng: -103.3486, status: "ok" },
  { id: "205", lat: 20.6607, lng: -103.3476, status: "ok" },
  { id: "101", lat: 20.6627, lng: -103.3506, status: "alert" },
  { id: "078", lat: 20.6577, lng: -103.3466, status: "ok" },
  { id: "156", lat: 20.6617, lng: -103.3456, status: "ok" },
];

const fencePoints: [number, number][] = [
  [20.6570, -103.3510],
  [20.6640, -103.3510],
  [20.6640, -103.3450],
  [20.6570, -103.3450],
];

export function MapView() {
  const [hoveredAnimal, setHoveredAnimal] = useState<string | null>(null);
  const [elevations, setElevations] = useState<{ [key: string]: number }>({});
  const [mapType, setMapType] = useState<"terrain" | "satellite">("terrain");

  useEffect(() => {
    // Calcular elevaciones simuladas para todos los animales
    const calculatedElevations: { [key: string]: number } = {};
    animals.forEach((animal) => {
      calculatedElevations[animal.id] = calculateSimulatedElevation(
        animal.lat,
        animal.lng
      );
    });
    setElevations(calculatedElevations);
  }, []);

  const center = { lat: 20.6597, lng: -103.3496 };
  const zoom = 14;

  // Convertir coordenadas lat/lng a coordenadas SVG
  const latLngToSVG = (lat: number, lng: number) => {
    const latRange = 0.007; // rango de latitud visible
    const lngRange = 0.006; // rango de longitud visible

    const x = ((lng - (center.lng - lngRange / 2)) / lngRange) * 100;
    const y = ((center.lat + latRange / 2 - lat) / latRange) * 100;

    return { x, y };
  };

  const svgFencePoints = fencePoints
    .map(([lat, lng]) => {
      const { x, y } = latLngToSVG(lat, lng);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative w-full h-full rounded overflow-hidden border border-[#4A5A4D]">
      {/* Google Maps Iframe con terreno */}
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${center.lat},${center.lng}&zoom=${zoom}&maptype=${mapType}`}
      />

      {/* Overlay con SVG para valla virtual y marcadores */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="0.2" stdDeviation="0.3" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Polígono de valla virtual */}
        <polygon
          points={svgFencePoints}
          fill="#5C7A5B"
          fillOpacity="0.15"
          stroke="#5C7A5B"
          strokeWidth="0.4"
          strokeDasharray="2,1.5"
          opacity="0.9"
          filter="url(#shadow)"
        />
      </svg>

      {/* Marcadores de animales con posicionamiento absoluto */}
      {animals.map((animal) => {
        const { x, y } = latLngToSVG(animal.lat, animal.lng);
        return (
          <div
            key={animal.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -100%)",
            }}
            onMouseEnter={() => setHoveredAnimal(animal.id)}
            onMouseLeave={() => setHoveredAnimal(null)}
          >
            <div className="relative group cursor-pointer">
              <MapPin
                className={`h-7 w-7 ${
                  animal.status === "alert" ? "text-[#B94A3E]" : "text-[#5C7A5B]"
                } drop-shadow-lg transition-transform ${
                  hoveredAnimal === animal.id ? "scale-110" : "scale-100"
                }`}
                fill="currentColor"
                strokeWidth={1}
                stroke="white"
              />
              {hoveredAnimal === animal.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-[#2C2C2C] text-sm rounded shadow-lg whitespace-nowrap border border-[#E5E5E5] z-50">
                  <p className="font-medium">Vaca #{animal.id}</p>
                  <p className="text-xs text-[#6B6B6B]">
                    {animal.status === "ok" ? "Normal" : "Alerta"}
                  </p>
                  {elevations[animal.id] && (
                    <p className="text-xs text-[#6B6B6B] flex items-center gap-1 mt-1">
                      <Mountain className="h-3 w-3" />
                      Elevación: {elevations[animal.id]}m
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Controles de mapa */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col gap-1.5 md:gap-2">
        <button
          onClick={() => setMapType("terrain")}
          className={`px-2 md:px-3 py-1 md:py-1.5 text-xs rounded shadow-md border transition-colors ${
            mapType === "terrain"
              ? "bg-[#5C7A5B] text-white border-[#5C7A5B]"
              : "bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#5C7A5B]"
          }`}
        >
          Terreno
        </button>
        <button
          onClick={() => setMapType("satellite")}
          className={`px-2 md:px-3 py-1 md:py-1.5 text-xs rounded shadow-md border transition-colors ${
            mapType === "satellite"
              ? "bg-[#5C7A5B] text-white border-[#5C7A5B]"
              : "bg-white text-[#2C2C2C] border-[#E5E5E5] hover:border-[#5C7A5B]"
          }`}
        >
          Satélite
        </button>
      </div>

      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white/95 px-2 md:px-3 py-1.5 md:py-2 rounded shadow-md border border-[#E5E5E5]">
        <p className="text-xs text-[#6B6B6B]">Total en monitoreo</p>
        <p className="font-semibold text-sm md:text-base text-[#2C2C2C]">6 animales</p>
        {Object.keys(elevations).length > 0 && (
          <p className="text-xs text-[#6B6B6B] mt-1 flex items-center gap-1">
            <Mountain className="h-3 w-3" />
            <span className="hidden sm:inline">Vista topográfica</span>
            <span className="sm:hidden">Topo</span>
          </p>
        )}
      </div>

      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-white/95 px-2 md:px-3 py-1.5 md:py-2 rounded shadow-md border border-[#E5E5E5]">
        <p className="text-xs md:text-sm font-medium text-[#2C2C2C]">Rancho La Esperanza</p>
        <p className="text-xs text-[#6B6B6B]">Jalisco, México</p>
      </div>

      <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-white/95 px-2 md:px-3 py-1.5 md:py-2 rounded shadow-md border border-[#E5E5E5] space-y-1 md:space-y-1.5">
        <p className="text-xs font-medium text-[#6B6B6B] mb-1 md:mb-2">Leyenda</p>
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
          <span className="text-[#2C2C2C] hidden sm:inline">Valla Virtual</span>
          <span className="text-[#2C2C2C] sm:hidden">Valla</span>
        </div>
      </div>
    </div>
  );
}

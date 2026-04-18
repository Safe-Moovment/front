import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MapPin, Plus, Edit2, Trash2, Power, Mountain } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { useState, useEffect } from "react";

const fences = [
  {
    id: "FENCE-001",
    name: "Perímetro Principal",
    area: "245 hectáreas",
    animals: 145,
    status: "active",
    violations: 1,
    color: "#5C7A5B",
    coordinates: [
      [20.6570, -103.3510],
      [20.6640, -103.3510],
      [20.6640, -103.3450],
      [20.6570, -103.3450],
    ] as [number, number][],
  },
  {
    id: "FENCE-002",
    name: "Sector A - Pastoreo",
    area: "80 hectáreas",
    animals: 45,
    status: "active",
    violations: 0,
    color: "#3D5A3C",
    coordinates: [
      [20.6575, -103.3505],
      [20.6600, -103.3505],
      [20.6600, -103.3480],
      [20.6575, -103.3480],
    ] as [number, number][],
  },
  {
    id: "FENCE-003",
    name: "Sector B - Descanso",
    area: "60 hectáreas",
    animals: 30,
    status: "inactive",
    violations: 0,
    color: "#9B8563",
    coordinates: [
      [20.6605, -103.3505],
      [20.6630, -103.3505],
      [20.6630, -103.3480],
      [20.6605, -103.3480],
    ] as [number, number][],
  },
  {
    id: "FENCE-004",
    name: "Zona de Cuarentena",
    area: "15 hectáreas",
    animals: 3,
    status: "active",
    violations: 0,
    color: "#B94A3E",
    coordinates: [
      [20.6575, -103.3475],
      [20.6590, -103.3475],
      [20.6590, -103.3460],
      [20.6575, -103.3460],
    ] as [number, number][],
  },
];

const animalMarkers = [
  { id: "001", lat: 20.6597, lng: -103.3496, status: "ok" },
  { id: "102", lat: 20.6587, lng: -103.3486, status: "ok" },
  { id: "205", lat: 20.6607, lng: -103.3476, status: "ok" },
  { id: "101", lat: 20.6647, lng: -103.3516, status: "alert" },
  { id: "078", lat: 20.6577, lng: -103.3466, status: "ok" },
];

// Función para simular elevación basada en coordenadas (zona de Jalisco: 1550-1650m)
const calculateSimulatedElevation = (lat: number, lng: number): number => {
  const latVariation = (lat - 20.65) * 1000;
  const lngVariation = (lng + 103.35) * 800;
  const noise = Math.sin(lat * 100) * Math.cos(lng * 100) * 15;

  const baseElevation = 1590;
  const elevation = baseElevation + latVariation + lngVariation + noise;

  return Math.round(Math.max(1550, Math.min(1650, elevation)));
};

export function VirtualFenceView() {
  const [selectedFence, setSelectedFence] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"terrain" | "satellite">("terrain");
  const [elevationData, setElevationData] = useState<{ min: number; max: number; avg: number } | null>(null);

  const center = { lat: 20.6597, lng: -103.3496 };
  const zoom = 14;

  // Calcular datos de elevación para el área usando simulación
  useEffect(() => {
    const elevations = fences[0].coordinates.map(([lat, lng]) =>
      calculateSimulatedElevation(lat, lng)
    );

    setElevationData({
      min: Math.min(...elevations),
      max: Math.max(...elevations),
      avg: Math.round(elevations.reduce((a, b) => a + b, 0) / elevations.length),
    });
  }, []);

  // Convertir coordenadas a formato SVG
  const latLngToSVG = (lat: number, lng: number) => {
    const latRange = 0.007;
    const lngRange = 0.006;
    const x = ((lng - (center.lng - lngRange / 2)) / lngRange) * 100;
    const y = ((center.lat + latRange / 2 - lat) / latRange) * 100;
    return { x, y };
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 md:gap-6 p-3 md:p-6">
      <div className="flex-1 min-w-0 h-[400px] md:h-[500px] lg:h-auto">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#5C7A5B]" />
              Mapa de Vallas Virtuales
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
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

              {/* Overlay SVG para vallas */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <filter id="glow-fence-map">
                    <feGaussianBlur stdDeviation="0.3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {fences.map((fence) => {
                  const points = fence.coordinates
                    .map(([lat, lng]) => {
                      const { x, y } = latLngToSVG(lat, lng);
                      return `${x},${y}`;
                    })
                    .join(" ");

                  return (
                    <polygon
                      key={fence.id}
                      points={points}
                      fill={fence.color}
                      fillOpacity={fence.status === "active" ? 0.2 : 0.08}
                      stroke={fence.color}
                      strokeWidth={selectedFence === fence.id ? 0.6 : 0.4}
                      strokeDasharray={fence.status === "active" ? "2,1.5" : "1,2"}
                      opacity={fence.status === "active" ? 0.95 : 0.5}
                      filter="url(#glow-fence-map)"
                      className="pointer-events-auto cursor-pointer transition-all"
                      onClick={() => setSelectedFence(fence.id)}
                    />
                  );
                })}

                {animalMarkers.map((animal) => {
                  const { x, y } = latLngToSVG(animal.lat, animal.lng);
                  return (
                    <circle
                      key={animal.id}
                      cx={x}
                      cy={y}
                      r="0.8"
                      fill={animal.status === "alert" ? "#B94A3E" : "#5C7A5B"}
                      stroke="#ffffff"
                      strokeWidth="0.2"
                      opacity="0.95"
                      filter="url(#glow-fence-map)"
                    />
                  );
                })}
              </svg>

              {/* Controles */}
              <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col gap-1.5 md:gap-2 z-10">
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

              <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white/95 px-2 md:px-3 py-1.5 md:py-2 rounded shadow-md border border-[#E5E5E5] text-xs max-w-[180px] md:max-w-none">
                <p className="font-medium mb-2 text-[#2C2C2C]">Vallas Activas</p>
                {fences.map((fence) => (
                  <div key={fence.id} className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded" style={{ backgroundColor: fence.color }} />
                    <span className="text-xs text-[#6B6B6B]">{fence.name}</span>
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

              <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 flex flex-col sm:flex-row gap-1.5 md:gap-2 z-10">
                <Button size="sm" className="bg-[#5C7A5B] hover:bg-[#5C7A5B]/90 text-xs">
                  <Plus className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                  <span className="hidden md:inline">Nueva Valla</span>
                </Button>
                <Button size="sm" className="bg-[#3D5A3C] hover:bg-[#3D5A3C]/90 text-xs">
                  <Edit2 className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                  <span className="hidden md:inline">Editar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:w-96 space-y-4 md:space-y-6 overflow-y-auto">
        <Card>
          <CardHeader>
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
                    <Switch checked={fence.status === "active"} />
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
                        {fence.violations} violación{fence.violations > 1 ? "es" : ""}{" "}
                        detectada{fence.violations > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit2 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[#B94A3E] hover:bg-[#B94A3E]/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estadísticas Generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Vallas activas</span>
              <span className="font-medium text-[#5C7A5B]">3/4</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Área total monitoreada</span>
              <span className="font-medium text-[#2C2C2C]">400 ha</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Violaciones hoy</span>
              <span className="font-medium text-[#B94A3E]">1</span>
            </div>
            {elevationData && (
              <>
                <div className="pt-2 border-t border-[#E5E5E5]">
                  <p className="text-xs text-[#6B6B6B] mb-2 flex items-center gap-1">
                    <Mountain className="h-3 w-3" />
                    Datos de Elevación
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B6B6B]">Elevación mínima</span>
                    <span className="font-medium text-[#2C2C2C]">{elevationData.min}m</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-[#6B6B6B]">Elevación máxima</span>
                    <span className="font-medium text-[#2C2C2C]">{elevationData.max}m</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-[#6B6B6B]">Desnivel</span>
                    <span className="font-medium text-[#5C7A5B]">
                      {elevationData.max - elevationData.min}m
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Activity } from "lucide-react";

import { useDashboard } from "../context/DashboardContext";

export function HealthStatus() {
  const { animals, devices } = useDashboard();
  
  const totalAnimals = animals.length;
  const healthyAnimals = animals.filter(a => a.health === "Excelente" || a.health === "Buena").length;
  const healthPercentage = totalAnimals > 0 ? Math.round((healthyAnimals / totalAnimals) * 100) : 0;
  
  const insidePerimeter = animals.filter(a => a.status === "ok").length;
  const normalTemp = animals.filter(a => a.temp >= 38.0 && a.temp <= 39.5).length;
  const chargedDevices = devices.filter(d => d.battery >= 20).length;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm md:text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#5C7A5B]" />
          Estado General del Hato
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-semibold text-[#2C2C2C] text-3xl md:text-4xl">
            {healthPercentage}%
          </span>
          <span className="text-[#5C7A5B] font-medium text-sm md:text-base">Saludable</span>
        </div>
        <div className="space-y-3 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-[#6B6B6B]">Dentro de perímetro</span>
            <span className="font-medium text-[#2C2C2C]">{insidePerimeter}/{totalAnimals}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B6B6B]">Temperatura normal</span>
            <span className="font-medium text-[#2C2C2C]">{normalTemp}/{totalAnimals}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B6B6B]">Dispositivos cargados</span>
            <span className="font-medium text-[#5C7A5B]">{chargedDevices}/{devices.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Activity } from "lucide-react";

export function HealthStatus() {
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
            98%
          </span>
          <span className="text-[#5C7A5B] font-medium text-sm md:text-base">Saludable</span>
        </div>
        <div className="space-y-3 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-[#6B6B6B]">Dentro de perímetro</span>
            <span className="font-medium text-[#2C2C2C]">145/150</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B6B6B]">Temperatura normal</span>
            <span className="font-medium text-[#2C2C2C]">148/150</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B6B6B]">Dispositivos cargados</span>
            <span className="font-medium text-[#5C7A5B]">150/150</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

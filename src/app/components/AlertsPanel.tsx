import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, MapPin, Thermometer } from "lucide-react";
import { Badge } from "./ui/badge";

const alerts = [
  {
    id: 1,
    animal: "Vaca 101",
    type: "location",
    message: "Fuera de perímetro",
    severity: "high",
    time: "Hace 5 min"
  },
  {
    id: 2,
    animal: "Vaca 078",
    type: "temperature",
    message: "Temperatura elevada: 39.8°C",
    severity: "medium",
    time: "Hace 23 min"
  },
  {
    id: 3,
    animal: "Vaca 205",
    type: "location",
    message: "Cerca del límite virtual",
    severity: "low",
    time: "Hace 1 hora"
  }
];

export function AlertsPanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm md:text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#B94A3E]" />
          Alertas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded bg-[#FAFAF8] border border-[#E5E5E5] hover:border-[#D1D5DB] transition-colors"
            >
              {alert.type === "location" ? (
                <MapPin className="h-4 w-4 text-[#B94A3E] mt-0.5 flex-shrink-0" />
              ) : (
                <Thermometer className="h-4 w-4 text-[#B94A3E] mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#2C2C2C]">{alert.animal}</p>
                <p className="text-sm text-[#6B6B6B]">{alert.message}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">{alert.time}</p>
              </div>
              <Badge
                variant={alert.severity === "high" ? "destructive" : "secondary"}
                className="text-xs flex-shrink-0"
              >
                {alert.severity === "high" ? "Alta" : alert.severity === "medium" ? "Media" : "Baja"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

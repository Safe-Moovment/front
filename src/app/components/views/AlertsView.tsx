import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AlertTriangle, MapPin, Thermometer, Battery, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const allAlerts = [
  {
    id: 1,
    animal: "Vaca 101",
    type: "location",
    message: "Fuera de perímetro",
    severity: "high",
    time: "Hace 5 min",
    location: "Sector Norte, 2.3km del límite"
  },
  {
    id: 2,
    animal: "Vaca 078",
    type: "temperature",
    message: "Temperatura elevada: 39.8°C",
    severity: "medium",
    time: "Hace 23 min",
    location: "Sector A"
  },
  {
    id: 3,
    animal: "Vaca 205",
    type: "location",
    message: "Cerca del límite virtual",
    severity: "low",
    time: "Hace 1 hora",
    location: "Sector C"
  },
  {
    id: 4,
    animal: "Vaca 156",
    type: "battery",
    message: "Batería baja: 15%",
    severity: "medium",
    time: "Hace 2 horas",
    location: "Sector D"
  },
  {
    id: 5,
    animal: "Vaca 023",
    type: "temperature",
    message: "Temperatura elevada: 40.1°C",
    severity: "high",
    time: "Hace 3 horas",
    location: "Sector B"
  }
];

export function AlertsView() {
  const highAlerts = allAlerts.filter(a => a.severity === "high");
  const mediumAlerts = allAlerts.filter(a => a.severity === "medium");
  const lowAlerts = allAlerts.filter(a => a.severity === "low");

  const renderAlert = (alert: typeof allAlerts[0]) => (
    <Card key={alert.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            alert.severity === "high" ? "bg-[#B94A3E]/10" :
            alert.severity === "medium" ? "bg-yellow-500/10" : "bg-gray-500/10"
          }`}>
            {alert.type === "location" && <MapPin className="h-6 w-6 text-[#B94A3E]" />}
            {alert.type === "temperature" && <Thermometer className="h-6 w-6 text-[#B94A3E]" />}
            {alert.type === "battery" && <Battery className="h-6 w-6 text-yellow-600" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium">{alert.animal}</h3>
              <Badge
                variant={alert.severity === "high" ? "destructive" : "secondary"}
                className={alert.severity === "high" ? "" : alert.severity === "medium" ? "bg-yellow-500" : ""}
              >
                {alert.severity === "high" ? "Alta" : alert.severity === "medium" ? "Media" : "Baja"}
              </Badge>
            </div>

            <p className="text-sm mb-2">{alert.message}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{alert.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{alert.time}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button size="sm" className="bg-[#5C7A5B] hover:bg-[#5C7A5B]/90">
                Ver Ubicación
              </Button>
              <Button size="sm" variant="outline">
                Resolver
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 mb-2 text-lg md:text-xl">
            <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-[#B94A3E]" />
            Sistema de Alertas
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Monitoreo en tiempo real de eventos críticos
          </p>
        </div>
        <Button className="bg-[#3D5A3C] hover:bg-[#3D5A3C]/90 w-full sm:w-auto">
          Configurar Alertas
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="border-[#B94A3E]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Alertas Críticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium" style={{ fontSize: "2rem", lineHeight: 1 }}>
              {highAlerts.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Alertas Medias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium" style={{ fontSize: "2rem", lineHeight: 1 }}>
              {mediumAlerts.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Alertas Bajas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium" style={{ fontSize: "2rem", lineHeight: 1 }}>
              {lowAlerts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todas ({allAlerts.length})</TabsTrigger>
          <TabsTrigger value="high">Críticas ({highAlerts.length})</TabsTrigger>
          <TabsTrigger value="medium">Medias ({mediumAlerts.length})</TabsTrigger>
          <TabsTrigger value="low">Bajas ({lowAlerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {allAlerts.map(renderAlert)}
        </TabsContent>
        <TabsContent value="high" className="space-y-4 mt-4">
          {highAlerts.map(renderAlert)}
        </TabsContent>
        <TabsContent value="medium" className="space-y-4 mt-4">
          {mediumAlerts.map(renderAlert)}
        </TabsContent>
        <TabsContent value="low" className="space-y-4 mt-4">
          {lowAlerts.map(renderAlert)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

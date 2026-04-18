import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AlertTriangle, MapPin, Thermometer, Battery, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Switch } from "../ui/switch";
import { useDashboard } from "../../context/DashboardContext";

export function AlertsView({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const { alerts: allAlerts, animals, resolveAlert } = useDashboard();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedMapAnimal, setSelectedMapAnimal] = useState<any>(null);
  const highAlerts = allAlerts.filter(a => a.severity === "high");
  const mediumAlerts = allAlerts.filter(a => a.severity === "medium");
  const lowAlerts = allAlerts.filter(a => a.severity === "low");

  const renderAlert = (alert: any) => (
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
              <Button size="sm" className="bg-[#5C7A5B] hover:bg-[#5C7A5B]/90" onClick={() => {
                const animal = animals.find(a => alert.animal.includes(a.id));
                if (animal) setSelectedMapAnimal(animal);
              }}>
                Ver Ubicación
              </Button>
              <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
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
        <Button className="bg-[#3D5A3C] hover:bg-[#3D5A3C]/90 w-full sm:w-auto" onClick={() => setIsConfigOpen(true)}>
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

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configuración de Alertas</DialogTitle>
            <DialogDescription>
              Ajusta las notificaciones y sensibilidades del sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Notificaciones Push</p>
                <p className="text-xs text-muted-foreground">Recibe alertas en la app en tiempo real</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Alertas por Correo</p>
                <p className="text-xs text-muted-foreground">Recibe resumen diario y alertas críticas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Alertas de Temperatura</p>
                <p className="text-xs text-muted-foreground">Señal de fiebre o hipotermia (&gt;39.5°C o &lt;37°C)</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Perímetro Estricto</p>
                <p className="text-xs text-muted-foreground">Avisar incluso antes de cruzar la valla (5m de holgura)</p>
              </div>
              <Switch />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-[#5C7A5B] hover:bg-[#5C7A5B]/90" onClick={() => setIsConfigOpen(false)}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedMapAnimal} onOpenChange={(open) => !open && setSelectedMapAnimal(null)}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] max-h-[600px] p-0 overflow-hidden flex flex-col">
          <div className="p-4 pb-2 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#5C7A5B]" />
                Ubicación de {selectedMapAnimal?.name}
              </DialogTitle>
              <DialogDescription>
                Última posición GPS reportada: {selectedMapAnimal?.lat.toFixed(5)}, {selectedMapAnimal?.lng.toFixed(5)} ({selectedMapAnimal?.locationText})
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 w-full bg-[#E5E5E5]">
            {selectedMapAnimal && (
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedMapAnimal.lat},${selectedMapAnimal.lng}&zoom=17&maptype=satellite`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

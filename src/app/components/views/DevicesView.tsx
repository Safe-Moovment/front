import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Radio, Battery, Signal, MapPin, Activity } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useState } from "react";
import { DeviceFormPanel } from "./DeviceFormPanel";
import { DeviceInfoPanel } from "./DeviceInfoPanel";

import { useDashboard, Device } from "../../context/DashboardContext";

export function DevicesView() {
  const { devices, animals, addDevice, updateDevice, devicesLoading, devicesError } = useDashboard();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [infoDevice, setInfoDevice] = useState<Device | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const activeDevices = devices.filter(d => d.status === "active").length;
  const warningDevices = devices.filter(d => d.status === "warning").length;
  const criticalDevices = devices.filter(d => d.status === "critical").length;

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 mb-2 text-lg md:text-xl">
            <Radio className="h-5 w-5 md:h-6 md:w-6 text-[#3D5A3C]" />
            Dispositivos IoT
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Gestión de collares inteligentes y sensores
          </p>
        </div>
        <Button 
          className="bg-[#3D5A3C] hover:bg-[#3D5A3C]/90 w-full sm:w-auto"
          onClick={() => {
            setEditingDevice(null);
            setIsFormOpen(true);
          }}
        >
          Registrar Dispositivo
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-[#5C7A5B]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dispositivos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-[#5C7A5B]" style={{ fontSize: "2rem", lineHeight: 1 }}>
              {activeDevices}
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Con Advertencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-yellow-600" style={{ fontSize: "2rem", lineHeight: 1 }}>
              {warningDevices}
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#B94A3E]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Estado Crítico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-[#B94A3E]" style={{ fontSize: "2rem", lineHeight: 1 }}>
              {criticalDevices}
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#3D5A3C]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Cobertura Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium" style={{ fontSize: "2rem", lineHeight: 1 }}>
              85%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {devicesLoading && (
          <Card className="md:col-span-2">
            <CardContent className="py-8 text-sm text-muted-foreground">
              Cargando dispositivos...
            </CardContent>
          </Card>
        )}

        {devicesError && (
          <Card className="md:col-span-2 border-[#B94A3E]/30">
            <CardContent className="py-6 text-sm text-[#B94A3E]">
              {devicesError}
            </CardContent>
          </Card>
        )}

        {saveError && (
          <Card className="md:col-span-2 border-[#B94A3E]/30">
            <CardContent className="py-6 text-sm text-[#B94A3E]">
              {saveError}
            </CardContent>
          </Card>
        )}

        {devices.map((device) => (
          <Card
            key={device.id}
            className={`hover:shadow-md transition-shadow ${
              device.status === "critical" ? "border-[#B94A3E]/30" :
              device.status === "warning" ? "border-yellow-500/30" :
              "border-[#5C7A5B]/20"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  {device.id}
                </CardTitle>
                <Badge
                  variant={
                    device.status === "active" ? "default" :
                    device.status === "warning" ? "secondary" :
                    "destructive"
                  }
                  className={device.status === "active" ? "bg-[#5C7A5B]" : device.status === "warning" ? "bg-yellow-500" : ""}
                >
                  {device.status === "active" ? "Activo" : device.status === "warning" ? "Advertencia" : "Crítico"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Animal asignado:</span>
                <span className="font-medium">Vaca #{device.animalId}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Battery className={`h-4 w-4 ${
                      device.battery > 80 ? "text-[#5C7A5B]" :
                      device.battery > 30 ? "text-yellow-600" :
                      "text-[#B94A3E]"
                    }`} />
                    <span className="text-muted-foreground">Batería</span>
                  </div>
                  <span className="font-medium">{device.battery}%</span>
                </div>
                <Progress
                  value={device.battery}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Signal className={`h-4 w-4 ${
                      device.signal > 70 ? "text-[#5C7A5B]" :
                      device.signal > 40 ? "text-yellow-600" :
                      "text-[#B94A3E]"
                    }`} />
                    <span className="text-muted-foreground">Señal</span>
                  </div>
                  <span className="font-medium">{device.signal}%</span>
                </div>
                <Progress
                  value={device.signal}
                  className="h-2"
                />
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{animals.find(a => a.id === device.animalId)?.locationText || "Desconocida"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>{formatLastPing(device.lastPing)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingDevice(device);
                    setIsFormOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setInfoDevice(device);
                    setIsInfoOpen(true);
                  }}
                >
                  Información del Dispositivo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeviceFormPanel
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        device={editingDevice}
        onSave={async (data) => {
          setSaveError(null);
          try {
            if (editingDevice) {
              await updateDevice(editingDevice.id, data);
            } else {
              await addDevice(data as Device);
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : "No se pudo guardar el dispositivo.";
            setSaveError(message);
            throw error;
          }
        }}
      />

      <DeviceInfoPanel 
        open={isInfoOpen}
        onOpenChange={setIsInfoOpen}
        device={infoDevice}
      />
    </div>
  );
}

function formatLastPing(raw: string): string {
  const value = new Date(raw);
  if (Number.isNaN(value.getTime())) {
    return raw;
  }

  const diffMs = Date.now() - value.getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMin < 1) {
    return "Hace un momento";
  }
  if (diffMin < 60) {
    return `Hace ${diffMin} min`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
}

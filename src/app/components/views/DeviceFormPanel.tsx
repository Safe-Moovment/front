import { useState, useEffect } from "react";
import { useIsMobile } from "../ui/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "../ui/drawer";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Device, useDashboard } from "../../context/DashboardContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  onSave: (data: Partial<Device>) => Promise<void> | void;
}

export function DeviceFormPanel({ open, onOpenChange, device, onSave }: Props) {
  const isMobile = useIsMobile();
  const { animals } = useDashboard();
  const [formData, setFormData] = useState<Partial<Device>>({});

  useEffect(() => {
    if (device) {
      setFormData(device);
    } else {
      setFormData({
        id: "",
        animalId: "No asignado",
        battery: 0,
        signal: 0,
        status: "active",
        lastPing: new Date().toISOString(),
        hardwareVersion: "",
        solarCharging: false,
        protocol: "LoRaWAN",
        lastSyncMode: "Store & Forward",
        gatewayId: "",
        alertsCount: 0,
      });
    }
  }, [device, open]);

  const handleChange = (field: keyof Device, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await onSave(formData);
    onOpenChange(false);
  };

  const isEditing = !!device;

  const content = (
    <div className="space-y-4 px-4 py-4 md:px-0">
      <div className="space-y-2">
        <Label htmlFor="id">ID de Hardware / Serial</Label>
        <Input 
          id="id" 
          value={formData.id} 
          onChange={e => handleChange("id", e.target.value)} 
          disabled={isEditing} 
          placeholder="Ej. DEV-099"
        />
      </div>
      <div className="space-y-2">
        <Label>Animal Asignado</Label>
        <Select value={formData.animalId} onValueChange={(val) => handleChange("animalId", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="No asignado">No asignado</SelectItem>
            {animals.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name} (#{a.id})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Estado de Conexión</Label>
        <Select value={formData.status} onValueChange={(val) => handleChange("status", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="warning">Advertencia</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="battery">Batería (%)</Label>
          <Input
            id="battery"
            type="number"
            min={0}
            max={100}
            value={formData.battery}
            onChange={e => handleChange("battery", Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signal">Señal (%)</Label>
          <Input
            id="signal"
            type="number"
            min={0}
            max={100}
            value={formData.signal}
            onChange={e => handleChange("signal", Number(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hardwareVersion">Versión de Hardware</Label>
        <Input
          id="hardwareVersion"
          value={formData.hardwareVersion}
          onChange={e => handleChange("hardwareVersion", e.target.value)}
          placeholder="Ej. V3-Solar"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Protocolo</Label>
          <Select value={formData.protocol} onValueChange={(val) => handleChange("protocol", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LoRaWAN">LoRaWAN</SelectItem>
              <SelectItem value="LTE">LTE</SelectItem>
              <SelectItem value="NB-IoT">NB-IoT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Modo de Sincronización</Label>
          <Select value={formData.lastSyncMode} onValueChange={(val) => handleChange("lastSyncMode", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Store & Forward">Store & Forward</SelectItem>
              <SelectItem value="Real-time">Real-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="gatewayId">Gateway ID</Label>
          <Input
            id="gatewayId"
            value={formData.gatewayId}
            onChange={e => handleChange("gatewayId", e.target.value)}
            placeholder="Ej. BASE-STATION-01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alertsCount">Conteo de Alertas</Label>
          <Input
            id="alertsCount"
            type="number"
            min={0}
            value={formData.alertsCount}
            onChange={e => handleChange("alertsCount", Number(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Carga Solar</Label>
        <Select
          value={String(formData.solarCharging)}
          onValueChange={(val) => handleChange("solarCharging", val === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Activa</SelectItem>
            <SelectItem value="false">Inactiva</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{isEditing ? `Editar Dispositivo ${device?.id}` : "Registrar Dispositivo"}</DrawerTitle>
            <DrawerDescription>Gestiona el collar y su asignación de hardware.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-auto pb-4">
            {content}
          </div>
          <DrawerFooter className="pt-2">
            <Button className="bg-[#3D5A3C] hover:bg-[#3D5A3C]/90" onClick={handleSave}>Guardar Cambios</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? `Editar Dispositivo ${device?.id}` : "Registrar Dispositivo"}</SheetTitle>
          <SheetDescription>Gestiona el collar y su asignación de hardware.</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {content}
        </div>
        <SheetFooter className="mt-8 flex flex-row gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-[#3D5A3C] hover:bg-[#3D5A3C]/90" onClick={handleSave}>Guardar Cambios</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

import { useState, useEffect } from "react";
import { useIsMobile } from "../ui/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "../ui/drawer";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Fence, useDashboard } from "../../context/DashboardContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fence: Fence | null;
  draftCoordinates?: [number, number][];
  onSave: (data: Partial<Fence>) => Promise<void> | void;
}

export function FenceFormPanel({ open, onOpenChange, fence, draftCoordinates, onSave }: Props) {
  const isMobile = useIsMobile();
  const { ranchContext } = useDashboard();
  const [formData, setFormData] = useState<Partial<Fence>>({});

  useEffect(() => {
    if (fence) {
      setFormData(fence);
    } else {
      // Default generated square around the ranch
      const baseLat = ranchContext.lat - 0.005;
      const baseLng = ranchContext.lng - 0.005;
      const defaultCoordinates: [number, number][] = draftCoordinates || [
        [baseLat, baseLng],
        [baseLat + 0.01, baseLng],
        [baseLat + 0.01, baseLng + 0.01],
        [baseLat, baseLng + 0.01],
      ];

      // Calculate area if draft was provided and geometry is available
      let computedAreaStr = "100 hectáreas";
      if (draftCoordinates && draftCoordinates.length >= 3 && window.google?.maps?.geometry?.spherical) {
        const path = draftCoordinates.map(([lat, lng]) => new google.maps.LatLng(lat, lng));
        const sqMeters = google.maps.geometry.spherical.computeArea(path);
        computedAreaStr = `${(sqMeters / 10000).toFixed(2)} hectáreas`;
      }

      setFormData({
        id: `FENCE-${Date.now()}`,
        name: "",
        area: computedAreaStr,
        animals: 0,
        status: "active",
        violations: 0,
        color: "#5C7A5B",
        coordinates: defaultCoordinates
      });
    }
  }, [fence, open, ranchContext, draftCoordinates]);

  const handleChange = (field: keyof Fence, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await onSave(formData);
    onOpenChange(false);
  };

  const isEditing = !!fence;

  const content = (
    <div className="space-y-4 px-4 py-4 md:px-0">
      <div className="space-y-2">
        <Label htmlFor="id">ID de Terreno</Label>
        <Input 
          id="id" 
          value={formData.id} 
          disabled 
          className="bg-gray-50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Módulo o Sector</Label>
        <Input 
          id="name" 
          value={formData.name} 
          onChange={e => handleChange("name", e.target.value)} 
          placeholder="Ej. Sector Pastoreo Norte"
        />
      </div>
      <div className="space-y-2">
        <Label>Color en el Mapa</Label>
        <div className="flex gap-2">
          {["#5C7A5B", "#3D5A3C", "#9B8563", "#B94A3E", "#D4A373", "#2A9D8F"].map(color => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'} transition-transform`}
              style={{ backgroundColor: color }}
              onClick={() => handleChange("color", color)}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Estado de la Valla</Label>
        <Select value={formData.status} onValueChange={(val) => handleChange("status", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activa (Impedir paso)</SelectItem>
            <SelectItem value="inactive">Inactiva (Permitir paso)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {!isEditing && (
        <p className="text-xs text-muted-foreground pt-4 leading-relaxed">
          {draftCoordinates ? 
            `Se guardará el polígono trazado con un área inicial estimada de ${formData.area}. Podrás modificar los vértices directamente en la vista del mapa posteriormente.` : 
            "Al guardar, se dibujará automáticamente una valla cuadrática por defecto."}
        </p>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{isEditing ? `Editar Valla ${fence?.name}` : "Nueva Valla Virtual"}</DrawerTitle>
            <DrawerDescription>Configura los polígonos de contención.</DrawerDescription>
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
          <SheetTitle>{isEditing ? `Editar Valla ${fence?.name}` : "Nueva Valla Virtual"}</SheetTitle>
          <SheetDescription>Configura los polígonos de contención de animales.</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {content}
        </div>
        <SheetFooter className="mt-8 flex flex-row gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-[#3D5A3C] hover:bg-[#3D5A3C]/90" onClick={handleSave}>Guardar Valla</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

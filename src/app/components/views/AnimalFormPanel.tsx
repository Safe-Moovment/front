import { useState, useEffect } from "react";
import { useIsMobile } from "../ui/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "../ui/drawer";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Animal, useDashboard } from "../../context/DashboardContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal: Animal | null;
  onSave: (data: Partial<Animal>) => Promise<void> | void;
}

export function AnimalFormPanel({ open, onOpenChange, animal, onSave }: Props) {
  const isMobile = useIsMobile();
  const { fences } = useDashboard();
  const [formData, setFormData] = useState<Partial<Animal>>({});

  useEffect(() => {
    if (animal) {
      setFormData(animal);
    } else {
      setFormData({
        id: "",
        name: "",
        health: "Excelente",
        status: "ok",
        locationText: "Sector A",
        temp: 38.5,
        battery: 100,
        lastUpdate: new Date().toISOString(),
        lat: 20.6597,
        lng: -103.3496
      });
    }
  }, [animal, open]);

  const handleChange = (field: keyof Animal, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await onSave(formData);
    onOpenChange(false);
  };

  const isEditing = !!animal;

  const content = (
    <div className="space-y-4 px-4 py-4 md:px-0">
      <div className="space-y-2">
        <Label htmlFor="id">ID del Collar / Etiqueta</Label>
        <Input 
          id="id" 
          value={formData.id} 
          onChange={e => handleChange("id", e.target.value)} 
          disabled={isEditing}
          placeholder="Ej. 104"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre / Apodo</Label>
        <Input 
          id="name" 
          value={formData.name} 
          onChange={e => handleChange("name", e.target.value)} 
          placeholder="Ej. Muu"
        />
      </div>
      <div className="space-y-2">
        <Label>Estado de Salud</Label>
        <Select value={formData.health} onValueChange={(val) => handleChange("health", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Excelente">Excelente</SelectItem>
            <SelectItem value="Buena">Buena</SelectItem>
            <SelectItem value="Atención">Atención</SelectItem>
            <SelectItem value="Alerta">Alerta</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="temp">Temperatura Corporal (°C)</Label>
        <Input 
          id="temp" 
          type="number" 
          step="0.1" 
          value={formData.temp} 
          onChange={e => handleChange("temp", parseFloat(e.target.value))} 
        />
      </div>
      <div className="space-y-2">
        <Label>Ubicación / Sector Asignado</Label>
        <Select 
          value={formData.locationText || "Sin Sector"} 
          onValueChange={(val) => handleChange("locationText", val === "Sin Sector" ? "" : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar sector..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sin Sector">Sin Sector (Libre)</SelectItem>
            <SelectItem value="Fuera de perímetro">Fuera de perímetro</SelectItem>
            {fences.map(fence => (
              <SelectItem key={fence.id} value={fence.name}>{fence.name}</SelectItem>
            ))}
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
            <DrawerTitle>{isEditing ? `Editar a ${animal?.name || 'Animal'}` : "Agregar Nuevo Animal"}</DrawerTitle>
            <DrawerDescription>Gestiona el perfil y estado de salud.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-auto pb-4">
            {content}
          </div>
          <DrawerFooter className="pt-2">
            <Button className="bg-[#5C7A5B] hover:bg-[#5C7A5B]/90" onClick={handleSave}>Guardar Cambios</Button>
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
          <SheetTitle>{isEditing ? `Editar a ${animal?.name || 'Animal'}` : "Agregar Nuevo Animal"}</SheetTitle>
          <SheetDescription>Gestiona el perfil y estado de salud del ejemplar.</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {content}
        </div>
        <SheetFooter className="mt-8 flex flex-row gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-[#5C7A5B] hover:bg-[#5C7A5B]/90" onClick={handleSave}>Guardar Cambios</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

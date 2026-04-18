import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Beef, Battery, MapPin, Thermometer, Activity, Search } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { Progress } from "../ui/progress";

import { useDashboard, Animal } from "../../context/DashboardContext";
import { AnimalFormPanel } from "./AnimalFormPanel";

export function CattleView() {
  const { animals, addAnimal, updateAnimal } = useDashboard();
  const cattleData = animals;
  const [search, setSearch] = useState("");
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  const filteredCattle = cattleData.filter(cattle =>
    cattle.id.includes(search) || cattle.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 mb-2 text-lg md:text-xl">
            <Beef className="h-5 w-5 md:h-6 md:w-6 text-[#5C7A5B]" />
            Gestión de Ganado
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            {cattleData.length} animales monitoreados
          </p>
        </div>
        <Button 
          className="bg-[#5C7A5B] hover:bg-[#5C7A5B]/90 w-full sm:w-auto"
          onClick={() => {
            setEditingAnimal(null);
            setIsPanelOpen(true);
          }}
        >
          Agregar Animal
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-[#5C7A5B]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total de Ganado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium" style={{ fontSize: "2rem", lineHeight: 1 }}>
              150
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#5C7A5B]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Estado Saludable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-[#5C7A5B]" style={{ fontSize: "2rem", lineHeight: 1 }}>
              {cattleData.filter(c => c.health === "Excelente" || c.health === "Buena").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#B94A3E]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Requieren Atención</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-[#B94A3E]" style={{ fontSize: "2rem", lineHeight: 1 }}>
              {cattleData.filter(c => c.health === "Atención" || c.health === "Alerta").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#3D5A3C]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tasa de Actualización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium" style={{ fontSize: "2rem", lineHeight: 1 }}>
              99%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base md:text-lg">Listado Completo</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 bg-[#F9FAF9] md:bg-white rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCattle.map((cattle) => (
              <Card key={cattle.id} className="hover:shadow-md transition-shadow border border-[#E5E5E5]">
                <CardHeader className="pb-2 border-b flex flex-row items-center justify-between space-y-0">
                  <div className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-[#5C7A5B]">#{cattle.id}</span>
                    <span className="text-[#2C2C2C]">{cattle.name}</span>
                  </div>
                  <Badge
                    variant={
                      cattle.health === "Excelente" ? "default" :
                      cattle.health === "Buena" ? "secondary" :
                      "destructive"
                    }
                    className={cattle.health === "Excelente" ? "bg-[#5C7A5B]" : ""}
                  >
                    {cattle.health}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4 pb-2 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                    <MapPin className="h-4 w-4" />
                    <span>{cattle.locationText}</span>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Temperatura</p>
                    <div className="flex items-center gap-1 font-medium text-[#2C2C2C]">
                      <Thermometer className={`h-4 w-4 ${
                        cattle.temp > 39 ? "text-[#B94A3E]" : "text-[#5C7A5B]"
                      }`} />
                      {cattle.temp}°C
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Batería Collar</p>
                    <div className="flex items-center gap-2 font-medium text-[#2C2C2C]">
                      <Battery className={`h-4 w-4 ${
                        cattle.battery < 20 ? "text-[#B94A3E]" : "text-[#5C7A5B]"
                      }`} />
                      {cattle.battery}%
                    </div>
                  </div>

                  <div className="col-span-2">
                     <p className="text-xs text-muted-foreground mb-1">Último contacto</p>
                     <p className="font-medium text-[#2C2C2C] flex items-center gap-1.5">
                       <Activity className="h-3.5 w-3.5 text-[#5C7A5B]" />
                       {cattle.lastUpdate}
                     </p>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-[#3D5A3C] hover:bg-[#5C7A5B]/10 hover:text-[#5C7A5B] border-[#5C7A5B]/30"
                    onClick={() => {
                      setEditingAnimal(cattle);
                      setIsPanelOpen(true);
                    }}
                  >
                    Ver / Editar Detalles
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimalFormPanel
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        animal={editingAnimal}
        onSave={(data) => {
          if (editingAnimal) {
            updateAnimal(editingAnimal.id, data);
          } else {
            addAnimal(data as Animal);
          }
        }}
      />
    </div>
  );
}

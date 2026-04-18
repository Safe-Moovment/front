import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Beef, Battery, MapPin, Thermometer, Activity, Search } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { Progress } from "../ui/progress";

const cattleData = [
  { id: "001", name: "Luna", location: "Sector A", health: "Excelente", battery: 95, temp: 38.5, lastUpdate: "Hace 2 min" },
  { id: "102", name: "Estrella", location: "Sector B", health: "Buena", battery: 87, temp: 38.8, lastUpdate: "Hace 5 min" },
  { id: "205", name: "Margarita", location: "Sector C", health: "Excelente", battery: 92, temp: 38.3, lastUpdate: "Hace 3 min" },
  { id: "078", name: "Rosa", location: "Sector A", health: "Atención", battery: 78, temp: 39.8, lastUpdate: "Hace 1 min" },
  { id: "156", name: "Paloma", location: "Sector D", health: "Excelente", battery: 89, temp: 38.6, lastUpdate: "Hace 4 min" },
  { id: "023", name: "Bella", location: "Sector B", health: "Buena", battery: 91, temp: 38.7, lastUpdate: "Hace 6 min" },
  { id: "101", name: "Canela", location: "Fuera", health: "Alerta", battery: 85, temp: 39.2, lastUpdate: "Hace 5 min" },
  { id: "087", name: "Nube", location: "Sector C", health: "Excelente", battery: 94, temp: 38.4, lastUpdate: "Hace 2 min" },
];

export function CattleView() {
  const [search, setSearch] = useState("");

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
        <Button className="bg-[#5C7A5B] hover:bg-[#5C7A5B]/90 w-full sm:w-auto">
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
              147
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#B94A3E]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Requieren Atención</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-[#B94A3E]" style={{ fontSize: "2rem", lineHeight: 1 }}>
              3
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
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Temperatura</TableHead>
                <TableHead>Salud</TableHead>
                <TableHead>Batería</TableHead>
                <TableHead>Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCattle.map((cattle) => (
                <TableRow key={cattle.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">#{cattle.id}</TableCell>
                  <TableCell>{cattle.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{cattle.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Thermometer className={`h-4 w-4 ${
                        cattle.temp > 39 ? "text-[#B94A3E]" : "text-[#5C7A5B]"
                      }`} />
                      <span className="text-sm">{cattle.temp}°C</span>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={cattle.battery} className="w-16 h-2" />
                      <span className="text-sm text-muted-foreground">{cattle.battery}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {cattle.lastUpdate}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="text-[#3D5A3C]">
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

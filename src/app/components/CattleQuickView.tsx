import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Beef, Battery, MapPin } from "lucide-react";
import { Badge } from "./ui/badge";

const cattleData = [
  { id: "001", location: "Sector A", health: "Excelente", battery: 95 },
  { id: "102", location: "Sector B", health: "Buena", battery: 87 },
  { id: "205", location: "Sector C", health: "Excelente", battery: 92 },
  { id: "078", location: "Sector A", health: "Atención", battery: 78 },
  { id: "156", location: "Sector D", health: "Excelente", battery: 89 },
];

export function CattleQuickView() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm md:text-base flex items-center gap-2">
          <Beef className="h-4 w-4 text-[#5C7A5B]" />
          Resumen de Ganado
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Salud</TableHead>
              <TableHead className="text-right">Batería</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cattleData.map((cattle) => (
              <TableRow key={cattle.id}>
                <TableCell className="font-medium">#{cattle.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{cattle.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={cattle.health === "Excelente" ? "default" : cattle.health === "Buena" ? "secondary" : "destructive"}
                    className={cattle.health === "Excelente" ? "bg-[#5C7A5B]" : ""}
                  >
                    {cattle.health}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Battery
                      className={`h-4 w-4 ${
                        cattle.battery > 80 ? "text-[#5C7A5B]" : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-sm">{cattle.battery}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

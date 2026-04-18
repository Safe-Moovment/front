import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Device, useDashboard } from "../../context/DashboardContext";
import { Battery, Signal, Activity, CheckCircle2, Cpu, HardDrive, Thermometer, MapPin, Radio, ShieldCheck, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
}

export function DeviceInfoPanel({ open, onOpenChange, device }: Props) {
  const { animals } = useDashboard();
  const animal = animals.find(a => a.id === device?.animalId);

  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticStep, setDiagnosticStep] = useState(0);

  const startDiagnostic = () => {
    setDiagnosticRunning(true);
    setDiagnosticStep(1);
  };

  useEffect(() => {
    if (diagnosticRunning && diagnosticStep < 6) {
      const timer = setTimeout(() => {
        setDiagnosticStep(prev => prev + 1);
      }, 800); // 800ms per step simulation
      return () => clearTimeout(timer);
    } else if (diagnosticStep === 6) {
      const timer = setTimeout(() => {
        setDiagnosticRunning(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [diagnosticRunning, diagnosticStep]);

  // Reset diagnostic when switching devices or reopening
  useEffect(() => {
    if (open) {
      setDiagnosticRunning(false);
      setDiagnosticStep(0);
    }
  }, [open, device?.id]);

  if (!device) return null;

  const content = (
    <Tabs defaultValue="resumen" className="w-full mt-4">
      <TabsList className="w-full justify-start overflow-x-auto bg-[#E5E5E5]/50 flex-nowrap h-auto py-1">
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="lorawan">LoRaWAN</TabsTrigger>
        <TabsTrigger value="sensores">Sensores</TabsTrigger>
        <TabsTrigger value="pruebas">Pruebas</TabsTrigger>
      </TabsList>
      
      <div className="mt-4 pb-12 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        
        {/* TAB: RESUMEN */}
        <TabsContent value="resumen" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Estado</span>
              <p>
                <Badge variant={device.status === "active" ? "default" : device.status === "warning" ? "secondary" : "destructive"} className={device.status === "active" ? "bg-[#5C7A5B]" : device.status === "warning" ? "bg-yellow-500" : ""}>
                    {device.status === "active" ? "Activo" : device.status === "warning" ? "Advertencia" : "Crítico"}
                </Badge>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Ubicación Actual</span>
              <p className="text-sm flex items-center gap-1 font-medium"><MapPin className="h-3.5 w-3.5 text-[#5C7A5B]"/> {animal?.locationText || "Desconocida"}</p>
            </div>
          </div>

          <div className="border border-[#E5E5E5] rounded-xl p-4 bg-[#F0F0ED]/50 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2"><Cpu className="h-4 w-4"/> Información de Hardware</h4>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div><span className="text-muted-foreground text-xs block">Modelo</span> MuuCollar Pro</div>
              <div><span className="text-muted-foreground text-xs block">Firmware</span> v2.3.1</div>
              <div><span className="text-muted-foreground text-xs block">Número de Serie</span> S/N-98421-{device.id}</div>
              <div><span className="text-muted-foreground text-xs block">Uptime</span> 23 días, 4 horas</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[#E5E5E5] rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2"><Battery className="h-4 w-4"/> Batería</h4>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Nivel Actual</span> <span className="font-medium">{device.battery}%</span></div>
                <Progress value={device.battery} className={`h-1.5 ${device.battery < 30 ? "bg-red-200" : "bg-green-100"}`} />
              </div>
              <div className="text-xs space-y-1.5 pt-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Voltaje</span> <span>3.85V</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Salud</span> <span className="text-[#5C7A5B]">98%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Autonomía</span> <span>~27 días</span></div>
              </div>
            </div>

            <div className="border border-[#E5E5E5] rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2"><Signal className="h-4 w-4"/> Señal</h4>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Intensidad</span> <span className="font-medium">{device.signal}%</span></div>
                <Progress value={device.signal} className={`h-1.5 ${device.signal < 50 ? "bg-yellow-200" : "bg-blue-100"}`} />
              </div>
              <div className="text-xs space-y-1.5 pt-2">
                <div className="flex justify-between"><span className="text-muted-foreground">RSSI</span> <span>-65 dBm</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SNR</span> <span className="text-[#5C7A5B]">8.5 dB</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gateway</span> <span>GTW-JAL-02</span></div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB: LORAWAN */}
        <TabsContent value="lorawan" className="space-y-6">
          <div className="border border-[#E5E5E5] rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2"><Radio className="h-4 w-4"/> Detalles Técnicos LoRaWAN</h4>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div><span className="text-muted-foreground text-xs block">Frecuencia</span> 915 MHz (AU915)</div>
              <div><span className="text-muted-foreground text-xs block">Data Rate</span> SF7BW125</div>
              <div><span className="text-muted-foreground text-xs block">Tasa de Éxito</span> 99.8%</div>
              <div><span className="text-muted-foreground text-xs block">Transmisiones Tot.</span> 12,458</div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Historial de Conexiones (24h)</h4>
            <div className="border-l-2 border-[#5C7A5B] ml-2 pl-4 space-y-4">
              <div className="relative">
                <div className="absolute w-2 h-2 bg-[#5C7A5B] rounded-full -left-[21px] top-1" />
                <p className="text-sm font-medium">Sincronización Exitosa</p>
                <p className="text-xs text-muted-foreground">Hace 2 minutos • Señal: 98% • Bat: 95%</p>
              </div>
              <div className="relative">
                <div className="absolute w-2 h-2 bg-[#5C7A5B] rounded-full -left-[21px] top-1" />
                <p className="text-sm font-medium">Sincronización Exitosa</p>
                <p className="text-xs text-muted-foreground">Hace 1 hora • Señal: 95% • Bat: 95%</p>
              </div>
              <div className="relative">
                <div className="absolute w-2 h-2 bg-[#B94A3E] rounded-full -left-[21px] top-1" />
                <p className="text-sm font-medium text-[#B94A3E]">Paquete Perdido (Timeout)</p>
                <p className="text-xs text-muted-foreground">Hace 2 horas • Reintentando conexión...</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB: SENSORES */}
        <TabsContent value="sensores" className="space-y-4">
          <div className="border border-[#E5E5E5] rounded-xl p-4 flex items-start gap-3">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><MapPin className="h-5 w-5"/></div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">Módulo GPS</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Satélites Visibles:</span> <span className="font-medium">12</span ></div>
                <div><span className="text-muted-foreground">HDOP (Precisión):</span> <span className="font-medium">1.2 (±3m)</span></div>
                <div><span className="text-muted-foreground">Último Fix:</span> <span className="font-medium">Hace 30 seg</span></div>
              </div>
            </div>
          </div>

          <div className="border border-[#E5E5E5] rounded-xl p-4 flex items-start gap-3">
            <div className="bg-purple-50 text-purple-600 p-2 rounded-lg"><Activity className="h-5 w-5"/></div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">Acelerómetro de Perfil</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Calibración:</span> <span className="text-[#5C7A5B] font-medium">OK</span></div>
                <div><span className="text-muted-foreground">Actividad:</span> <span className="font-medium">Caminando</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Vectores (m/s²):</span> <span className="font-mono text-[10px]">X:-0.4 Y:9.8 Z:0.1</span></div>
              </div>
            </div>
          </div>

          <div className="border border-[#E5E5E5] rounded-xl p-4 flex items-start gap-3">
            <div className="bg-orange-50 text-orange-600 p-2 rounded-lg"><Thermometer className="h-5 w-5"/></div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">Sensor de Temperatura</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Temp. Actual:</span> <span className="font-medium">38.5°C</span></div>
                <div><span className="text-muted-foreground">Tolerancia:</span> <span className="font-medium">±0.2°C</span></div>
              </div>
            </div>
          </div>

          <div className="border border-[#E5E5E5] rounded-xl p-4 flex items-start gap-3">
            <div className="bg-gray-100 text-gray-600 p-2 rounded-lg"><HardDrive className="h-5 w-5"/></div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">Rendimiento Placa</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Uso CPU:</span> <span className="font-medium">23%</span></div>
                <div><span className="text-muted-foreground">Memoria RAM:</span> <span className="font-medium">67%</span></div>
                <div><span className="text-muted-foreground">Almacenamiento:</span> <span className="font-medium">45%</span></div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB: PRUEBAS */}
        <TabsContent value="pruebas" className="space-y-6">
          <div className="bg-[#F0F0ED] rounded-xl p-5 text-center space-y-4">
            <ShieldCheck className="h-10 w-10 text-[#5C7A5B] mx-auto" />
            <div>
              <h4 className="font-semibold">Diagnóstico Profundo</h4>
              <p className="text-xs text-muted-foreground px-4 mt-1">
                Ejecuta una validación en tiempo real de todos los módulos de hardware del dispositivo.
              </p>
            </div>
            <Button 
              className="bg-[#3D5A3C] hover:bg-[#3D5A3C]/90 w-full font-medium"
              onClick={startDiagnostic}
              disabled={diagnosticRunning}
            >
              {diagnosticRunning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Diagnosticando...</> : "Ejecutar Diagnóstico Completo"}
            </Button>
          </div>

          {diagnosticStep > 0 && (
            <div className="space-y-3 mt-6 border rounded-xl p-4">
              <DiagnosticRow label="Conectividad LoRaWAN" step={1} currentStep={diagnosticStep} />
              <DiagnosticRow label="Módulo GPS (Satélites)" step={2} currentStep={diagnosticStep} />
              <DiagnosticRow label="Sensores (Temp y Acelerómetro)" step={3} currentStep={diagnosticStep} />
              <DiagnosticRow label="Controlador de Batería" step={4} currentStep={diagnosticStep} />
              <DiagnosticRow label="Estímulo Acústico (Valla Virtual)" step={5} currentStep={diagnosticStep} />
              <DiagnosticRow label="Integridad de Memoria" step={6} currentStep={diagnosticStep} />
              
              {diagnosticStep >= 6 && !diagnosticRunning && (
                <div className="pt-4 mt-4 border-t border-[#E5E5E5] text-center text-sm font-semibold text-[#5C7A5B] flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5"/> Diagnóstico finalizado con éxito
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[550px] w-full p-0">
        <div className="p-6 pb-2 border-b">
          <SheetHeader>
            <SheetTitle className="text-xl">Información del Dispositivo</SheetTitle>
            <SheetDescription>
              Dispositivo ID: {device.id} • Asignado a Vaca #{device.animalId}
            </SheetDescription>
          </SheetHeader>
        </div>
        <div className="px-6 h-[calc(100vh-100px)]">
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DiagnosticRow({ label, step, currentStep }: { label: string, step: number, currentStep: number }) {
  const isPending = currentStep < step;
  const isRunning = currentStep === step;
  const isDone = currentStep > step;

  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className={isPending ? "text-muted-foreground" : isDone ? "text-[#2C2C2C]" : "font-medium"}>{label}</span>
      <div>
        {isPending && <span className="text-xs text-muted-foreground">—</span>}
        {isRunning && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
        {isDone && <CheckCircle2 className="h-4 w-4 text-[#5C7A5B]" />}
      </div>
    </div>
  );
}

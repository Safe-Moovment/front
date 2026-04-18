import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createDeviceApi, fetchDevicesApi, updateDeviceApi } from "../devicesApi";
import { createAnimalApi, fetchAnimalsApi, updateAnimalApi } from "../animalsApi";
import { createFenceApi, deleteFenceApi, fetchFencesApi, updateFenceApi } from "../fencesApi";

export interface Animal {
  id: string;
  name: string;
  lat: number;
  lng: number;
  health: "Excelente" | "Buena" | "Atención" | "Alerta";
  battery: number;
  temp: number;
  lastUpdate: string;
  status: "ok" | "alert";
  locationText: string;
}

export interface Device {
  id: string;
  animalId: string;
  battery: number;
  signal: number;
  status: "active" | "warning" | "critical";
  lastPing: string;
  hardwareVersion: string;
  solarCharging: boolean;
  protocol: "LoRaWAN" | "LTE" | "NB-IoT";
  lastSyncMode: "Store & Forward" | "Real-time";
  gatewayId: string;
  alertsCount: number;
}

export interface Alert {
  id: number;
  animal: string;
  type: "location" | "temperature" | "battery";
  message: string;
  severity: "high" | "medium" | "low";
  time: string;
  location: string;
}

export interface Fence {
  id: string;
  name: string;
  area: string;
  animals: number;
  status: "active" | "inactive";
  violations: number;
  color: string;
  coordinates: [number, number][];
}

interface DashboardContextType {
  animals: Animal[];
  devices: Device[];
  alerts: Alert[];
  fences: Fence[];
  mode: DashboardMode;
  ranchContext: {
    lat: number;
    lng: number;
    name: string;
    totalArea: string;
  };
  resolveAlert: (id: number) => void;
  addAnimal: (animal: Animal) => Promise<void>;
  updateAnimal: (id: string, animal: Partial<Animal>) => Promise<void>;
  refreshAnimals: () => Promise<void>;
  animalsLoading: boolean;
  animalsError: string | null;
  addDevice: (device: Device) => Promise<void>;
  updateDevice: (id: string, device: Partial<Device>) => Promise<void>;
  refreshDevices: () => Promise<void>;
  devicesLoading: boolean;
  devicesError: string | null;
  addFence: (fence: Fence) => Promise<void>;
  updateFence: (id: string, fence: Partial<Fence>) => Promise<void>;
  deleteFence: (id: string) => Promise<void>;
  refreshFences: () => Promise<void>;
  fencesLoading: boolean;
  fencesError: string | null;
}

export type DashboardMode = "live" | "demo";

const initialAlerts: Alert[] = [
  { id: 1, animal: "Vaca 101 (Canela)", type: "location", message: "Fuera de perímetro", severity: "high", time: "Hace 5 min", location: "Sector Norte, 2.3km del límite" },
  { id: 2, animal: "Vaca 078 (Rosa)", type: "temperature", message: "Temperatura elevada: 39.8°C", severity: "medium", time: "Hace 23 min", location: "Sector A" },
  { id: 3, animal: "Vaca 205 (Margarita)", type: "location", message: "Cerca del límite virtual", severity: "low", time: "Hace 1 hora", location: "Sector C" },
  { id: 4, animal: "Vaca 156 (Paloma)", type: "battery", message: "Batería baja: 15%", severity: "medium", time: "Hace 2 horas", location: "Sector D" },
];

const demoAnimals: Animal[] = [
  {
    id: "DEMO-101",
    name: "Demo Canela",
    lat: 20.6641,
    lng: -103.3448,
    health: "Excelente",
    battery: 92,
    temp: 38.4,
    lastUpdate: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    status: "ok",
    locationText: "Demo Norte",
  },
  {
    id: "DEMO-078",
    name: "Demo Rosa",
    lat: 20.6568,
    lng: -103.3456,
    health: "Atención",
    battery: 67,
    temp: 39.7,
    lastUpdate: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: "alert",
    locationText: "Demo A",
  },
  {
    id: "DEMO-205",
    name: "Demo Margarita",
    lat: 20.6626,
    lng: -103.3482,
    health: "Buena",
    battery: 84,
    temp: 38.8,
    lastUpdate: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    status: "ok",
    locationText: "Demo C",
  },
  {
    id: "DEMO-156",
    name: "Demo Paloma",
    lat: 20.6584,
    lng: -103.3511,
    health: "Alerta",
    battery: 14,
    temp: 40.1,
    lastUpdate: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    status: "alert",
    locationText: "Demo D",
  },
  {
    id: "DEMO-132",
    name: "Demo Luna",
    lat: 20.6601,
    lng: -103.3492,
    health: "Excelente",
    battery: 88,
    temp: 38.2,
    lastUpdate: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    status: "ok",
    locationText: "Demo B",
  },
  {
    id: "DEMO-189",
    name: "Demo Nube",
    lat: 20.6592,
    lng: -103.3526,
    health: "Buena",
    battery: 73,
    temp: 38.9,
    lastUpdate: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    status: "ok",
    locationText: "Demo Oeste",
  },
];

const demoDevices: Device[] = [
  {
    id: "DEMO-DEV-101",
    animalId: "DEMO-101",
    battery: 92,
    signal: 88,
    status: "active",
    lastPing: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    hardwareVersion: "v2.3",
    solarCharging: true,
    protocol: "LoRaWAN",
    lastSyncMode: "Real-time",
    gatewayId: "DEMO-GW-NORTE-01",
    alertsCount: 0,
  },
  {
    id: "DEMO-DEV-078",
    animalId: "DEMO-078",
    battery: 67,
    signal: 64,
    status: "warning",
    lastPing: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    hardwareVersion: "v2.2",
    solarCharging: true,
    protocol: "LoRaWAN",
    lastSyncMode: "Store & Forward",
    gatewayId: "DEMO-GW-CENTRO-02",
    alertsCount: 2,
  },
  {
    id: "DEMO-DEV-205",
    animalId: "DEMO-205",
    battery: 84,
    signal: 81,
    status: "active",
    lastPing: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
    hardwareVersion: "v2.3",
    solarCharging: true,
    protocol: "LoRaWAN",
    lastSyncMode: "Real-time",
    gatewayId: "DEMO-GW-SUR-01",
    alertsCount: 1,
  },
  {
    id: "DEMO-DEV-156",
    animalId: "DEMO-156",
    battery: 14,
    signal: 39,
    status: "critical",
    lastPing: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    hardwareVersion: "v2.1",
    solarCharging: false,
    protocol: "LTE",
    lastSyncMode: "Store & Forward",
    gatewayId: "DEMO-GW-SUR-03",
    alertsCount: 4,
  },
  {
    id: "DEMO-DEV-132",
    animalId: "DEMO-132",
    battery: 88,
    signal: 86,
    status: "active",
    lastPing: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    hardwareVersion: "v2.3",
    solarCharging: true,
    protocol: "LoRaWAN",
    lastSyncMode: "Real-time",
    gatewayId: "DEMO-GW-B-01",
    alertsCount: 0,
  },
  {
    id: "DEMO-DEV-189",
    animalId: "DEMO-189",
    battery: 73,
    signal: 74,
    status: "active",
    lastPing: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    hardwareVersion: "v2.2",
    solarCharging: true,
    protocol: "NB-IoT",
    lastSyncMode: "Real-time",
    gatewayId: "DEMO-GW-OESTE-01",
    alertsCount: 1,
  },
];

const demoFences: Fence[] = [
  {
    id: "DEMO-FENCE-1",
    name: "Demo Potrero Norte",
    area: "120 ha",
    animals: 18,
    status: "active",
    violations: 1,
    color: "#5C7A5B",
    coordinates: [
      [20.6634, -103.3522],
      [20.6636, -103.3484],
      [20.6611, -103.3472],
      [20.6595, -103.3512],
    ],
  },
  {
    id: "DEMO-FENCE-2",
    name: "Demo Potrero Centro",
    area: "95 ha",
    animals: 14,
    status: "active",
    violations: 0,
    color: "#2A9D8F",
    coordinates: [
      [20.6608, -103.3505],
      [20.6609, -103.3476],
      [20.6582, -103.3474],
      [20.6579, -103.3508],
    ],
  },
  {
    id: "DEMO-FENCE-3",
    name: "Demo Lote de descanso",
    area: "40 ha",
    animals: 0,
    status: "inactive",
    violations: 0,
    color: "#B94A3E",
    coordinates: [
      [20.6576, -103.3524],
      [20.6578, -103.3509],
      [20.6564, -103.3507],
      [20.6562, -103.3522],
    ],
  },
];

const demoAlerts: Alert[] = [
  {
    id: 1,
    animal: "Demo 156 (Paloma)",
    type: "battery",
    message: "Bateria critica: 14%",
    severity: "high",
    time: "Hace 3 min",
    location: "Sector D",
  },
  {
    id: 2,
    animal: "Demo 078 (Rosa)",
    type: "temperature",
    message: "Temperatura elevada: 39.7°C",
    severity: "medium",
    time: "Hace 12 min",
    location: "Sector A",
  },
  {
    id: 3,
    animal: "Demo 205 (Margarita)",
    type: "location",
    message: "Cerca del limite virtual",
    severity: "low",
    time: "Hace 22 min",
    location: "Potrero Norte",
  },
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

function normalizeFenceCoordinates(coordinates: [number, number][]): [number, number][] {
  return coordinates.map(([a, b]) => {
    // Fix records accidentally stored as [lng, lat].
    if (Math.abs(a) > 90 && Math.abs(b) <= 90) {
      return [b, a];
    }
    return [a, b];
  });
}

function normalizeFence(fence: Fence): Fence {
  return {
    ...fence,
    coordinates: normalizeFenceCoordinates(fence.coordinates),
  };
}

export function DashboardProvider({ children, mode = "live" }: { children: ReactNode; mode?: DashboardMode }) {
  const isDemoMode = mode === "demo";
  const [animals, setAnimals] = useState<Animal[]>(isDemoMode ? demoAnimals : []);
  const [animalsLoading, setAnimalsLoading] = useState<boolean>(false);
  const [animalsError, setAnimalsError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>(isDemoMode ? demoDevices : []);
  const [devicesLoading, setDevicesLoading] = useState<boolean>(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(isDemoMode ? demoAlerts : initialAlerts);
  const [fences, setFences] = useState<Fence[]>(isDemoMode ? demoFences : []);
  const [fencesLoading, setFencesLoading] = useState<boolean>(false);
  const [fencesError, setFencesError] = useState<string | null>(null);

  const resolveAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const refreshAnimals = async () => {
    if (isDemoMode) {
      setAnimalsLoading(false);
      setAnimalsError(null);
      setAnimals(demoAnimals);
      return;
    }

    setAnimalsLoading(true);
    setAnimalsError(null);
    try {
      const data = await fetchAnimalsApi();
      setAnimals(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudieron cargar animales.";
      setAnimalsError(message);
    } finally {
      setAnimalsLoading(false);
    }
  };

  const addAnimal = async (animal: Animal) => {
    if (isDemoMode) {
      setAnimalsError(null);
      setAnimals((prev) => [...prev, animal]);
      return;
    }

    setAnimalsError(null);
    const created = await createAnimalApi(animal);
    setAnimals(prev => [...prev, created]);
  };

  const refreshDevices = async () => {
    if (isDemoMode) {
      setDevicesLoading(false);
      setDevicesError(null);
      setDevices(demoDevices);
      return;
    }

    setDevicesLoading(true);
    setDevicesError(null);
    try {
      const data = await fetchDevicesApi();
      setDevices(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudieron cargar dispositivos.";
      setDevicesError(message);
    } finally {
      setDevicesLoading(false);
    }
  };

  const refreshFences = async () => {
    if (isDemoMode) {
      setFencesLoading(false);
      setFencesError(null);
      setFences(demoFences.map(normalizeFence));
      return;
    }

    setFencesLoading(true);
    setFencesError(null);
    try {
      const data = await fetchFencesApi();
      setFences(data.map(normalizeFence));
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudieron cargar vallas.";
      setFencesError(message);
    } finally {
      setFencesLoading(false);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      return;
    }

    void refreshAnimals();
    void refreshDevices();
    void refreshFences();
  }, [isDemoMode]);
  
  const updateAnimal = async (id: string, newData: Partial<Animal>) => {
    if (isDemoMode) {
      setAnimalsError(null);
      setAnimals((prev) => prev.map((a) => (a.id === id ? { ...a, ...newData } : a)));
      return;
    }

    setAnimalsError(null);
    const updated = await updateAnimalApi(id, newData);
    setAnimals(prev => prev.map(a => a.id === id ? updated : a));
  };

  const addDevice = async (device: Device) => {
    if (isDemoMode) {
      setDevicesError(null);
      setDevices((prev) => [...prev, device]);
      return;
    }

    setDevicesError(null);
    const created = await createDeviceApi(device);
    setDevices(prev => [...prev, created]);
  };

  const updateDevice = async (id: string, newData: Partial<Device>) => {
    if (isDemoMode) {
      setDevicesError(null);
      setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...newData } : d)));
      return;
    }

    setDevicesError(null);
    const updated = await updateDeviceApi(id, newData);
    setDevices(prev => prev.map(d => d.id === id ? updated : d));
  };

  const addFence = async (fence: Fence) => {
    if (isDemoMode) {
      setFencesError(null);
      setFences((prev) => [...prev, normalizeFence(fence)]);
      return;
    }

    setFencesError(null);
    const created = await createFenceApi(fence);
    setFences(prev => [...prev, normalizeFence(created)]);
  };

  const updateFence = async (id: string, newData: Partial<Fence>) => {
    if (isDemoMode) {
      setFencesError(null);
      setFences((prev) => prev.map((f) => (f.id === id ? normalizeFence({ ...f, ...newData }) : f)));
      return;
    }

    setFencesError(null);
    const updated = await updateFenceApi(id, newData);
    setFences(prev => prev.map(f => f.id === id ? normalizeFence(updated) : f));
  };

  const deleteFence = async (id: string) => {
    if (isDemoMode) {
      setFencesError(null);
      setFences((prev) => prev.filter((f) => f.id !== id));
      return;
    }

    setFencesError(null);
    await deleteFenceApi(id);
    setFences(prev => prev.filter(f => f.id !== id));
  };

  const ranchContext = {
    lat: isDemoMode ? 20.6608 : 20.6597,
    lng: isDemoMode ? -103.3489 : -103.3496,
    name: isDemoMode ? "Demo Rancho La Esperanza" : "Rancho La Esperanza",
    totalArea: isDemoMode ? "400 ha (demo)" : "400 ha",
  };

  return (
    <DashboardContext.Provider value={{
      animals, devices, alerts, fences, ranchContext,
      mode,
      resolveAlert, addAnimal, updateAnimal, addDevice, updateDevice,
      refreshAnimals, animalsLoading, animalsError,
      refreshDevices, devicesLoading, devicesError,
      addFence, updateFence, deleteFence,
      refreshFences, fencesLoading, fencesError
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

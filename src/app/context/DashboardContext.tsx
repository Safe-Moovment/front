import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createDeviceApi, fetchDevicesApi, updateDeviceApi } from "../devicesApi";

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
  ranchContext: {
    lat: number;
    lng: number;
    name: string;
    totalArea: string;
  };
  resolveAlert: (id: number) => void;
  addAnimal: (animal: Animal) => void;
  updateAnimal: (id: string, animal: Partial<Animal>) => void;
  addDevice: (device: Device) => Promise<void>;
  updateDevice: (id: string, device: Partial<Device>) => Promise<void>;
  refreshDevices: () => Promise<void>;
  devicesLoading: boolean;
  devicesError: string | null;
  addFence: (fence: Fence) => void;
  updateFence: (id: string, fence: Partial<Fence>) => void;
  deleteFence: (id: string) => void;
}

const initialAnimals: Animal[] = [
  { id: "001", name: "Luna", lat: 20.6597, lng: -103.3496, health: "Excelente", battery: 95, temp: 38.5, lastUpdate: "Hace 2 min", status: "ok", locationText: "Sector A" },
  { id: "102", name: "Estrella", lat: 20.6587, lng: -103.3486, health: "Buena", battery: 87, temp: 38.8, lastUpdate: "Hace 5 min", status: "ok", locationText: "Sector B" },
  { id: "205", name: "Margarita", lat: 20.6607, lng: -103.3476, health: "Excelente", battery: 92, temp: 38.3, lastUpdate: "Hace 3 min", status: "ok", locationText: "Sector C" },
  { id: "078", name: "Rosa", lat: 20.6577, lng: -103.3466, health: "Atención", battery: 78, temp: 39.8, lastUpdate: "Hace 1 min", status: "ok", locationText: "Sector A" },
  { id: "156", name: "Paloma", lat: 20.6617, lng: -103.3456, health: "Excelente", battery: 15, temp: 38.6, lastUpdate: "Hace 4 min", status: "ok", locationText: "Sector D" },
  { id: "023", name: "Bella", lat: 20.6580, lng: -103.3490, health: "Buena", battery: 91, temp: 38.7, lastUpdate: "Hace 6 min", status: "ok", locationText: "Sector B" },
  { id: "101", name: "Canela", lat: 20.6627, lng: -103.3506, health: "Alerta", battery: 85, temp: 39.2, lastUpdate: "Hace 5 min", status: "alert", locationText: "Fuera de perímetro" },
  { id: "087", name: "Nube", lat: 20.6575, lng: -103.3460, health: "Excelente", battery: 94, temp: 38.4, lastUpdate: "Hace 2 min", status: "ok", locationText: "Sector C" },
];

const initialAlerts: Alert[] = [
  { id: 1, animal: "Vaca 101 (Canela)", type: "location", message: "Fuera de perímetro", severity: "high", time: "Hace 5 min", location: "Sector Norte, 2.3km del límite" },
  { id: 2, animal: "Vaca 078 (Rosa)", type: "temperature", message: "Temperatura elevada: 39.8°C", severity: "medium", time: "Hace 23 min", location: "Sector A" },
  { id: 3, animal: "Vaca 205 (Margarita)", type: "location", message: "Cerca del límite virtual", severity: "low", time: "Hace 1 hora", location: "Sector C" },
  { id: 4, animal: "Vaca 156 (Paloma)", type: "battery", message: "Batería baja: 15%", severity: "medium", time: "Hace 2 horas", location: "Sector D" },
];

const initialFences: Fence[] = [
  {
    id: "FENCE-001",
    name: "Perímetro Principal",
    area: "245 hectáreas",
    animals: 145,
    status: "active",
    violations: 1,
    color: "#5C7A5B",
    coordinates: [[20.6570, -103.3510], [20.6640, -103.3510], [20.6640, -103.3450], [20.6570, -103.3450]],
  },
  {
    id: "FENCE-002",
    name: "Sector A - Pastoreo",
    area: "80 hectáreas",
    animals: 45,
    status: "active",
    violations: 0,
    color: "#3D5A3C",
    coordinates: [[20.6575, -103.3505], [20.6600, -103.3505], [20.6600, -103.3480], [20.6575, -103.3480]],
  },
  {
    id: "FENCE-003",
    name: "Sector B - Descanso",
    area: "60 hectáreas",
    animals: 30,
    status: "inactive",
    violations: 0,
    color: "#9B8563",
    coordinates: [[20.6605, -103.3505], [20.6630, -103.3505], [20.6630, -103.3480], [20.6605, -103.3480]],
  },
  {
    id: "FENCE-004",
    name: "Zona de Cuarentena",
    area: "15 hectáreas",
    animals: 3,
    status: "active",
    violations: 0,
    color: "#B94A3E",
    coordinates: [[20.6575, -103.3475], [20.6590, -103.3475], [20.6590, -103.3460], [20.6575, -103.3460]],
  },
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [animals, setAnimals] = useState<Animal[]>(initialAnimals);
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState<boolean>(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  
  const [fences, setFences] = useState<Fence[]>(() => {
    const saved = localStorage.getItem("safe_moovment_fences");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parsing fences from localStorage", e);
      }
    }
    return initialFences;
  });

  // Keep fences in sync with localStorage
  useEffect(() => {
    localStorage.setItem("safe_moovment_fences", JSON.stringify(fences));
  }, [fences]);

  const resolveAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const addAnimal = (animal: Animal) => setAnimals(prev => [...prev, animal]);

  const refreshDevices = async () => {
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

  useEffect(() => {
    void refreshDevices();
  }, []);
  
  const updateAnimal = (id: string, newData: Partial<Animal>) => {
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, ...newData } : a));
  };

  const addDevice = async (device: Device) => {
    setDevicesError(null);
    const created = await createDeviceApi(device);
    setDevices(prev => [...prev, created]);
  };

  const updateDevice = async (id: string, newData: Partial<Device>) => {
    setDevicesError(null);
    const updated = await updateDeviceApi(id, newData);
    setDevices(prev => prev.map(d => d.id === id ? updated : d));
  };

  const addFence = (fence: Fence) => setFences(prev => [...prev, fence]);

  const updateFence = (id: string, newData: Partial<Fence>) => {
    setFences(prev => prev.map(f => f.id === id ? { ...f, ...newData } : f));
  };

  const deleteFence = (id: string) => {
    setFences(prev => prev.filter(f => f.id !== id));
  };

  const ranchContext = {
    lat: 20.6597,
    lng: -103.3496,
    name: "Rancho La Esperanza",
    totalArea: "400 ha",
  };

  return (
    <DashboardContext.Provider value={{
      animals, devices, alerts, fences, ranchContext,
      resolveAlert, addAnimal, updateAnimal, addDevice, updateDevice,
      refreshDevices, devicesLoading, devicesError,
      addFence, updateFence, deleteFence
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

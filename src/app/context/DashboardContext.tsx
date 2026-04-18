import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

const initialAlerts: Alert[] = [
  { id: 1, animal: "Vaca 101 (Canela)", type: "location", message: "Fuera de perímetro", severity: "high", time: "Hace 5 min", location: "Sector Norte, 2.3km del límite" },
  { id: 2, animal: "Vaca 078 (Rosa)", type: "temperature", message: "Temperatura elevada: 39.8°C", severity: "medium", time: "Hace 23 min", location: "Sector A" },
  { id: 3, animal: "Vaca 205 (Margarita)", type: "location", message: "Cerca del límite virtual", severity: "low", time: "Hace 1 hora", location: "Sector C" },
  { id: 4, animal: "Vaca 156 (Paloma)", type: "battery", message: "Batería baja: 15%", severity: "medium", time: "Hace 2 horas", location: "Sector D" },
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

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalsLoading, setAnimalsLoading] = useState<boolean>(false);
  const [animalsError, setAnimalsError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState<boolean>(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [fences, setFences] = useState<Fence[]>([]);
  const [fencesLoading, setFencesLoading] = useState<boolean>(false);
  const [fencesError, setFencesError] = useState<string | null>(null);

  const resolveAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const refreshAnimals = async () => {
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
    setAnimalsError(null);
    const created = await createAnimalApi(animal);
    setAnimals(prev => [...prev, created]);
  };

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

  const refreshFences = async () => {
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
    void refreshAnimals();
    void refreshDevices();
    void refreshFences();
  }, []);
  
  const updateAnimal = async (id: string, newData: Partial<Animal>) => {
    setAnimalsError(null);
    const updated = await updateAnimalApi(id, newData);
    setAnimals(prev => prev.map(a => a.id === id ? updated : a));
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

  const addFence = async (fence: Fence) => {
    setFencesError(null);
    const created = await createFenceApi(fence);
    setFences(prev => [...prev, normalizeFence(created)]);
  };

  const updateFence = async (id: string, newData: Partial<Fence>) => {
    setFencesError(null);
    const updated = await updateFenceApi(id, newData);
    setFences(prev => prev.map(f => f.id === id ? normalizeFence(updated) : f));
  };

  const deleteFence = async (id: string) => {
    setFencesError(null);
    await deleteFenceApi(id);
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

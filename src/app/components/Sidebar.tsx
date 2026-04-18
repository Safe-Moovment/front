import {
  Home,
  AlertTriangle,
  Beef,
  Radio,
  MapPin,
  Sparkles,
  Menu,
  Mountain
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { BrandLogo } from "./BrandLogo";

const menuItems = [
  { icon: Home, label: "Inicio", path: "home" },
  { icon: AlertTriangle, label: "Alertas", path: "alerts" },
  { icon: Beef, label: "Ganado", path: "cattle" },
  { icon: Radio, label: "Dispositivos", path: "devices" },
  { icon: MapPin, label: "Valla Virtual", path: "fence" },
  { icon: Mountain, label: "Elevación", path: "elevation" },
  { icon: Sparkles, label: "Gemini Concierge", path: "gemini" },
];

interface SidebarProps {
  currentView: string;
  onNavigate: (path: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ currentView, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onMobileClose(); // Cerrar sidebar en móvil después de navegar
  };

  return (
    <>
      {/* Overlay para móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`bg-[#2C2C2C] text-[#F5F5F5] transition-all duration-200 flex flex-col border-r border-[#3D3D3D] z-50
          fixed lg:sticky top-0 h-screen
          ${collapsed ? "w-16" : "w-56"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-[#3D3D3D]">
          {!collapsed && (
            <BrandLogo tone="light" imageClassName="h-9 w-9" textClassName="text-white" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#F5F5F5] hover:bg-[#3D3D3D]"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                currentView === item.path
                  ? "bg-[#5C7A5B] text-white"
                  : "hover:bg-[#3D3D3D] text-[#E5E5E5]"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[#3D3D3D]">
          {!collapsed && (
            <div className="text-xs text-[#9CA3AF] space-y-1">
              <p>Última actualización:</p>
              <p className="text-[#F5F5F5]">Hoy, 14:32 hrs</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "./components/ui/button";
import { Sidebar } from "./components/Sidebar";
import { MapView } from "./components/MapView";
import { HealthStatus } from "./components/HealthStatus";
import { AlertsPanel } from "./components/AlertsPanel";
import { GeminiWidget } from "./components/GeminiWidget";
import { CattleQuickView } from "./components/CattleQuickView";
import { AlertsView } from "./components/views/AlertsView";
import { CattleView } from "./components/views/CattleView";
import { DevicesView } from "./components/views/DevicesView";
import { VirtualFenceView } from "./components/views/VirtualFenceView";
import { GeminiView } from "./components/views/GeminiView";

export default function AppDashboard() {
  const [currentView, setCurrentView] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case "alerts":
        return <AlertsView />;
      case "cattle":
        return <CattleView />;
      case "devices":
        return <DevicesView />;
      case "fence":
        return <VirtualFenceView />;
      case "gemini":
        return <GeminiView />;
      default:
        return (
          <div className="h-full p-3 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6">
            <div className="flex-1 min-w-0 h-[400px] md:h-[500px] lg:h-auto">
              <MapView />
            </div>
            <div className="lg:w-96 space-y-4 md:space-y-6 overflow-y-auto pb-4">
              <HealthStatus />
              <AlertsPanel />
              <GeminiWidget />
              <CattleQuickView />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAF8] overflow-hidden">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F0F0ED]">
        {/* Header móvil */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#E5E5E5]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-[#2C2C2C]">Muu y Saludable</h1>
          <div className="w-10" /> {/* Espaciador */}
        </div>

        <div className="flex-1 overflow-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

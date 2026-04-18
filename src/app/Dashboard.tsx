import { useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router";
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
import { ElevationMapView } from "./components/views/ElevationMapView";
import { clearDashboardAuthenticated } from "./auth";
import { BrandLogo } from "./components/BrandLogo";

export default function Dashboard() {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState("home");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        clearDashboardAuthenticated();
        setCurrentView("home");
        navigate("/dashboard/login", { replace: true });
    };

    const renderView = () => {
        switch (currentView) {
            case "alerts":
                return <AlertsView onNavigate={setCurrentView} />;
            case "cattle":
                return <CattleView />;
            case "devices":
                return <DevicesView />;
            case "fence":
                return <VirtualFenceView />;
            case "gemini":
                return <GeminiView />;
            case "elevation":
                return <ElevationMapView />;
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
                <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#E5E5E5]">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <BrandLogo tone="dark" imageClassName="h-8 w-8" />
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Salir
                    </Button>
                </div>

                <div className="hidden lg:flex justify-end p-3 bg-white border-b border-[#E5E5E5]">
                    <div className="mr-auto">
                        <BrandLogo tone="dark" imageClassName="h-8 w-8" />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Cerrar sesion
                    </Button>
                </div>

                <div className="flex-1 overflow-auto">{renderView()}</div>
            </main>
        </div>
    );
}

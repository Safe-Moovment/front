import { createBrowserRouter, redirect } from "react-router";
import { LandingPage } from "./components/views/LandingPage";
import AppDashboard from "./AppDashboard";
import Dashboard from "./Dashboard";
import DashboardLogin from "./DashboardLogin";
import { clearDashboardAuthenticated, isBackendReachable, isDashboardAuthenticated } from "./auth";
import { DashboardProvider } from "./context/DashboardContext";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/demo",
    element: (
      <DashboardProvider mode="demo">
        <AppDashboard />
      </DashboardProvider>
    ),
  },
  {
    path: "/dashboard/login",
    element: <DashboardLogin />,
  },
  {
    path: "/dashboard",
    element: (
      <DashboardProvider mode="live">
        <Dashboard />
      </DashboardProvider>
    ),
    loader: async () => {
      if (!isDashboardAuthenticated()) {
        throw redirect("/dashboard/login");
      }

      const backendUp = await isBackendReachable();
      if (!backendUp) {
        clearDashboardAuthenticated();
        throw redirect("/dashboard/login");
      }

      return null;
    },
  },
  {
    path: "/app",
    element: (
      <DashboardProvider mode="demo">
        <AppDashboard />
      </DashboardProvider>
    ),
  },
]);

import { createBrowserRouter, redirect } from "react-router";
import { LandingPage } from "./components/views/LandingPage";
import AppDashboard from "./AppDashboard";
import Dashboard from "./Dashboard";
import DashboardLogin from "./DashboardLogin";
import { clearDashboardAuthenticated, isBackendReachable, isDashboardAuthenticated } from "./auth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/demo",
    element: <AppDashboard />,
  },
  {
    path: "/dashboard/login",
    element: <DashboardLogin />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
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
    element: <AppDashboard />,
  },
]);

import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/views/LandingPage";
import AppDashboard from "./AppDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/app",
    element: <AppDashboard />,
  },
]);

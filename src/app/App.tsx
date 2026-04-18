import { RouterProvider } from "react-router";
import { router } from "./routes";
import { DashboardProvider } from "./context/DashboardContext";

export default function App() {
  return (
    <DashboardProvider>
      <RouterProvider router={router} />
    </DashboardProvider>
  );
}
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  RequireAuthorizationRoute,
  requireActiveUserPolicy,
} from "./features/auth";
import RequireAuthenticatedRoute from "./features/auth/guards/RequireAuthenticatedRoute";
import { useAuthSession } from "./features/auth/context/useAuthSession";
import { AppShellRoutes } from "./router/routes/AppShellRoutes";
import { AuthRoutes } from "./router/routes/AuthRoutes";
import SplashScreen from "./pages/SplashScreen";
import SystemUnstableScreen from "./pages/SystemUnstableScreen";
import {
  getSystemDown,
  subscribeSystemStatus,
} from "./shared/system-status/system-status-events";

export default function AppRouter() {
  const { session, isInitializing } = useAuthSession();
  const authenticatedUserId = session?.user.idUsers;
  const [systemDown, setSystemDownState] = useState(getSystemDown());

  useEffect(() => subscribeSystemStatus(setSystemDownState), []);

  if (systemDown) {
    return <SystemUnstableScreen />;
  }

  if (isInitializing) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {AuthRoutes()}

        <Route element={<RequireAuthenticatedRoute />}>
          <Route
            element={
              <RequireAuthorizationRoute
                policy={requireActiveUserPolicy}
                deniedState={{ reasonCode: "USER_INACTIVE" }}
              />
            }
          >
            {AppShellRoutes({ userId: authenticatedUserId })}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

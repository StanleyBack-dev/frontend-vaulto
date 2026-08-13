import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { Navigate, Route } from "react-router-dom";
import { CategoriesProviderOutlet } from "../../features/categories";
import { CreditCardsProviderOutlet } from "../../features/credit-cards";
import { UsersProviderOutlet } from "../../features/users";
import RequirePageAccessRoute from "../../features/auth/guards/RequirePageAccessRoute";
import {
  adminRoutePaths,
  categoryRoutePaths,
  creditCardRoutePaths,
  userRoutePaths,
} from "../navigation";

const CategoryForm = lazy(() => import("../../pages/categories/CategoryForm"));
const Categories = lazy(() => import("../../pages/categories/Categories"));
const CreditCardForm = lazy(
  () => import("../../pages/credit-cards/CreditCardForm"),
);
const CreditCards = lazy(() => import("../../pages/credit-cards/CreditCards"));
const UserForm = lazy(() => import("../../pages/users/UserForm"));

function withPageSuspense(element: React.ReactNode) {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Carregando...</div>}>
      {element}
    </Suspense>
  );
}

interface UserScopedProviderRouteProps {
  userId?: string;
  loginPath: string;
  ProviderOutlet: ComponentType<{ userId?: string }>;
}

function UserScopedProviderRoute({
  userId,
  loginPath,
  ProviderOutlet,
}: UserScopedProviderRouteProps) {
  if (!userId) {
    return <Navigate to={loginPath} replace />;
  }

  return <ProviderOutlet userId={userId} />;
}

interface ManagementRoutesProps {
  userId?: string;
  loginPath: string;
}

export function ManagementRoutes({ userId, loginPath }: ManagementRoutesProps) {
  return (
    <>
      <Route element={<RequirePageAccessRoute view="categories" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={loginPath}
              ProviderOutlet={CategoriesProviderOutlet}
            />
          }
        >
          <Route
            path={categoryRoutePaths.list}
            element={withPageSuspense(<Categories />)}
          />
          <Route
            path={categoryRoutePaths.create}
            element={withPageSuspense(<CategoryForm mode="create" />)}
          />
          <Route
            path={categoryRoutePaths.edit()}
            element={withPageSuspense(<CategoryForm mode="edit" />)}
          />
        </Route>
      </Route>
      <Route element={<RequirePageAccessRoute view="creditCards" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={loginPath}
              ProviderOutlet={CreditCardsProviderOutlet}
            />
          }
        >
          <Route
            path={creditCardRoutePaths.list}
            element={withPageSuspense(<CreditCards />)}
          />
          <Route
            path={creditCardRoutePaths.create}
            element={withPageSuspense(<CreditCardForm mode="create" />)}
          />
          <Route
            path={creditCardRoutePaths.edit()}
            element={withPageSuspense(<CreditCardForm mode="edit" />)}
          />
        </Route>
      </Route>
      <Route element={<RequirePageAccessRoute view="admin" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={loginPath}
              ProviderOutlet={UsersProviderOutlet}
            />
          }
        >
          <Route
            path={userRoutePaths.create}
            element={withPageSuspense(<UserForm mode="create" />)}
          />
          <Route
            path={userRoutePaths.edit()}
            element={withPageSuspense(<UserForm mode="edit" />)}
          />
        </Route>
      </Route>
      {/* Usuários agora vive dentro da aba "Usuários" do painel Admin */}
      <Route
        path={userRoutePaths.list}
        element={<Navigate to={adminRoutePaths.list} replace />}
      />
      <Route
        path={userRoutePaths.legacyList}
        element={<Navigate to={adminRoutePaths.list} replace />}
      />
      <Route
        path={categoryRoutePaths.legacyList}
        element={<Navigate to={categoryRoutePaths.list} replace />}
      />
      <Route
        path={categoryRoutePaths.legacyCreate}
        element={<Navigate to={categoryRoutePaths.create} replace />}
      />
      <Route
        path={categoryRoutePaths.legacyEdit()}
        element={<Navigate to={categoryRoutePaths.edit()} replace />}
      />
      <Route
        path={userRoutePaths.legacyCreate}
        element={<Navigate to={userRoutePaths.create} replace />}
      />
      <Route
        path={userRoutePaths.legacyEdit()}
        element={<Navigate to={userRoutePaths.edit()} replace />}
      />
    </>
  );
}

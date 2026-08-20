import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { useAuthSession } from "@/features/auth";
import { Navigate, Route } from "react-router-dom";
import AppLayout from "../AppLayout";
import {
  adminRoutePaths,
  authRoutePaths,
  calendarRoutePaths,
  chartsRoutePaths,
  comparisonRoutePaths,
  dashboardRoutePaths,
  debtRoutePaths,
  debtsStatementRoutePaths,
  faqRoutePaths,
  financialHealthRoutePaths,
  forecastRoutePaths,
  goalContributionRoutePaths,
  goalRoutePaths,
  incomeReceiptRoutePaths,
  incomeRoutePaths,
  paymentRoutePaths,
  planRoutePaths,
  referralsRoutePaths,
  reminderRoutePaths,
  routePaths,
  settingsRoutePaths,
  supportRoutePaths,
  supportTicketRoutePaths,
  termsOfUseRoutePaths,
  utilityRoutePaths,
} from "../navigation";
import RequirePageAccessRoute from "../../features/auth/guards/RequirePageAccessRoute";
import { DebtsProviderOutlet } from "../../features/debts";
import { GoalsProviderOutlet } from "../../features/goals";
import { IncomesProviderOutlet } from "../../features/incomes";
import { ManagementRoutes } from "./ManagementRoutes";

const AccessDenied = lazy(() => import("../../pages/AccessDenied"));
const AdminDashboard = lazy(() => import("../../pages/admin/AdminDashboard"));
const SupportTicketDetail = lazy(
  () => import("../../pages/admin/SupportTicketDetail"),
);
const DebtsDashboardKanban = lazy(
  () => import("../../pages/debts/DebtsDashboardKanban"),
);
const Debts = lazy(() => import("../../pages/debts/Debts"));
const DebtForm = lazy(() => import("../../pages/debts/DebtForm"));
const Statement = lazy(() => import("../../pages/statement/Statement"));
const Incomes = lazy(() => import("../../pages/incomes/Incomes"));
const IncomeForm = lazy(() => import("../../pages/incomes/IncomeForm"));
const Payments = lazy(() => import("../../pages/payments/Payments"));
const Recebimentos = lazy(
  () => import("../../pages/income-receipts/Recebimentos"),
);
const Goals = lazy(() => import("../../pages/goals/Goals"));
const GoalForm = lazy(() => import("../../pages/goals/GoalForm"));
const GoalContributions = lazy(
  () => import("../../pages/goals/GoalContributions"),
);
const Profile = lazy(() => import("../../pages/Profile"));
const Settings = lazy(() => import("../../pages/Settings"));
const Plans = lazy(() => import("../../pages/Plans"));
const Referrals = lazy(() => import("../../pages/Referrals"));
const ReferralWallet = lazy(() => import("../../pages/ReferralWallet"));
const Forecast = lazy(() => import("../../pages/Forecast"));
const CalendarPage = lazy(() => import("../../pages/Calendar"));
const Reminders = lazy(() => import("../../pages/Reminders"));
const Charts = lazy(() => import("../../pages/Charts"));
const Comparisons = lazy(() => import("../../pages/Comparisons"));
const FinancialHealth = lazy(() => import("../../pages/FinancialHealth"));
const Manual = lazy(() => import("../../pages/Manual"));
const Support = lazy(() => import("../../pages/Support"));
const TermsOfUse = lazy(() => import("../../pages/TermsOfUse"));

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
  const { session } = useAuthSession();

  const resolvedUserId = userId ?? session?.user.idUsers;

  if (!resolvedUserId) {
    return <Navigate to={loginPath} replace />;
  }

  return <ProviderOutlet userId={resolvedUserId} />;
}

interface AppShellRoutesProps {
  userId?: string;
}

export function AppShellRoutes({ userId }: AppShellRoutesProps) {
  return (
    <Route element={<AppLayout />}>
      {ManagementRoutes({ userId, loginPath: authRoutePaths.login })}

      {/* Dashboard - Kanban de dividas */}
      <Route element={<RequirePageAccessRoute view="dashboard" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={authRoutePaths.login}
              ProviderOutlet={DebtsProviderOutlet}
            />
          }
        >
          <Route
            path={dashboardRoutePaths.list}
            element={withPageSuspense(<DebtsDashboardKanban />)}
          />
        </Route>
      </Route>

      {/* Dividas - tabela + formularios */}
      <Route element={<RequirePageAccessRoute view="debts" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={authRoutePaths.login}
              ProviderOutlet={DebtsProviderOutlet}
            />
          }
        >
          <Route
            path={debtRoutePaths.list}
            element={withPageSuspense(<Debts />)}
          />
          <Route
            path={debtRoutePaths.create}
            element={withPageSuspense(<DebtForm mode="create" />)}
          />
          <Route
            path={debtRoutePaths.edit()}
            element={withPageSuspense(<DebtForm mode="edit" />)}
          />
        </Route>
      </Route>

      {/* Extratos - extrato detalhado de dividas, receitas ou ambas por periodo */}
      <Route element={<RequirePageAccessRoute view="debtsStatement" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={authRoutePaths.login}
              ProviderOutlet={DebtsProviderOutlet}
            />
          }
        >
          <Route
            path={debtsStatementRoutePaths.list}
            element={withPageSuspense(<Statement />)}
          />
        </Route>
      </Route>

      {/* Receitas - cadastro e controle de entradas */}
      <Route element={<RequirePageAccessRoute view="incomes" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={authRoutePaths.login}
              ProviderOutlet={IncomesProviderOutlet}
            />
          }
        >
          <Route
            path={incomeRoutePaths.list}
            element={withPageSuspense(<Incomes />)}
          />
          <Route
            path={incomeRoutePaths.create}
            element={withPageSuspense(<IncomeForm mode="create" />)}
          />
          <Route
            path={incomeRoutePaths.edit()}
            element={withPageSuspense(<IncomeForm mode="edit" />)}
          />
        </Route>
      </Route>

      {/* Pagamentos - registro de pagamentos de parcelas */}
      <Route element={<RequirePageAccessRoute view="payments" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={authRoutePaths.login}
              ProviderOutlet={DebtsProviderOutlet}
            />
          }
        >
          <Route
            path={paymentRoutePaths.list}
            element={withPageSuspense(<Payments />)}
          />
        </Route>
      </Route>

      {/* Recebimentos - registro de recebimentos de parcelas de receitas */}
      <Route element={<RequirePageAccessRoute view="incomeReceipts" />}>
        <Route
          element={
            <UserScopedProviderRoute
              userId={userId}
              loginPath={authRoutePaths.login}
              ProviderOutlet={IncomesProviderOutlet}
            />
          }
        >
          <Route
            path={incomeReceiptRoutePaths.list}
            element={withPageSuspense(<Recebimentos />)}
          />
        </Route>
      </Route>

      {/* Metas financeiras - recurso exclusivo do Vaulto Pro (gate feito na pagina) */}
      <Route
        element={
          <UserScopedProviderRoute
            userId={userId}
            loginPath={authRoutePaths.login}
            ProviderOutlet={GoalsProviderOutlet}
          />
        }
      >
        <Route
          path={goalRoutePaths.list}
          element={withPageSuspense(<Goals />)}
        />
        <Route
          path={goalRoutePaths.create}
          element={withPageSuspense(<GoalForm mode="create" />)}
        />
        <Route
          path={goalRoutePaths.edit()}
          element={withPageSuspense(<GoalForm mode="edit" />)}
        />
        <Route
          path={goalContributionRoutePaths.list}
          element={withPageSuspense(<GoalContributions />)}
        />
      </Route>

      {/* Redirects legados */}
      <Route
        path={debtRoutePaths.legacyList}
        element={<Navigate to={debtRoutePaths.list} replace />}
      />
      <Route
        path={debtRoutePaths.management}
        element={<Navigate to={debtRoutePaths.list} replace />}
      />
      <Route
        path={debtRoutePaths.legacyManagement}
        element={<Navigate to={debtRoutePaths.list} replace />}
      />
      <Route
        path={debtRoutePaths.reports}
        element={<Navigate to={dashboardRoutePaths.list} replace />}
      />
      <Route
        path={debtRoutePaths.legacyCreate}
        element={<Navigate to={debtRoutePaths.create} replace />}
      />
      <Route
        path={debtRoutePaths.legacyEdit()}
        element={<Navigate to={debtRoutePaths.edit()} replace />}
      />
      <Route
        path={debtRoutePaths.legacyReports}
        element={<Navigate to={dashboardRoutePaths.list} replace />}
      />
      <Route
        path={routePaths.profile}
        element={withPageSuspense(<Profile />)}
      />
      {/* Configurações - agrega planos, indicações, lembretes, ajuda, suporte e termos */}
      <Route
        path={settingsRoutePaths.list}
        element={withPageSuspense(<Settings />)}
      />
      {/* Planos - comparativo de planos e assinatura do Vaulto Pro */}
      <Route path={planRoutePaths.list} element={withPageSuspense(<Plans />)} />
      {/* Indique e Ganhe - programa de indicações, comum a todos os usuários */}
      <Route
        path={referralsRoutePaths.list}
        element={withPageSuspense(<Referrals />)}
      />
      {/* Carteira de indicações - saldo, saque via Pix e histórico, separado
          da página de indicações pra não sobrecarregá-la */}
      <Route
        path={referralsRoutePaths.wallet}
        element={withPageSuspense(<ReferralWallet />)}
      />
      {/* Previsão financeira - "quanto posso gastar" (recurso Pro) */}
      <Route
        path={forecastRoutePaths.list}
        element={withPageSuspense(<Forecast />)}
      />
      {/* Calendário financeiro - vencimentos por dia (recurso Pro) */}
      <Route
        path={calendarRoutePaths.list}
        element={withPageSuspense(<CalendarPage />)}
      />
      {/* Lembretes - vencimentos de amanhã e aviso por e-mail (recurso Pro) */}
      <Route
        path={reminderRoutePaths.list}
        element={withPageSuspense(<Reminders />)}
      />
      {/* Gráficos - dívidas e receitas por status no mês, comum a todos os usuários */}
      <Route
        path={chartsRoutePaths.list}
        element={withPageSuspense(<Charts />)}
      />
      {/* Comparativos - gastos e receitas por categoria, mês a mês (recurso Pro) */}
      <Route
        path={comparisonRoutePaths.list}
        element={withPageSuspense(<Comparisons />)}
      />
      {/* Saúde Financeira - score 0-100 combinando dívidas, pontualidade e reservas (recurso Pro) */}
      <Route
        path={financialHealthRoutePaths.list}
        element={withPageSuspense(<FinancialHealth />)}
      />
      {/* Manual/Ajuda - documentação de uso, comum a todos os usuários */}
      <Route path={faqRoutePaths.list} element={withPageSuspense(<Manual />)} />
      {/* Suporte - contato com a equipe por e-mail, comum a todos os usuários */}
      <Route
        path={supportRoutePaths.list}
        element={withPageSuspense(<Support />)}
      />
      {/* Termos e Privacidade - consulta a qualquer momento, comum a todos os usuários */}
      <Route
        path={termsOfUseRoutePaths.list}
        element={withPageSuspense(<TermsOfUse />)}
      />
      {/* Admin - dashboard, usuários e chamados de suporte (ADMIN_MASTER) */}
      <Route element={<RequirePageAccessRoute view="admin" />}>
        <Route
          path={adminRoutePaths.list}
          element={withPageSuspense(<AdminDashboard />)}
        />
        <Route
          path={supportTicketRoutePaths.detail()}
          element={withPageSuspense(<SupportTicketDetail />)}
        />
      </Route>
      <Route
        path={utilityRoutePaths.accessDenied}
        element={withPageSuspense(<AccessDenied />)}
      />
    </Route>
  );
}

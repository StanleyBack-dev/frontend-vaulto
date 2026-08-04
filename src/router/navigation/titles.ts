import type { ActiveView } from "../../types/views";

export const viewTitles: Record<
  ActiveView,
  { title: string; subtitle: string }
> = {
  dashboard: { title: "Dashboard", subtitle: "Visão geral das dívidas" },
  debts: { title: "Dívidas", subtitle: "Contas a pagar e receber" },
  payments: {
    title: "Pagamentos",
    subtitle: "Registro de pagamentos de parcelas",
  },
  categories: { title: "Categorias", subtitle: "Cadastro de categorias" },
  creditCards: {
    title: "Cartões de Crédito",
    subtitle: "Cadastro de cartões e limites",
  },
  users: {
    title: "Usuários",
    subtitle: "Gerenciar usuários de acesso",
  },
  profile: { title: "Perfil", subtitle: "Informações da empresa" },
};

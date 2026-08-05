import type { Debt, DebtStatus } from "@/api/debts/schema";

export interface DebtStatementLine {
  idDebt: string;
  idDebtInstallment?: string;
  title: string;
  category: string;
  creditCard?: string;
  installmentLabel: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: DebtStatus;
}

function toDateOnly(value: string): string {
  return value.slice(0, 10);
}

function isWithinPeriod(
  dueDate: string,
  periodFrom: string,
  periodTo: string,
): boolean {
  return dueDate >= periodFrom && dueDate <= periodTo;
}

// A statement line is either one installment due within the period, or the
// whole debt when it has no installments — its single due date is what
// matters then, and the amount paid comes from its payment history since
// there's no per-installment amountPaid to read it from.
export function buildDebtStatementLines(
  debts: Debt[],
  periodFrom: string,
  periodTo: string,
): DebtStatementLine[] {
  const lines: DebtStatementLine[] = [];

  for (const debt of debts) {
    if (debt.hasInstallments) {
      for (const installment of debt.installments) {
        const dueDate = toDateOnly(installment.dueDate);
        if (!isWithinPeriod(dueDate, periodFrom, periodTo)) continue;

        lines.push({
          idDebt: debt.idDebt,
          idDebtInstallment: installment.idDebtInstallment,
          title: debt.title,
          category: debt.category,
          creditCard: debt.creditCard ?? undefined,
          installmentLabel: `${installment.installmentNumber}/${
            debt.installmentCount ?? debt.installments.length
          }`,
          dueDate,
          amountDue: installment.amountDue,
          amountPaid: installment.amountPaid,
          status: installment.status,
        });
      }
      continue;
    }

    if (!debt.dueDate) continue;

    const dueDate = toDateOnly(debt.dueDate);
    if (!isWithinPeriod(dueDate, periodFrom, periodTo)) continue;

    const amountPaid = debt.payments.reduce(
      (sum, payment) => sum + payment.amountPaid,
      0,
    );

    lines.push({
      idDebt: debt.idDebt,
      title: debt.title,
      category: debt.category,
      creditCard: debt.creditCard ?? undefined,
      installmentLabel: "Única",
      dueDate,
      amountDue: debt.totalAmount,
      amountPaid,
      status: debt.status,
    });
  }

  return lines.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

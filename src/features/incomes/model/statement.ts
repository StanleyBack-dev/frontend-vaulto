import type { Income, IncomeStatus } from "@/api/incomes/schema";

export interface IncomeStatementLine {
  idIncome: string;
  idIncomeInstallment?: string;
  title: string;
  category: string;
  installmentLabel: string;
  dueDate: string;
  amountDue: number;
  amountReceived: number;
  status: IncomeStatus;
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

// Every income always has at least one installment — even a non-parceled
// one gets a single installment entry (see IncomeInstallmentScheduleService)
// — so a statement line is always built from the installments array,
// unlike debts where a non-installment debt has no installments at all.
export function buildIncomeStatementLines(
  incomes: Income[],
  periodFrom: string,
  periodTo: string,
): IncomeStatementLine[] {
  const lines: IncomeStatementLine[] = [];

  for (const income of incomes) {
    for (const installment of income.installments) {
      const dueDate = toDateOnly(installment.dueDate);
      if (!isWithinPeriod(dueDate, periodFrom, periodTo)) continue;

      lines.push({
        idIncome: income.idIncome,
        idIncomeInstallment: installment.idIncomeInstallment,
        title: income.title,
        category: income.category,
        installmentLabel: `${installment.installmentNumber}/${
          income.installmentCount ?? income.installments.length
        }`,
        dueDate,
        amountDue: installment.amountDue,
        amountReceived: installment.amountReceived,
        status: installment.status,
      });
    }
  }

  return lines.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

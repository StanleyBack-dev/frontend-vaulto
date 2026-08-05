export function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(monthValue: string): string {
  const [yearStr, monthStr] = monthValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!year || !month) {
    return monthValue;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function monthToDueDateRange(monthValue: string): {
  dueDateFrom: string;
  dueDateTo: string;
} {
  const [yearStr, monthStr] = monthValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(year, month, 0).getDate();

  return {
    dueDateFrom: `${yearStr}-${monthStr}-01`,
    dueDateTo: `${yearStr}-${monthStr}-${String(lastDay).padStart(2, "0")}`,
  };
}

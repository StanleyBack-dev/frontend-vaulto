import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "@/components/atoms/Button";
import EditIcon from "@/components/atoms/icons/EditIcon";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ConfirmDialog from "@molecules/ConfirmDialog";
import SectionCard from "@/components/organisms/SectionCard";
import { colors } from "@/config";
import {
  fetchIncomeById,
  incomeStatusLabel,
  useIncomesContext,
} from "@/features/incomes";
import {
  deleteIncomeReceipt,
  fetchIncomeReceipts,
  incomeReceiptUiCopy,
  receiveInstallment,
  updateIncomeReceipt,
} from "@/features/income-receipts";
import type { Income, IncomeInstallment } from "@/api/incomes/schema";
import type { IncomeReceipt } from "@/api/income-receipts/schema";
import { useToast } from "@/shared/toast/useToast";
import {
  formatCurrencyForInput,
  formatDateDisplay,
  formatDateTimeDisplay,
  maskCurrencyInput,
} from "@/utils/format";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(value?: string | null): string {
  return formatDateDisplay(value ?? undefined) || "-";
}

function formatDateTime(value?: string | null): string {
  return formatDateTimeDisplay(value ?? undefined) || "-";
}

function nowInputValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function buildRegisterSuccessMessage(
  totalAmount: number,
  lines: IncomeReceipt[],
  installments: IncomeInstallment[],
): string {
  if (lines.length <= 1) {
    return incomeReceiptUiCopy.success.registerReceipt;
  }

  const installmentNumberById = new Map(
    installments.map((installment) => [
      installment.idIncomeInstallment,
      installment.installmentNumber,
    ]),
  );

  const breakdown = lines
    .map((line) => {
      const number = line.idIncomeInstallment
        ? installmentNumberById.get(line.idIncomeInstallment)
        : undefined;
      return `parcela ${number ?? "-"} (${formatCurrency(line.amountReceived)})`;
    })
    .join(", ");

  return `${incomeReceiptUiCopy.success.registerReceiptSplitPrefix} ${formatCurrency(totalAmount)} ${incomeReceiptUiCopy.success.registerReceiptSplitAppliedTo}: ${breakdown}.`;
}

function installmentLabel(
  installmentNumber: number,
  hasInstallments: boolean,
): string {
  return hasInstallments ? String(installmentNumber) : "Recebimento único";
}

function getStatusPillStyle(status: IncomeInstallment["status"]) {
  switch (status) {
    case "RECEIVED":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    case "PARTIALLY_RECEIVED":
      return "bg-amber-100 text-amber-800 border border-amber-300";
    case "OVERDUE":
      return "bg-rose-100 text-rose-800 border border-rose-300";
    default:
      return "bg-violet-100 text-violet-800 border border-violet-300";
  }
}

export default function Recebimentos() {
  const { incomes, load: loadIncomes } = useIncomesContext();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    void loadIncomes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedIncomeId, setSelectedIncomeId] = useState("");
  const [incomeDetail, setIncomeDetail] = useState<Income | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [receivingInstallmentId, setReceivingInstallmentId] = useState<
    string | null
  >(null);
  const [receiveAmount, setReceiveAmount] = useState("");
  const [receiveDate, setReceiveDate] = useState(nowInputValue());
  const [submitting, setSubmitting] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [receipts, setReceipts] = useState<IncomeReceipt[]>([]);
  const [receiptPendingDelete, setReceiptPendingDelete] =
    useState<IncomeReceipt | null>(null);

  async function loadDetail(idIncome: string) {
    setLoadingDetail(true);
    try {
      const detail = await fetchIncomeById(idIncome);
      setIncomeDetail(detail);
    } catch (error) {
      showError(
        incomeReceiptUiCopy.errors.loadIncomesFallback,
        error instanceof Error ? error.message : undefined,
      );
      setIncomeDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function loadReceipts(idIncome: string) {
    try {
      const list = await fetchIncomeReceipts(idIncome);
      setReceipts(list);
    } catch {
      setReceipts([]);
    }
  }

  useEffect(() => {
    if (!selectedIncomeId) {
      setIncomeDetail(null);
      setReceipts([]);
      return;
    }

    void loadDetail(selectedIncomeId);
    void loadReceipts(selectedIncomeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIncomeId]);

  function startReceipt(installment: IncomeInstallment) {
    const outstanding = Math.max(
      installment.amountDue - installment.amountReceived,
      0,
    );
    const suggestedAmount =
      outstanding > 0 ? outstanding : installment.amountDue;
    setReceivingInstallmentId(installment.idIncomeInstallment);
    setReceiveAmount(formatCurrencyForInput(suggestedAmount));
    setReceiveDate(nowInputValue());
  }

  function cancelReceipt() {
    setReceivingInstallmentId(null);
    setReceiveAmount("");
  }

  async function confirmReceipt(installment: IncomeInstallment) {
    const normalized = receiveAmount.replace(/\./g, "").replace(",", ".");
    const amount = Number(normalized);

    if (!Number.isFinite(amount) || amount <= 0) {
      showError(
        incomeReceiptUiCopy.errors.invalidReceiptData,
        "Informe um valor de recebimento válido.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await receiveInstallment({
        idIncome: installment.idIncome,
        idIncomeInstallment: installment.idIncomeInstallment,
        amountReceived: amount,
        receivedAt: receiveDate
          ? new Date(receiveDate).toISOString()
          : undefined,
      });

      showSuccess(
        buildRegisterSuccessMessage(
          amount,
          result.receipts,
          result.installments,
        ),
      );
      setReceivingInstallmentId(null);
      await loadDetail(installment.idIncome);
      await loadReceipts(installment.idIncome);
    } catch (error) {
      showError(
        incomeReceiptUiCopy.errors.registerReceiptFallback,
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startEditReceipt(receipt: IncomeReceipt) {
    if (!receipt.idIncomeReceipt) return;
    setEditingReceiptId(receipt.idIncomeReceipt);
    setEditAmount(formatCurrencyForInput(receipt.amountReceived));
    setEditDate(receipt.receivedAt.slice(0, 16));
  }

  function cancelEditReceipt() {
    setEditingReceiptId(null);
    setEditAmount("");
    setEditDate("");
  }

  async function confirmEditReceipt(receipt: IncomeReceipt) {
    if (!receipt.idIncomeReceipt) return;

    const normalized = editAmount.replace(/\./g, "").replace(",", ".");
    const amount = Number(normalized);

    if (!Number.isFinite(amount) || amount <= 0) {
      showError(
        incomeReceiptUiCopy.errors.invalidReceiptData,
        "Informe um valor de recebimento válido.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await updateIncomeReceipt(receipt.idIncomeReceipt, {
        amountReceived: amount,
        receivedAt: editDate ? new Date(editDate).toISOString() : undefined,
      });

      showSuccess(incomeReceiptUiCopy.success.updateReceipt);
      cancelEditReceipt();
      if (receipt.idIncome) {
        await loadDetail(receipt.idIncome);
        await loadReceipts(receipt.idIncome);
      }
    } catch (error) {
      showError(
        incomeReceiptUiCopy.errors.updateReceiptFallback,
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDeleteReceipt() {
    if (!receiptPendingDelete?.idIncomeReceipt) return;

    const receipt = receiptPendingDelete;
    setSubmitting(true);
    try {
      await deleteIncomeReceipt(receipt.idIncomeReceipt!);
      showSuccess(incomeReceiptUiCopy.success.deleteReceipt);
      setReceiptPendingDelete(null);
      if (receipt.idIncome) {
        await loadDetail(receipt.idIncome);
        await loadReceipts(receipt.idIncome);
      }
    } catch (error) {
      showError(
        incomeReceiptUiCopy.errors.deleteReceiptFallback,
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const installments = incomeDetail?.installments ?? [];
  const installmentNumberById = new Map(
    installments.map((installment) => [
      installment.idIncomeInstallment,
      installment.installmentNumber,
    ]),
  );
  const sortedReceipts = [...receipts].sort((a, b) =>
    a.receivedAt < b.receivedAt ? 1 : -1,
  );

  return (
    <div className="space-y-4">
      <SectionCard
        title={incomeReceiptUiCopy.listing.title}
        description={incomeReceiptUiCopy.listing.subtitle}
      >
        <Select
          label={incomeReceiptUiCopy.listing.selectIncomeLabel}
          value={selectedIncomeId}
          onChange={(event) => setSelectedIncomeId(event.target.value)}
        >
          <option value="">
            {incomeReceiptUiCopy.listing.selectIncomePlaceholder}
          </option>
          {incomes.map((income) => (
            <option key={income.idIncome} value={income.idIncome}>
              {income.title} - {income.category}
            </option>
          ))}
        </Select>
        {incomes.length === 0 && (
          <p className="mt-2 text-sm" style={{ color: colors.brown[500] }}>
            {incomeReceiptUiCopy.listing.emptyIncomesMessage}
          </p>
        )}
      </SectionCard>

      {!selectedIncomeId && (
        <p className="text-sm" style={{ color: "#4a3f6b" }}>
          {incomeReceiptUiCopy.listing.noIncomeSelected}
        </p>
      )}

      {selectedIncomeId && loadingDetail && (
        <div className="flex items-center justify-center h-40">
          <div
            className="w-9 h-9 rounded-full border-2 animate-spin"
            style={{
              borderColor: colors.gold[500],
              borderTopColor: "transparent",
            }}
          />
        </div>
      )}

      {selectedIncomeId && !loadingDetail && incomeDetail && (
        <div
          className="overflow-hidden rounded-xl border bg-white shadow-sm"
          style={{ borderColor: "#e8d5c9" }}
        >
          <div className="w-full overflow-x-auto">
            <table className="min-w-[820px] w-full text-sm">
              <thead>
                <tr style={{ background: colors.black[800] }}>
                  {[
                    incomeReceiptUiCopy.listing.columns.installment,
                    incomeReceiptUiCopy.listing.columns.dueDate,
                    incomeReceiptUiCopy.listing.columns.amountDue,
                    incomeReceiptUiCopy.listing.columns.amountReceived,
                    incomeReceiptUiCopy.listing.columns.receivedAt,
                    incomeReceiptUiCopy.listing.columns.status,
                    incomeReceiptUiCopy.listing.columns.actions,
                  ].map((label) => (
                    <th
                      key={label}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sm:px-6"
                      style={{ color: colors.brown[300] }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#e8d5c9" }}>
                {installments.map((installment) => {
                  const outstanding = Math.max(
                    installment.amountDue - installment.amountReceived,
                    0,
                  );
                  const isReceived = installment.status === "RECEIVED";
                  const isLocked = isReceived && incomeDetail.hasInstallments;
                  const isEditingRow =
                    receivingInstallmentId === installment.idIncomeInstallment;

                  return (
                    <tr key={installment.idIncomeInstallment}>
                      <td className="px-4 py-4 sm:px-6">
                        <span className="text-sm font-semibold text-[#1a1333]">
                          {installmentLabel(
                            installment.installmentNumber,
                            incomeDetail.hasInstallments,
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span className="text-sm text-[#4a3f6b]">
                          {formatDate(installment.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span className="text-sm font-semibold text-[#1a1333]">
                          {formatCurrency(installment.amountDue)}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span className="text-sm text-[#5a4e7a]">
                          {formatCurrency(installment.amountReceived)}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span className="text-sm text-[#4a3f6b]">
                          {formatDateTime(installment.receivedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusPillStyle(installment.status)}`}
                        >
                          {incomeStatusLabel(installment.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        {isLocked ? (
                          <span className="text-xs text-[#9a7060]">-</span>
                        ) : isEditingRow ? (
                          <div className="flex flex-col gap-2 min-w-[220px]">
                            <Input
                              label={incomeReceiptUiCopy.form.amountLabel}
                              inputMode="decimal"
                              value={receiveAmount}
                              onChange={(event) =>
                                setReceiveAmount(
                                  maskCurrencyInput(event.target.value),
                                )
                              }
                              placeholder={formatCurrencyForInput(outstanding)}
                            />
                            <Input
                              label={incomeReceiptUiCopy.form.dateLabel}
                              type="datetime-local"
                              value={receiveDate}
                              onChange={(event) =>
                                setReceiveDate(event.target.value)
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                loading={submitting}
                                onClick={() => confirmReceipt(installment)}
                              >
                                {incomeReceiptUiCopy.form.submit}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                                disabled={submitting}
                                onClick={cancelReceipt}
                              >
                                {incomeReceiptUiCopy.form.cancel}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => startReceipt(installment)}
                          >
                            {isReceived
                              ? incomeReceiptUiCopy.listing.receiveAgainAction
                              : incomeReceiptUiCopy.listing.receiveAction}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedIncomeId && !loadingDetail && incomeDetail && (
        <SectionCard
          title={incomeReceiptUiCopy.history.title}
          description={incomeReceiptUiCopy.history.subtitle}
        >
          {receipts.length === 0 ? (
            <p className="text-sm" style={{ color: "#4a3f6b" }}>
              {incomeReceiptUiCopy.history.empty}
            </p>
          ) : (
            <div
              className="overflow-hidden rounded-xl border bg-white shadow-sm"
              style={{ borderColor: "#e8d5c9" }}
            >
              <div className="w-full overflow-x-auto">
                <table className="min-w-[640px] w-full text-sm">
                  <thead>
                    <tr style={{ background: colors.black[800] }}>
                      {[
                        incomeReceiptUiCopy.history.columns.installment,
                        incomeReceiptUiCopy.history.columns.amount,
                        incomeReceiptUiCopy.history.columns.receivedAt,
                        incomeReceiptUiCopy.history.columns.actions,
                      ].map((label) => (
                        <th
                          key={label}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sm:px-6"
                          style={{ color: colors.brown[300] }}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: "#e8d5c9" }}
                  >
                    {sortedReceipts.map((receipt) => {
                      const isEditingRow =
                        editingReceiptId === receipt.idIncomeReceipt;
                      const installmentNumber = receipt.idIncomeInstallment
                        ? installmentNumberById.get(receipt.idIncomeInstallment)
                        : undefined;

                      return (
                        <tr key={receipt.idIncomeReceipt}>
                          <td className="px-4 py-4 sm:px-6">
                            <span className="text-sm font-semibold text-[#1a1333]">
                              {installmentNumber !== undefined
                                ? installmentLabel(
                                    installmentNumber,
                                    incomeDetail.hasInstallments,
                                  )
                                : "-"}
                            </span>
                          </td>
                          {isEditingRow ? (
                            <>
                              <td className="px-4 py-4 sm:px-6">
                                <Input
                                  label={incomeReceiptUiCopy.form.amountLabel}
                                  inputMode="decimal"
                                  value={editAmount}
                                  onChange={(event) =>
                                    setEditAmount(
                                      maskCurrencyInput(event.target.value),
                                    )
                                  }
                                />
                              </td>
                              <td className="px-4 py-4 sm:px-6">
                                <Input
                                  label={incomeReceiptUiCopy.form.dateLabel}
                                  type="datetime-local"
                                  value={editDate}
                                  onChange={(event) =>
                                    setEditDate(event.target.value)
                                  }
                                />
                              </td>
                              <td className="px-4 py-4 sm:px-6">
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    loading={submitting}
                                    onClick={() => confirmEditReceipt(receipt)}
                                  >
                                    {incomeReceiptUiCopy.form.submit}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                                    disabled={submitting}
                                    onClick={cancelEditReceipt}
                                  >
                                    {incomeReceiptUiCopy.form.cancel}
                                  </Button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-4 sm:px-6">
                                <span className="text-sm font-semibold text-[#1a1333]">
                                  {formatCurrency(receipt.amountReceived)}
                                </span>
                              </td>
                              <td className="px-4 py-4 sm:px-6">
                                <span className="text-sm text-[#4a3f6b]">
                                  {formatDateTime(receipt.receivedAt)}
                                </span>
                              </td>
                              <td className="px-4 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    title="Editar"
                                    className="text-violet-700 transition hover:text-violet-900"
                                    onClick={() => startEditReceipt(receipt)}
                                  >
                                    <EditIcon size={18} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Excluir"
                                    className="text-rose-700 transition hover:text-rose-900"
                                    onClick={() =>
                                      setReceiptPendingDelete(receipt)
                                    }
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      <ConfirmDialog
        open={Boolean(receiptPendingDelete)}
        title="Excluir recebimento"
        description={incomeReceiptUiCopy.history.deleteConfirm}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        icon={<Trash2 size={20} />}
        loading={submitting}
        onConfirm={() => {
          void handleConfirmDeleteReceipt();
        }}
        onCancel={() => setReceiptPendingDelete(null)}
      />
    </div>
  );
}

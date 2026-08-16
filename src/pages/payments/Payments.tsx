import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "@/components/atoms/Button";
import EditIcon from "@/components/atoms/icons/EditIcon";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ConfirmDialog from "@molecules/ConfirmDialog";
import ExportButtons from "@/components/molecules/ExportButtons";
import SectionCard from "@/components/organisms/SectionCard";
import { colors } from "@/config";
import {
  debtStatusLabel,
  fetchDebtById,
  useDebtsContext,
} from "@/features/debts";
import {
  deleteDebtPayment,
  payInstallment,
  paymentUiCopy,
  updateDebtPayment,
} from "@/features/payments";
import type { Debt, DebtInstallment, DebtPayment } from "@/api/debts/schema";
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
  lines: DebtPayment[],
  installments: DebtInstallment[],
): string {
  if (lines.length <= 1) {
    return paymentUiCopy.success.registerPayment;
  }

  const installmentNumberById = new Map(
    installments.map((installment) => [
      installment.idDebtInstallment,
      installment.installmentNumber,
    ]),
  );

  const breakdown = lines
    .map((line) => {
      const number = line.idDebtInstallment
        ? installmentNumberById.get(line.idDebtInstallment)
        : undefined;
      return `parcela ${number ?? "-"} (${formatCurrency(line.amountPaid)})`;
    })
    .join(", ");

  return `${paymentUiCopy.success.registerPaymentSplitPrefix} ${formatCurrency(totalAmount)} ${paymentUiCopy.success.registerPaymentSplitAppliedTo}: ${breakdown}.`;
}

function installmentLabel(
  installmentNumber: number,
  hasInstallments: boolean,
): string {
  return hasInstallments ? String(installmentNumber) : "Pagamento único";
}

function getStatusPillStyle(status: DebtInstallment["status"]) {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    case "PARTIALLY_PAID":
      return "bg-amber-100 text-amber-800 border border-amber-300";
    case "OVERDUE":
      return "bg-rose-100 text-rose-800 border border-rose-300";
    default:
      return "bg-violet-100 text-violet-800 border border-violet-300";
  }
}

export default function Payments() {
  const { debts, load: loadDebts } = useDebtsContext();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    void loadDebts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedDebtId, setSelectedDebtId] = useState("");
  const [debtDetail, setDebtDetail] = useState<Debt | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [payingInstallmentId, setPayingInstallmentId] = useState<string | null>(
    null,
  );
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(nowInputValue());
  const [submitting, setSubmitting] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [paymentPendingDelete, setPaymentPendingDelete] =
    useState<DebtPayment | null>(null);

  async function loadDetail(idDebt: string) {
    setLoadingDetail(true);
    try {
      const detail = await fetchDebtById(idDebt);
      setDebtDetail(detail);
    } catch (error) {
      showError(
        paymentUiCopy.errors.loadDebtsFallback,
        error instanceof Error ? error.message : undefined,
      );
      setDebtDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    if (!selectedDebtId) {
      setDebtDetail(null);
      return;
    }

    void loadDetail(selectedDebtId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDebtId]);

  function startPayment(installment: DebtInstallment) {
    const outstanding = Math.max(
      installment.amountDue - installment.amountPaid,
      0,
    );
    const suggestedAmount =
      outstanding > 0 ? outstanding : installment.amountDue;
    setPayingInstallmentId(installment.idDebtInstallment);
    setPayAmount(formatCurrencyForInput(suggestedAmount));
    setPayDate(nowInputValue());
  }

  function cancelPayment() {
    setPayingInstallmentId(null);
    setPayAmount("");
  }

  async function confirmPayment(installment: DebtInstallment) {
    const normalized = payAmount.replace(/\./g, "").replace(",", ".");
    const amount = Number(normalized);

    if (!Number.isFinite(amount) || amount <= 0) {
      showError(
        paymentUiCopy.errors.invalidPaymentData,
        "Informe um valor de pagamento válido.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await payInstallment({
        idDebt: installment.idDebt,
        idDebtInstallment: installment.idDebtInstallment,
        amountPaid: amount,
        paidAt: payDate ? new Date(payDate).toISOString() : undefined,
      });

      showSuccess(
        buildRegisterSuccessMessage(
          amount,
          result.payments,
          result.installments,
        ),
      );
      setPayingInstallmentId(null);
      await loadDetail(installment.idDebt);
    } catch (error) {
      showError(
        paymentUiCopy.errors.registerPaymentFallback,
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startEditPayment(payment: DebtPayment) {
    if (!payment.idDebtPayment) return;
    setEditingPaymentId(payment.idDebtPayment);
    setEditAmount(formatCurrencyForInput(payment.amountPaid));
    setEditDate(payment.paidAt.slice(0, 16));
  }

  function cancelEditPayment() {
    setEditingPaymentId(null);
    setEditAmount("");
    setEditDate("");
  }

  async function confirmEditPayment(payment: DebtPayment) {
    if (!payment.idDebtPayment) return;

    const normalized = editAmount.replace(/\./g, "").replace(",", ".");
    const amount = Number(normalized);

    if (!Number.isFinite(amount) || amount <= 0) {
      showError(
        paymentUiCopy.errors.invalidPaymentData,
        "Informe um valor de pagamento válido.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await updateDebtPayment(payment.idDebtPayment, {
        amountPaid: amount,
        paidAt: editDate ? new Date(editDate).toISOString() : undefined,
      });

      showSuccess(paymentUiCopy.success.updatePayment);
      cancelEditPayment();
      if (payment.idDebt) {
        await loadDetail(payment.idDebt);
      }
    } catch (error) {
      showError(
        paymentUiCopy.errors.updatePaymentFallback,
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDeletePayment() {
    if (!paymentPendingDelete?.idDebtPayment) return;

    const payment = paymentPendingDelete;
    setSubmitting(true);
    try {
      await deleteDebtPayment(payment.idDebtPayment!);
      showSuccess(paymentUiCopy.success.deletePayment);
      setPaymentPendingDelete(null);
      if (payment.idDebt) {
        await loadDetail(payment.idDebt);
      }
    } catch (error) {
      showError(
        paymentUiCopy.errors.deletePaymentFallback,
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const installments = debtDetail?.installments ?? [];
  const payments = debtDetail?.payments ?? [];
  const installmentNumberById = new Map(
    installments.map((installment) => [
      installment.idDebtInstallment,
      installment.installmentNumber,
    ]),
  );
  const sortedPayments = [...payments].sort((a, b) =>
    a.paidAt < b.paidAt ? 1 : -1,
  );

  return (
    <div className="space-y-4">
      <SectionCard
        title={paymentUiCopy.listing.title}
        description={paymentUiCopy.listing.subtitle}
      >
        <Select
          label={paymentUiCopy.listing.selectDebtLabel}
          value={selectedDebtId}
          onChange={(event) => setSelectedDebtId(event.target.value)}
        >
          <option value="">
            {paymentUiCopy.listing.selectDebtPlaceholder}
          </option>
          {debts.map((debt) => (
            <option key={debt.idDebt} value={debt.idDebt}>
              {debt.title} - {debt.category}
            </option>
          ))}
        </Select>
        {debts.length === 0 && (
          <p className="mt-2 text-sm" style={{ color: colors.brown[500] }}>
            {paymentUiCopy.listing.emptyDebtsMessage}
          </p>
        )}
      </SectionCard>

      {!selectedDebtId && (
        <p className="text-sm" style={{ color: "#4a3f6b" }}>
          {paymentUiCopy.listing.noDebtSelected}
        </p>
      )}

      {selectedDebtId && loadingDetail && (
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

      {selectedDebtId && !loadingDetail && debtDetail && (
        <div className="flex justify-end">
          <ExportButtons
            resource="payments"
            filters={{ idDebt: selectedDebtId }}
          />
        </div>
      )}

      {selectedDebtId && !loadingDetail && debtDetail && (
        <div
          className="overflow-hidden rounded-xl border bg-white shadow-sm"
          style={{ borderColor: "#e8d5c9" }}
        >
          <div className="w-full overflow-x-auto">
            <table className="min-w-[820px] w-full text-sm">
              <thead>
                <tr style={{ background: colors.black[800] }}>
                  {[
                    paymentUiCopy.listing.columns.installment,
                    paymentUiCopy.listing.columns.dueDate,
                    paymentUiCopy.listing.columns.amountDue,
                    paymentUiCopy.listing.columns.amountPaid,
                    paymentUiCopy.listing.columns.paidAt,
                    paymentUiCopy.listing.columns.status,
                    paymentUiCopy.listing.columns.actions,
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
                    installment.amountDue - installment.amountPaid,
                    0,
                  );
                  const isPaid = installment.status === "PAID";
                  const isLocked = isPaid && debtDetail.hasInstallments;
                  const isEditingRow =
                    payingInstallmentId === installment.idDebtInstallment;

                  return (
                    <tr key={installment.idDebtInstallment}>
                      <td className="px-4 py-4 sm:px-6">
                        <span className="text-sm font-semibold text-[#1a1333]">
                          {installmentLabel(
                            installment.installmentNumber,
                            debtDetail.hasInstallments,
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
                          {formatCurrency(installment.amountPaid)}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span className="text-sm text-[#4a3f6b]">
                          {formatDateTime(installment.paidAt)}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusPillStyle(installment.status)}`}
                        >
                          {debtStatusLabel(installment.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        {isLocked ? (
                          <span className="text-xs text-[#9a7060]">-</span>
                        ) : isEditingRow ? (
                          <div className="flex flex-col gap-2 min-w-[220px]">
                            <Input
                              label={paymentUiCopy.form.amountLabel}
                              inputMode="decimal"
                              value={payAmount}
                              onChange={(event) =>
                                setPayAmount(
                                  maskCurrencyInput(event.target.value),
                                )
                              }
                              placeholder={formatCurrencyForInput(outstanding)}
                            />
                            <Input
                              label={paymentUiCopy.form.dateLabel}
                              type="datetime-local"
                              value={payDate}
                              onChange={(event) =>
                                setPayDate(event.target.value)
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                loading={submitting}
                                onClick={() => confirmPayment(installment)}
                              >
                                {paymentUiCopy.form.submit}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                                disabled={submitting}
                                onClick={cancelPayment}
                              >
                                {paymentUiCopy.form.cancel}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => startPayment(installment)}
                          >
                            {isPaid
                              ? paymentUiCopy.listing.payAgainAction
                              : paymentUiCopy.listing.payAction}
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

      {selectedDebtId && !loadingDetail && debtDetail && (
        <SectionCard
          title={paymentUiCopy.history.title}
          description={paymentUiCopy.history.subtitle}
        >
          {payments.length === 0 ? (
            <p className="text-sm" style={{ color: "#4a3f6b" }}>
              {paymentUiCopy.history.empty}
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
                        paymentUiCopy.history.columns.installment,
                        paymentUiCopy.history.columns.amount,
                        paymentUiCopy.history.columns.paidAt,
                        paymentUiCopy.history.columns.actions,
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
                    {sortedPayments.map((payment) => {
                      const isEditingRow =
                        editingPaymentId === payment.idDebtPayment;
                      const installmentNumber = payment.idDebtInstallment
                        ? installmentNumberById.get(payment.idDebtInstallment)
                        : undefined;

                      return (
                        <tr key={payment.idDebtPayment}>
                          <td className="px-4 py-4 sm:px-6">
                            <span className="text-sm font-semibold text-[#1a1333]">
                              {installmentNumber !== undefined
                                ? installmentLabel(
                                    installmentNumber,
                                    debtDetail.hasInstallments,
                                  )
                                : "-"}
                            </span>
                          </td>
                          {isEditingRow ? (
                            <>
                              <td className="px-4 py-4 sm:px-6">
                                <Input
                                  label={paymentUiCopy.form.amountLabel}
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
                                  label={paymentUiCopy.form.dateLabel}
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
                                    onClick={() => confirmEditPayment(payment)}
                                  >
                                    {paymentUiCopy.form.submit}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                                    disabled={submitting}
                                    onClick={cancelEditPayment}
                                  >
                                    {paymentUiCopy.form.cancel}
                                  </Button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-4 sm:px-6">
                                <span className="text-sm font-semibold text-[#1a1333]">
                                  {formatCurrency(payment.amountPaid)}
                                </span>
                              </td>
                              <td className="px-4 py-4 sm:px-6">
                                <span className="text-sm text-[#4a3f6b]">
                                  {formatDateTime(payment.paidAt)}
                                </span>
                              </td>
                              <td className="px-4 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    title="Editar"
                                    className="text-violet-700 transition hover:text-violet-900"
                                    onClick={() => startEditPayment(payment)}
                                  >
                                    <EditIcon size={18} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Excluir"
                                    className="text-rose-700 transition hover:text-rose-900"
                                    onClick={() =>
                                      setPaymentPendingDelete(payment)
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
        open={Boolean(paymentPendingDelete)}
        title="Excluir pagamento"
        description={paymentUiCopy.history.deleteConfirm}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        icon={<Trash2 size={20} />}
        loading={submitting}
        onConfirm={() => {
          void handleConfirmDeletePayment();
        }}
        onCancel={() => setPaymentPendingDelete(null)}
      />
    </div>
  );
}

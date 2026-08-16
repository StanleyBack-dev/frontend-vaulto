import { useEffect, useState } from "react";
import { Crown, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import EditIcon from "@/components/atoms/icons/EditIcon";
import Input from "@/components/atoms/Input";
import Loading from "@/components/atoms/Loading";
import Select from "@/components/atoms/Select";
import ConfirmDialog from "@molecules/ConfirmDialog";
import ExportButtons from "@/components/molecules/ExportButtons";
import SectionCard from "@/components/organisms/SectionCard";
import { colors } from "@/config";
import {
  fetchGoalById,
  goalStatusLabel,
  goalUiCopy,
  removeGoalContribution,
  saveGoalContribution,
  saveGoalContributionDetails,
  useGoalsContext,
} from "@/features/goals";
import { useBillingContext } from "@/features/billing";
import { planRoutePaths } from "@/router";
import type { FinancialGoal, GoalContribution } from "@/api/goals/schema";
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

function nowInputValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function toErrorMessage(error: unknown): string | undefined {
  return error instanceof Error && error.message ? error.message : undefined;
}

export default function GoalContributions() {
  const navigate = useNavigate();
  const { isPro, isLoading: isSubscriptionLoading } = useBillingContext();
  const { goals, load: loadGoals } = useGoalsContext();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (isPro) {
      void loadGoals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [goalDetail, setGoalDetail] = useState<FinancialGoal | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(nowInputValue());
  const [note, setNote] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [contributionPendingDelete, setContributionPendingDelete] =
    useState<GoalContribution | null>(null);
  const [editingContributionId, setEditingContributionId] = useState<
    string | null
  >(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editAmountError, setEditAmountError] = useState<string | undefined>();
  const [editSubmitting, setEditSubmitting] = useState(false);

  async function loadDetail(idFinancialGoal: string) {
    setLoadingDetail(true);
    try {
      const detail = await fetchGoalById(idFinancialGoal);
      setGoalDetail(detail);
    } catch (error) {
      showError(goalUiCopy.errors.loadGoalsFallback, toErrorMessage(error));
      setGoalDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    if (!selectedGoalId) {
      setGoalDetail(null);
      return;
    }

    void loadDetail(selectedGoalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGoalId]);

  function startAdd() {
    setIsAdding(true);
    setAmount("");
    setDate(nowInputValue());
    setNote("");
    setAmountError(undefined);
  }

  function cancelAdd() {
    setIsAdding(false);
    setAmount("");
    setNote("");
    setAmountError(undefined);
  }

  async function confirmAdd() {
    const normalized = amount.replace(/\./g, "").replace(",", ".");
    const parsedAmount = Number(normalized);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Informe um valor válido.");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await saveGoalContribution({
        idFinancialGoal: selectedGoalId,
        amount: parsedAmount,
        contributedAt: date ? new Date(date).toISOString() : undefined,
        note: note.trim() || undefined,
      });

      showSuccess(goalUiCopy.success.registerContribution);
      setGoalDetail(updated);
      cancelAdd();
    } catch (error) {
      showError(
        goalUiCopy.errors.registerContributionFallback,
        toErrorMessage(error),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(contribution: GoalContribution) {
    setEditingContributionId(contribution.idGoalContribution);
    setEditAmount(formatCurrencyForInput(contribution.amount));
    setEditDate(contribution.contributedAt.slice(0, 16));
    setEditNote(contribution.note ?? "");
    setEditAmountError(undefined);
  }

  function cancelEdit() {
    setEditingContributionId(null);
    setEditAmount("");
    setEditDate("");
    setEditNote("");
    setEditAmountError(undefined);
  }

  async function confirmEdit(contribution: GoalContribution) {
    const normalized = editAmount.replace(/\./g, "").replace(",", ".");
    const parsedAmount = Number(normalized);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setEditAmountError("Informe um valor válido.");
      return;
    }

    setEditSubmitting(true);
    try {
      const updated = await saveGoalContributionDetails({
        idFinancialGoal: contribution.idFinancialGoal,
        idGoalContribution: contribution.idGoalContribution,
        amount: parsedAmount,
        contributedAt: editDate ? new Date(editDate).toISOString() : undefined,
        note: editNote.trim() || undefined,
      });

      showSuccess(goalUiCopy.success.updateContribution);
      setGoalDetail(updated);
      cancelEdit();
    } catch (error) {
      showError(
        goalUiCopy.errors.updateContributionFallback,
        toErrorMessage(error),
      );
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!contributionPendingDelete) return;

    const contribution = contributionPendingDelete;
    setRemovingId(contribution.idGoalContribution);
    try {
      const updated = await removeGoalContribution(
        contribution.idFinancialGoal,
        contribution.idGoalContribution,
      );

      showSuccess(goalUiCopy.success.deleteContribution);
      setGoalDetail(updated);
      setContributionPendingDelete(null);
    } catch (error) {
      showError(
        goalUiCopy.errors.deleteContributionFallback,
        toErrorMessage(error),
      );
    } finally {
      setRemovingId(null);
    }
  }

  if (isSubscriptionLoading) {
    return (
      <div className="flex h-56 items-center justify-center">
        <Loading label="Carregando..." />
      </div>
    );
  }

  if (!isPro) {
    return (
      <SectionCard
        title={goalUiCopy.proGate.title}
        description={goalUiCopy.proGate.description}
      >
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
              color: "#fff",
            }}
          >
            <Crown size={26} />
          </div>
          <p
            className="max-w-md text-sm leading-relaxed"
            style={{ color: colors.brown[500] }}
          >
            {goalUiCopy.proGate.message}
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(planRoutePaths.list)}
          >
            {goalUiCopy.proGate.action}
          </Button>
        </div>
      </SectionCard>
    );
  }

  const sortedContributions = [...(goalDetail?.contributions ?? [])].sort(
    (a, b) => (a.contributedAt < b.contributedAt ? 1 : -1),
  );

  return (
    <div className="space-y-4">
      <SectionCard
        title="Contribuições de metas"
        description="Selecione uma meta para registrar ou excluir contribuições."
      >
        <Select
          label="Meta"
          value={selectedGoalId}
          onChange={(event) => setSelectedGoalId(event.target.value)}
        >
          <option value="">Selecione uma meta</option>
          {goals.map((goal) => (
            <option key={goal.idFinancialGoal} value={goal.idFinancialGoal}>
              {goal.title}
            </option>
          ))}
        </Select>
        {goals.length === 0 && (
          <p className="mt-2 text-sm" style={{ color: colors.brown[500] }}>
            Nenhuma meta cadastrada ainda.
          </p>
        )}
        {goalDetail && (
          <p className="mt-2 text-sm" style={{ color: colors.brown[500] }}>
            Alvo: {formatCurrency(goalDetail.targetAmount)} • Atual:{" "}
            {formatCurrency(goalDetail.currentAmount)} • Restante:{" "}
            {formatCurrency(
              Math.max(goalDetail.targetAmount - goalDetail.currentAmount, 0),
            )}{" "}
            • Progresso: {goalDetail.progressPercent}% •{" "}
            {goalStatusLabel(goalDetail.status)}
            {goalDetail.targetDate
              ? ` • Data alvo: ${formatDateDisplay(goalDetail.targetDate)}`
              : ""}
          </p>
        )}
      </SectionCard>

      {!selectedGoalId && (
        <p className="text-sm" style={{ color: "#4a3f6b" }}>
          Selecione uma meta para ver as contribuições.
        </p>
      )}

      {selectedGoalId && loadingDetail && (
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

      {selectedGoalId && !loadingDetail && goalDetail && (
        <SectionCard
          title="Histórico de contribuições"
          description="Registre novos aportes ou exclua contribuições já lançadas."
          action={
            !isAdding ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={startAdd}
              >
                Nova contribuição
              </Button>
            ) : undefined
          }
        >
          <div className="mb-3 flex justify-end">
            <ExportButtons
              resource="goal-contributions"
              filters={{ idFinancialGoal: selectedGoalId }}
            />
          </div>
          <div
            className="overflow-hidden rounded-xl border bg-white shadow-sm"
            style={{ borderColor: "#e8d5c9" }}
          >
            <div className="w-full overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm">
                <thead>
                  <tr style={{ background: colors.black[800] }}>
                    {["Valor", "Data", "Observação", "Ações"].map((label) => (
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
                  {isAdding && (
                    <tr>
                      <td className="px-4 py-4 sm:px-6">
                        <Input
                          label="Valor"
                          inputMode="decimal"
                          value={amount}
                          onChange={(event) =>
                            setAmount(maskCurrencyInput(event.target.value))
                          }
                          placeholder="0,00"
                          error={amountError}
                        />
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <Input
                          label="Data"
                          type="datetime-local"
                          value={date}
                          onChange={(event) => setDate(event.target.value)}
                        />
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <Input
                          label="Observação (opcional)"
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          placeholder="Ex: Bônus de julho"
                        />
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            loading={submitting}
                            onClick={() => {
                              void confirmAdd();
                            }}
                          >
                            Confirmar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                            disabled={submitting}
                            onClick={cancelAdd}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {sortedContributions.length === 0 && !isAdding ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-sm sm:px-6"
                        style={{ color: "#4a3f6b" }}
                      >
                        Nenhuma contribuição registrada ainda.
                      </td>
                    </tr>
                  ) : (
                    sortedContributions.map((contribution) => {
                      const isEditingRow =
                        editingContributionId ===
                        contribution.idGoalContribution;

                      if (isEditingRow) {
                        return (
                          <tr key={contribution.idGoalContribution}>
                            <td className="px-4 py-4 sm:px-6">
                              <Input
                                label="Valor"
                                inputMode="decimal"
                                value={editAmount}
                                onChange={(event) =>
                                  setEditAmount(
                                    maskCurrencyInput(event.target.value),
                                  )
                                }
                                error={editAmountError}
                              />
                            </td>
                            <td className="px-4 py-4 sm:px-6">
                              <Input
                                label="Data"
                                type="datetime-local"
                                value={editDate}
                                onChange={(event) =>
                                  setEditDate(event.target.value)
                                }
                              />
                            </td>
                            <td className="px-4 py-4 sm:px-6">
                              <Input
                                label="Observação (opcional)"
                                value={editNote}
                                onChange={(event) =>
                                  setEditNote(event.target.value)
                                }
                                placeholder="Ex: Bônus de julho"
                              />
                            </td>
                            <td className="px-4 py-4 sm:px-6">
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  loading={editSubmitting}
                                  onClick={() => {
                                    void confirmEdit(contribution);
                                  }}
                                >
                                  Confirmar
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                                  disabled={editSubmitting}
                                  onClick={cancelEdit}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={contribution.idGoalContribution}>
                          <td className="px-4 py-4 sm:px-6">
                            <span className="text-sm font-semibold text-[#1a1333]">
                              {formatCurrency(contribution.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <span className="text-sm text-[#4a3f6b]">
                              {formatDateTimeDisplay(
                                contribution.contributedAt,
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <span className="text-sm text-[#5a4e7a]">
                              {contribution.note || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                title="Editar"
                                className="text-violet-700 transition hover:text-violet-900"
                                onClick={() => startEdit(contribution)}
                              >
                                <EditIcon size={18} />
                              </button>
                              <button
                                type="button"
                                title="Excluir"
                                className="text-rose-700 transition hover:text-rose-900 disabled:opacity-50"
                                disabled={
                                  removingId === contribution.idGoalContribution
                                }
                                onClick={() =>
                                  setContributionPendingDelete(contribution)
                                }
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      )}

      <ConfirmDialog
        open={Boolean(contributionPendingDelete)}
        title="Excluir contribuição"
        description="Tem certeza que deseja excluir esta contribuição? Esta ação é irreversível."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        icon={<Trash2 size={20} />}
        loading={Boolean(removingId)}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        onCancel={() => setContributionPendingDelete(null)}
      />
    </div>
  );
}

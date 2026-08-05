export const incomeReceiptUiCopy = {
  listing: {
    title: "Recebimentos",
    subtitle:
      "Registre recebimentos e acompanhe o saldo de cada receita, parcelada ou não.",
    selectIncomeLabel: "Receita",
    selectIncomePlaceholder: "Selecione uma receita",
    emptyIncomesMessage: "Nenhuma receita encontrada.",
    noIncomeSelected:
      "Selecione uma receita para ver os detalhes de recebimento.",
    columns: {
      installment: "Parcela",
      dueDate: "Vencimento",
      amountDue: "Valor esperado",
      amountReceived: "Valor recebido",
      receivedAt: "Data do recebimento",
      status: "Status",
      actions: "Ações",
    },
    receiveAction: "Registrar recebimento",
    receiveAgainAction: "Registrar novo recebimento",
  },
  form: {
    title: "Registrar recebimento",
    amountLabel: "Valor recebido",
    dateLabel: "Data e horário do recebimento",
    submit: "Confirmar recebimento",
    cancel: "Cancelar",
  },
  history: {
    title: "Histórico de recebimentos",
    subtitle: "Edite ou exclua recebimentos já registrados para esta receita.",
    empty: "Nenhum recebimento registrado ainda.",
    columns: {
      installment: "Parcela",
      amount: "Valor recebido",
      receivedAt: "Data e horário",
      actions: "Ações",
    },
    deleteConfirm: "Tem certeza que deseja excluir este recebimento?",
  },
  success: {
    registerReceipt: "Recebimento registrado com sucesso.",
    registerReceiptSplitPrefix: "Recebimento de",
    registerReceiptSplitAppliedTo: "aplicado a",
    updateReceipt: "Recebimento atualizado com sucesso.",
    deleteReceipt: "Recebimento excluído com sucesso.",
  },
  errors: {
    loadIncomesFallback: "Não foi possível carregar as receitas.",
    registerReceiptFallback: "Não foi possível registrar o recebimento.",
    updateReceiptFallback: "Não foi possível atualizar o recebimento.",
    deleteReceiptFallback: "Não foi possível excluir o recebimento.",
    invalidResponseData: "Resposta inválida ao registrar recebimento.",
    invalidReceiptData: "Dados inválidos para o recebimento.",
  },
} as const;

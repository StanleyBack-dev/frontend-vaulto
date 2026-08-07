import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import SectionCard from "@/components/organisms/SectionCard";
import Button from "@atoms/Button";
import { useOnboardingContext } from "@/features/onboarding";
import { colors, radii } from "@/config";

interface ManualTopic {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

const topics: ManualTopic[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "A tela inicial, com a visão geral das suas finanças.",
    content: (
      <>
        <p>
          Mostra um quadro com todas as suas dívidas organizadas por situação —{" "}
          <strong>Em aberto</strong>, <strong>Vencidas</strong>,{" "}
          <strong>Parcialmente pagas</strong> e <strong>Pagas</strong> — com o
          valor total de cada uma.
        </p>
        <p>
          Logo abaixo, um resumo do mês mostra quanto você já{" "}
          <strong>recebeu</strong> de receitas, quanto ainda tem a receber,
          quanto <strong>pagou</strong> de dívidas e o saldo do período.
        </p>
        <p>
          <strong>Importante:</strong> esses valores de "recebido" e "pago"
          sempre refletem o que já aconteceu de verdade — nunca contam valores
          apenas esperados ou previstos que ainda não foram confirmados.
        </p>
        <p>
          Você pode trocar o mês exibido, ver o período inteiro sem filtro de
          data, e buscar por título ou categoria.
        </p>
      </>
    ),
  },
  {
    id: "dividas",
    title: "Dívidas",
    description: "Cadastro e controle de tudo o que você tem a pagar.",
    content: (
      <>
        <p>
          Cadastre contas, compras, empréstimos e qualquer outra dívida. Pode
          ser <strong>à vista</strong> (um único vencimento) ou{" "}
          <strong>parcelada</strong> (dividida em várias parcelas mensais).
        </p>
        <p>
          Se a dívida estiver vinculada a um cartão de crédito, o vencimento é
          calculado automaticamente pela data de fechamento e vencimento do
          cartão — você não precisa informar essa data manualmente.
        </p>
        <p>
          O status de cada dívida muda sozinho conforme os pagamentos vão sendo
          registrados: começa <strong>Em aberto</strong>, passa a{" "}
          <strong>Parcialmente paga</strong> quando parte do valor é quitado,
          vira <strong>Paga</strong> quando o valor total é quitado, ou fica{" "}
          <strong>Vencida</strong> se passar do prazo sem pagamento completo.
        </p>
        <p>
          Depois de criada, uma dívida parcelada não permite mais alterar o
          valor total nem a data de vencimento — isso preserva o histórico das
          parcelas já geradas. Dívidas à vista continuam editáveis normalmente.
        </p>
      </>
    ),
  },
  {
    id: "extratos",
    title: "Extratos",
    description: "Relatório detalhado das movimentações de um período.",
    content: (
      <>
        <p>
          Gera um relatório mostrando, parcela por parcela, tudo o que venceu
          num mês escolhido. Você decide o que aparece: só{" "}
          <strong>Dívidas</strong>, só <strong>Receitas</strong>, ou{" "}
          <strong>Ambas</strong> juntas na mesma lista, com uma coluna indicando
          o tipo de cada linha.
        </p>
        <p>
          As alterações de mês ou tipo só afetam a tela depois que você clica em{" "}
          <strong>Gerar</strong> — trocar o filtro sozinho não atualiza os dados
          exibidos.
        </p>
      </>
    ),
  },
  {
    id: "receitas",
    title: "Receitas",
    description: "Cadastro e controle de tudo o que você tem a receber.",
    content: (
      <>
        <p>
          Cadastre salário, freelances, valores emprestados a terceiros ou
          qualquer outra entrada de dinheiro esperada. Assim como as dívidas,
          uma receita pode ser recebida de uma vez ou <strong>parcelada</strong>{" "}
          — útil, por exemplo, quando alguém te deve um valor e vai pagando aos
          poucos.
        </p>
        <p>
          Existe uma opção de marcar a receita como <strong>recorrente</strong>,
          para casos que se repetem todo mês, como um salário fixo.
        </p>
        <p>
          Da mesma forma que as dívidas, uma receita parcelada não permite
          alterar o valor total nem o vencimento depois de criada.
        </p>
      </>
    ),
  },
  {
    id: "pagamentos",
    title: "Pagamentos",
    description: "Onde você registra que uma parcela de dívida foi paga.",
    content: (
      <>
        <p>
          Selecione a dívida, veja as parcelas em aberto e informe o valor e a
          data em que o pagamento aconteceu. É possível pagar parcial ou
          totalmente uma parcela — se o valor pago for maior que o necessário, o
          excedente é aplicado automaticamente nas próximas parcelas em aberto,
          na ordem.
        </p>
        <p>
          Pagamentos já registrados podem ser editados ou excluídos a qualquer
          momento, e o status da dívida é recalculado automaticamente. Todo o
          histórico fica disponível para consulta.
        </p>
      </>
    ),
  },
  {
    id: "recebimentos",
    title: "Recebimentos",
    description: "O mesmo que Pagamentos, só que para as Receitas.",
    content: (
      <>
        <p>
          É aqui que você confirma que recebeu, total ou parcialmente, o valor
          de uma receita. Funciona exatamente como a tela de Pagamentos:
          selecione a receita, escolha a parcela, informe valor e data, e o
          status é atualizado automaticamente.
        </p>
      </>
    ),
  },
  {
    id: "categorias",
    title: "Categorias",
    description: "Organização das suas dívidas e receitas em grupos.",
    content: (
      <>
        <p>
          Categorias como "Moradia", "Alimentação", "Salário" ou "Freelance"
          ajudam a organizar e filtrar suas dívidas e receitas. Cada categoria
          tem um tipo — <strong>Despesa</strong> ou <strong>Receita</strong> — e
          só aparece como opção no cadastro correspondente ao seu tipo.
        </p>
      </>
    ),
  },
  {
    id: "cartoes",
    title: "Cartões de Crédito",
    description: "Cadastro dos seus cartões e cálculo automático de fatura.",
    content: (
      <>
        <p>
          Cadastre seus cartões com limite disponível, dia de fechamento e dia
          de vencimento da fatura. Ao vincular uma dívida a um cartão, o sistema
          calcula sozinho em qual fatura a compra cai e a data de vencimento
          correta, além de verificar se o valor cabe no limite disponível.
        </p>
      </>
    ),
  },
];

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: "Por que o saldo do mês não bate com o que eu esperava receber?",
    answer:
      "Porque o saldo sempre considera apenas valores já recebidos ou pagos, nunca os esperados. Se uma receita ainda não foi recebida, ela não entra na conta do saldo até que um recebimento seja registrado.",
  },
  {
    question: "Posso editar uma parcela que já foi totalmente paga?",
    answer:
      "Você não edita a parcela diretamente, mas pode editar ou excluir o pagamento (ou recebimento) registrado para ela nas telas de Pagamentos/Recebimentos — o status da parcela é recalculado automaticamente a partir disso.",
  },
  {
    question: "O que acontece se eu pagar a mais do que devia numa parcela?",
    answer:
      "O valor excedente é aplicado automaticamente na próxima parcela em aberto, seguindo a ordem — e no restante que sobrar, se ainda houver mais parcelas pendentes.",
  },
  {
    question:
      "Posso mudar o valor total ou o vencimento de uma dívida/receita parcelada depois de criada?",
    answer:
      "Não. Quando é parcelada, o valor total e a data de vencimento são definidos na criação e não podem ser editados depois, para preservar o histórico das parcelas já geradas. Isso não vale para dívidas/receitas à vista, que continuam editáveis.",
  },
  {
    question:
      "Qual a diferença entre Dívidas/Receitas e Pagamentos/Recebimentos?",
    answer:
      "Dívidas e Receitas são o cadastro — o que existe e o que é esperado. Pagamentos e Recebimentos são o registro de quando o dinheiro realmente saiu ou entrou.",
  },
];

interface ManualTopicCardProps {
  topic: ManualTopic;
  isOpen: boolean;
  onToggle: () => void;
}

function ManualTopicCard({ topic, isOpen, onToggle }: ManualTopicCardProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-6 sm:py-5"
      >
        <h3
          className="text-base font-semibold sm:text-lg"
          style={{ color: colors.brown[800] }}
        >
          {topic.title}
        </h3>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-200"
          style={{
            color: colors.brown[500],
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {isOpen && (
        <div
          className="border-t px-4 py-4 sm:px-6 sm:py-5"
          style={{ borderColor: colors.brown[100] }}
        >
          <p
            className="mb-3 text-sm leading-6"
            style={{ color: colors.brown[500] }}
          >
            {topic.description}
          </p>
          <div className="space-y-3 text-sm leading-6 text-[#2C1810]">
            {topic.content}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Manual() {
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());
  const { restartTour } = useOnboardingContext();

  function toggleTopic(id: string) {
    setOpenTopics((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function openTopic(id: string) {
    setOpenTopics((current) => new Set(current).add(id));
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Bem-vindo ao Vaulto"
        description="Um guia rápido de como usar cada área do sistema."
      >
        <div className="space-y-3 text-sm leading-6 text-[#2C1810]">
          <p>
            O Vaulto ajuda você a controlar suas dívidas e receitas em um só
            lugar: o que você deve pagar, o que tem a receber, e o que já
            realmente aconteceu.
          </p>
          <p>Pule direto para o que precisa:</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {topics.map((topic) => (
              <a
                key={topic.id}
                href={`#${topic.id}`}
                onClick={() => openTopic(topic.id)}
                className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-80"
                style={{
                  borderColor: colors.brown[100],
                  color: colors.brown[500],
                }}
              >
                {topic.title}
              </a>
            ))}
            <a
              href="#faq"
              className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-80"
              style={{
                borderColor: colors.brown[100],
                color: colors.brown[500],
              }}
            >
              Perguntas frequentes
            </a>
          </div>
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
              leftIcon={<Sparkles size={14} />}
              onClick={restartTour}
            >
              Refazer tour guiado
            </Button>
          </div>
        </div>
      </SectionCard>

      {topics.map((topic) => (
        <div key={topic.id} id={topic.id} className="scroll-mt-6">
          <ManualTopicCard
            topic={topic}
            isOpen={openTopics.has(topic.id)}
            onToggle={() => toggleTopic(topic.id)}
          />
        </div>
      ))}

      <div id="faq" className="scroll-mt-6">
        <SectionCard
          title="Perguntas frequentes"
          description="Dúvidas comuns sobre como o sistema se comporta."
        >
          <div className="space-y-5">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <p
                  className="text-sm font-semibold"
                  style={{ color: colors.brown[800] }}
                >
                  {faq.question}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#2C1810]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Sparkles } from "lucide-react";
import SectionCard from "@/components/organisms/SectionCard";
import Button from "@atoms/Button";
import { useOnboardingContext } from "@/features/onboarding";
import { settingsRoutePaths } from "@/router/navigation";
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
  {
    id: "previsao",
    title: "Previsão financeira",
    description: "Quanto você pode gastar com segurança no período.",
    content: (
      <>
        <p>
          <strong>Recurso exclusivo do Vaulto Pro.</strong> Informe o saldo que
          você tem disponível hoje e escolha até quando olhar — um período
          pré-definido (7 a 90 dias) ou uma data específica.
        </p>
        <p>
          O cálculo soma ao seu saldo as receitas previstas para o período e
          subtrai as dívidas em aberto no mesmo período, mostrando quanto você
          pode gastar com segurança sem comprometer o que já está programado. Se
          o resultado for negativo, significa que suas dívidas previstas superam
          o saldo e as receitas do período.
        </p>
      </>
    ),
  },
  {
    id: "calendario",
    title: "Calendário financeiro",
    description: "Dívidas e receitas organizadas por dia de vencimento.",
    content: (
      <>
        <p>
          <strong>Recurso exclusivo do Vaulto Pro.</strong> Mostra um calendário
          do mês escolhido com o total de dívidas e receitas que vencem em cada
          dia. Toque em um dia para ver a lista detalhada dos lançamentos
          daquela data, incluindo se e quando já foram pagos ou recebidos.
        </p>
      </>
    ),
  },
  {
    id: "metas",
    title: "Metas financeiras",
    description: "Defina objetivos e acompanhe seu progresso.",
    content: (
      <>
        <p>
          <strong>Recurso exclusivo do Vaulto Pro.</strong> Cadastre metas com
          um valor alvo e, opcionalmente, uma data alvo — por exemplo, juntar
          uma reserva de emergência ou guardar para uma viagem.
        </p>
        <p>
          O progresso de cada meta é calculado a partir das contribuições
          registradas para ela em <strong>Contribuições de metas</strong>. Ao
          excluir uma meta, todo o histórico de contribuições dela é perdido
          permanentemente.
        </p>
      </>
    ),
  },
  {
    id: "contribuicoes-metas",
    title: "Contribuições de metas",
    description: "Registro de contribuições para suas metas financeiras.",
    content: (
      <>
        <p>
          <strong>Recurso exclusivo do Vaulto Pro.</strong> Selecione uma meta
          já cadastrada para ver o valor alvo, o valor já acumulado, quanto
          falta e o percentual de progresso.
        </p>
        <p>
          Registre novas contribuições informando valor, data e uma observação
          opcional. Contribuições já lançadas podem ser editadas ou excluídas a
          qualquer momento — o progresso da meta é recalculado automaticamente.
        </p>
      </>
    ),
  },
  {
    id: "comparativos",
    title: "Comparativos",
    description: "Gastos e receitas por categoria, mês a mês.",
    content: (
      <>
        <p>
          <strong>Recurso exclusivo do Vaulto Pro.</strong> Compare o quanto
          você gastou ou recebeu em cada categoria entre dois períodos — mês,
          trimestre, semestre ou ano. Por padrão a comparação é sempre com o
          período anterior, mas também é possível escolher manualmente os dois
          períodos a comparar.
        </p>
        <p>
          O resultado mostra, categoria por categoria, a variação percentual
          entre os dois períodos, destacando se ela é uma melhora ou uma piora —
          para despesas, uma redução é destacada em verde; para receitas, um
          aumento é destacado em verde.
        </p>
      </>
    ),
  },
  {
    id: "saude-financeira",
    title: "Saúde Financeira",
    description:
      "Um indicador de 0 a 100 combinando comprometimento com dívidas, pontualidade e reservas.",
    content: (
      <>
        <p>
          <strong>Recurso exclusivo do Vaulto Pro.</strong> Escolha até quando
          olhar as dívidas e receitas em aberto (um período pré-definido ou uma
          data específica) e o sistema calcula um score de 0 a 100, classificado
          como <strong>Saudável</strong>, <strong>Atenção</strong> ou{" "}
          <strong>Crítico</strong>.
        </p>
        <p>
          O score combina três pilares, cada um com seu próprio peso:{" "}
          <strong>Comprometimento com dívidas</strong> (quanto das suas receitas
          esperadas já está comprometido com dívidas em aberto no período),{" "}
          <strong>Pontualidade</strong> (proporção de dívidas em dia, sem
          vencimentos em atraso) e <strong>Reservas</strong> (progresso médio
          das suas metas financeiras — se você ainda não tem metas cadastradas,
          esse pilar fica vazio até que você crie uma).
        </p>
      </>
    ),
  },
  {
    id: "lembretes",
    title: "Lembretes",
    description: "O que vence amanhã, e como avisamos você por e-mail.",
    content: (
      <>
        <p>
          <strong>Recurso exclusivo do Vaulto Pro.</strong> Todo dia, se houver
          dívidas ou receitas vencendo no dia seguinte, o Vaulto envia
          automaticamente um e-mail de resumo para o seu endereço cadastrado.
        </p>
        <p>
          Esta página mostra a mesma prévia do que seria enviado: tudo o que
          vence amanhã, separado em dívidas a pagar e receitas a receber, com
          detalhes de parcela, valor já pago/recebido e quanto ainda resta.
          Itens que já foram totalmente pagos ou recebidos não aparecem aqui.
        </p>
      </>
    ),
  },
  {
    id: "perfil",
    title: "Perfil",
    description: "Seus dados, sua assinatura e o gerenciamento da sua conta.",
    content: (
      <>
        <p>
          Mostra seus dados cadastrais, o status da sua assinatura (Free ou Pro)
          e o histórico de pagamentos da assinatura Vaulto Pro.
        </p>
        <p>
          Se você é assinante Pro, pode <strong>cancelar a assinatura</strong> a
          qualquer momento — ela permanece ativa até o fim do período já pago,
          sem renovar depois disso.
        </p>
        <p>
          Também é possível <strong>inativar</strong> a conta (você pode voltar
          quando quiser, basta fazer login novamente) ou{" "}
          <strong>solicitar a exclusão definitiva</strong> da conta e dos dados
          pessoais. A exclusão não é imediata: existe um prazo de{" "}
          <strong>30 dias</strong> a partir da solicitação para você mudar de
          ideia e cancelar o pedido antes que os dados sejam apagados de
          verdade.
        </p>
      </>
    ),
  },
  {
    id: "planos",
    title: "Planos",
    description: "Compare o Free e o Vaulto Pro e escolha o seu.",
    content: (
      <>
        <p>
          Mostra lado a lado tudo o que muda entre o plano <strong>Free</strong>{" "}
          (gratuito, com limites de cadastros e histórico) e o{" "}
          <strong>Vaulto Pro</strong> (cadastros ilimitados, relatórios
          avançados, exportação, lembretes, calendário, previsão financeira e
          metas). A cobrança do Vaulto Pro acontece assim que você assina, e o
          Pro é ativado na hora após a confirmação do pagamento.
        </p>
      </>
    ),
  },
  {
    id: "indique-e-ganhe",
    title: "Indique e Ganhe",
    description: "Indique amigos e ganhe 1 mês grátis de Vaulto Pro.",
    content: (
      <>
        <p>
          Todo usuário tem um código de indicação único e um link para
          compartilhar. Quando um amigo entra pelo seu link e assina o Vaulto
          Pro, a indicação só conta de verdade depois que a{" "}
          <strong>primeira cobrança dele for confirmada</strong> — assinar e
          cancelar antes de pagar não conta.
        </p>
        <p>
          A cada <strong>3 amigos</strong> que assinarem o Pro dessa forma, você
          ganha <strong>1 mês grátis</strong> de Vaulto Pro. Se você já é Pro, o
          mês grátis entra automaticamente quando o seu ciclo atual terminar.
          Essa recompensa é única — não se acumula além do primeiro mês grátis.
        </p>
      </>
    ),
  },
  {
    id: "suporte",
    title: "Suporte",
    description: "Fale com a nossa equipe por e-mail.",
    content: (
      <>
        <p>
          Escolha uma categoria (dúvida, problema técnico, sugestão, financeiro
          ou outro) e escreva sua mensagem. Ela é enviada por e-mail para a
          nossa equipe, e você recebe uma confirmação no seu e-mail cadastrado.
        </p>
        <p>
          Para evitar abuso, é possível enviar apenas{" "}
          <strong>1 mensagem por dia</strong>. Enquanto esse limite estiver
          ativo, a tela mostra quando você poderá enviar a próxima mensagem.
        </p>
      </>
    ),
  },
  {
    id: "termos-de-uso",
    title: "Termos e Privacidade",
    description: "Termos de Uso e Política de Privacidade da plataforma.",
    content: (
      <>
        <p>
          Reúne o texto completo dos Termos de Uso e da Política de Privacidade
          do Vaulto, além da data em que você os aceitou.
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
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (!id) return;

    openTopic(id);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="outline"
        className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
        leftIcon={<ArrowLeft size={16} />}
        onClick={() => navigate(settingsRoutePaths.list)}
      >
        Voltar para Configurações
      </Button>

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

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Banknote,
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  Check,
  CreditCard,
  Gift,
  HeartPulse,
  LayoutDashboard,
  PieChart,
  Receipt,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import Button from "../components/atoms/Button";
import DebtsIcon from "../components/atoms/icons/DebtsIcon";
import { brand, colors, typography } from "../config";
import { authRoutePaths, routePaths } from "../router";
import { captureReferralCodeFromUrl, useAuthSession } from "../features/auth";

const painPoints = [
  {
    icon: <AlertTriangle size={22} />,
    pain: "Dívidas espalhadas na cabeça, no papel ou em várias planilhas",
    solution:
      "Centralize tudo em um único painel, com parcelas e vencimentos organizados automaticamente.",
  },
  {
    icon: <Bell size={22} />,
    pain: "Esquecer o vencimento de uma parcela ou fatura",
    solution:
      "Lembretes e calendário financeiro avisam antes da data, evitando juros e multas.",
  },
  {
    icon: <PieChart size={22} />,
    pain: "Não saber para onde o dinheiro está indo todo mês",
    solution:
      "Extratos, categorias e gráficos mostram exatamente onde cada real foi gasto.",
  },
  {
    icon: <TrendingUp size={22} />,
    pain: "Viver no automático, sem visão do que vem pela frente",
    solution:
      "Previsão financeira e metas ajudam a planejar os próximos meses com clareza.",
  },
];

const beforeItems = [
  "Anotações espalhadas em papel, apps e conversas soltas",
  "Nunca sabe ao certo quanto falta pagar de cada dívida",
  "Só percebe o problema quando a fatura chega",
  "Decisões financeiras no feeling, sem números por perto",
];

const afterItems = [
  "Tudo num painel único, sempre atualizado",
  "Cada parcela e vencimento visível com antecedência",
  "Lembretes antes da data, não depois dela",
  "Decisões com base em dados reais, não em achismo",
];

const personas = [
  {
    icon: <Briefcase size={22} />,
    title: "Autônomos e freelancers",
    description:
      "Renda que varia de mês a mês pede um controle mais de perto. Registre receitas fixas e variáveis e saiba exatamente quanto entrou em cada período.",
  },
  {
    icon: <CreditCard size={22} />,
    title: "Quem tem dívidas parceladas",
    description:
      "Cartão, financiamento, empréstimo — cada um com uma parcela diferente. Veja todas juntas, com quanto já foi pago e quanto ainda falta.",
  },
  {
    icon: <Users size={22} />,
    title: "Casais e famílias",
    description:
      "Contas da casa, metas em comum, gastos que se misturam. Organize tudo num só lugar para decidir junto, com clareza.",
  },
];

const features = [
  {
    icon: <DebtsIcon size={22} />,
    title: "Dívidas",
    description:
      "Cadastre dívidas fixas e parceladas e acompanhe cada parcela até a quitação.",
  },
  {
    icon: <CreditCard size={22} />,
    title: "Cartões de crédito",
    description:
      "Controle limites, faturas e gastos de cada cartão em um só lugar.",
  },
  {
    icon: <Banknote size={22} />,
    title: "Receitas",
    description:
      "Registre receitas fixas e variáveis e saiba exatamente quanto entra por mês.",
  },
  {
    icon: <Receipt size={22} />,
    title: "Extratos",
    description:
      "Veja o histórico completo de pagamentos e recebimentos, com filtros por período.",
  },
  {
    icon: <Target size={22} />,
    title: "Metas financeiras",
    description:
      "Defina metas e acompanhe contribuições até alcançar cada objetivo.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Previsão financeira",
    description:
      "Projete os próximos meses com base no seu histórico real de dívidas e receitas.",
  },
  {
    icon: <CalendarDays size={22} />,
    title: "Calendário financeiro",
    description:
      "Visualize vencimentos e recebimentos futuros em um calendário único.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Comparativos",
    description:
      "Compare períodos e categorias para entender sua evolução financeira.",
  },
  {
    icon: <HeartPulse size={22} />,
    title: "Saúde financeira",
    description:
      "Acompanhe um indicador da sua saúde financeira com base nos seus dados.",
  },
  {
    icon: <Gift size={22} />,
    title: "Indique e Ganhe",
    description:
      "Convide amigos para o Vaulto e ganhe recompensas por cada indicação.",
  },
];

const steps = [
  {
    number: "1",
    title: "Cadastre",
    description: "Adicione suas dívidas, receitas e cartões em poucos minutos.",
  },
  {
    number: "2",
    title: "Acompanhe",
    description:
      "Veja tudo organizado em um painel único, com extratos e categorias automáticas.",
  },
  {
    number: "3",
    title: "Planeje",
    description:
      "Use metas, previsão financeira e lembretes para decidir os próximos passos com segurança.",
  },
];

const trustPoints = [
  {
    icon: <ShieldCheck size={20} />,
    text: "Login seguro com sua conta Google",
  },
  {
    icon: <LayoutDashboard size={20} />,
    text: "Seus dados organizados em um painel pessoal, só seu",
  },
  {
    icon: <Sparkles size={20} />,
    text: "Feito para o uso real do dia a dia, não só para o mês perfeito",
  },
];

const faqs = [
  {
    question: "Preciso instalar alguma coisa?",
    answer:
      "Não. O Vaulto funciona direto no navegador, do computador ou do celular, sem instalação.",
  },
  {
    question: "Meus dados financeiros ficam seguros?",
    answer:
      "Sim. Você acessa com senha ou sua conta Google, e as informações ficam organizadas em um painel pessoal, visível só para você.",
  },
  {
    question:
      "O Vaulto substitui meu banco ou acessa minha conta automaticamente?",
    answer:
      "Não. O Vaulto não é uma instituição financeira e não realiza transações bancárias. É uma ferramenta de organização: você cadastra os dados e o painel cuida de mostrar tudo de forma clara.",
  },
  {
    question: "Funciona para quem tem renda variável, como autônomos?",
    answer:
      "Sim. Você pode cadastrar receitas fixas e variáveis, acompanhar meses diferentes e ter uma visão clara de quanto entra e quanto sai a cada período.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
      style={{
        borderColor: colors.brown[100],
        color: colors.gold[500],
        fontFamily: typography.fontFamily,
      }}
    >
      {children}
    </span>
  );
}

function Reveal({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={style}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthSession();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    captureReferralCodeFromUrl(window.location.search);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 480);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  function goToApp() {
    navigate(isAuthenticated ? routePaths.dashboard : authRoutePaths.login);
  }

  const ctaLabel = isAuthenticated ? "Ir para o Dashboard" : "Entrar no Vaulto";
  const headerCtaLabel = isAuthenticated ? "Dashboard" : "Entrar";

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <header
        className="sticky top-0 z-20 border-b backdrop-blur-md"
        style={{
          borderColor: colors.brown[100],
          background: "rgba(9,9,15,0.75)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3 select-none">
            <img
              src="/vaulto-logo-96.png"
              alt={brand.name}
              className="h-9 w-9 rounded-full shadow-md"
            />
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: colors.white, fontFamily: typography.fontFamily }}
            >
              {brand.name}
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#funcionalidades"
              className="text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: colors.brown[300] }}
            >
              Funcionalidades
            </a>
            <a
              href="#como-funciona"
              className="text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: colors.brown[300] }}
            >
              Como funciona
            </a>
            <a
              href="#duvidas"
              className="text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: colors.brown[300] }}
            >
              Dúvidas
            </a>
          </nav>

          <Button type="button" variant="outline" size="sm" onClick={goToApp}>
            {headerCtaLabel}
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:pb-28 lg:pt-24">
          <div>
            <SectionLabel>{brand.subtitle}</SectionLabel>
            <h1
              className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
              style={{ color: colors.white, fontFamily: typography.fontFamily }}
            >
              Sua vida financeira,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #7B3FF2, #D4AF37)",
                }}
              >
                organizada em um só lugar
              </span>
            </h1>
            <p
              className="mt-6 text-lg leading-relaxed"
              style={{ color: colors.brown[300] }}
            >
              O Vaulto reúne dívidas, receitas, cartões e metas em um único
              painel, para você parar de perder o controle do dinheiro no meio
              de planilhas soltas e lembretes na cabeça.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight size={18} />}
                onClick={goToApp}
              >
                {ctaLabel}
              </Button>
              <a href="#funcionalidades">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Ver funcionalidades
                </Button>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {trustPoints.map((point) => (
                <div key={point.text} className="flex items-center gap-2">
                  <span style={{ color: colors.gold[500] }}>{point.icon}</span>
                  <span
                    className="text-sm"
                    style={{ color: colors.brown[300] }}
                  >
                    {point.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute inset-4 -z-10 rounded-full opacity-40 blur-2xl sm:-inset-8"
              style={{
                background:
                  "radial-gradient(circle, rgba(123,63,242,0.35), transparent 70%)",
              }}
            />
            <div
              className="rounded-2xl border p-5 shadow-md"
              style={{
                borderColor: colors.brown[100],
                background: colors.black[800],
              }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e53e3e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#7B3FF2]" />
                <span
                  className="ml-3 text-xs font-medium"
                  style={{ color: colors.brown[500] }}
                >
                  Painel Vaulto
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "Dívidas em aberto", value: "R$ 3.240,00" },
                  { label: "Receitas do mês", value: "R$ 6.500,00" },
                  { label: "Saldo previsto", value: "R$ 1.180,00" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: colors.brown[100],
                      background: colors.black[700],
                    }}
                  >
                    <p
                      className="text-[11px] leading-tight"
                      style={{ color: colors.brown[500] }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="mt-1.5 text-sm font-semibold"
                      style={{ color: colors.white }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 flex h-28 items-end gap-2 rounded-xl border p-3"
                style={{
                  borderColor: colors.brown[100],
                  background: colors.black[700],
                }}
              >
                {[45, 70, 55, 90, 65, 80, 50].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${height}%`,
                      background:
                        "linear-gradient(to top, #4F2D9B, #7B3FF2, #D4AF37)",
                      opacity: 0.5 + height / 200,
                    }}
                  />
                ))}
              </div>

              <p
                className="mt-3 text-center text-[11px]"
                style={{ color: colors.brown[500] }}
              >
                Ilustração do painel Vaulto · valores de exemplo
              </p>
            </div>
          </div>
        </section>

        <section
          className="border-y"
          style={{ borderColor: colors.brown[100] }}
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <SectionLabel>Antes e depois</SectionLabel>
              <h2
                className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
                style={{
                  color: colors.white,
                  fontFamily: typography.fontFamily,
                }}
              >
                Sai do controle solto, entra o painel único
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              <Reveal
                className="rounded-2xl border p-6"
                style={{
                  borderColor: colors.brown[100],
                  background: colors.black[800],
                }}
              >
                <p
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: colors.brown[500] }}
                >
                  Sem o Vaulto
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {beforeItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: "rgba(229,62,62,0.16)",
                          color: "#e53e3e",
                        }}
                      >
                        <X size={12} />
                      </span>
                      <span
                        className="text-sm leading-relaxed"
                        style={{ color: colors.brown[300] }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal
                className="rounded-2xl border p-6"
                style={{
                  borderColor: colors.gold[500],
                  background: colors.black[800],
                }}
              >
                <p
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: colors.gold[500] }}
                >
                  Com o Vaulto
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {afterItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: "rgba(212,175,55,0.18)",
                          color: colors.gold[500],
                        }}
                      >
                        <Check size={12} />
                      </span>
                      <span
                        className="text-sm leading-relaxed"
                        style={{ color: colors.white }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionLabel>Por que o Vaulto existe</SectionLabel>
            <h2
              className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{
                color: colors.white,
                fontFamily: typography.fontFamily,
              }}
            >
              As dores do dia a dia financeiro, resolvidas
            </h2>
            <p className="mt-4 text-base" style={{ color: colors.brown[300] }}>
              Cada funcionalidade do Vaulto nasceu de um problema real de quem
              tenta organizar as próprias finanças sozinho.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {painPoints.map((item) => (
              <Reveal
                key={item.pain}
                className="flex gap-4 rounded-2xl border p-5"
                style={{
                  borderColor: colors.brown[100],
                  background: colors.black[800],
                }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #4F2D9B, #7B3FF2)",
                    color: colors.white,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: colors.white }}
                  >
                    {item.pain}
                  </p>
                  <p
                    className="mt-1.5 text-sm leading-relaxed"
                    style={{ color: colors.brown[300] }}
                  >
                    {item.solution}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section
          className="border-y"
          style={{ borderColor: colors.brown[100] }}
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <SectionLabel>Para quem é o Vaulto</SectionLabel>
              <h2
                className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
                style={{
                  color: colors.white,
                  fontFamily: typography.fontFamily,
                }}
              >
                Feito para o seu dia a dia financeiro
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {personas.map((persona) => (
                <Reveal
                  key={persona.title}
                  className="rounded-2xl border p-6"
                  style={{
                    borderColor: colors.brown[100],
                    background: colors.black[800],
                  }}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, #4F2D9B, #7B3FF2)",
                      color: colors.white,
                    }}
                  >
                    {persona.icon}
                  </div>
                  <p
                    className="mt-4 text-base font-semibold"
                    style={{ color: colors.white }}
                  >
                    {persona.title}
                  </p>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: colors.brown[300] }}
                  >
                    {persona.description}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="funcionalidades"
          className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
        >
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionLabel>Funcionalidades</SectionLabel>
            <h2
              className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: colors.white, fontFamily: typography.fontFamily }}
            >
              Tudo que você precisa para organizar suas finanças
            </h2>
            <p className="mt-4 text-base" style={{ color: colors.brown[300] }}>
              Um único painel para dívidas, receitas, cartões e planejamento
              financeiro, sem precisar de mais nenhuma planilha.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border p-5 transition-colors hover:border-[#4F2D9B]"
                style={{
                  borderColor: colors.brown[100],
                  background: colors.black[800],
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    background: colors.brown[100],
                    color: colors.gold[500],
                  }}
                >
                  {feature.icon}
                </div>
                <p
                  className="mt-3 text-sm font-semibold"
                  style={{ color: colors.white }}
                >
                  {feature.title}
                </p>
                <p
                  className="mt-1.5 text-xs leading-relaxed"
                  style={{ color: colors.brown[500] }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="como-funciona"
          className="border-y"
          style={{ borderColor: colors.brown[100] }}
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <SectionLabel>Como funciona</SectionLabel>
              <h2
                className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
                style={{
                  color: colors.white,
                  fontFamily: typography.fontFamily,
                }}
              >
                Do caos financeiro à clareza, em 3 passos
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="text-center sm:text-left">
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-base font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #4F2D9B, #7B3FF2, #D4AF37)",
                      color: colors.white,
                    }}
                  >
                    {step.number}
                  </span>
                  <p
                    className="mt-4 text-lg font-semibold"
                    style={{ color: colors.white }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: colors.brown[300] }}
                  >
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="duvidas" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionLabel>Dúvidas frequentes</SectionLabel>
            <h2
              className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: colors.white, fontFamily: typography.fontFamily }}
            >
              Antes de começar, algumas respostas
            </h2>
          </Reveal>

          <div className="mt-12 flex flex-col gap-4">
            {faqs.map((faq) => (
              <Reveal
                key={faq.question}
                className="rounded-2xl border p-5 sm:p-6"
                style={{
                  borderColor: colors.brown[100],
                  background: colors.black[800],
                }}
              >
                <p
                  className="text-base font-semibold"
                  style={{ color: colors.white }}
                >
                  {faq.question}
                </p>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: colors.brown[300] }}
                >
                  {faq.answer}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className="overflow-hidden rounded-3xl border px-6 py-14 text-center sm:px-16"
            style={{
              borderColor: colors.brown[100],
              background:
                "radial-gradient(circle at 20% 20%, rgba(123,63,242,0.28), transparent 55%), radial-gradient(circle at 80% 80%, rgba(212,175,55,0.16), transparent 50%), #141225",
            }}
          >
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: colors.white, fontFamily: typography.fontFamily }}
            >
              Pronto para organizar sua vida financeira?
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-base"
              style={{ color: colors.brown[300] }}
            >
              Acesse sua conta e centralize dívidas, receitas e metas em um
              painel feito para o seu dia a dia.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight size={18} />}
                onClick={goToApp}
              >
                {ctaLabel}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: colors.brown[100] }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
          <div className="flex items-center gap-2 select-none">
            <img
              src="/vaulto-logo-96.png"
              alt={brand.name}
              className="h-7 w-7 rounded-full"
            />
            <span
              className="text-sm font-semibold"
              style={{ color: colors.white, fontFamily: typography.fontFamily }}
            >
              {brand.name}
            </span>
          </div>
          <p className="text-xs" style={{ color: colors.brown[500] }}>
            &copy; {new Date().getFullYear()} {brand.legalName}. Todos os
            direitos reservados.
          </p>
        </div>
      </footer>

      <button
        type="button"
        aria-label="Voltar ao topo"
        onClick={scrollToTop}
        className={`fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-all duration-300 sm:bottom-6 sm:right-6 ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(to top right, #4F2D9B, #7B3FF2, #D4AF37)",
          color: colors.white,
        }}
      >
        <ArrowUp size={20} />
      </button>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 backdrop-blur-md sm:hidden"
        style={{
          borderColor: colors.brown[100],
          background: "rgba(9,9,15,0.92)",
        }}
      >
        <Button
          type="button"
          variant="primary"
          size="md"
          className="w-full"
          onClick={goToApp}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}

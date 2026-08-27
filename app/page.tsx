"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardList,
  ExternalLink,
  FileText,
  Flag,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  Link2,
  ListChecks,
  MoreHorizontal,
  Plus,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type GlobalPage = "Стратегия" | "Мои QBR" | "Инициативы" | "Команды" | "Шаблоны"
type StatusTone = "green" | "yellow" | "red" | "blue" | "slate"

const quarters = [
  { label: "II квартал 2026", short: "II кв. 2026", phase: "Итоги зафиксированы", completion: 100 },
  { label: "III квартал 2026", short: "III кв. 2026", phase: "Подготовка к ревью", completion: 86 },
  { label: "IV квартал 2026", short: "IV кв. 2026", phase: "Формирование планов", completion: 34 },
  { label: "I квартал 2027", short: "I кв. 2027", phase: "Плановый период", completion: 8 },
] as const

const navItems: { label: GlobalPage; icon: typeof Target }[] = [
  { label: "Стратегия", icon: GitBranch },
  { label: "Мои QBR", icon: LayoutDashboard },
  { label: "Инициативы", icon: Rocket },
  { label: "Команды", icon: Users },
  { label: "Шаблоны", icon: ClipboardList },
]

const strategyKpis = [
  { value: "13%+", label: "CAGR комиссионного дохода" },
  { value: "18%+", label: "RoE на протяжении стратегии" },
  { value: "65+ млрд ₽", label: "чистая прибыль к 2028 году" },
  { value: "50%+", label: "прибыли МСФО — дивиденды" },
  { value: "50–55%", label: "Cost-to-F&C Income Ratio к 2028 году" },
] as const

const strategyDirections = [
  {
    number: "01",
    title: "Развитие рынков капитала",
    description: "Рост числа эмитентов и инструментов, повышение ликвидности и расширение ESG-предложения.",
    accent: "border-rose-200 bg-rose-50 text-rose-700",
    okrs: [
      { metric: "IPO / SPO", target: "≈10 в год" },
      { metric: "ОТС и инвестплатформы", target: "100+ имен" },
      { metric: "Новые эмиссии корп. облигаций", target: "+200%" },
    ],
    initiatives: ["Цифровой онбординг эмитентов", "Новая модель маркет-мейкинга", "Расширение линейки ESG-инструментов"],
    fte: "14,5 FTE",
  },
  {
    number: "02",
    title: "Активное вовлечение конечного клиента",
    description: "Развитие Финуслуг, ЦФА и данных, прямое взаимодействие с клиентом и персонализация сервисов.",
    accent: "border-violet-200 bg-violet-50 text-violet-700",
    okrs: [
      { metric: "Клиентская база Финуслуг", target: "×10" },
      { metric: "Продуктов на клиента", target: "+60%" },
      { metric: "Клиенты терминала Data", target: "1000+" },
    ],
    initiatives: ["AI-аналитика в терминале", "Персональный цифровой онбординг", "Продуктовая линейка ЦФА"],
    fte: "11,0 FTE",
  },
  {
    number: "03",
    title: "Международный доступ",
    description: "Связи с иностранными инвесторами, иностранные инструменты и технологическая интеграция с ЕАЭС.",
    accent: "border-blue-200 bg-blue-50 text-blue-700",
    okrs: [
      { metric: "Кросс-листинг ETF", target: "запуск" },
      { metric: "Интеграция с ЕАЭС", target: "пилот" },
      { metric: "Редомициляция", target: "поддержка" },
    ],
    initiatives: ["Пилот технологического линка ЕАЭС", "Контур иностранных инструментов", "Сервис сопровождения редомициляции"],
    fte: "8,0 FTE",
  },
] as const

const initiatives = [
  {
    id: "IN-241",
    title: "AI-аналитика в торговом терминале",
    strategy: "Активное вовлечение конечного клиента",
    okr: "1000+ клиентов терминала Data",
    metric: "Активные пользователи терминала",
    status: "В работе",
    tone: "blue" as StatusTone,
    progress: 68,
    fte: "3,0 FTE",
    owner: "Анна Смирнова",
    deadline: "18 дек",
  },
  {
    id: "IN-237",
    title: "Персональный цифровой онбординг",
    strategy: "Активное вовлечение конечного клиента",
    okr: "+60% продуктов на клиента",
    metric: "Конверсия в целевое действие",
    status: "В работе",
    tone: "blue" as StatusTone,
    progress: 82,
    fte: "2,5 FTE",
    owner: "Алексей Иванов",
    deadline: "30 ноя",
  },
  {
    id: "IN-229",
    title: "Миграция витрины клиентских данных",
    strategy: "Катализатор · Современные технологии",
    okr: "Снизить time-to-market экспериментов",
    metric: "Время запуска эксперимента",
    status: "Под риском",
    tone: "red" as StatusTone,
    progress: 54,
    fte: "4,0 FTE",
    owner: "Мария Орлова",
    deadline: "15 дек",
  },
  {
    id: "IN-245",
    title: "Расширение продуктовой линейки ЦФА",
    strategy: "Активное вовлечение конечного клиента",
    okr: "Сформировать продуктовое предложение ЦФА",
    metric: "Количество доступных продуктов",
    status: "Запланировано",
    tone: "slate" as StatusTone,
    progress: 18,
    fte: "2,0 FTE",
    owner: "Илья Волков",
    deadline: "25 дек",
  },
  {
    id: "IN-251",
    title: "Пилот технологической интеграции с ЕАЭС",
    strategy: "Международный доступ",
    okr: "Построить технологический линк с ЕАЭС",
    metric: "Пройденные этапы интеграции",
    status: "Не начато",
    tone: "yellow" as StatusTone,
    progress: 5,
    fte: "3,5 FTE",
    owner: "Дмитрий Соколов",
    deadline: "I кв. 2027",
  },
] as const

const metrics = [
  { name: "Активные пользователи терминала", strategy: "Вовлечение клиента", plan: "50 тыс.", fact: "52,4 тыс.", progress: 105, status: "green", trend: "+22%", fte: "3,0", initiatives: 1 },
  { name: "Конверсия в целевое действие", strategy: "Вовлечение клиента", plan: "18%", fact: "16,3%", progress: 91, status: "yellow", trend: "+2,2 п.п.", fte: "2,5", initiatives: 1 },
  { name: "Время запуска эксперимента", strategy: "Современные технологии", plan: "7 дней", fact: "9 дней", progress: 78, status: "red", trend: "−17%", fte: "4,0", initiatives: 1 },
  { name: "Доступность сервиса", strategy: "Современные технологии", plan: "99,95%", fact: "99,97%", progress: 100, status: "green", trend: "+0,06 п.п.", fte: "1,5", initiatives: 2 },
] as const

const reviewSections = ["Обзор", "Цели и метрики", "Достижения", "Риски", "Решения", "Следующий квартал"]

const workspaceData = {
  "Цели и метрики": {
    eyebrow: "Уровень 2 · OKR",
    title: "Цели и ключевые результаты команды",
    description: "Каждая цель связана со стратегическим направлением, метрикой и ресурсом команды.",
    button: "Добавить цель",
    items: [
      { title: "Увеличить регулярное использование терминала", meta: "Стратегия · Активное вовлечение конечного клиента", value: "105%", label: "выполнение", tone: "green", fte: "3,0 FTE", details: ["KR: 50 тыс. активных пользователей", "Факт: 52,4 тыс.", "Инициатива: AI-аналитика"] },
      { title: "Повысить конверсию в целевое действие", meta: "Стратегия · Активное вовлечение конечного клиента", value: "91%", label: "выполнение", tone: "yellow", fte: "2,5 FTE", details: ["KR: конверсия 18%", "Факт: 16,3%", "Инициатива: цифровой онбординг"] },
      { title: "Сократить запуск продуктового эксперимента", meta: "Катализатор · Современные технологии", value: "78%", label: "выполнение", tone: "red", fte: "4,0 FTE", details: ["KR: не более 7 дней", "Факт: 9 дней", "Инициатива: миграция витрины данных"] },
    ],
  },
  Достижения: {
    eyebrow: "Полученный эффект",
    title: "Достижения и уроки",
    description: "Фиксируем не выполненные работы, а изменение продукта и подтвержденный эффект.",
    button: "Добавить достижение",
    items: [
      { title: "Новый сценарий онбординга", meta: "IN-237 · Запущено 18 августа", value: "+12%", label: "к конверсии", tone: "green", details: ["Путь сокращен с 5 до 3 шагов", "A/B-тест: 34 тыс. пользователей", "Лучший эффект у новых клиентов"] },
      { title: "Повышена стабильность сервиса", meta: "Программа технологической надежности", value: "99,97%", label: "доступность", tone: "green", details: ["Устранены 3 класса сбоев", "−42% критических инцидентов", "Лучший результат за год"] },
    ],
  },
  Риски: {
    eyebrow: "Контроль отклонений",
    title: "Риски и зависимости",
    description: "Оцениваем влияние на OKR, назначаем владельца и определяем, нужна ли эскалация.",
    button: "Добавить риск",
    items: [
      { title: "Дефицит аналитического ресурса", meta: "Цель · Конверсия", value: "Высокий", label: "уровень риска", tone: "red", details: ["Вероятность и влияние: высокие", "План: выделить 0,5 FTE", "Нужна эскалация"] },
      { title: "Задержка миграции витрины данных", meta: "Инициатива · IN-229", value: "Средний", label: "уровень риска", tone: "yellow", details: ["Зависимость: Data Platform", "План: поэтапная поставка", "Владелец: Мария Орлова"] },
    ],
  },
  Решения: {
    eyebrow: "Управленческий фокус",
    title: "Решения, требуемые от руководства",
    description: "Выносим на QBR только вопросы, которые команда не может решить самостоятельно.",
    button: "Добавить решение",
    items: [
      { title: "Выделить аналитика на IV квартал", meta: "Решение до 15 октября", value: "0,5 FTE", label: "запрашиваемый ресурс", tone: "red", details: ["Перераспределить ресурс из завершенного проекта", "Альтернатива: сократить эксперименты", "Решает риск по IN-229"] },
      { title: "Подтвердить приоритет автоматизации", meta: "Продуктовый комитет", value: "P1", label: "предлагаемый приоритет", tone: "yellow", details: ["Включить инициативу в квартальный план", "Эффект: −25% времени обработки", "Срок решения: 20 октября"] },
    ],
  },
  "Следующий квартал": {
    eyebrow: "Фокус вперед",
    title: "Приоритеты следующего квартала",
    description: "Три результата, измеримые критерии успеха и сознательный отказ от второстепенных инициатив.",
    button: "Добавить приоритет",
    items: [
      { title: "Довести конверсию до 20%", meta: "OKR · Вовлечение конечного клиента", value: "20%", label: "целевая метрика", tone: "green", fte: "3,0 FTE", details: ["+18 тыс. действий за квартал", "6 продуктовых экспериментов", "Инициатива IN-237"] },
      { title: "Запустить продуктовую линейку ЦФА", meta: "Стратегия · Вовлечение конечного клиента", value: "4", label: "новых продукта", tone: "yellow", fte: "2,0 FTE", details: ["Проверить спрос в 3 сегментах", "Первый запуск до 15 декабря", "Инициатива IN-245"] },
      { title: "Не берем в квартал", meta: "Сознательный выбор команды", value: "2", label: "инициативы отложены", tone: "neutral", details: ["Редизайн личного кабинета", "Расширение отчетности", "Фокус на стратегических OKR"] },
    ],
  },
} as const

const statusStyles: Record<StatusTone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  yellow: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
}

function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[tone]}`}><span className="size-1.5 rounded-full bg-current" />{label}</span>
}

function StatusDot({ status }: { status: string }) {
  const color = status === "green" ? "bg-emerald-500" : status === "yellow" ? "bg-amber-400" : "bg-rose-500"
  return <span className={`mt-1.5 inline-block size-2.5 shrink-0 rounded-full ${color}`} />
}

function StatCard({ icon: Icon, label, value, note, tone }: { icon: typeof Target; label: string; value: string; note: string; tone: "blue" | "amber" | "red" | "violet" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", red: "bg-rose-50 text-rose-700", violet: "bg-violet-50 text-violet-700" }
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"><div className="flex items-start justify-between gap-3"><div><p className="text-[13px] font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div><div className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon className="size-5" /></div></div></article>
}

function QuarterSwitcher({ index, onChange }: { index: number; onChange: (index: number) => void }) {
  return (
    <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm">
      <button onClick={() => onChange(index - 1)} disabled={index === 0} className="grid size-8 place-items-center text-slate-500 transition hover:bg-slate-50 disabled:opacity-30" aria-label="Предыдущий квартал"><ChevronLeft className="size-4" /></button>
      <div className="min-w-[112px] border-x border-slate-200 px-3 text-center text-xs font-semibold text-slate-800">{quarters[index].short}</div>
      <button onClick={() => onChange(index + 1)} disabled={index === quarters.length - 1} className="grid size-8 place-items-center text-slate-500 transition hover:bg-slate-50 disabled:opacity-30" aria-label="Следующий квартал"><ChevronRight className="size-4" /></button>
    </div>
  )
}

function StrategyPage({ onOpenInitiatives }: { onOpenInitiatives: () => void }) {
  return (
    <main className="mx-auto w-full max-w-[1380px] p-4 md:p-7">
      <section className="overflow-hidden rounded-3xl bg-[#111827] text-white">
        <div className="grid lg:grid-cols-[1.3fr_1fr]">
          <div className="relative p-6 md:p-9">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-[#ef3e42]" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Стратегия Группы Московская Биржа 2028</p>
            <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight md:text-4xl">Существенный рост капитализации при долгосрочной устойчивой прибыли</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">Ключевая амбиция — выйти за пределы инфраструктурной роли, сохранив позицию драйвера развития российского финансового рынка.</p>
          </div>
          <div className="grid grid-cols-2 border-t border-white/10 bg-white/5 lg:border-l lg:border-t-0">
            {strategyKpis.map((kpi) => <div key={kpi.label} className="border-b border-r border-white/10 p-5"><p className="text-xl font-semibold text-white">{kpi.value}</p><p className="mt-1 text-xs leading-5 text-slate-400">{kpi.label}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
          {[{ n: "1", title: "Стратегия компании", note: "3 направления и катализаторы" }, { n: "2", title: "Цели и метрики (OKR)", note: "измеримые результаты" }, { n: "3", title: "Инициативы квартала", note: "работы, ресурсы и статусы" }].map((step, i) => (
            <div key={step.n} className="contents">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"><span className="grid size-7 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">{step.n}</span><div><p className="text-sm font-semibold text-slate-900">{step.title}</p><p className="mt-0.5 text-xs text-slate-500">{step.note}</p></div></div>
              {i < 2 && <ArrowRight className="mx-auto hidden size-4 text-slate-300 md:block" />}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <CircleDot className="mt-0.5 size-4 shrink-0 text-blue-600" />
        <p className="text-xs leading-5 text-blue-900"><span className="font-semibold">Логика прототипа:</span> стратегические направления и целевые ориентиры перенесены из опубликованной Стратегии Группы Московская Биржа 2028. Декомпозиция до командных OKR, инициатив и FTE показана как демонстрационная модель QBR Tool.</p>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {strategyDirections.map((direction) => (
          <article key={direction.number} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4"><span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${direction.accent}`}>{direction.number}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{direction.fte}</span></div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">{direction.title}</h3>
              <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-600">{direction.description}</p>
            </div>
            <div className="border-y border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><Target className="size-3.5" /> Цели и метрики</div>
              <div className="mt-3 space-y-2">{direction.okrs.map((okr) => <div key={okr.metric} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs"><span className="text-slate-600">{okr.metric}</span><span className="font-semibold text-slate-950">{okr.target}</span></div>)}</div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><Rocket className="size-3.5" /> Инициативы квартала</div>
              <ul className="mt-3 space-y-2">{direction.initiatives.map((item, index) => <li key={item} className="flex items-start gap-2.5 text-xs leading-5 text-slate-600"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${index === 0 ? "bg-blue-500" : index === 1 ? "bg-amber-400" : "bg-slate-300"}`} />{item}</li>)}</ul>
              <Button onClick={onOpenInitiatives} variant="ghost" size="sm" className="mt-3 px-0 text-slate-700">Открыть инициативы <ArrowRight /></Button>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3"><p className="mr-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Катализаторы достижения стратегии</p>{["Культура инвестиций", "Трансформация процессов и снижение time-to-market", "OpenAPI, AI и blockchain"].map((item) => <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">{item}</span>)}</div>
        <a href="https://www.moex.com/files/4g62xymgykeh5zb9r40newqv42" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900">Источник: Стратегия Группы Московская Биржа 2028 <ExternalLink className="size-3.5" /></a>
      </section>
    </main>
  )
}

function InitiativesPage({ quarterIndex }: { quarterIndex: number }) {
  return (
    <main className="mx-auto w-full max-w-[1380px] p-4 md:p-7">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Rocket} label="Инициативы квартала" value="5" note="3 связаны с бизнес-направлениями" tone="blue" />
        <StatCard icon={Gauge} label="Средний прогресс" value="45%" note={quarters[quarterIndex].phase} tone="amber" />
        <StatCard icon={AlertTriangle} label="Под риском" value="1" note="требует решения на QBR" tone="red" />
        <StatCard icon={BriefcaseBusiness} label="Загрузка ресурсов" value="15 FTE" note="из 17 доступных" tone="violet" />
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-950">Портфель инициатив</h2><p className="mt-0.5 text-xs text-slate-500">Стратегия → OKR → метрика → инициатива</p></div><div className="flex items-center gap-2 text-xs text-slate-500"><Link2 className="size-4" /> Все инициативы связаны с целями</div></div>
        <Table>
          <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="pl-5 text-xs text-slate-500">Инициатива</TableHead><TableHead className="text-xs text-slate-500">Связь со стратегией</TableHead><TableHead className="text-xs text-slate-500">Статус</TableHead><TableHead className="text-xs text-slate-500">Прогресс</TableHead><TableHead className="text-xs text-slate-500">Ресурс</TableHead><TableHead className="pr-5 text-xs text-slate-500">Владелец / срок</TableHead></TableRow></TableHeader>
          <TableBody>{initiatives.map((item) => <TableRow key={item.id} className="border-slate-100"><TableCell className="min-w-[230px] py-4 pl-5"><p className="font-medium text-slate-950">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.id} · {item.metric}</p></TableCell><TableCell className="min-w-[260px]"><p className="text-xs font-medium text-slate-700">{item.strategy}</p><p className="mt-1 text-xs text-slate-400">OKR: {item.okr}</p></TableCell><TableCell><StatusPill label={item.status} tone={item.tone} /></TableCell><TableCell className="min-w-[130px]"><div className="flex items-center gap-2"><Progress value={item.progress} className="h-1.5 w-16 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-800" /><span className="text-xs font-semibold text-slate-700">{item.progress}%</span></div></TableCell><TableCell><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{item.fte}</span></TableCell><TableCell className="pr-5"><p className="text-xs font-medium text-slate-700">{item.owner}</p><p className="mt-1 text-xs text-slate-400">{item.deadline}</p></TableCell></TableRow>)}</TableBody>
        </Table>
      </section>
    </main>
  )
}

function SectionWorkspace({ section }: { section: keyof typeof workspaceData }) {
  const data = workspaceData[section]
  const toneStyles = { green: "bg-emerald-50 text-emerald-700", yellow: "bg-amber-50 text-amber-700", red: "bg-rose-50 text-rose-700", neutral: "bg-slate-100 text-slate-700" }
  return (
    <main className="mx-auto w-full max-w-[1180px] p-4 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ef3e42]">{data.eyebrow}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{data.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{data.description}</p></div><Button className="bg-slate-950 text-white hover:bg-slate-800"><Plus />{data.button}</Button></div>
      <div className="mt-6 space-y-4">{data.items.map((item, index) => <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px]"><div><div className="flex items-start gap-4"><div className="grid size-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">{index + 1}</div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-950">{item.title}</h3>{"fte" in item && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{item.fte}</span>}</div><p className="mt-1 text-xs text-slate-500">{item.meta}</p></div></div><div className="ml-12 mt-4 grid gap-2 md:grid-cols-3">{item.details.map((detail) => <div key={detail} className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">{detail}</div>)}</div></div><div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 lg:block lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"><div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${toneStyles[item.tone]}`}>{item.value}</div><p className="mt-2 text-xs text-slate-500">{item.label}</p><Button variant="ghost" size="sm" className="mt-3 px-0 text-slate-600">Изменить <ArrowRight /></Button></div></div></article>)}</div>
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-4"><div className="rounded-xl bg-white p-2.5 text-violet-700 shadow-sm"><Bot className="size-5" /></div><div><p className="text-sm font-semibold text-violet-950">AI-помощник проверит качество раздела</p><p className="mt-0.5 text-xs text-violet-700">Проверит связи со стратегией, метрики, ресурсы и подтверждение результатов.</p></div><Button variant="outline" size="sm" className="ml-auto hidden border-violet-200 bg-white text-violet-800 sm:flex">Проверить раздел</Button></div>
    </main>
  )
}

function QbrOverview({ quarterIndex, onOpenInitiatives }: { quarterIndex: number; onOpenInitiatives: () => void }) {
  const quarter = quarters[quarterIndex]
  return (
    <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
      <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="grid lg:grid-cols-[1fr_310px]"><div className="relative p-5 md:p-6"><div className="absolute inset-y-0 left-0 w-1 bg-amber-400" /><div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><CircleDot className="size-3.5" /> Общий статус: требует внимания</span><span className="text-xs text-slate-400">{quarter.phase}</span></div><h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">Команда ускорила рост, но не достигла целевой конверсии</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Результаты квартала связаны со стратегическими OKR. Основной риск — ресурс аналитики для инициативы миграции клиентских данных.</p></div><Button variant="ghost" size="icon-sm" className="text-slate-400" aria-label="Дополнительные действия"><MoreHorizontal /></Button></div></div><div className="border-t border-slate-200 bg-slate-50/70 p-5 lg:border-l lg:border-t-0"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Готовность периода</p><span className="text-sm font-bold text-slate-950">{quarter.completion}%</span></div><Progress value={quarter.completion} className="mt-3 h-2 bg-slate-200 [&_[data-slot=progress-indicator]]:bg-[#ef3e42]" /><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><span className="flex items-center gap-1.5 text-emerald-700"><Check className="size-3.5" /> Связи заполнены</span><span className="flex items-center gap-1.5 text-amber-700"><AlertTriangle className="size-3.5" /> 2 замечания AI</span></div></div></div></section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={Target} label="Стратегические OKR" value="3 из 4" note="один требует внимания" tone="blue" /><StatCard icon={Rocket} label="Инициативы" value="4" note="одна под риском" tone="amber" /><StatCard icon={BriefcaseBusiness} label="Ресурс команды" value="11 FTE" note="задействовано в целях" tone="violet" /><StatCard icon={ListChecks} label="Требуются решения" value="3" note="до 15 октября" tone="red" /></section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-semibold text-slate-950">Цели и ключевые результаты</h3><p className="mt-0.5 text-xs text-slate-500">Стратегия, план, факт и задействованный ресурс</p></div><Button variant="ghost" size="sm" className="text-slate-600">Все OKR <ArrowRight /></Button></div><Table><TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="pl-5 text-xs text-slate-500">Метрика</TableHead><TableHead className="text-xs text-slate-500">Стратегия</TableHead><TableHead className="text-xs text-slate-500">План / факт</TableHead><TableHead className="text-xs text-slate-500">FTE</TableHead><TableHead className="pr-5 text-xs text-slate-500">Выполнение</TableHead></TableRow></TableHeader><TableBody>{metrics.map((metric) => <TableRow key={metric.name} className="border-slate-100"><TableCell className="min-w-[230px] py-3.5 pl-5"><div className="flex items-start gap-3"><StatusDot status={metric.status} /><div><p className="font-medium text-slate-900">{metric.name}</p><p className="mt-1 text-xs text-slate-400">{metric.initiatives} инициативы</p></div></div></TableCell><TableCell className="text-xs text-slate-600">{metric.strategy}</TableCell><TableCell><p className="text-xs text-slate-500">{metric.plan}</p><p className="font-semibold text-slate-950">{metric.fact} <span className="text-xs font-medium text-emerald-600">{metric.trend}</span></p></TableCell><TableCell><span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{metric.fte}</span></TableCell><TableCell className="min-w-[140px] pr-5"><div className="flex items-center gap-2"><Progress value={Math.min(metric.progress, 100)} className="h-1.5 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-800" /><span className="w-9 text-right text-xs font-semibold text-slate-700">{metric.progress}%</span></div></TableCell></TableRow>)}</TableBody></Table></section>
        <aside className="rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><div className="flex items-center gap-2"><div className="rounded-lg bg-violet-50 p-2 text-violet-700"><Bot className="size-4" /></div><div><h3 className="text-sm font-semibold text-slate-950">AI-проверка связности</h3><p className="text-xs text-slate-500">Стратегия → OKR → инициативы</p></div><Sparkles className="ml-auto size-4 text-violet-500" /></div></div><div className="space-y-4 p-5"><div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5"><p className="text-xs font-semibold text-amber-900">Ресурс не соответствует приоритету</p><p className="mt-1 text-xs leading-5 text-amber-800">Критичная инициатива IN-229 использует 4 FTE, но остается под риском.</p></div><div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5"><p className="text-xs font-semibold text-emerald-900">Связи заполнены</p><p className="mt-1 text-xs leading-5 text-emerald-800">Все инициативы квартала связаны минимум с одним OKR.</p></div><button className="flex w-full items-center justify-between rounded-xl border border-violet-100 bg-violet-50/60 p-3.5 text-left transition hover:bg-violet-50"><span><span className="block text-xs font-semibold text-violet-900">Сформировать резюме</span><span className="mt-1 block text-xs text-violet-700">Успехи, риски и решения</span></span><ArrowRight className="size-4 text-violet-600" /></button></div></aside>
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><div className="flex items-center gap-2"><Rocket className="size-4 text-[#ef3e42]" /><h3 className="text-sm font-semibold text-slate-950">Инициативы квартала</h3></div><p className="mt-1 text-xs text-slate-500">Конкретные работы, обеспечивающие достижение OKR</p></div><Button onClick={onOpenInitiatives} variant="outline" size="sm">Открыть портфель <ArrowRight /></Button></div><div className="grid gap-px bg-slate-100 lg:grid-cols-4">{initiatives.slice(0, 4).map((item) => <article key={item.id} className="bg-white p-4"><div className="flex items-center justify-between gap-2"><StatusPill label={item.status} tone={item.tone} /><span className="text-[11px] font-medium text-slate-400">{item.id}</span></div><h4 className="mt-3 min-h-[40px] text-sm font-semibold leading-5 text-slate-900">{item.title}</h4><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">OKR: {item.okr}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs font-semibold text-blue-700">{item.fte}</span><span className="text-xs font-semibold text-slate-600">{item.progress}%</span></div></article>)}</div></section>

      <div className="mt-5 grid gap-5 lg:grid-cols-3"><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" /><h3 className="text-sm font-semibold">Главные достижения</h3></div><p className="mt-4 text-sm leading-6 text-slate-600">Новый онбординг повысил конверсию первого шага на 12%; доступность достигла 99,97%.</p></section><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Flag className="size-4 text-rose-600" /><h3 className="text-sm font-semibold">Риски и зависимости</h3></div><p className="mt-4 text-sm leading-6 text-slate-600">Миграция витрины данных зависит от Data Platform и требует управленческого контроля.</p></section><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Lightbulb className="size-4 text-violet-600" /><h3 className="text-sm font-semibold">Требуются решения</h3></div><p className="mt-4 text-sm leading-6 text-slate-600">Выделить дополнительно 0,5 FTE аналитика и подтвердить приоритет автоматизации.</p></section></div>
    </main>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return <main className="mx-auto w-full max-w-[900px] p-7"><div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Users className="mx-auto size-8 text-slate-400" /><h2 className="mt-4 text-xl font-semibold text-slate-950">{title}</h2><p className="mt-2 text-sm text-slate-500">Раздел сохранен в структуре макета и будет детализирован на следующем этапе.</p></div></main>
}

export default function Home() {
  const [globalPage, setGlobalPage] = useState<GlobalPage>("Мои QBR")
  const [activeSection, setActiveSection] = useState("Обзор")
  const [mode, setMode] = useState("Подготовка")
  const [quarterIndex, setQuarterIndex] = useState(1)
  const quarter = quarters[quarterIndex]

  const advanceMode = () => {
    if (mode === "Подготовка") setMode("Ревью")
    else if (mode === "Ревью") setMode("Итоги")
  }

  const pageTitle = globalPage === "Стратегия" ? "Стратегия Группы Московская Биржа" : globalPage === "Инициативы" ? "Портфель инициатив" : globalPage === "Мои QBR" ? "Цифровые сервисы" : globalPage
  const pageSubtitle = globalPage === "Стратегия" ? "Стратегия 2028 → OKR → квартальные инициативы" : globalPage === "Инициативы" ? `${quarter.label} · 5 инициатив` : globalPage === "Мои QBR" ? `Квартальный обзор · ${quarter.label}` : "Рабочее пространство"

  return (
    <SidebarProvider>
      <Sidebar className="border-r-0 bg-[#111827] text-white" collapsible="icon">
        <SidebarHeader className="border-b border-white/10 px-3 py-4"><div className="flex h-9 items-center gap-3 px-1"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#ef3e42] text-sm font-bold text-white">Q</div><div className="min-w-0 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-semibold tracking-tight">QBR Tool</p><p className="truncate text-[10px] uppercase tracking-[0.16em] text-slate-400">Strategy & review</p></div></div></SidebarHeader>
        <SidebarContent className="bg-[#111827]"><SidebarGroup><SidebarGroupLabel className="text-slate-500">Управление результатами</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{navItems.map(({ label, icon: Icon }) => <SidebarMenuItem key={label}><SidebarMenuButton onClick={() => setGlobalPage(label)} isActive={globalPage === label} tooltip={label} className="h-10 text-slate-300 hover:bg-white/8 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:text-white"><Icon /><span>{label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup><SidebarGroup><SidebarGroupLabel className="text-slate-500">Текущий период</SidebarGroupLabel><SidebarGroupContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton onClick={() => setGlobalPage("Мои QBR")} className="h-auto items-start rounded-xl border border-white/10 bg-white/5 p-3 text-white hover:bg-white/8"><span className="mt-1 size-2 shrink-0 rounded-full bg-amber-400" /><span className="min-w-0 group-data-[collapsible=icon]:hidden"><span className="block truncate text-xs font-medium">Цифровые сервисы</span><span className="mt-1 block text-[11px] text-slate-400">{quarter.short} · {quarter.completion}%</span></span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent>
        <SidebarFooter className="border-t border-white/10 bg-[#111827] p-3"><div className="flex items-center gap-3 rounded-xl p-1"><div className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-700 text-xs font-semibold">АИ</div><div className="min-w-0 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-medium text-white">Алексей Иванов</p><p className="truncate text-[11px] text-slate-400">Владелец продукта</p></div></div></SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#f5f7fa]">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:px-7"><div className="flex min-w-0 items-center gap-3"><SidebarTrigger className="md:hidden" /><div className="min-w-0"><h1 className="truncate text-sm font-semibold text-slate-950 md:text-base">{pageTitle}</h1><p className="truncate text-xs text-slate-500">{pageSubtitle}</p></div></div><div className="flex shrink-0 items-center gap-2">{(globalPage === "Мои QBR" || globalPage === "Инициативы") && <QuarterSwitcher index={quarterIndex} onChange={setQuarterIndex} />}{globalPage === "Мои QBR" && <><div className="hidden items-center rounded-lg bg-slate-100 p-1 xl:flex">{["Подготовка", "Ревью", "Итоги"].map((item) => <button key={item} onClick={() => setMode(item)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${mode === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>{item}</button>)}</div><Button onClick={advanceMode} size="sm" className="hidden bg-[#ef3e42] text-white hover:bg-[#d92f34] sm:flex">{mode === "Подготовка" ? "Завершить подготовку" : mode === "Ревью" ? "Зафиксировать итоги" : "Экспорт PDF"}{mode === "Итоги" ? <FileText /> : <ArrowRight />}</Button></>}{globalPage === "Инициативы" && <Button size="sm" className="hidden bg-[#ef3e42] text-white hover:bg-[#d92f34] sm:flex"><Plus />Добавить инициативу</Button>}{globalPage === "Стратегия" && <Button variant="outline" size="sm" asChild className="hidden sm:flex"><a href="https://www.moex.com/files/4g62xymgykeh5zb9r40newqv42" target="_blank" rel="noreferrer">Источник <ExternalLink /></a></Button>}</div></header>

        {globalPage === "Стратегия" && <StrategyPage onOpenInitiatives={() => setGlobalPage("Инициативы")} />}
        {globalPage === "Инициативы" && <InitiativesPage quarterIndex={quarterIndex} />}
        {globalPage === "Команды" && <PlaceholderPage title="Команды" />}
        {globalPage === "Шаблоны" && <PlaceholderPage title="Шаблоны QBR" />}
        {globalPage === "Мои QBR" && <Tabs value={activeSection} onValueChange={setActiveSection} className="gap-0"><div className="border-b border-slate-200 bg-white px-4 md:px-7"><div className="flex h-14 items-center justify-between gap-6 overflow-x-auto scrollbar-none"><TabsList variant="line" className="h-full shrink-0 gap-6 p-0" aria-label="Разделы квартального обзора">{reviewSections.map((item) => <TabsTrigger key={item} value={item} className="h-full px-0 text-sm data-[state=active]:font-semibold data-[state=active]:after:bg-[#ef3e42]">{item}</TabsTrigger>)}</TabsList><div className="hidden shrink-0 items-center gap-2 text-xs text-slate-500 xl:flex"><span>{quarter.phase}</span><Progress value={quarter.completion} className="h-1.5 w-24 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-emerald-500" /><span className="font-semibold text-slate-700">{quarter.completion}%</span></div></div></div>{activeSection === "Обзор" ? <QbrOverview quarterIndex={quarterIndex} onOpenInitiatives={() => setGlobalPage("Инициативы")} /> : <SectionWorkspace section={activeSection as keyof typeof workspaceData} />}</Tabs>}
      </SidebarInset>
    </SidebarProvider>
  )
}

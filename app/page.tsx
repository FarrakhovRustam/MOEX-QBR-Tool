"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Building2,
  ChartBar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Database,
  ExternalLink,
  Flag,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Pencil,
  Plus,
  Rocket,
  RefreshCw,
  ShieldAlert,
  Target,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"

type GlobalPage = "Стратегия" | "Метрики" | "Инициативы" | "Команды" | "Мои QBR"
type StatusTone = "green" | "yellow" | "red" | "blue" | "slate"
type RiskLevel = "high" | "medium" | "low"
type InitiativeRisk = { id: string; level: RiskLevel; name: string; description: string }
type EmployeeItem = { id: string; name: string; role: string; email: string }
type TeamItem = { id: string; name: string; department: string; employees: EmployeeItem[] }
type InitiativeItem = {
  id: string
  title: string
  strategy: string
  goal: string
  metric: string
  linkedMetrics: string[]
  target: string
  current: string
  status: string
  tone: StatusTone
  progress: number
  owner: string
  team: string
  employees: string[]
  fte: number
  risks: InitiativeRisk[]
}
type MetricItem = {
  id: string
  name: string
  strategy: string
  goal: string
  plan: string
  fact: string
  progress: number
  status: "green" | "yellow" | "red"
  trend: string
  initiatives: number
  source: string
}

const quarters = [
  { label: "II квартал 2026", short: "II кв. 2026", phase: "Итоги зафиксированы", completion: 100 },
  { label: "III квартал 2026", short: "III кв. 2026", phase: "Подготовка к ревью", completion: 86 },
  { label: "IV квартал 2026", short: "IV кв. 2026", phase: "Формирование планов", completion: 34 },
  { label: "I квартал 2027", short: "I кв. 2027", phase: "Плановый период", completion: 8 },
] as const

const navItems: { label: GlobalPage; icon: typeof Target }[] = [
  { label: "Стратегия", icon: GitBranch },
  { label: "Метрики", icon: ChartBar },
  { label: "Инициативы", icon: Rocket },
  { label: "Команды", icon: Users },
  { label: "Мои QBR", icon: LayoutDashboard },
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
    averageProgress: 62,
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
    averageProgress: 71,
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
    averageProgress: 38,
  },
] as const

const initialTeams: TeamItem[] = [
  { id: "T-01", name: "AI-агенты", department: "Дирекция цифровых сервисов", employees: [{ id: "E-01", name: "Анна Смирнова", role: "Владелец продукта", email: "a.smirnova@moex.ru" }, { id: "E-02", name: "Елена Петрова", role: "ML-инженер", email: "e.petrova@moex.ru" }, { id: "E-03", name: "Сергей Ким", role: "Системный аналитик", email: "s.kim@moex.ru" }] },
  { id: "T-02", name: "Регистрация и онбординг", department: "Клиентские платформы", employees: [{ id: "E-04", name: "Алексей Иванов", role: "Владелец продукта", email: "a.ivanov@moex.ru" }, { id: "E-05", name: "Ольга Морозова", role: "Продуктовый аналитик", email: "o.morozova@moex.ru" }] },
  { id: "T-03", name: "Data Platform", department: "Дирекция данных", employees: [{ id: "E-06", name: "Мария Орлова", role: "Руководитель продукта", email: "m.orlova@moex.ru" }, { id: "E-07", name: "Никита Лебедев", role: "Data Engineer", email: "n.lebedev@moex.ru" }, { id: "E-08", name: "Павел Егоров", role: "Архитектор данных", email: "p.egorov@moex.ru" }] },
  { id: "T-04", name: "ЦФА и цифровые активы", department: "Новые рынки", employees: [{ id: "E-09", name: "Илья Волков", role: "Владелец продукта", email: "i.volkov@moex.ru" }, { id: "E-10", name: "Татьяна Белова", role: "Бизнес-аналитик", email: "t.belova@moex.ru" }] },
  { id: "T-05", name: "Международная интеграция", department: "Международный бизнес", employees: [{ id: "E-11", name: "Дмитрий Соколов", role: "Руководитель продукта", email: "d.sokolov@moex.ru" }, { id: "E-12", name: "Роман Федоров", role: "Интеграционный архитектор", email: "r.fedorov@moex.ru" }] },
]

const strategicGoals = [
  "Увеличить регулярное использование терминала",
  "Повысить конверсию в целевое действие",
  "Сократить запуск продуктового эксперимента",
  "Сформировать продуктовое предложение ЦФА",
  "Построить технологический линк с ЕАЭС",
  "Увеличить число активных эмитентов",
  "Повысить надежность клиентских сервисов",
  "Снизить операционную нагрузку",
]

const initiatives: InitiativeItem[] = [
  {
    id: "IN-241",
    title: "AI-аналитика в торговом терминале",
    strategy: "Активное вовлечение конечного клиента",
    goal: "Увеличить регулярное использование терминала",
    metric: "Активные пользователи терминала",
    linkedMetrics: ["Активные пользователи терминала"],
    target: "1 000 клиентов",
    current: "680 клиентов",
    status: "В работе",
    tone: "blue",
    progress: 68,
    owner: "Анна Смирнова",
    team: "AI-агенты",
    employees: ["Анна Смирнова", "Елена Петрова", "Сергей Ким"],
    fte: 3,
    risks: [{ id: "R-101", level: "medium", name: "Данные для модели", description: "Задержка поставки данных для рекомендательной модели" }],
  },
  {
    id: "IN-237",
    title: "Персональный цифровой онбординг",
    strategy: "Активное вовлечение конечного клиента",
    goal: "Повысить конверсию в целевое действие",
    metric: "Конверсия в целевое действие",
    linkedMetrics: ["Конверсия в целевое действие"],
    target: "18%",
    current: "14,8%",
    status: "В работе",
    tone: "blue",
    progress: 82,
    owner: "Алексей Иванов",
    team: "Регистрация и онбординг",
    employees: ["Алексей Иванов", "Ольга Морозова"],
    fte: 2,
    risks: [{ id: "R-102", level: "low", name: "Согласование текстов", description: "Незначительная задержка согласования текстов" }],
  },
  {
    id: "IN-229",
    title: "Миграция витрины клиентских данных",
    strategy: "Катализатор · Современные технологии",
    goal: "Сократить запуск продуктового эксперимента",
    metric: "Мигрированные витрины",
    linkedMetrics: ["Время запуска эксперимента"],
    target: "20 витрин",
    current: "11 витрин",
    status: "Приостановлена",
    tone: "red",
    progress: 55,
    owner: "Мария Орлова",
    team: "Data Platform",
    employees: ["Мария Орлова", "Сергей Ким", "Никита Лебедев", "Елена Петрова"],
    fte: 4,
    risks: [
      { id: "R-103", level: "high", name: "Окно миграции", description: "Не согласовано окно миграции" },
      { id: "R-104", level: "high", name: "Ресурс аналитики", description: "Недостаточно аналитического ресурса" },
      { id: "R-105", level: "medium", name: "Зависимость от платформы", description: "Зависимость от Data Platform" },
    ],
  },
  {
    id: "IN-245",
    title: "Расширение продуктовой линейки ЦФА",
    strategy: "Активное вовлечение конечного клиента",
    goal: "Сформировать продуктовое предложение ЦФА",
    metric: "Количество доступных продуктов",
    linkedMetrics: ["Конверсия в целевое действие"],
    target: "4 продукта",
    current: "4 продукта",
    status: "Завершена",
    tone: "green",
    progress: 100,
    owner: "Илья Волков",
    team: "ЦФА и цифровые активы",
    employees: ["Илья Волков", "Ольга Морозова"],
    fte: 2,
    risks: [],
  },
  {
    id: "IN-251",
    title: "Пилот технологической интеграции с ЕАЭС",
    strategy: "Международный доступ",
    goal: "Построить технологический линк с ЕАЭС",
    metric: "Пройденные этапы интеграции",
    linkedMetrics: ["Доступность сервиса"],
    target: "5 этапов",
    current: "1 этап",
    status: "Не начато",
    tone: "yellow",
    progress: 20,
    owner: "Дмитрий Соколов",
    team: "Международная интеграция",
    employees: ["Дмитрий Соколов", "Никита Лебедев", "Елена Петрова"],
    fte: 3,
    risks: [
      { id: "R-106", level: "high", name: "Требования участника", description: "Не согласованы требования внешнего участника" },
      { id: "R-107", level: "low", name: "Календарный план", description: "Возможна корректировка календарного плана" },
    ],
  },
]

const strategicMetrics: MetricItem[] = [
  { id: "M-101", name: "Активные пользователи терминала", strategy: "Активное вовлечение конечного клиента", goal: "Увеличить регулярное использование терминала", plan: "50 тыс.", fact: "52,4 тыс.", progress: 105, status: "green", trend: "+22%", initiatives: 1, source: "DWH" },
  { id: "M-102", name: "Конверсия в целевое действие", strategy: "Активное вовлечение конечного клиента", goal: "Повысить конверсию в целевое действие", plan: "18%", fact: "16,3%", progress: 91, status: "yellow", trend: "+2,2 п.п.", initiatives: 2, source: "Вручную" },
  { id: "M-103", name: "Время запуска эксперимента", strategy: "Современные технологии", goal: "Сократить запуск продуктового эксперимента", plan: "7 дней", fact: "9 дней", progress: 78, status: "red", trend: "−17%", initiatives: 1, source: "BI-витрина" },
  { id: "M-104", name: "Доступность сервиса", strategy: "Современные технологии", goal: "Повысить надежность клиентских сервисов", plan: "99,95%", fact: "99,97%", progress: 100, status: "green", trend: "+0,06 п.п.", initiatives: 1, source: "Мониторинг" },
  { id: "M-105", name: "Новые эмитенты на платформе", strategy: "Развитие рынков капитала", goal: "Увеличить число активных эмитентов", plan: "24", fact: "18", progress: 75, status: "yellow", trend: "+4", initiatives: 0, source: "Вручную" },
  { id: "M-106", name: "Доля автоматизированных операций", strategy: "Современные технологии", goal: "Снизить операционную нагрузку", plan: "65%", fact: "58%", progress: 89, status: "yellow", trend: "+8 п.п.", initiatives: 0, source: "DWH" },
]

const reviewSections = ["Обзор", "Вопросы и решения"]

const workspaceData = {
  "Вопросы и решения": {
    eyebrow: "Повестка QBR",
    title: "Вопросы и решения",
    description: "До встречи команда регистрирует риски, сложности и ограничения, а на QBR по каждому вопросу фиксирует решение.",
    button: "Добавить вопрос",
    items: [
      { title: "Дефицит аналитического ресурса", meta: "Вопрос · Цель «Повысить конверсию»", value: "Открыт", label: "статус вопроса", tone: "red", details: ["Риск: замедление продуктовых экспериментов", "Нужно решить: выделить 0,5 FTE", "Решение: ожидает QBR"] },
      { title: "Задержка миграции витрины данных", meta: "Вопрос · Инициатива IN-229", value: "На контроле", label: "статус вопроса", tone: "yellow", details: ["Ограничение: зависимость от Data Platform", "Предложение: поэтапная поставка", "Решение: подтвердить этапность на QBR"] },
      { title: "Приоритет автоматизации операций", meta: "Вопрос · Продуктовый комитет", value: "Решено", label: "статус вопроса", tone: "green", details: ["Сложность: конкуренция за ресурс разработки", "Решение: приоритет P1", "Владелец решения: директор продукта"] },
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
    <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white shadow-sm">
      <button onClick={() => onChange(index - 1)} disabled={index === 0} className="grid size-11 place-items-center rounded-l-xl text-slate-600 transition hover:bg-slate-50 disabled:opacity-30" aria-label="Предыдущий квартал"><ChevronLeft className="size-5" /></button>
      <div className="grid h-full min-w-[148px] place-items-center border-x border-slate-200 px-4 text-center text-sm font-semibold text-slate-900">{quarters[index].short}</div>
      <button onClick={() => onChange(index + 1)} disabled={index === quarters.length - 1} className="grid size-11 place-items-center rounded-r-xl text-slate-600 transition hover:bg-slate-50 disabled:opacity-30" aria-label="Следующий квартал"><ChevronRight className="size-5" /></button>
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
          {[{ n: "1", title: "Стратегия компании", note: "3 направления и катализаторы" }, { n: "2", title: "Цели и метрики", note: "измеримые результаты" }, { n: "3", title: "Инициативы квартала", note: "работы, прогресс и статусы" }].map((step, i) => (
            <div key={step.n} className="contents">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"><span className="grid size-7 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">{step.n}</span><div><p className="text-sm font-semibold text-slate-900">{step.title}</p><p className="mt-0.5 text-xs text-slate-500">{step.note}</p></div></div>
              {i < 2 && <ArrowRight className="mx-auto hidden size-4 text-slate-300 md:block" />}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {strategyDirections.map((direction) => (
          <article key={direction.number} className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4"><span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${direction.accent}`}>{direction.number}</span></div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">{direction.title}</h3>
              <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-600">{direction.description}</p>
            </div>
            <div className="border-y border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><Target className="size-3.5" /> Цели и метрики</div>
              <div className="mt-3 space-y-2">{direction.okrs.map((okr) => <div key={okr.metric} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs"><span className="text-slate-600">{okr.metric}</span><span className="font-semibold text-slate-950">{okr.target}</span></div>)}</div>
            </div>
            <div className="mt-auto min-h-[190px] p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><Rocket className="size-3.5" /> Инициативы квартала</div>
              <div className="mt-4 flex items-center justify-between"><div><p className="text-2xl font-semibold tracking-tight text-slate-950">{direction.initiatives.length}</p><p className="mt-0.5 text-xs text-slate-500">инициативы</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><AlertTriangle className="size-3.5" /> Есть риски</span></div>
              <div className="mt-4"><div className="flex items-center justify-between text-xs"><span className="font-medium text-slate-600">Средний прогресс</span><span className="font-semibold text-slate-900">{direction.averageProgress}%</span></div><Progress value={direction.averageProgress} className="mt-2 h-1.5 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-800" /></div>
              <Button onClick={onOpenInitiatives} variant="ghost" size="sm" className="mt-3 px-0 text-slate-700">Открыть инициативы <ArrowRight /></Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

function RiskCounters({ risks }: { risks: InitiativeRisk[] }) {
  const levels: { key: RiskLevel; label: string; className: string }[] = [
    { key: "high", label: "Высокий", className: "bg-rose-100 text-rose-700 ring-rose-300" },
    { key: "medium", label: "Средний", className: "bg-amber-100 text-amber-700 ring-amber-300" },
    { key: "low", label: "Низкий", className: "bg-emerald-100 text-emerald-700 ring-emerald-300" },
  ]
  const active = levels.map((level) => ({ ...level, count: risks.filter((risk) => risk.level === level.key).length })).filter((level) => level.count > 0)
  if (!active.length) return <span className="grid size-7 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200" title="Рисков нет">0</span>
  return <div className="flex flex-wrap gap-1.5">{active.map((level) => <span key={level.key} className={`grid size-7 place-items-center rounded-full text-xs font-bold ring-1 ring-inset ${level.className}`} title={`${level.label}: ${level.count}`} aria-label={`${level.label}: ${level.count}`}>{level.count}</span>)}</div>
}

function InitiativesTable({ items, editable = false, onRemove, onEditFte, onAddRisk, onStatusChange, onEditOwnerTeam }: { items: InitiativeItem[]; editable?: boolean; onRemove?: (id: string) => void; onEditFte?: (id: string) => void; onAddRisk?: (id: string) => void; onStatusChange?: (id: string, status: string) => void; onEditOwnerTeam?: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table className={`table-fixed ${editable ? "min-w-[1260px]" : "min-w-[1160px]"}`}>
        <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="w-[180px] pl-5 text-xs text-slate-500">Инициатива</TableHead><TableHead className="w-[165px] text-xs text-slate-500">Стратегия</TableHead><TableHead className="w-[180px] text-xs text-slate-500">Ключевая метрика</TableHead><TableHead className="w-[125px] text-xs text-slate-500">Статус</TableHead><TableHead className="w-[105px] text-xs text-slate-500">Прогресс</TableHead><TableHead className="w-[105px] text-xs text-slate-500">Риски</TableHead><TableHead className="w-[105px] text-xs text-slate-500">FTE</TableHead><TableHead className="w-[165px] pr-5 text-xs text-slate-500">Владелец / команда</TableHead>{editable && <TableHead className="w-[115px] pr-5 text-right text-xs text-slate-500">Действия</TableHead>}</TableRow></TableHeader>
        <TableBody>{items.map((item) => <TableRow key={item.id} className="border-slate-100 align-top"><TableCell className="whitespace-normal break-words py-4 pl-5"><p className="font-medium leading-5 text-slate-950">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.id}</p></TableCell><TableCell className="whitespace-normal break-words"><p className="text-xs font-medium leading-5 text-slate-700">{item.goal}</p></TableCell><TableCell className="whitespace-normal break-words"><div className="space-y-1">{item.linkedMetrics.map((metric) => <p key={metric} className="text-xs font-medium leading-4 text-slate-700">{metric}</p>)}</div><p className="mt-2 text-xs leading-4 text-slate-400">Цель: {item.target}<br />Сейчас: {item.current}</p></TableCell><TableCell>{editable ? <Select value={item.status} onValueChange={(value) => onStatusChange?.(item.id, value)}><SelectTrigger size="sm" className="w-full text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Не начато">Не начато</SelectItem><SelectItem value="В работе">В работе</SelectItem><SelectItem value="Приостановлена">Приостановлена</SelectItem><SelectItem value="Завершена">Завершена</SelectItem></SelectContent></Select> : <StatusPill label={item.status} tone={item.tone} />}</TableCell><TableCell><div className="flex items-center gap-2"><Progress value={item.progress} className="h-1.5 w-12 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-800" /><span className="text-xs font-semibold text-slate-700">{item.progress}%</span></div></TableCell><TableCell><div className="flex items-center gap-1.5"><RiskCounters risks={item.risks} />{editable && <Button onClick={() => onAddRisk?.(item.id)} variant="ghost" size="icon-sm" className="size-7 text-slate-500" aria-label="Добавить риск"><Plus className="size-3.5" /></Button>}</div></TableCell><TableCell><div className="flex items-center gap-1"><span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{item.fte.toFixed(1).replace(".", ",")}</span>{editable && <Button onClick={() => onEditFte?.(item.id)} variant="ghost" size="icon-sm" className="size-7 text-slate-500" aria-label="Изменить состав"><Pencil className="size-3.5" /></Button>}</div></TableCell><TableCell className="whitespace-normal break-words pr-5"><div className="flex items-start gap-1"><div><p className="text-xs font-medium leading-5 text-slate-700">{item.owner}</p><p className="mt-1 text-xs leading-4 text-slate-400">{item.team}</p></div>{editable && <Button onClick={() => onEditOwnerTeam?.(item.id)} variant="ghost" size="icon-sm" className="size-7 text-slate-500" aria-label="Изменить владельца и команду"><Pencil className="size-3.5" /></Button>}</div></TableCell>{editable && <TableCell className="pr-5 text-right"><Button onClick={() => onRemove?.(item.id)} variant="ghost" size="icon-sm" className="text-slate-400 hover:text-rose-600" aria-label="Удалить инициативу из QBR"><Trash2 className="size-4" /></Button></TableCell>}</TableRow>)}</TableBody>
      </Table>
    </div>
  )
}

function InitiativesPage({ quarterIndex, items, setItems, metricCatalog, teams }: { quarterIndex: number; items: InitiativeItem[]; setItems: (items: InitiativeItem[]) => void; metricCatalog: MetricItem[]; teams: TeamItem[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")
  const [goalDraft, setGoalDraft] = useState("")
  const [metricsDraft, setMetricsDraft] = useState<string[]>([])
  const [ownerDraft, setOwnerDraft] = useState("")
  const [teamDraft, setTeamDraft] = useState("")
  const [fteDraft, setFteDraft] = useState("0")
  const [goalFilter, setGoalFilter] = useState("all")
  const [metricFilter, setMetricFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [teamFilter, setTeamFilter] = useState("all")
  const owners = Array.from(new Set(teams.flatMap((team) => team.employees.map((employee) => employee.name))))
  const filteredItems = items.filter((item) => (goalFilter === "all" || item.goal === goalFilter) && (metricFilter === "all" || item.linkedMetrics.includes(metricFilter)) && (statusFilter === "all" || item.status === statusFilter) && (ownerFilter === "all" || item.owner === ownerFilter) && (teamFilter === "all" || item.team === teamFilter))
  const averageProgress = Math.round(items.reduce((sum, item) => sum + item.progress, 0) / Math.max(items.length, 1))
  const totalFte = items.reduce((sum, item) => sum + item.fte, 0)
  const addInitiative = () => {
    const team = teams.find((item) => item.name === teamDraft)
    if (!titleDraft.trim() || !goalDraft || !metricsDraft.length || !ownerDraft || !team) return
    const firstMetric = metricCatalog.find((metric) => metric.name === metricsDraft[0])
    setItems([...items, { id: `IN-${260 + items.length}`, title: titleDraft.trim(), strategy: firstMetric?.strategy ?? "Стратегия компании", goal: goalDraft, metric: metricsDraft.join(", "), linkedMetrics: metricsDraft, target: "—", current: "—", status: "Не начато", tone: "slate", progress: 0, owner: ownerDraft, team: team.name, employees: team.employees.map((employee) => employee.name), fte: Number(fteDraft.replace(",", ".")) || 0, risks: [] }])
    setDialogOpen(false); setTitleDraft(""); setGoalDraft(""); setMetricsDraft([]); setOwnerDraft(""); setTeamDraft(""); setFteDraft("0")
  }
  return (
    <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Rocket} label="Инициативы квартала" value={`${items.length}`} note="3 связаны с бизнес-направлениями" tone="blue" />
        <StatCard icon={Gauge} label="Средний прогресс" value={`${averageProgress}%`} note={quarters[quarterIndex].phase} tone="amber" />
        <StatCard icon={AlertTriangle} label="Приостановлено" value="1" note="есть два высоких риска" tone="red" />
        <StatCard icon={BriefcaseBusiness} label="Загрузка ресурсов" value={`${totalFte} FTE`} note="по составу инициатив" tone="violet" />
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-950">Портфель инициатив</h2><p className="mt-0.5 text-xs text-slate-500">Стратегия → цель → ключевые метрики → инициатива</p></div><Button onClick={() => setDialogOpen(true)} size="sm" className="bg-[#ef3e42] text-white hover:bg-[#d92f34]"><Plus />Добавить инициативу</Button></div>
        <div className="grid gap-2 border-b border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-2 xl:grid-cols-5">{[{ value: goalFilter, set: setGoalFilter, label: "Стратегическая цель", options: strategicGoals }, { value: metricFilter, set: setMetricFilter, label: "Метрика", options: metricCatalog.map((metric) => metric.name) }, { value: statusFilter, set: setStatusFilter, label: "Статус", options: ["Не начато", "В работе", "Приостановлена", "Завершена"] }, { value: ownerFilter, set: setOwnerFilter, label: "Владелец", options: owners }, { value: teamFilter, set: setTeamFilter, label: "Команда", options: teams.map((team) => team.name) }].map((filter) => <Select key={filter.label} value={filter.value} onValueChange={filter.set}><SelectTrigger className="w-full bg-white text-xs"><SelectValue placeholder={filter.label} /></SelectTrigger><SelectContent><SelectItem value="all">Все · {filter.label}</SelectItem>{filter.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>)}</div>
        <InitiativesTable items={filteredItems} />
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Новая инициатива</DialogTitle><DialogDescription>Свяжите инициативу со стратегической целью, метриками и ответственной командой.</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="initiative-title">Название инициативы</Label><Input id="initiative-title" value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} placeholder="Например: Автоматизация проверки эмитентов" /></div><div className="space-y-2 sm:col-span-2"><Label>Стратегическая цель</Label><Select value={goalDraft} onValueChange={setGoalDraft}><SelectTrigger className="w-full"><SelectValue placeholder="Выберите одну цель" /></SelectTrigger><SelectContent>{strategicGoals.map((goal) => <SelectItem key={goal} value={goal}>{goal}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2 sm:col-span-2"><Label>Стратегические метрики</Label><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="w-full justify-between font-normal">{metricsDraft.length ? `Выбрано: ${metricsDraft.length}` : "Выберите одну или несколько метрик"}<ChevronRight className="size-4 rotate-90" /></Button></DropdownMenuTrigger><DropdownMenuContent className="w-[420px] max-w-[calc(100vw-2rem)]">{metricCatalog.map((metric) => <DropdownMenuCheckboxItem key={metric.id} checked={metricsDraft.includes(metric.name)} onCheckedChange={(checked) => setMetricsDraft(checked ? [...metricsDraft, metric.name] : metricsDraft.filter((item) => item !== metric.name))} onSelect={(event) => event.preventDefault()}>{metric.name}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>{metricsDraft.length > 0 && <div className="flex flex-wrap gap-1.5">{metricsDraft.map((metric) => <span key={metric} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">{metric}</span>)}</div>}</div><div className="space-y-2"><Label>Команда</Label><Select value={teamDraft} onValueChange={(value) => { const team = teams.find((item) => item.name === value); setTeamDraft(value); setFteDraft(String(team?.employees.length ?? 0)); if (team && !team.employees.some((employee) => employee.name === ownerDraft)) setOwnerDraft(team.employees[0]?.name ?? "") }}><SelectTrigger className="w-full"><SelectValue placeholder="Выберите команду" /></SelectTrigger><SelectContent>{teams.map((team) => <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Владелец</Label><Select value={ownerDraft} onValueChange={setOwnerDraft}><SelectTrigger className="w-full"><SelectValue placeholder="Выберите владельца" /></SelectTrigger><SelectContent>{owners.map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="initiative-fte">FTE</Label><Input id="initiative-fte" inputMode="decimal" value={fteDraft} onChange={(event) => setFteDraft(event.target.value)} /><p className="text-xs text-slate-500">Заполнено по числу сотрудников команды, можно изменить.</p></div></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={addInitiative} disabled={!titleDraft.trim() || !goalDraft || !metricsDraft.length || !ownerDraft || !teamDraft}>Добавить инициативу</Button></DialogFooter></DialogContent></Dialog>
    </main>
  )
}

function MetricsPage({ items, setItems }: { items: MetricItem[]; setItems: (items: MetricItem[]) => void }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState("")
  const [goalDraft, setGoalDraft] = useState("")
  const [valueDraft, setValueDraft] = useState("")
  const addMetric = () => {
    if (!nameDraft.trim() || !goalDraft || !valueDraft.trim()) return
    setItems([...items, { id: `M-${110 + items.length}`, name: nameDraft.trim(), strategy: "Стратегия компании", goal: goalDraft, plan: "—", fact: "—", progress: 0, status: "yellow", trend: "Новая", initiatives: 0, source: valueDraft.trim() }])
    setDialogOpen(false); setNameDraft(""); setGoalDraft(""); setValueDraft("")
  }
  return <main className="mx-auto w-full max-w-[1380px] p-4 md:p-7"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-base font-semibold text-slate-950">Справочник метрик</h2><p className="mt-1 text-xs text-slate-500">Метрики используются в стратегических целях, инициативах и квартальных обзорах.</p></div><Button onClick={() => setDialogOpen(true)} className="bg-[#ef3e42] text-white hover:bg-[#d92f34]"><Plus />Добавить метрику</Button></div><Table><TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="w-[34%] pl-5 text-xs text-slate-500">Метрика</TableHead><TableHead className="w-[40%] text-xs text-slate-500">Стратегия</TableHead><TableHead className="pr-5 text-xs text-slate-500">Значение</TableHead></TableRow></TableHeader><TableBody>{items.map((metric) => <TableRow key={metric.id} className="border-slate-100"><TableCell className="py-4 pl-5"><p className="font-medium text-slate-900">{metric.name}</p><p className="mt-1 text-xs text-slate-400">{metric.id}</p></TableCell><TableCell><p className="text-sm font-medium text-slate-700">{metric.goal}</p><p className="mt-1 text-xs text-slate-400">{metric.strategy}</p></TableCell><TableCell className="pr-5"><span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700"><Database className="size-3.5" />{metric.source}</span></TableCell></TableRow>)}</TableBody></Table></section><Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>Добавить метрику</DialogTitle><DialogDescription>Создайте метрику и привяжите ее к стратегической цели.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="new-metric-name">Метрика</Label><Input id="new-metric-name" value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} placeholder="Название метрики" /></div><div className="space-y-2"><Label>Стратегия</Label><Select value={goalDraft} onValueChange={setGoalDraft}><SelectTrigger className="w-full"><SelectValue placeholder="Выберите стратегическую цель" /></SelectTrigger><SelectContent>{strategicGoals.map((goal) => <SelectItem key={goal} value={goal}>{goal}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="metric-value-source">Значение / источник</Label><Input id="metric-value-source" value={valueDraft} onChange={(event) => setValueDraft(event.target.value)} placeholder="API, AdHoc или ссылка на источник" /></div></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={addMetric} disabled={!nameDraft.trim() || !goalDraft || !valueDraft.trim()}>Добавить</Button></DialogFooter></DialogContent></Dialog></main>
}

function TeamsPage({ teams, setTeams }: { teams: TeamItem[]; setTeams: (teams: TeamItem[]) => void }) {
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [employeeTeamId, setEmployeeTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState("")
  const [department, setDepartment] = useState("")
  const [employeeName, setEmployeeName] = useState("")
  const [employeeRole, setEmployeeRole] = useState("")
  const [employeeEmail, setEmployeeEmail] = useState("")
  const addTeam = () => { if (!teamName.trim() || !department.trim()) return; setTeams([...teams, { id: `T-${Date.now()}`, name: teamName.trim(), department: department.trim(), employees: [] }]); setTeamDialogOpen(false); setTeamName(""); setDepartment("") }
  const addEmployee = () => { if (!employeeTeamId || !employeeName.trim() || !employeeRole.trim() || !employeeEmail.trim()) return; setTeams(teams.map((team) => team.id === employeeTeamId ? { ...team, employees: [...team.employees, { id: `E-${Date.now()}`, name: employeeName.trim(), role: employeeRole.trim(), email: employeeEmail.trim() }] } : team)); setEmployeeTeamId(null); setEmployeeName(""); setEmployeeRole(""); setEmployeeEmail("") }
  const selectedTeam = teams.find((team) => team.id === employeeTeamId)
  return <main className="mx-auto w-full max-w-[1280px] p-4 md:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-slate-950">Команды и сотрудники</h2><p className="mt-1 text-sm text-slate-500">Справочник используется для назначения владельцев и расчета FTE инициатив.</p></div><div className="flex gap-2"><Button disabled variant="outline"><Upload />Импорт из AD</Button><Button onClick={() => setTeamDialogOpen(true)} className="bg-[#ef3e42] text-white hover:bg-[#d92f34]"><Plus />Добавить команду</Button></div></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{teams.map((team) => <section key={team.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><Building2 className="size-5" /></div><div><h3 className="font-semibold text-slate-900">{team.name}</h3><p className="mt-0.5 text-xs text-slate-500">{team.department} · {team.employees.length} сотрудников</p></div></div><Button onClick={() => setEmployeeTeamId(team.id)} variant="outline" size="sm"><UserPlus />Добавить сотрудника</Button></div><div className="divide-y divide-slate-100">{team.employees.length ? team.employees.map((employee) => <div key={employee.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_1fr] sm:items-center"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{employee.name.split(" ").map((part) => part[0]).join("")}</span><div><p className="text-sm font-medium text-slate-800">{employee.name}</p><p className="mt-0.5 text-xs text-slate-500">{employee.role}</p></div></div><p className="text-xs text-slate-500 sm:text-right">{employee.email}</p></div>) : <p className="p-5 text-center text-sm text-slate-400">Сотрудники еще не добавлены</p>}</div></section>)}</div><Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}><DialogContent><DialogHeader><DialogTitle>Добавить команду</DialogTitle><DialogDescription>Создайте команду в организационном справочнике.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="team-name">Название команды</Label><Input id="team-name" value={teamName} onChange={(event) => setTeamName(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="team-department">Подразделение</Label><Input id="team-department" value={department} onChange={(event) => setDepartment(event.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={() => setTeamDialogOpen(false)}>Отмена</Button><Button onClick={addTeam} disabled={!teamName.trim() || !department.trim()}>Добавить команду</Button></DialogFooter></DialogContent></Dialog><Dialog open={Boolean(employeeTeamId)} onOpenChange={(open) => !open && setEmployeeTeamId(null)}><DialogContent><DialogHeader><DialogTitle>Добавить сотрудника</DialogTitle><DialogDescription>Команда: {selectedTeam?.name}</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="employee-name">Имя</Label><Input id="employee-name" value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="employee-role">Должность</Label><Input id="employee-role" value={employeeRole} onChange={(event) => setEmployeeRole(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="employee-email">Email</Label><Input id="employee-email" type="email" value={employeeEmail} onChange={(event) => setEmployeeEmail(event.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={() => setEmployeeTeamId(null)}>Отмена</Button><Button onClick={addEmployee} disabled={!employeeName.trim() || !employeeRole.trim() || !employeeEmail.trim()}>Добавить сотрудника</Button></DialogFooter></DialogContent></Dialog></main>
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

function MetricsTable({ items, initiatives: linkedInitiatives, editable, onPlanChange, onFactChange, onSourceChange, onRemove }: { items: MetricItem[]; initiatives: InitiativeItem[]; editable: boolean; onPlanChange: (id: string, value: string) => void; onFactChange: (id: string, value: string) => void; onSourceChange: (id: string, value: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table className={`table-fixed ${editable ? "min-w-[1140px]" : "min-w-[980px]"}`}>
        <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="w-[220px] pl-5 text-xs text-slate-500">Метрика</TableHead><TableHead className="w-[210px] text-xs text-slate-500">Стратегическая цель</TableHead><TableHead className="w-[125px] text-xs text-slate-500">Цель</TableHead><TableHead className="w-[135px] text-xs text-slate-500">Факт</TableHead><TableHead className="w-[150px] text-xs text-slate-500">Источник</TableHead><TableHead className="w-[105px] text-xs text-slate-500">Риски</TableHead><TableHead className="w-[145px] pr-5 text-xs text-slate-500">Выполнение</TableHead>{editable && <TableHead className="w-[70px] pr-5 text-right text-xs text-slate-500">Удалить</TableHead>}</TableRow></TableHeader>
        <TableBody>{items.map((metric) => {
          const inheritedRisks = linkedInitiatives.filter((initiative) => initiative.linkedMetrics.includes(metric.name)).flatMap((initiative) => initiative.risks)
          return <TableRow key={metric.id} className="border-slate-100 align-top"><TableCell className="whitespace-normal py-3.5 pl-5"><div className="flex items-start gap-3"><StatusDot status={metric.status} /><div><p className="font-medium leading-5 text-slate-900">{metric.name}</p><p className="mt-1 text-xs text-slate-400">{linkedInitiatives.filter((initiative) => initiative.linkedMetrics.includes(metric.name)).length} инициативы</p></div></div></TableCell><TableCell className="whitespace-normal text-xs leading-5 text-slate-600"><p className="font-medium text-slate-700">{metric.goal}</p><p className="mt-1 text-slate-400">{metric.strategy}</p></TableCell><TableCell>{editable ? <Input value={metric.plan} onChange={(event) => onPlanChange(metric.id, event.target.value)} className="h-8 text-xs" aria-label={`Целевое значение ${metric.name}`} /> : <span className="text-sm font-semibold text-slate-900">{metric.plan}</span>}</TableCell><TableCell>{editable ? <Input value={metric.fact} onChange={(event) => onFactChange(metric.id, event.target.value)} className="h-8 text-xs" aria-label={`Фактическое значение ${metric.name}`} /> : <div><p className="font-semibold text-slate-950">{metric.fact}</p><p className="mt-1 text-xs font-medium text-emerald-600">{metric.trend}</p></div>}</TableCell><TableCell>{editable ? <Select value={metric.source} onValueChange={(value) => onSourceChange(metric.id, value)}><SelectTrigger size="sm" className="w-full text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Вручную">Вручную</SelectItem><SelectItem value="DWH">DWH</SelectItem><SelectItem value="BI-витрина">BI-витрина</SelectItem><SelectItem value="Мониторинг">Мониторинг</SelectItem><SelectItem value="Файл AdHoc">Файл AdHoc</SelectItem></SelectContent></Select> : <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"><Database className="size-3.5" />{metric.source}</span>}</TableCell><TableCell><RiskCounters risks={inheritedRisks} /></TableCell><TableCell className="pr-5"><div className="flex items-center gap-2"><Progress value={Math.min(metric.progress, 100)} className="h-1.5 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-800" /><span className="w-9 text-right text-xs font-semibold text-slate-700">{metric.progress}%</span></div></TableCell>{editable && <TableCell className="pr-5 text-right"><Button onClick={() => onRemove(metric.id)} variant="ghost" size="icon-sm" className="text-slate-400 hover:text-rose-600" aria-label="Удалить метрику из QBR"><Trash2 className="size-4" /></Button></TableCell>}</TableRow>
        })}</TableBody>
      </Table>
    </div>
  )
}

function QbrPeriodOverview({ quarterIndex, metricItems, initiativeItems, qbrInitiativeIds }: { quarterIndex: number; metricItems: MetricItem[]; initiativeItems: InitiativeItem[]; qbrInitiativeIds: string[] }) {
  const quarter = quarters[quarterIndex]
  const selectedInitiatives = initiativeItems.filter((initiative) => qbrInitiativeIds.includes(initiative.id))
  const unlinkedMetrics = metricItems.filter((metric) => !selectedInitiatives.some((initiative) => initiative.linkedMetrics.includes(metric.name)))
  const unlinkedInitiatives = selectedInitiatives.filter((initiative) => !initiative.linkedMetrics.length)
  const connectivity = Math.max(0, 100 - unlinkedMetrics.length * 12 - unlinkedInitiatives.length * 10 - metricItems.filter((metric) => metric.source === "Вручную").length * 6)
  return <main className="mx-auto w-full max-w-[1480px] px-4 pt-5 md:px-7"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="relative border-b border-slate-100 p-5 md:p-6"><div className="absolute inset-y-0 left-0 w-1 bg-violet-500" /><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-tight text-slate-950">AI-обзор периода</h2><div className="mt-2 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><CircleDot className="size-3.5" /> Требует внимания</span><span className="text-xs text-slate-400">{quarter.phase}</span></div></div><Button variant="outline"><RefreshCw className="size-4 text-violet-600" />Обновить AI-оценку</Button></div><h3 className="mt-5 text-xl font-semibold text-slate-950">Команда ускорила рост, но не достигла целевой конверсии</h3><p className="mt-2 text-sm leading-6 text-slate-600">Рост использования терминала опережает план. Основной фокус QBR — снять ограничения по миграции данных, улучшить связность метрик с инициативами и зафиксировать решения по аналитическому ресурсу.</p></div><div className="grid lg:grid-cols-3"><div className="bg-slate-50/70 p-5 md:p-6"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Готовность к ревью</p><span className="text-lg font-bold text-slate-950">{quarter.completion}%</span></div><Progress value={quarter.completion} className="mt-3 h-2 bg-slate-200 [&_[data-slot=progress-indicator]]:bg-[#ef3e42]" /><div className="mt-4 space-y-2 text-xs"><span className="flex items-center gap-1.5 text-emerald-700"><Check className="size-3.5" /> Метрики обновлены</span><span className="flex items-center gap-1.5 text-emerald-700"><Check className="size-3.5" /> Достижения заполнены</span><span className="flex items-center gap-1.5 text-amber-700"><AlertTriangle className="size-3.5" /> 2 замечания AI</span></div></div><div className="border-t border-slate-200 p-5 lg:border-l lg:border-t-0 md:p-6"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Оценка связности</p><span className="text-lg font-bold text-violet-700">{connectivity}%</span></div><Progress value={connectivity} className="mt-3 h-2 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-violet-600" /><div className="mt-4 space-y-2 text-xs text-slate-600">{unlinkedMetrics.slice(0, 2).map((metric) => <p key={metric.id} className="flex gap-2"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" /><span><b>{metric.name}</b> — нет связанной инициативы</span></p>)}{metricItems.filter((metric) => metric.source === "Вручную").slice(0, 1).map((metric) => <p key={metric.id} className="flex gap-2"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" /><span><b>{metric.name}</b> — источник данных не подключен</span></p>)}</div></div><div className="border-t border-slate-200 p-5 lg:border-l lg:border-t-0 md:p-6"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Влияние на стратегические цели</p><span className="text-lg font-bold text-blue-700">74%</span></div><Progress value={74} className="mt-3 h-2 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-blue-600" /><div className="mt-4 space-y-2 text-xs text-slate-600"><p className="flex gap-2"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />3 стратегические цели поддержаны инициативами</p><p className="flex gap-2"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />Международный доступ пока имеет низкий вклад</p></div></div></div></section></main>
}

function QbrOverview({ mode, metricItems, setMetricItems, metricCatalog, initiativeItems, setInitiativeItems, qbrInitiativeIds, setQbrInitiativeIds, teams, onOpenInitiatives }: { quarterIndex?: number; mode: string; metricItems: MetricItem[]; setMetricItems: (items: MetricItem[]) => void; metricCatalog: MetricItem[]; initiativeItems: InitiativeItem[]; setInitiativeItems: (items: InitiativeItem[]) => void; qbrInitiativeIds: string[]; setQbrInitiativeIds: (ids: string[]) => void; teams: TeamItem[]; onOpenInitiatives: () => void }) {
  const editable = mode === "Подготовка"
  const selectedInitiatives = initiativeItems.filter((initiative) => qbrInitiativeIds.includes(initiative.id))
  const availableMetrics = metricCatalog.filter((metric) => !metricItems.some((item) => item.id === metric.id))
  const availableInitiatives = initiativeItems.filter((initiative) => !qbrInitiativeIds.includes(initiative.id))
  const [metricDialogOpen, setMetricDialogOpen] = useState(false)
  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false)
  const [peopleInitiativeId, setPeopleInitiativeId] = useState<string | null>(null)
  const [riskInitiativeId, setRiskInitiativeId] = useState<string | null>(null)
  const [ownerTeamInitiativeId, setOwnerTeamInitiativeId] = useState<string | null>(null)
  const [metricDraftId, setMetricDraftId] = useState("")
  const [metricTargetDraft, setMetricTargetDraft] = useState("")
  const [metricFactDraft, setMetricFactDraft] = useState("")
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("medium")
  const [riskName, setRiskName] = useState("")
  const [riskDescription, setRiskDescription] = useState("")
  const [ownerEditDraft, setOwnerEditDraft] = useState("")
  const [teamEditDraft, setTeamEditDraft] = useState("")
  const employeeDirectory = Array.from(new Set(teams.flatMap((team) => team.employees.map((employee) => employee.name))))

  const updateMetric = (id: string, patch: Partial<MetricItem>) => setMetricItems(metricItems.map((metric) => metric.id === id ? { ...metric, ...patch } : metric))
  const addMetric = () => {
    const catalogMetric = metricCatalog.find((metric) => metric.id === metricDraftId)
    if (!catalogMetric) return
    setMetricItems([...metricItems, { ...catalogMetric, plan: metricTargetDraft || catalogMetric.plan, fact: metricFactDraft || catalogMetric.fact }])
    setMetricDialogOpen(false)
    setMetricDraftId("")
  }
  const toggleEmployee = (initiativeId: string, employee: string) => setInitiativeItems(initiativeItems.map((initiative) => { if (initiative.id !== initiativeId) return initiative; const employees = initiative.employees.includes(employee) ? initiative.employees.filter((person) => person !== employee) : [...initiative.employees, employee]; return { ...initiative, employees, fte: employees.length } }))
  const addRisk = () => {
    if (!riskInitiativeId || !riskName.trim() || !riskDescription.trim()) return
    setInitiativeItems(initiativeItems.map((initiative) => initiative.id !== riskInitiativeId ? initiative : { ...initiative, risks: [...initiative.risks, { id: `R-${Date.now()}`, level: riskLevel, name: riskName.trim(), description: riskDescription.trim() }] }))
    setRiskInitiativeId(null)
    setRiskName("")
    setRiskDescription("")
    setRiskLevel("medium")
  }
  const peopleInitiative = initiativeItems.find((initiative) => initiative.id === peopleInitiativeId)
  const riskInitiative = initiativeItems.find((initiative) => initiative.id === riskInitiativeId)
  const ownerTeamInitiative = initiativeItems.find((initiative) => initiative.id === ownerTeamInitiativeId)
  return (
    <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={Target} label="Цели и метрики" value={`${metricItems.length}`} note="включено в QBR" tone="blue" /><StatCard icon={Rocket} label="Инициативы" value={`${selectedInitiatives.length}`} note="включено в QBR" tone="amber" /><StatCard icon={BriefcaseBusiness} label="Ресурс инициатив" value={`${selectedInitiatives.reduce((sum, item) => sum + item.fte, 0)} FTE`} note="по составу команд" tone="violet" /><StatCard icon={ListChecks} label="Открытые вопросы" value="3" note="требуют решений на QBR" tone="red" /></section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-semibold text-slate-950">Цели и метрики</h3><p className="mt-0.5 text-xs text-slate-500">Карточки показывают результат и инициативы, которые обеспечивают достижение цели</p></div>{editable ? <Button onClick={() => setMetricDialogOpen(true)} size="sm" className="bg-slate-950 text-white hover:bg-slate-800"><Plus />Добавить метрику</Button> : <Button variant="ghost" size="sm" className="text-slate-600">Все цели <ArrowRight /></Button>}</div><div className="grid gap-4 bg-slate-50/50 p-4 xl:grid-cols-2">{metricItems.map((metric) => { const linked = selectedInitiatives.filter((initiative) => initiative.linkedMetrics.includes(metric.name)); const inheritedRisks = linked.flatMap((initiative) => initiative.risks); return <article key={metric.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><StatusDot status={metric.status} /><div><h4 className="font-semibold leading-5 text-slate-950">{metric.name}</h4><p className="mt-1 text-xs leading-5 text-slate-500">{metric.goal}</p></div></div><RiskCounters risks={inheritedRisks} /></div><div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Связанные инициативы</p><div className="mt-2 flex flex-wrap gap-1.5">{linked.length ? linked.map((initiative) => <span key={initiative.id} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">{initiative.id} · {initiative.title}</span>) : <span className="text-xs text-amber-700">Нет связанных инициатив</span>}</div></div><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-xs text-slate-500">Целевое значение</p>{editable ? <Input value={metric.plan} onChange={(event) => updateMetric(metric.id, { plan: event.target.value })} className="mt-1 h-8" /> : <p className="mt-1 text-lg font-semibold text-slate-950">{metric.plan}</p>}</div><div><p className="text-xs text-slate-500">Фактическое значение</p>{editable ? <Input value={metric.fact} onChange={(event) => updateMetric(metric.id, { fact: event.target.value })} className="mt-1 h-8" /> : <p className="mt-1 text-lg font-semibold text-slate-950">{metric.fact}</p>}</div></div><div className="mt-4 flex items-center gap-3"><Progress value={Math.min(metric.progress, 100)} className="h-2 flex-1 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-900" /><span className="text-sm font-semibold text-slate-700">{metric.progress}%</span></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">{editable ? <Select value={metric.source} onValueChange={(value) => updateMetric(metric.id, { source: value })}><SelectTrigger size="sm" className="w-[160px] text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Вручную">Вручную</SelectItem><SelectItem value="DWH">DWH</SelectItem><SelectItem value="BI-витрина">BI-витрина</SelectItem><SelectItem value="Мониторинг">Мониторинг</SelectItem><SelectItem value="Файл AdHoc">Файл AdHoc</SelectItem></SelectContent></Select> : <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Database className="size-3.5" />{metric.source}</span>}{editable && <Button onClick={() => setMetricItems(metricItems.filter((item) => item.id !== metric.id))} variant="ghost" size="icon-sm" className="text-slate-400 hover:text-rose-600"><Trash2 className="size-4" /></Button>}</div></article> })}</div></section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><div className="flex items-center gap-2"><Rocket className="size-4 text-[#ef3e42]" /><h3 className="text-sm font-semibold text-slate-950">Инициативы квартала</h3></div><p className="mt-1 text-xs text-slate-500">Стратегия, ключевая метрика, статус, риски и состав команды</p></div>{editable ? <Button onClick={() => setInitiativeDialogOpen(true)} size="sm" className="bg-slate-950 text-white hover:bg-slate-800"><Plus />Добавить из портфеля</Button> : <Button onClick={onOpenInitiatives} variant="outline" size="sm">Открыть портфель <ArrowRight /></Button>}</div><InitiativesTable items={selectedInitiatives} editable={editable} onRemove={(id) => setQbrInitiativeIds(qbrInitiativeIds.filter((item) => item !== id))} onEditFte={setPeopleInitiativeId} onAddRisk={setRiskInitiativeId} onStatusChange={(id, status) => setInitiativeItems(initiativeItems.map((initiative) => initiative.id === id ? { ...initiative, status, tone: status === "Завершена" ? "green" : status === "Приостановлена" ? "red" : status === "В работе" ? "blue" : "yellow", progress: status === "Завершена" ? 100 : initiative.progress } : initiative))} onEditOwnerTeam={(id) => { const initiative = initiativeItems.find((item) => item.id === id); setOwnerTeamInitiativeId(id); setOwnerEditDraft(initiative?.owner ?? ""); setTeamEditDraft(initiative?.team ?? "") }} /></section>

      <div className="mt-5 grid gap-5 lg:grid-cols-3"><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" /><h3 className="text-sm font-semibold">Главные достижения</h3></div><p className="mt-4 text-sm leading-6 text-slate-600">Новый онбординг повысил конверсию первого шага на 12%; доступность достигла 99,97%.</p></section><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Flag className="size-4 text-rose-600" /><h3 className="text-sm font-semibold">Вопросы к QBR</h3></div><p className="mt-4 text-sm leading-6 text-slate-600">Зависимость от Data Platform и дефицит аналитического ресурса требуют обсуждения на встрече.</p></section><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Lightbulb className="size-4 text-violet-600" /><h3 className="text-sm font-semibold">Зафиксированные решения</h3></div><p className="mt-4 text-sm leading-6 text-slate-600">Автоматизация получила приоритет P1; решение по дополнительному аналитику ожидает QBR.</p></section></div>

      <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Добавить целевую метрику</DialogTitle><DialogDescription>Выберите метрику из стратегического справочника и задайте значения для текущего квартала.</DialogDescription></DialogHeader>
          <div className="space-y-4"><div className="space-y-2"><Label>Стратегическая метрика</Label><Select value={metricDraftId} onValueChange={(value) => { const metric = metricCatalog.find((item) => item.id === value); setMetricDraftId(value); setMetricTargetDraft(metric?.plan ?? ""); setMetricFactDraft(metric?.fact ?? "") }}><SelectTrigger className="w-full"><SelectValue placeholder="Выберите метрику" /></SelectTrigger><SelectContent>{availableMetrics.map((metric) => <SelectItem key={metric.id} value={metric.id}>{metric.name}</SelectItem>)}</SelectContent></Select></div>{metricDraftId && (() => { const metric = metricCatalog.find((item) => item.id === metricDraftId); return metric ? <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-800">Стратегическая цель:</span> {metric.goal}<br /><span className="font-semibold text-slate-800">Направление:</span> {metric.strategy}</div> : null })()}<div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="metric-target">Целевое значение</Label><Input id="metric-target" value={metricTargetDraft} onChange={(event) => setMetricTargetDraft(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="metric-fact">Фактическое значение</Label><Input id="metric-fact" value={metricFactDraft} onChange={(event) => setMetricFactDraft(event.target.value)} /></div></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setMetricDialogOpen(false)}>Отмена</Button><Button onClick={addMetric} disabled={!metricDraftId}>Добавить в QBR</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={initiativeDialogOpen} onOpenChange={setInitiativeDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Добавить инициативу в QBR</DialogTitle><DialogDescription>Выберите инициативы из портфеля текущего квартала.</DialogDescription></DialogHeader>
          <div className="max-h-[420px] space-y-2 overflow-y-auto">{availableInitiatives.length ? availableInitiatives.map((initiative) => <div key={initiative.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">{initiative.title}</p><p className="mt-1 text-xs text-slate-500">{initiative.id} · {initiative.goal}</p></div><Button onClick={() => setQbrInitiativeIds([...qbrInitiativeIds, initiative.id])} variant="outline" size="sm"><Plus />Добавить</Button></div>) : <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">Все инициативы портфеля уже добавлены в QBR.</div>}</div>
          <DialogFooter><Button onClick={() => setInitiativeDialogOpen(false)}>Готово</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(peopleInitiativeId)} onOpenChange={(open) => !open && setPeopleInitiativeId(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Состав и FTE инициативы</DialogTitle><DialogDescription>{peopleInitiative?.title}. Один добавленный сотрудник учитывается как 1,0 FTE в прототипе.</DialogDescription></DialogHeader>
          <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3"><span className="text-sm font-medium text-blue-900">Текущий ресурс</span><span className="text-lg font-bold text-blue-800">{peopleInitiative?.fte.toFixed(1).replace(".", ",") ?? "0,0"} FTE</span></div>
          <div className="grid max-h-[390px] gap-2 overflow-y-auto sm:grid-cols-2">{employeeDirectory.map((employee) => { const selected = peopleInitiative?.employees.includes(employee); return <button key={employee} onClick={() => peopleInitiativeId && toggleEmployee(peopleInitiativeId, employee)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selected ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}><span className={`grid size-8 place-items-center rounded-full text-xs font-semibold ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{employee.split(" ").map((part) => part[0]).join("")}</span><span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{employee}</span><span className={`text-xs font-semibold ${selected ? "text-rose-600" : "text-blue-700"}`}>{selected ? "Удалить" : "Добавить"}</span></button>})}</div>
          <DialogFooter><Button onClick={() => setPeopleInitiativeId(null)}>Готово</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(riskInitiativeId)} onOpenChange={(open) => !open && setRiskInitiativeId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Добавить риск</DialogTitle><DialogDescription>{riskInitiative?.title}. Укажите уровень и кратко опишите влияние на результат.</DialogDescription></DialogHeader>
          <div className="space-y-4"><div className="space-y-2"><Label htmlFor="risk-name">Имя риска</Label><Input id="risk-name" value={riskName} onChange={(event) => setRiskName(event.target.value)} placeholder="Например: Задержка поставки данных" /></div><div className="space-y-2"><Label>Уровень риска</Label><Select value={riskLevel} onValueChange={(value) => setRiskLevel(value as RiskLevel)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Низкий</SelectItem><SelectItem value="medium">Средний</SelectItem><SelectItem value="high">Высокий</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="risk-description">Описание риска</Label><Textarea id="risk-description" value={riskDescription} onChange={(event) => setRiskDescription(event.target.value)} placeholder="Опишите влияние риска на результат и срок" rows={4} /></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setRiskInitiativeId(null)}>Отмена</Button><Button onClick={addRisk} disabled={!riskName.trim() || !riskDescription.trim()}><ShieldAlert />Добавить риск</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(ownerTeamInitiativeId)} onOpenChange={(open) => !open && setOwnerTeamInitiativeId(null)}><DialogContent><DialogHeader><DialogTitle>Владелец и команда</DialogTitle><DialogDescription>{ownerTeamInitiative?.title}. При смене команды состав и FTE обновятся по справочнику.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>Команда</Label><Select value={teamEditDraft} onValueChange={(value) => { const team = teams.find((item) => item.name === value); setTeamEditDraft(value); if (team && !team.employees.some((employee) => employee.name === ownerEditDraft)) setOwnerEditDraft(team.employees[0]?.name ?? "") }}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{teams.map((team) => <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Владелец</Label><Select value={ownerEditDraft} onValueChange={setOwnerEditDraft}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{(teams.find((team) => team.name === teamEditDraft)?.employees ?? teams.flatMap((team) => team.employees)).map((employee) => <SelectItem key={employee.id} value={employee.name}>{employee.name} · {employee.role}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setOwnerTeamInitiativeId(null)}>Отмена</Button><Button onClick={() => { const team = teams.find((item) => item.name === teamEditDraft); if (!ownerTeamInitiativeId || !team || !ownerEditDraft) return; setInitiativeItems(initiativeItems.map((initiative) => initiative.id === ownerTeamInitiativeId ? { ...initiative, owner: ownerEditDraft, team: team.name, employees: team.employees.map((employee) => employee.name), fte: team.employees.length } : initiative)); setOwnerTeamInitiativeId(null) }}>Сохранить</Button></DialogFooter></DialogContent></Dialog>
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
  const [metricCatalog, setMetricCatalog] = useState<MetricItem[]>(() => strategicMetrics.map((metric) => ({ ...metric })))
  const [metricItems, setMetricItems] = useState<MetricItem[]>(() => strategicMetrics.slice(0, 4).map((metric) => ({ ...metric })))
  const [teams, setTeams] = useState<TeamItem[]>(() => initialTeams.map((team) => ({ ...team, employees: team.employees.map((employee) => ({ ...employee })) })))
  const [initiativeItems, setInitiativeItems] = useState<InitiativeItem[]>(() => initiatives.map((initiative) => ({ ...initiative, employees: [...initiative.employees], risks: initiative.risks.map((risk) => ({ ...risk })) })))
  const [qbrInitiativeIds, setQbrInitiativeIds] = useState<string[]>(() => initiatives.slice(0, 4).map((initiative) => initiative.id))
  const quarter = quarters[quarterIndex]

  const pageTitle = globalPage === "Стратегия" ? "Стратегия Группы Московская Биржа" : globalPage === "Метрики" ? "Стратегические метрики" : globalPage === "Инициативы" ? "Портфель инициатив" : globalPage === "Мои QBR" ? "Цифровые сервисы" : globalPage
  const pageSubtitle = globalPage === "Стратегия" ? "Стратегия 2028 → цели и метрики → квартальные инициативы" : globalPage === "Инициативы" ? `${quarter.label} · ${initiativeItems.length} инициатив` : globalPage === "Мои QBR" ? `Квартальный обзор · ${quarter.label}` : "Рабочее пространство"

  return (
    <SidebarProvider>
      <Sidebar className="border-r-0 bg-[#111827] text-white" collapsible="icon">
        <SidebarHeader className="border-b border-white/10 px-3 py-4"><div className="flex h-9 items-center gap-3 px-1"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#ef3e42] text-sm font-bold text-white">Q</div><div className="min-w-0 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-semibold tracking-tight">QBR Tool</p><p className="truncate text-[10px] uppercase tracking-[0.16em] text-slate-400">Strategy & review</p></div></div></SidebarHeader>
        <SidebarContent className="bg-[#111827]"><SidebarGroup><SidebarGroupLabel className="text-slate-500">Управление результатами</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{navItems.map(({ label, icon: Icon }) => <SidebarMenuItem key={label}><SidebarMenuButton onClick={() => setGlobalPage(label)} isActive={globalPage === label} tooltip={label} className="h-10 text-slate-300 hover:bg-white/8 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:text-white"><Icon /><span>{label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup><SidebarGroup><SidebarGroupLabel className="text-slate-500">Доступные мне QBR</SidebarGroupLabel><SidebarGroupContent><SidebarMenu className="gap-2">{[{ name: "Цифровые сервисы", owner: "Алексей Иванов", period: quarter.short, readiness: quarter.completion, color: "bg-amber-400" }, { name: "Регистрация и онбординг", owner: "Ольга Морозова", period: "III кв. 2026", readiness: 72, color: "bg-blue-400" }].map((review) => <SidebarMenuItem key={review.name}><SidebarMenuButton onClick={() => setGlobalPage("Мои QBR")} className="h-auto items-start rounded-xl border border-white/10 bg-white/5 p-3 text-white hover:bg-white/8"><span className={`mt-1 size-2 shrink-0 rounded-full ${review.color}`} /><span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><span className="block truncate text-xs font-medium">{review.name}</span><span className="mt-1 block truncate text-[10px] text-slate-400">Владелец: {review.owner}</span><span className="mt-2 flex items-center justify-between text-[10px] text-slate-400"><span>{review.period}</span><span>{review.readiness}%</span></span><span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-emerald-400" style={{ width: `${review.readiness}%` }} /></span></span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent>
        <SidebarFooter className="border-t border-white/10 bg-[#111827] p-3"><div className="flex items-center gap-3 rounded-xl p-1"><div className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-700 text-xs font-semibold">АИ</div><div className="min-w-0 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-medium text-white">Алексей Иванов</p><p className="truncate text-[11px] text-slate-400">Владелец продукта</p></div></div></SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#f5f7fa]">
        <header className="sticky top-0 z-20 flex min-h-[72px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:px-7"><div className="flex min-w-0 items-center gap-3"><SidebarTrigger className="md:hidden" />{(globalPage === "Мои QBR" || globalPage === "Инициативы") && <QuarterSwitcher index={quarterIndex} onChange={setQuarterIndex} />}<div className="hidden min-w-0 lg:block"><h1 className="truncate text-sm font-semibold text-slate-950 md:text-base">{pageTitle}</h1><p className="truncate text-xs text-slate-500">{pageSubtitle}</p></div></div><div className="flex shrink-0 items-center gap-2">{globalPage === "Стратегия" && <Button variant="outline" size="sm" asChild className="hidden sm:flex"><a href="https://www.moex.com/files/4g62xymgykeh5zb9r40newqv42" target="_blank" rel="noreferrer">Источник <ExternalLink /></a></Button>}</div></header>

        {globalPage === "Стратегия" && <StrategyPage onOpenInitiatives={() => setGlobalPage("Инициативы")} />}
        {globalPage === "Метрики" && <MetricsPage items={metricCatalog} setItems={setMetricCatalog} />}
        {globalPage === "Инициативы" && <InitiativesPage quarterIndex={quarterIndex} items={initiativeItems} setItems={setInitiativeItems} metricCatalog={metricCatalog} teams={teams} />}
        {globalPage === "Команды" && <TeamsPage teams={teams} setTeams={setTeams} />}
        {globalPage === "Мои QBR" && <><div className="border-b border-slate-200 bg-white px-4 py-3 md:px-7"><div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Этап квартального обзора</p><div className="flex items-center rounded-xl bg-slate-100 p-1">{["Подготовка", "Ревью", "Итоги"].map((item) => <button key={item} onClick={() => setMode(item)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${mode === item ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>{item}</button>)}</div></div></div><QbrPeriodOverview quarterIndex={quarterIndex} metricItems={metricItems} initiativeItems={initiativeItems} qbrInitiativeIds={qbrInitiativeIds} />{mode === "Подготовка" && <div className="mx-auto w-full max-w-[1480px] px-4 pt-4 md:px-7"><div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800"><Pencil className="size-4" /><span className="font-semibold">Режим подготовки:</span><span>добавляйте метрики и инициативы, обновляйте фактические значения, состав и риски.</span></div></div>}<Tabs value={activeSection} onValueChange={setActiveSection} className="gap-0"><div className="mx-auto w-full max-w-[1480px] px-4 pt-4 md:px-7"><TabsList className="h-12 rounded-xl bg-slate-900 p-1" aria-label="Разделы квартального обзора">{reviewSections.map((item) => <TabsTrigger key={item} value={item} className="h-10 min-w-[170px] rounded-lg px-5 text-sm font-medium text-slate-300 data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:text-slate-950">{item}</TabsTrigger>)}</TabsList></div>{activeSection === "Обзор" ? <QbrOverview quarterIndex={quarterIndex} mode={mode} metricItems={metricItems} setMetricItems={setMetricItems} metricCatalog={metricCatalog} initiativeItems={initiativeItems} setInitiativeItems={setInitiativeItems} qbrInitiativeIds={qbrInitiativeIds} setQbrInitiativeIds={setQbrInitiativeIds} teams={teams} onOpenInitiatives={() => setGlobalPage("Инициативы")} /> : <SectionWorkspace section={activeSection as keyof typeof workspaceData} />}</Tabs></>}
      </SidebarInset>
    </SidebarProvider>
  )
}

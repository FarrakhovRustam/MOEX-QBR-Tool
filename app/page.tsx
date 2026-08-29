"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Building2,
  ChartBar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDot,
  Database,
  Download,
  ExternalLink,
  FileDown,
  Flag,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Pencil,
  Plus,
  Rocket,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  UserPlus,
  Users,
  LogOut,
} from "lucide-react";
import { authService, isSupabaseConfigured, type AuthSession } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type GlobalPage =
  "Стратегия" | "Метрики" | "Инициативы" | "Команды" | "Мои QBR";
type StatusTone = "green" | "yellow" | "red" | "blue" | "slate";
type RiskLevel = "high" | "medium" | "low";
type InitiativeRisk = {
  id: string;
  level: RiskLevel;
  name: string;
  description: string;
};
type EmployeeItem = { id: string; name: string; role: string; email: string };
type TeamItem = {
  id: string;
  name: string;
  department: string;
  employees: EmployeeItem[];
};
type InitiativeItem = {
  id: string;
  title: string;
  strategy: string;
  goal: string;
  metric: string;
  linkedMetrics: string[];
  target: string;
  current: string;
  status: string;
  tone: StatusTone;
  progress: number;
  owner: string;
  team: string;
  employees: string[];
  fte: number;
  risks: InitiativeRisk[];
  trackerUrl?: string;
};
type MetricItem = {
  id: string;
  name: string;
  category: string;
  strategy: string;
  goal: string;
  plan: string;
  fact: string;
  direction: "increase" | "decrease";
  progress: number;
  status: "green" | "yellow" | "red";
  trend: string;
  initiatives: number;
  source: string;
  description: string;
};
type QbrQuestion = {
  id: string;
  title: string;
  question: string;
  decision: string;
};

type QbrSnapshot = {
  mode: string;
  metricItems: MetricItem[];
  initiativeItems: InitiativeItem[];
  initiativeIds: string[];
  questions: QbrQuestion[];
};

function parseNumericValue(value: string) {
  const normalized = value
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateProgress(
  target: string,
  actual: string,
  direction: "increase" | "decrease" = "increase",
) {
  const targetValue = parseNumericValue(target);
  const actualValue = parseNumericValue(actual);
  if (targetValue === null || actualValue === null || targetValue <= 0)
    return 0;
  if (direction === "decrease" && actualValue <= 0) return 0;
  return Math.max(
    0,
    Math.round(
      (direction === "decrease"
        ? targetValue / actualValue
        : actualValue / targetValue) * 100,
    ),
  );
}

function metricStatus(progress: number): MetricItem["status"] {
  if (progress >= 100) return "green";
  if (progress >= 85) return "yellow";
  return "red";
}

function recalculateMetric(metric: MetricItem): MetricItem {
  const progress = calculateProgress(
    metric.plan,
    metric.fact,
    metric.direction,
  );
  return { ...metric, progress, status: metricStatus(progress) };
}

function recalculateInitiative(initiative: InitiativeItem): InitiativeItem {
  return {
    ...initiative,
    progress: calculateProgress(initiative.target, initiative.current),
  };
}

function cloneInitiatives(items: InitiativeItem[]) {
  return items.map((item) => ({
    ...item,
    linkedMetrics: [...item.linkedMetrics],
    employees: [...item.employees],
    risks: item.risks.map((risk) => ({ ...risk })),
  }));
}

function cloneMetrics(items: MetricItem[]) {
  return items.map((item) => ({ ...item }));
}

function cloneQuestions(items: QbrQuestion[]) {
  return items.map((item) => ({ ...item }));
}

function russianCount(
  value: number,
  forms: [string, string, string],
) {
  const mod100 = value % 100;
  const mod10 = value % 10;
  if (mod100 >= 11 && mod100 <= 14) return `${value} ${forms[2]}`;
  if (mod10 === 1) return `${value} ${forms[0]}`;
  if (mod10 >= 2 && mod10 <= 4) return `${value} ${forms[1]}`;
  return `${value} ${forms[2]}`;
}

function calculateReviewReadiness(
  metricItems: MetricItem[],
  selectedInitiatives: InitiativeItem[],
  questions: QbrQuestion[],
) {
  const metricNames = new Set(metricItems.map((metric) => metric.name));
  const checks = [
    selectedInitiatives.length > 0,
    metricItems.length > 0,
    metricItems.every(
      (metric) =>
        parseNumericValue(metric.plan) !== null &&
        parseNumericValue(metric.fact) !== null,
    ),
    selectedInitiatives.every(
      (initiative) =>
        initiative.linkedMetrics.length > 0 &&
        initiative.linkedMetrics.every((name) => metricNames.has(name)),
    ),
    selectedInitiatives.every(
      (initiative) => initiative.owner && initiative.team && initiative.fte > 0,
    ),
    questions.length > 0,
    selectedInitiatives.every((initiative) => initiative.status !== "Пауза"),
  ];
  return Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );
}

const quarters = [
  {
    label: "II квартал 2026",
    short: "II кв. 2026",
    phase: "Итоги зафиксированы",
  },
  {
    label: "III квартал 2026",
    short: "III кв. 2026",
    phase: "Подготовка к ревью",
  },
  {
    label: "IV квартал 2026",
    short: "IV кв. 2026",
    phase: "Формирование планов",
  },
  {
    label: "I квартал 2027",
    short: "I кв. 2027",
    phase: "Плановый период",
  },
] as const;

const navItems: { label: GlobalPage; icon: typeof Target }[] = [
  { label: "Стратегия", icon: GitBranch },
  { label: "Метрики", icon: ChartBar },
  { label: "Команды", icon: Users },
  { label: "Инициативы", icon: Rocket },
  { label: "Мои QBR", icon: LayoutDashboard },
];

const strategyKpis = [
  { value: "13%+", label: "CAGR комиссионного дохода" },
  { value: "18%+", label: "RoE на протяжении стратегии" },
  { value: "65+ млрд ₽", label: "чистая прибыль к 2028 году" },
  { value: "50%+", label: "прибыли МСФО — дивиденды" },
  { value: "50–55%", label: "Cost-to-F&C Income Ratio к 2028 году" },
] as const;

const strategyDirections = [
  {
    number: "01",
    title: "Развитие рынков капитала",
    description:
      "Рост числа эмитентов и инструментов, повышение ликвидности и расширение ESG-предложения.",
    accent: "border-rose-200 bg-rose-50 text-rose-700",
    okrs: [
      { metric: "IPO / SPO", target: "≈10 в год" },
      { metric: "ОТС и инвестплатформы", target: "100+ имен" },
      { metric: "Новые эмиссии корп. облигаций", target: "+200%" },
    ],
    initiatives: [
      "Цифровой онбординг эмитентов",
      "Новая модель маркет-мейкинга",
      "Расширение линейки ESG-инструментов",
    ],
    averageProgress: 62,
  },
  {
    number: "02",
    title: "Активное вовлечение конечного клиента",
    description:
      "Развитие Финуслуг, ЦФА и данных, прямое взаимодействие с клиентом и персонализация сервисов.",
    accent: "border-violet-200 bg-violet-50 text-violet-700",
    okrs: [
      { metric: "Клиентская база Финуслуг", target: "×10" },
      { metric: "Продуктов на клиента", target: "+60%" },
      { metric: "Клиенты терминала Data", target: "1000+" },
    ],
    initiatives: [
      "AI-аналитика в терминале",
      "Персональный цифровой онбординг",
      "Продуктовая линейка ЦФА",
    ],
    averageProgress: 71,
  },
  {
    number: "03",
    title: "Международный доступ",
    description:
      "Связи с иностранными инвесторами, иностранные инструменты и технологическая интеграция с ЕАЭС.",
    accent: "border-blue-200 bg-blue-50 text-blue-700",
    okrs: [
      { metric: "Кросс-листинг ETF", target: "запуск" },
      { metric: "Интеграция с ЕАЭС", target: "пилот" },
      { metric: "Редомициляция", target: "поддержка" },
    ],
    initiatives: [
      "Пилот технологического линка ЕАЭС",
      "Контур иностранных инструментов",
      "Сервис сопровождения редомициляции",
    ],
    averageProgress: 38,
  },
] as const;

const initialTeams: TeamItem[] = [
  {
    id: "T-01",
    name: "AI-агенты",
    department: "Дирекция цифровых сервисов",
    employees: [
      {
        id: "E-01",
        name: "Анна Смирнова",
        role: "Владелец продукта",
        email: "a.smirnova@moex.ru",
      },
      {
        id: "E-02",
        name: "Елена Петрова",
        role: "ML-инженер",
        email: "e.petrova@moex.ru",
      },
      {
        id: "E-03",
        name: "Сергей Ким",
        role: "Системный аналитик",
        email: "s.kim@moex.ru",
      },
    ],
  },
  {
    id: "T-02",
    name: "Регистрация и онбординг",
    department: "Клиентские платформы",
    employees: [
      {
        id: "E-04",
        name: "Алексей Иванов",
        role: "Владелец продукта",
        email: "a.ivanov@moex.ru",
      },
      {
        id: "E-05",
        name: "Ольга Морозова",
        role: "Продуктовый аналитик",
        email: "o.morozova@moex.ru",
      },
    ],
  },
  {
    id: "T-03",
    name: "Data Platform",
    department: "Дирекция данных",
    employees: [
      {
        id: "E-06",
        name: "Мария Орлова",
        role: "Руководитель продукта",
        email: "m.orlova@moex.ru",
      },
      {
        id: "E-07",
        name: "Никита Лебедев",
        role: "Data Engineer",
        email: "n.lebedev@moex.ru",
      },
      {
        id: "E-08",
        name: "Павел Егоров",
        role: "Архитектор данных",
        email: "p.egorov@moex.ru",
      },
    ],
  },
  {
    id: "T-04",
    name: "ЦФА и цифровые активы",
    department: "Новые рынки",
    employees: [
      {
        id: "E-09",
        name: "Илья Волков",
        role: "Владелец продукта",
        email: "i.volkov@moex.ru",
      },
      {
        id: "E-10",
        name: "Татьяна Белова",
        role: "Бизнес-аналитик",
        email: "t.belova@moex.ru",
      },
    ],
  },
  {
    id: "T-05",
    name: "Международная интеграция",
    department: "Международный бизнес",
    employees: [
      {
        id: "E-11",
        name: "Дмитрий Соколов",
        role: "Руководитель продукта",
        email: "d.sokolov@moex.ru",
      },
      {
        id: "E-12",
        name: "Роман Федоров",
        role: "Интеграционный архитектор",
        email: "r.fedorov@moex.ru",
      },
    ],
  },
];

const strategicGoals = [
  "Увеличить регулярное использование терминала",
  "Повысить конверсию в целевое действие",
  "Сократить запуск продуктового эксперимента",
  "Сформировать продуктовое предложение ЦФА",
  "Построить технологический линк с ЕАЭС",
  "Увеличить число активных эмитентов",
  "Повысить надежность клиентских сервисов",
  "Снизить операционную нагрузку",
];

const initiatives: InitiativeItem[] = [
  {
    id: "IN-241",
    trackerUrl: "https://tracker.moex.example/IN-241",
    title: "AI-аналитика в торговом терминале",
    strategy: "Активное вовлечение конечного клиента",
    goal: "Увеличить регулярное использование терминала",
    metric: "Активные пользователи терминала",
    linkedMetrics: ["Активные пользователи терминала"],
    target: "10 сценариев",
    current: "7 сценариев",
    status: "В работе",
    tone: "blue",
    progress: 70,
    owner: "Анна Смирнова",
    team: "AI-агенты",
    employees: ["Анна Смирнова", "Елена Петрова", "Сергей Ким"],
    fte: 3,
    risks: [
      {
        id: "R-101",
        level: "medium",
        name: "Данные для модели",
        description: "Задержка поставки данных для рекомендательной модели",
      },
    ],
  },
  {
    id: "IN-237",
    trackerUrl: "https://tracker.moex.example/IN-237",
    title: "Персональный цифровой онбординг",
    strategy: "Активное вовлечение конечного клиента",
    goal: "Повысить конверсию в целевое действие",
    metric: "Конверсия в целевое действие",
    linkedMetrics: ["Конверсия в целевое действие"],
    target: "5 сценариев",
    current: "4 сценария",
    status: "В работе",
    tone: "blue",
    progress: 80,
    owner: "Алексей Иванов",
    team: "Регистрация и онбординг",
    employees: ["Алексей Иванов", "Ольга Морозова"],
    fte: 2,
    risks: [
      {
        id: "R-102",
        level: "low",
        name: "Согласование текстов",
        description: "Незначительная задержка согласования текстов",
      },
    ],
  },
  {
    id: "IN-229",
    trackerUrl: "https://tracker.moex.example/IN-229",
    title: "Миграция витрины клиентских данных",
    strategy: "Катализатор · Современные технологии",
    goal: "Сократить запуск продуктового эксперимента",
    metric: "Мигрированные витрины",
    linkedMetrics: ["Время запуска эксперимента"],
    target: "20 витрин",
    current: "11 витрин",
    status: "Пауза",
    tone: "red",
    progress: 55,
    owner: "Мария Орлова",
    team: "Data Platform",
    employees: [
      "Мария Орлова",
      "Сергей Ким",
      "Никита Лебедев",
      "Елена Петрова",
    ],
    fte: 4,
    risks: [
      {
        id: "R-103",
        level: "high",
        name: "Окно миграции",
        description: "Не согласовано окно миграции",
      },
      {
        id: "R-104",
        level: "high",
        name: "Ресурс аналитики",
        description: "Недостаточно аналитического ресурса",
      },
      {
        id: "R-105",
        level: "medium",
        name: "Зависимость от платформы",
        description: "Зависимость от Data Platform",
      },
    ],
  },
  {
    id: "IN-245",
    trackerUrl: "https://tracker.moex.example/IN-245",
    title: "Расширение продуктовой линейки ЦФА",
    strategy: "Активное вовлечение конечного клиента",
    goal: "Сформировать продуктовое предложение ЦФА",
    metric: "Количество доступных продуктов",
    linkedMetrics: ["Количество доступных продуктов ЦФА"],
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
    trackerUrl: "https://tracker.moex.example/IN-251",
    title: "Пилот технологической интеграции с ЕАЭС",
    strategy: "Международный доступ",
    goal: "Построить технологический линк с ЕАЭС",
    metric: "Пройденные этапы интеграции",
    linkedMetrics: ["Пройденные этапы интеграции"],
    target: "5 этапов",
    current: "1 этап",
    status: "Не начато",
    tone: "slate",
    progress: 20,
    owner: "Дмитрий Соколов",
    team: "Международная интеграция",
    employees: ["Дмитрий Соколов", "Никита Лебедев", "Елена Петрова"],
    fte: 3,
    risks: [
      {
        id: "R-106",
        level: "high",
        name: "Требования участника",
        description: "Не согласованы требования внешнего участника",
      },
      {
        id: "R-107",
        level: "low",
        name: "Календарный план",
        description: "Возможна корректировка календарного плана",
      },
    ],
  },
];

const strategicMetrics: MetricItem[] = [
  {
    id: "M-101",
    name: "Активные пользователи терминала",
    category: "Стратегическая",
    description:
      "Количество уникальных клиентов, регулярно использующих терминал.",
    strategy: "Активное вовлечение конечного клиента",
    goal: "Увеличить регулярное использование терминала",
    plan: "50 тыс.",
    fact: "52,4 тыс.",
    direction: "increase",
    progress: 105,
    status: "green",
    trend: "+22%",
    initiatives: 1,
    source: "DWH",
  },
  {
    id: "M-102",
    name: "Конверсия в целевое действие",
    category: "Операционная",
    description:
      "Доля пользователей, завершивших ключевое действие в цифровом сервисе.",
    strategy: "Активное вовлечение конечного клиента",
    goal: "Повысить конверсию в целевое действие",
    plan: "18%",
    fact: "16,3%",
    direction: "increase",
    progress: 91,
    status: "yellow",
    trend: "+2,2 п.п.",
    initiatives: 2,
    source: "Вручную",
  },
  {
    id: "M-103",
    name: "Время запуска эксперимента",
    category: "Операционная",
    description:
      "Среднее время от постановки гипотезы до запуска эксперимента.",
    strategy: "Современные технологии",
    goal: "Сократить запуск продуктового эксперимента",
    plan: "7 дней",
    fact: "9 дней",
    direction: "decrease",
    progress: 78,
    status: "red",
    trend: "−17%",
    initiatives: 1,
    source: "BI-витрина",
  },
  {
    id: "M-104",
    name: "Доступность сервиса",
    category: "Контрольная",
    description: "Доля времени штатной доступности клиентского сервиса.",
    strategy: "Современные технологии",
    goal: "Повысить надежность клиентских сервисов",
    plan: "99,95%",
    fact: "99,97%",
    direction: "increase",
    progress: 100,
    status: "green",
    trend: "+0,06 п.п.",
    initiatives: 1,
    source: "Мониторинг",
  },
  {
    id: "M-105",
    name: "Новые эмитенты на платформе",
    category: "Стратегическая",
    description: "Количество новых активных эмитентов, подключенных за период.",
    strategy: "Развитие рынков капитала",
    goal: "Увеличить число активных эмитентов",
    plan: "24",
    fact: "18",
    direction: "increase",
    progress: 75,
    status: "yellow",
    trend: "+4",
    initiatives: 0,
    source: "Вручную",
  },
  {
    id: "M-106",
    name: "Доля автоматизированных операций",
    category: "Операционная",
    description: "Доля операций, выполняемых без ручного участия сотрудников.",
    strategy: "Современные технологии",
    goal: "Снизить операционную нагрузку",
    plan: "65%",
    fact: "58%",
    direction: "increase",
    progress: 89,
    status: "yellow",
    trend: "+8 п.п.",
    initiatives: 0,
    source: "DWH",
  },
  {
    id: "M-107",
    name: "Количество доступных продуктов ЦФА",
    category: "Стратегическая",
    description: "Количество продуктов ЦФА, доступных клиентам на платформе.",
    strategy: "Активное вовлечение конечного клиента",
    goal: "Сформировать продуктовое предложение ЦФА",
    plan: "4 продукта",
    fact: "4 продукта",
    direction: "increase",
    progress: 100,
    status: "green",
    trend: "+2",
    initiatives: 1,
    source: "DWH",
  },
  {
    id: "M-108",
    name: "Пройденные этапы интеграции",
    category: "Операционная",
    description: "Количество завершенных этапов технологической интеграции.",
    strategy: "Международный доступ",
    goal: "Построить технологический линк с ЕАЭС",
    plan: "5 этапов",
    fact: "1 этап",
    direction: "increase",
    progress: 20,
    status: "red",
    trend: "",
    initiatives: 1,
    source: "Вручную",
  },
];

const workspaceData = {
  "Вопросы и решения": {
    eyebrow: "Повестка QBR",
    title: "Вопросы и решения",
    description:
      "До встречи команда регистрирует риски, сложности и ограничения, а на QBR по каждому вопросу фиксирует решение.",
    button: "Добавить вопрос",
    items: [
      {
        title: "Дефицит аналитического ресурса",
        meta: "Вопрос · Цель «Повысить конверсию»",
        value: "Открыт",
        label: "статус вопроса",
        tone: "red",
        details: [
          "Риск: замедление продуктовых экспериментов",
          "Нужно решить: выделить 0,5 FTE",
          "Решение: ожидает QBR",
        ],
      },
      {
        title: "Задержка миграции витрины данных",
        meta: "Вопрос · Инициатива IN-229",
        value: "На контроле",
        label: "статус вопроса",
        tone: "yellow",
        details: [
          "Ограничение: зависимость от Data Platform",
          "Предложение: поэтапная поставка",
          "Решение: подтвердить этапность на QBR",
        ],
      },
      {
        title: "Приоритет автоматизации операций",
        meta: "Вопрос · Продуктовый комитет",
        value: "Решено",
        label: "статус вопроса",
        tone: "green",
        details: [
          "Сложность: конкуренция за ресурс разработки",
          "Решение: приоритет P1",
          "Владелец решения: директор продукта",
        ],
      },
    ],
  },
} as const;

const initialQbrQuestions: QbrQuestion[] = [
  {
    id: "Q-101",
    title: "Дефицит аналитического ресурса",
    question:
      "Как закрыть дефицит 0,5 FTE аналитика для продуктовых экспериментов?",
    decision: "",
  },
  {
    id: "Q-102",
    title: "Задержка миграции витрины данных",
    question:
      "Подтверждаем ли поэтапную поставку витрин совместно с Data Platform?",
    decision: "",
  },
  {
    id: "Q-103",
    title: "Приоритет автоматизации операций",
    question: "Какой приоритет закрепить за автоматизацией в следующем цикле?",
    decision: "Автоматизация операций получает приоритет P1.",
  },
];

const statusStyles: Record<StatusTone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  yellow: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "green"
      ? "bg-emerald-500"
      : status === "yellow"
        ? "bg-amber-400"
        : "bg-rose-500";
  return (
    <span
      className={`mt-1.5 inline-block size-2.5 shrink-0 rounded-full ${color}`}
    />
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  note: string;
  tone: "blue" | "amber" | "red" | "violet";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{note}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </article>
  );
}

function QuarterSwitcher({
  index,
  onChange,
}: {
  index: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => onChange(index - 1)}
        disabled={index === 0}
        className="grid size-11 place-items-center rounded-l-xl text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
        aria-label="Предыдущий квартал"
      >
        <ChevronLeft className="size-5" />
      </button>
      <div className="grid h-full min-w-[148px] place-items-center border-x border-slate-200 px-4 text-center text-sm font-semibold text-slate-900">
        {quarters[index].short}
      </div>
      <button
        onClick={() => onChange(index + 1)}
        disabled={index === quarters.length - 1}
        className="grid size-11 place-items-center rounded-r-xl text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
        aria-label="Следующий квартал"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

function StrategyPage({
  onOpenInitiatives,
}: {
  onOpenInitiatives: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-[1380px] p-4 md:p-7">
      <section className="overflow-hidden rounded-3xl bg-[#111827] text-white">
        <div className="grid lg:grid-cols-[1.3fr_1fr]">
          <div className="relative p-6 md:p-9">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-[#ef3e42]" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Стратегия Группы Московская Биржа 2028
            </p>
            <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight md:text-4xl">
              Существенный рост капитализации при долгосрочной устойчивой
              прибыли
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Ключевая амбиция — выйти за пределы инфраструктурной роли,
              сохранив позицию драйвера развития российского финансового рынка.
            </p>
          </div>
          <div className="grid grid-cols-2 border-t border-white/10 bg-white/5 lg:border-l lg:border-t-0">
            {strategyKpis.map((kpi) => (
              <div
                key={kpi.label}
                className="border-b border-r border-white/10 p-5"
              >
                <p className="text-xl font-semibold text-white">{kpi.value}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
          {[
            {
              n: "1",
              title: "Стратегия компании",
              note: "3 направления и катализаторы",
            },
            { n: "2", title: "Цели и метрики", note: "измеримые результаты" },
            {
              n: "3",
              title: "Инициативы квартала",
              note: "работы, прогресс и статусы",
            },
          ].map((step, i) => (
            <div key={step.n} className="contents">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <span className="grid size-7 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                  {step.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{step.note}</p>
                </div>
              </div>
              {i < 2 && (
                <ArrowRight className="mx-auto hidden size-4 text-slate-300 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {strategyDirections.map((direction) => (
          <article
            key={direction.number}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${direction.accent}`}
                >
                  {direction.number}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">
                {direction.title}
              </h3>
              <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-600">
                {direction.description}
              </p>
            </div>
            <div className="min-h-[220px] border-y border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <Target className="size-3.5" /> Цели и метрики
              </div>
              <div className="mt-3 space-y-2">
                {direction.okrs.map((okr) => (
                  <div
                    key={okr.metric}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs"
                  >
                    <span className="text-slate-600">{okr.metric}</span>
                    <span className="font-semibold text-slate-950">
                      {okr.target}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto min-h-[190px] p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <Rocket className="size-3.5" /> Инициативы квартала
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-slate-950">
                    {direction.initiatives.length}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">инициативы</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <AlertTriangle className="size-3.5" /> Есть риски
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">
                    Средний прогресс
                  </span>
                  <span className="font-semibold text-slate-900">
                    {direction.averageProgress}%
                  </span>
                </div>
                <Progress
                  value={direction.averageProgress}
                  className="mt-2 h-1.5 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-800"
                />
              </div>
              <Button
                onClick={onOpenInitiatives}
                variant="ghost"
                size="sm"
                className="mt-3 px-0 text-slate-700"
              >
                Открыть инициативы <ArrowRight />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function RiskCounters({ risks }: { risks: InitiativeRisk[] }) {
  const high = risks.filter((risk) => risk.level === "high").length;
  const medium = risks.filter((risk) => risk.level === "medium").length;
  const low = risks.filter((risk) => risk.level === "low").length;
  const title = risks.length
    ? `Всего: ${risks.length}. Высоких: ${high}, средних: ${medium}, низких: ${low}`
    : "Рисков нет";
  return (
    <span
      className={`relative inline-grid size-8 shrink-0 place-items-center ${risks.length ? "text-rose-700" : "text-slate-500"}`}
      title={title}
      aria-label={title}
    >
      <AlertTriangle
        className={`absolute size-8 ${risks.length ? "fill-rose-100 text-rose-300" : "fill-slate-100 text-slate-300"}`}
      />
      <span className="relative mt-1 text-[10px] font-bold">
        {risks.length}
      </span>
    </span>
  );
}

function InitiativeRiskSummary({ risks }: { risks: InitiativeRisk[] }) {
  return <RiskCounters risks={risks} />;
}

function InitiativesTable({
  items,
  editable = false,
  onRemove,
  onEditFte,
  onAddRisk,
  onCurrentChange,
  onStatusChange,
  onEditOwnerTeam,
  onEdit,
}: {
  items: InitiativeItem[];
  editable?: boolean;
  onRemove?: (id: string) => void;
  onEditFte?: (id: string) => void;
  onAddRisk?: (id: string) => void;
  onCurrentChange?: (id: string, value: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onEditOwnerTeam?: (id: string) => void;
  onEdit?: (item: InitiativeItem) => void;
}) {
  const showActions = editable || Boolean(onEdit);
  return (
    <div className="overflow-x-auto">
      <Table
        className={`table-fixed ${showActions ? "min-w-[1260px]" : "min-w-[1160px]"}`}
      >
        <TableHeader>
          <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
            <TableHead className="w-[190px] pl-5 text-xs text-slate-600">
              Инициатива
            </TableHead>
            <TableHead className="w-[165px] text-xs text-slate-600">
              Стратегия
            </TableHead>
            <TableHead className="w-[165px] text-xs text-slate-600">
              Ключевая метрика
            </TableHead>
            <TableHead className="w-[125px] text-xs text-slate-600">
              Статус
            </TableHead>
            <TableHead className="w-[145px] text-xs text-slate-600">
              Прогресс инициативы
            </TableHead>
            <TableHead className="w-[95px] text-xs text-slate-600">
              Риски
            </TableHead>
            <TableHead className="w-[95px] text-xs text-slate-600">
              FTE
            </TableHead>
            <TableHead className="w-[165px] pr-5 text-xs text-slate-600">
              Владелец / команда
            </TableHead>
            {showActions && (
              <TableHead className="w-[110px] pr-5 text-right text-xs text-slate-600">
                Действия
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!items.length && (
            <TableRow>
              <TableCell
                colSpan={showActions ? 9 : 8}
                className="h-28 text-center text-sm text-slate-500"
              >
                Инициативы не найдены. Измените фильтры или добавьте инициативу.
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <TableRow key={item.id} className="border-slate-100 align-top">
              <TableCell className="whitespace-normal break-words py-4 pl-5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-medium leading-5 text-slate-950">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{item.id}</p>
                  </div>
                  {item.trackerUrl && (
                    <a
                      href={item.trackerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 shrink-0 rounded-md p-1 text-blue-600 hover:bg-blue-50"
                      aria-label="Открыть инициативу в трекере"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="whitespace-normal break-words">
                <p className="text-xs font-medium leading-5 text-slate-700">
                  {item.goal}
                </p>
              </TableCell>
              <TableCell className="whitespace-normal break-words">
                <div className="space-y-1">
                  {item.linkedMetrics.map((metric) => (
                    <p
                      key={metric}
                      className="text-xs font-medium leading-4 text-slate-700"
                    >
                      {metric}
                    </p>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {editable ? (
                  <Select
                    value={item.status}
                    onValueChange={(value) => onStatusChange?.(item.id, value)}
                  >
                    <SelectTrigger
                      size="sm"
                      className="w-full text-xs text-slate-800"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Не начато">Не начато</SelectItem>
                      <SelectItem value="В работе">В работе</SelectItem>
                      <SelectItem value="Пауза">Пауза</SelectItem>
                      <SelectItem value="Завершена">Завершена</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusPill label={item.status} tone={item.tone} />
                )}
              </TableCell>
              <TableCell>
                <div className="text-xs leading-4 text-slate-500">
                  <p>План: {item.target}</p>
                  {editable ? (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="shrink-0">Факт:</span>
                      <Input
                        value={item.current}
                        onChange={(event) =>
                          onCurrentChange?.(item.id, event.target.value)
                        }
                        className="h-8 min-w-0 bg-white px-2 text-xs font-medium text-slate-900"
                        aria-label={`Фактический прогресс ${item.title}`}
                      />
                    </div>
                  ) : (
                    <p className="mt-1">Факт: {item.current}</p>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress
                    value={Math.min(item.progress, 100)}
                    className="h-1.5 flex-1 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-800"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    {item.progress}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  {editable ? (
                    <RiskCounters risks={item.risks} />
                  ) : (
                    <InitiativeRiskSummary risks={item.risks} />
                  )}
                  {editable && (
                    <Button
                      onClick={() => onAddRisk?.(item.id)}
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-slate-500"
                      aria-label="Добавить риск"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                    {item.fte.toFixed(1).replace(".", ",")}
                  </span>
                  {editable && (
                    <Button
                      onClick={() => onEditFte?.(item.id)}
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-slate-500"
                      aria-label="Изменить состав"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="whitespace-normal break-words pr-5">
                <div className="flex items-start gap-1">
                  <div>
                    <p className="text-xs font-medium leading-5 text-slate-700">
                      {item.owner}
                    </p>
                    <p className="mt-1 text-xs leading-4 text-slate-400">
                      {item.team}
                    </p>
                  </div>
                  {editable && (
                    <Button
                      onClick={() => onEditOwnerTeam?.(item.id)}
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-slate-500"
                      aria-label="Изменить владельца и команду"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
              {showActions && (
                <TableCell className="pr-5 text-right">
                  <div className="flex justify-end gap-1">
                    {onEdit && (
                      <Button
                        onClick={() => onEdit(item)}
                        variant="ghost"
                        size="icon-sm"
                        className="text-slate-500 hover:text-blue-700"
                        aria-label="Редактировать инициативу"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    {editable && (
                      <Button
                        onClick={() => onRemove?.(item.id)}
                        variant="ghost"
                        size="icon-sm"
                        className="text-slate-400 hover:text-rose-600"
                        aria-label="Удалить инициативу из QBR"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InitiativesPage({
  items,
  setItems,
  metricCatalog,
  teams,
}: {
  items: InitiativeItem[];
  setItems: (items: InitiativeItem[]) => void;
  metricCatalog: MetricItem[];
  teams: TeamItem[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [goalDraft, setGoalDraft] = useState("");
  const [metricsDraft, setMetricsDraft] = useState<string[]>([]);
  const [ownerDraft, setOwnerDraft] = useState("");
  const [teamDraft, setTeamDraft] = useState("");
  const [fteDraft, setFteDraft] = useState("0");
  const [trackerDraft, setTrackerDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [goalFilter, setGoalFilter] = useState("all");
  const [metricFilter, setMetricFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const owners = Array.from(
    new Set(
      teams.flatMap((team) => team.employees.map((employee) => employee.name)),
    ),
  );
  const query = searchQuery.trim().toLowerCase();
  const filteredItems = items.filter(
    (item) =>
      (!query ||
        [item.title, item.id, item.owner, item.team].some((value) =>
          value.toLowerCase().includes(query),
        )) &&
      (goalFilter === "all" || item.goal === goalFilter) &&
      (metricFilter === "all" || item.linkedMetrics.includes(metricFilter)) &&
      (statusFilter === "all" || item.status === statusFilter) &&
      (ownerFilter === "all" || item.owner === ownerFilter) &&
      (teamFilter === "all" || item.team === teamFilter),
  );

  const resetDrafts = () => {
    setEditingId(null);
    setTitleDraft("");
    setGoalDraft("");
    setMetricsDraft([]);
    setOwnerDraft("");
    setTeamDraft("");
    setFteDraft("0");
    setTrackerDraft("");
  };
  const openCreate = () => {
    resetDrafts();
    setDialogOpen(true);
  };
  const openEdit = (item: InitiativeItem) => {
    setEditingId(item.id);
    setTitleDraft(item.title);
    setGoalDraft(item.goal);
    setMetricsDraft(item.linkedMetrics);
    setOwnerDraft(item.owner);
    setTeamDraft(item.team);
    setFteDraft(String(item.fte));
    setTrackerDraft(item.trackerUrl ?? "");
    setDialogOpen(true);
  };
  const saveInitiative = () => {
    const team = teams.find((item) => item.name === teamDraft);
    if (
      !titleDraft.trim() ||
      !goalDraft ||
      !metricsDraft.length ||
      !ownerDraft ||
      !team
    )
      return;
    const firstMetric = metricCatalog.find(
      (metric) => metric.name === metricsDraft[0],
    );
    const common = {
      title: titleDraft.trim(),
      strategy: firstMetric?.strategy ?? "Стратегия компании",
      goal: goalDraft,
      metric: metricsDraft.join(", "),
      linkedMetrics: metricsDraft,
      owner: ownerDraft,
      team: team.name,
      fte: Number(fteDraft.replace(",", ".")) || 0,
      trackerUrl: trackerDraft.trim() || undefined,
    };
    if (editingId) {
      setItems(
        items.map((item) =>
          item.id === editingId ? { ...item, ...common } : item,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          id: `IN-${260 + items.length}`,
          ...common,
          target: "—",
          current: "—",
          status: "Не начато",
          tone: "slate",
          progress: 0,
          employees: team.employees.map((employee) => employee.name),
          risks: [],
        },
      ]);
    }
    setDialogOpen(false);
    resetDrafts();
  };
  return (
    <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Портфель инициатив
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Работы, прогресс и статусы
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-slate-950 text-white hover:bg-slate-800"
          >
            <Plus />
            Добавить инициативу
          </Button>
        </div>
        <div className="border-b border-slate-100 bg-slate-50/70 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Быстрый поиск по инициативам"
              className="bg-white pl-9 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {[
              {
                value: goalFilter,
                set: setGoalFilter,
                label: "Стратегическая цель",
                options: strategicGoals,
              },
              {
                value: metricFilter,
                set: setMetricFilter,
                label: "Метрика",
                options: metricCatalog.map((metric) => metric.name),
              },
              {
                value: statusFilter,
                set: setStatusFilter,
                label: "Статус",
                options: ["Не начато", "В работе", "Пауза", "Завершена"],
              },
              {
                value: ownerFilter,
                set: setOwnerFilter,
                label: "Владелец",
                options: owners,
              },
              {
                value: teamFilter,
                set: setTeamFilter,
                label: "Команда",
                options: teams.map((team) => team.name),
              },
            ].map((filter) => (
              <Select
                key={filter.label}
                value={filter.value}
                onValueChange={filter.set}
              >
                <SelectTrigger className="w-full border-slate-300 bg-white text-xs font-medium text-slate-800">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все · {filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>
        <InitiativesTable items={filteredItems} onEdit={openEdit} />
      </section>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDrafts();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Редактировать инициативу" : "Новая инициатива"}
            </DialogTitle>
            <DialogDescription>
              Свяжите инициативу со стратегической целью, метриками и
              ответственной командой.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="initiative-title">Название инициативы</Label>
              <Input
                id="initiative-title"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                placeholder="Например: Автоматизация проверки эмитентов"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Цель</Label>
              <Select
                value={goalDraft}
                onValueChange={(value) => {
                  setGoalDraft(value);
                  setMetricsDraft((selected) =>
                    selected.filter((name) =>
                      metricCatalog.some(
                        (metric) =>
                          metric.name === name && metric.goal === value,
                      ),
                    ),
                  );
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите одну цель" />
                </SelectTrigger>
                <SelectContent>
                  {strategicGoals.map((goal) => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Метрики</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {metricsDraft.length
                      ? `Выбрано: ${metricsDraft.length}`
                      : "Выберите одну или несколько метрик"}
                    <ChevronRight className="size-4 rotate-90" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[420px] max-w-[calc(100vw-2rem)]">
                  {metricCatalog
                    .filter((metric) => metric.goal === goalDraft)
                    .map((metric) => (
                    <DropdownMenuCheckboxItem
                      key={metric.id}
                      checked={metricsDraft.includes(metric.name)}
                      onCheckedChange={(checked) =>
                        setMetricsDraft(
                          checked
                            ? [...metricsDraft, metric.name]
                            : metricsDraft.filter(
                                (item) => item !== metric.name,
                              ),
                        )
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      {metric.name}
                    </DropdownMenuCheckboxItem>
                    ))}
                  {!goalDraft && (
                    <p className="px-2 py-3 text-xs text-slate-500">
                      Сначала выберите цель.
                    </p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <Label>Команда</Label>
              <Select
                value={teamDraft}
                onValueChange={(value) => {
                  const team = teams.find((item) => item.name === value);
                  setTeamDraft(value);
                  setFteDraft(String(team?.employees.length ?? 0));
                  if (
                    team &&
                    !team.employees.some(
                      (employee) => employee.name === ownerDraft,
                    )
                  )
                    setOwnerDraft(team.employees[0]?.name ?? "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите команду" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.name}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Владелец</Label>
              <Select value={ownerDraft} onValueChange={setOwnerDraft}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите владельца" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner} value={owner}>
                      {owner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initiative-fte">FTE</Label>
              <Input
                id="initiative-fte"
                inputMode="decimal"
                value={fteDraft}
                onChange={(event) => setFteDraft(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initiative-tracker">Ссылка на трекер</Label>
              <Input
                id="initiative-tracker"
                type="url"
                value={trackerDraft}
                onChange={(event) => setTrackerDraft(event.target.value)}
                placeholder="https://tracker/IN-123"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={saveInitiative}
              disabled={
                !titleDraft.trim() ||
                !goalDraft ||
                !metricsDraft.length ||
                !ownerDraft ||
                !teamDraft
              }
            >
              {editingId ? "Сохранить изменения" : "Добавить инициативу"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function MetricsPage({
  items,
  setItems,
  onMetricRename,
}: {
  items: MetricItem[];
  setItems: (items: MetricItem[]) => void;
  onMetricRename: (previousName: string, nextName: string) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [categoryDraft, setCategoryDraft] = useState("Операционная");
  const [valueDraft, setValueDraft] = useState("");
  const [sourceMode, setSourceMode] = useState("manual");
  const [searchQuery, setSearchQuery] = useState("");
  const query = searchQuery.trim().toLowerCase();
  const duplicateName = items.some(
    (metric) =>
      metric.id !== editingId &&
      metric.name.trim().toLowerCase() === nameDraft.trim().toLowerCase(),
  );
  const filteredItems = items.filter(
    (metric) =>
      !query ||
      [metric.name, metric.description, metric.category, metric.source].some(
        (value) => value.toLowerCase().includes(query),
      ),
  );
  const resetDrafts = () => {
    setEditingId(null);
    setNameDraft("");
    setDescriptionDraft("");
    setCategoryDraft("Операционная");
    setValueDraft("");
    setSourceMode("manual");
  };
  const openCreate = () => {
    resetDrafts();
    setDialogOpen(true);
  };
  const openEdit = (metric: MetricItem) => {
    setEditingId(metric.id);
    setNameDraft(metric.name);
    setDescriptionDraft(metric.description);
    setCategoryDraft(metric.category);
    setValueDraft(metric.fact);
    setSourceMode(metric.source === "Вручную" ? "manual" : "integration");
    setDialogOpen(true);
  };
  const saveMetric = () => {
    if (
      !nameDraft.trim() ||
      !descriptionDraft.trim() ||
      duplicateName ||
      (sourceMode === "manual" && !valueDraft.trim())
    )
      return;
    if (editingId) {
      const previousMetric = items.find((metric) => metric.id === editingId);
      const nextName = nameDraft.trim();
      setItems(
        items.map((metric) =>
          metric.id === editingId
            ? recalculateMetric({
                ...metric,
                name: nextName,
                description: descriptionDraft.trim(),
                category: categoryDraft,
                fact: sourceMode === "manual" ? valueDraft.trim() : metric.fact,
                source: sourceMode === "manual" ? "Вручную" : metric.source,
              })
            : metric,
        ),
      );
      if (previousMetric && previousMetric.name !== nextName)
        onMetricRename(previousMetric.name, nextName);
    } else {
      setItems([
        ...items,
        {
          id: `M-${110 + items.length}`,
          name: nameDraft.trim(),
          description: descriptionDraft.trim(),
          category: categoryDraft,
          strategy: "",
          goal: nameDraft.trim(),
          plan: valueDraft.trim(),
          fact: valueDraft.trim(),
          direction: "increase",
          progress: 100,
          status: "green",
          trend: "",
          initiatives: 0,
          source: "Вручную",
        },
      ]);
    }
    setDialogOpen(false);
    resetDrafts();
  };
  return (
    <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Справочник метрик
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Единый каталог показателей для инициатив и квартальных обзоров.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-slate-950 text-white hover:bg-slate-800"
          >
            <Plus />
            Добавить метрику
          </Button>
        </div>
        <div className="border-b border-slate-100 bg-slate-50/70 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Быстрый поиск по метрикам"
              className="bg-white pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[1080px]">
            <TableHeader>
              <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                <TableHead className="w-[22%] pl-5 text-xs text-slate-600">
                  Метрика
                </TableHead>
                <TableHead className="w-[30%] text-xs text-slate-600">
                  Описание
                </TableHead>
                <TableHead className="w-[14%] text-xs text-slate-600">
                  Категория
                </TableHead>
                <TableHead className="w-[12%] text-xs text-slate-600">
                  Значение
                </TableHead>
                <TableHead className="w-[14%] text-xs text-slate-600">
                  Источник
                </TableHead>
                <TableHead className="w-[8%] pr-5 text-right text-xs text-slate-600">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((metric) => (
                <TableRow key={metric.id} className="border-slate-100">
                  <TableCell className="py-4 pl-5">
                    <p className="font-medium text-slate-900">{metric.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{metric.id}</p>
                  </TableCell>
                  <TableCell className="text-sm leading-6 text-slate-600">
                    {metric.description}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {metric.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-lg font-semibold text-slate-950">
                      {metric.fact}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                      <Database className="size-3.5" />
                      {metric.source}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button
                      onClick={() => openEdit(metric)}
                      variant="ghost"
                      size="icon-sm"
                      className="text-slate-500 hover:text-blue-700"
                      aria-label="Редактировать метрику"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDrafts();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Редактировать метрику" : "Добавить метрику"}
            </DialogTitle>
            <DialogDescription>
              Укажите название, описание, значение и способ получения данных.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-metric-name">Метрика</Label>
              <Input
                id="new-metric-name"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                placeholder="Название метрики"
              />
              {duplicateName && (
                <p className="text-xs text-rose-600">
                  Метрика с таким названием уже существует.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-metric-description">Описание</Label>
              <Textarea
                id="new-metric-description"
                value={descriptionDraft}
                onChange={(event) => setDescriptionDraft(event.target.value)}
                placeholder="Что измеряет показатель и как интерпретируется"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={categoryDraft} onValueChange={setCategoryDraft}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Стратегическая">Стратегическая</SelectItem>
                  <SelectItem value="Операционная">Операционная</SelectItem>
                  <SelectItem value="Контрольная">Контрольная</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Значение и источник</Label>
              <Tabs value={sourceMode} onValueChange={setSourceMode}>
                <TabsList className="grid h-10 w-full grid-cols-2">
                  <TabsTrigger value="manual">Ручной ввод</TabsTrigger>
                  <TabsTrigger value="integration">
                    SQL / DWH / ETL / API
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="mt-3">
                  <Input
                    value={valueDraft}
                    onChange={(event) => setValueDraft(event.target.value)}
                    placeholder="Например: 18%, 50 тыс. или 7 дней"
                  />
                </TabsContent>
                <TabsContent
                  value="integration"
                  className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500"
                >
                  Возможность добавить источник будет реализована в следующих
                  версиях QBR Tool.
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={saveMetric}
              disabled={
                !nameDraft.trim() ||
                !descriptionDraft.trim() ||
                duplicateName ||
                (!editingId && sourceMode !== "manual") ||
                (sourceMode === "manual" && !valueDraft.trim())
              }
            >
              {editingId ? "Сохранить изменения" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function TeamsPage({
  teams,
  setTeams,
}: {
  teams: TeamItem[];
  setTeams: (teams: TeamItem[]) => void;
}) {
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [employeeTeamId, setEmployeeTeamId] = useState<string | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const [teamName, setTeamName] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const addTeam = () => {
    if (!teamName.trim() || !department.trim()) return;
    setTeams([
      ...teams,
      {
        id: `T-${Date.now()}`,
        name: teamName.trim(),
        department: department.trim(),
        employees: [],
      },
    ]);
    setTeamDialogOpen(false);
    setTeamName("");
    setDepartment("");
  };
  const addEmployee = () => {
    if (
      !employeeTeamId ||
      !employeeName.trim() ||
      !employeeRole.trim() ||
      !employeeEmail.trim()
    )
      return;
    setTeams(
      teams.map((team) =>
        team.id === employeeTeamId
          ? {
              ...team,
              employees: [
                ...team.employees,
                {
                  id: `E-${Date.now()}`,
                  name: employeeName.trim(),
                  role: employeeRole.trim(),
                  email: employeeEmail.trim(),
                },
              ],
            }
          : team,
      ),
    );
    setEmployeeTeamId(null);
    setEmployeeName("");
    setEmployeeRole("");
    setEmployeeEmail("");
  };
  const selectedTeam = teams.find((team) => team.id === employeeTeamId);
  const toggleTeam = (id: string) =>
    setExpandedTeams(
      expandedTeams.includes(id)
        ? expandedTeams.filter((item) => item !== id)
        : [...expandedTeams, id],
    );
  return (
    <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            Команды и сотрудники
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Раскройте строку команды, чтобы посмотреть состав сотрудников.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setImportDialogOpen(true)}
            className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          >
            <Download />
            Импорт из LDAP-каталога
          </Button>
          <Button
            onClick={() => setTeamDialogOpen(true)}
            className="bg-slate-950 text-white hover:bg-slate-800"
          >
            <Plus />
            Добавить команду
          </Button>
        </div>
      </div>
      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="w-[32%] pl-5 text-xs text-slate-600">
                  Команда
                </TableHead>
                <TableHead className="w-[30%] text-xs text-slate-600">
                  Подразделение
                </TableHead>
                <TableHead className="w-[14%] text-center text-xs text-slate-600">
                  Сотрудников
                </TableHead>
                <TableHead className="w-[24%] pr-5 text-right text-xs text-slate-600">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <>
                  {
                    <TableRow
                      key={team.id}
                      onClick={() => toggleTeam(team.id)}
                      className="cursor-pointer border-slate-100 hover:bg-slate-50"
                    >
                      <TableCell className="py-5 pl-5">
                        <div className="flex items-center gap-3">
                          <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                            <Building2 className="size-5" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-950">
                              {team.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {team.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 text-sm text-slate-600">
                        {team.department}
                      </TableCell>
                      <TableCell className="py-5 text-center">
                        <span className="text-2xl font-semibold tracking-tight text-slate-950">
                          {team.employees.length}
                        </span>
                      </TableCell>
                      <TableCell className="py-5 pr-5">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              setEmployeeTeamId(team.id);
                            }}
                            size="sm"
                            className="bg-slate-950 text-white hover:bg-slate-800"
                          >
                            <UserPlus />
                            Добавить сотрудника
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={
                              expandedTeams.includes(team.id)
                                ? "Свернуть команду"
                                : "Развернуть команду"
                            }
                          >
                            {expandedTeams.includes(team.id) ? (
                              <ChevronUp className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  }
                  {expandedTeams.includes(team.id) && (
                    <TableRow
                      key={`${team.id}-employees`}
                      className="bg-slate-50/60 hover:bg-slate-50/60"
                    >
                      <TableCell colSpan={4} className="px-5 py-4">
                        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                          {team.employees.length ? (
                            team.employees.map((employee) => (
                              <div
                                key={employee.id}
                                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3"
                              >
                                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                                  {employee.name
                                    .split(" ")
                                    .map((part) => part[0])
                                    .join("")}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-800">
                                    {employee.name}
                                  </p>
                                  <p className="mt-0.5 truncate text-xs text-slate-500">
                                    {employee.role} · {employee.email}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">
                              Сотрудники еще не добавлены
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Импорт из LDAP-каталога</DialogTitle>
            <DialogDescription>
              Возможность импорта из LDAP-каталога
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-800">
            Подключение корпоративной службы каталогов будет реализовано в
            следующих версиях приложения.
          </div>
          <DialogFooter>
            <Button onClick={() => setImportDialogOpen(false)}>Понятно</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить команду</DialogTitle>
            <DialogDescription>
              Создайте команду в организационном справочнике.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Название команды</Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-department">Подразделение</Label>
              <Input
                id="team-department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={addTeam}
              disabled={!teamName.trim() || !department.trim()}
            >
              Добавить команду
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(employeeTeamId)}
        onOpenChange={(open) => !open && setEmployeeTeamId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить сотрудника</DialogTitle>
            <DialogDescription>Команда: {selectedTeam?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee-name">Имя</Label>
              <Input
                id="employee-name"
                value={employeeName}
                onChange={(event) => setEmployeeName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-role">Должность</Label>
              <Input
                id="employee-role"
                value={employeeRole}
                onChange={(event) => setEmployeeRole(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-email">Email</Label>
              <Input
                id="employee-email"
                type="email"
                value={employeeEmail}
                onChange={(event) => setEmployeeEmail(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmployeeTeamId(null)}>
              Отмена
            </Button>
            <Button
              onClick={addEmployee}
              disabled={
                !employeeName.trim() ||
                !employeeRole.trim() ||
                !employeeEmail.trim()
              }
              className="bg-slate-950 text-white hover:bg-slate-800"
            >
              Добавить сотрудника
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function SectionWorkspace({
  section,
}: {
  section: keyof typeof workspaceData;
}) {
  const data = workspaceData[section];
  const toneStyles = {
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-rose-50 text-rose-700",
    neutral: "bg-slate-100 text-slate-700",
  };
  return (
    <main className="mx-auto w-full max-w-[1180px] p-4 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ef3e42]">
            {data.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {data.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {data.description}
          </p>
        </div>
        <Button className="bg-slate-950 text-white hover:bg-slate-800">
          <Plus />
          {data.button}
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {data.items.map((item, index) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px]">
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-950">
                        {item.title}
                      </h3>
                      {"fte" in item && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                          {String(item.fte)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                  </div>
                </div>
                <div className="ml-12 mt-4 grid gap-2 md:grid-cols-3">
                  {item.details.map((detail) => (
                    <div
                      key={detail}
                      className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600"
                    >
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 lg:block lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <div
                  className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${toneStyles[item.tone]}`}
                >
                  {item.value}
                </div>
                <p className="mt-2 text-xs text-slate-500">{item.label}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 px-0 text-slate-600"
                >
                  Изменить <ArrowRight />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
        <div className="rounded-xl bg-white p-2.5 text-violet-700 shadow-sm">
          <Bot className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-violet-950">
            AI-помощник проверит качество раздела
          </p>
          <p className="mt-0.5 text-xs text-violet-700">
            Проверит связи со стратегией, метрики, ресурсы и подтверждение
            результатов.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden border-violet-200 bg-white text-violet-800 sm:flex"
        >
          Проверить раздел
        </Button>
      </div>
    </main>
  );
}

function MetricsTable({
  items,
  initiatives: linkedInitiatives,
  editable,
  onPlanChange,
  onFactChange,
  onSourceChange,
  onRemove,
}: {
  items: MetricItem[];
  initiatives: InitiativeItem[];
  editable: boolean;
  onPlanChange: (id: string, value: string) => void;
  onFactChange: (id: string, value: string) => void;
  onSourceChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table
        className={`table-fixed ${editable ? "min-w-[1140px]" : "min-w-[980px]"}`}
      >
        <TableHeader>
          <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
            <TableHead className="w-[220px] pl-5 text-xs text-slate-500">
              Метрика
            </TableHead>
            <TableHead className="w-[210px] text-xs text-slate-500">
              Цель
            </TableHead>
            <TableHead className="w-[125px] text-xs text-slate-500">
              Целевое значение
            </TableHead>
            <TableHead className="w-[135px] text-xs text-slate-500">
              Факт
            </TableHead>
            <TableHead className="w-[150px] text-xs text-slate-500">
              Источник
            </TableHead>
            <TableHead className="w-[105px] text-xs text-slate-500">
              Риски
            </TableHead>
            <TableHead className="w-[145px] pr-5 text-xs text-slate-500">
              Выполнение
            </TableHead>
            {editable && (
              <TableHead className="w-[70px] pr-5 text-right text-xs text-slate-500">
                Удалить
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!items.length && (
            <TableRow>
              <TableCell
                colSpan={editable ? 8 : 7}
                className="h-28 text-center text-sm text-slate-500"
              >
                Метрики появятся автоматически после добавления инициативы.
              </TableCell>
            </TableRow>
          )}
          {items.map((metric) => {
            const inheritedRisks = linkedInitiatives
              .filter((initiative) =>
                initiative.linkedMetrics.includes(metric.name),
              )
              .flatMap((initiative) => initiative.risks);
            return (
              <TableRow key={metric.id} className="border-slate-100 align-top">
                <TableCell className="whitespace-normal py-3.5 pl-5">
                  <div className="flex items-start gap-3">
                    <StatusDot status={metric.status} />
                    <div>
                      <p className="font-medium leading-5 text-slate-900">
                        {metric.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {russianCount(
                          linkedInitiatives.filter((initiative) =>
                            initiative.linkedMetrics.includes(metric.name),
                          ).length,
                          ["инициатива", "инициативы", "инициатив"],
                        )}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal text-xs leading-5 text-slate-600">
                  <p className="font-medium text-slate-700">{metric.goal}</p>
                  <p className="mt-1 text-slate-400">{metric.strategy}</p>
                </TableCell>
                <TableCell>
                  {editable ? (
                    <Input
                      value={metric.plan}
                      onChange={(event) =>
                        onPlanChange(metric.id, event.target.value)
                      }
                      className="h-8 text-xs"
                      aria-label={`Целевое значение ${metric.name}`}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-900">
                      {metric.plan}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {editable ? (
                    <Input
                      value={metric.fact}
                      onChange={(event) =>
                        onFactChange(metric.id, event.target.value)
                      }
                      className="h-8 text-xs"
                      aria-label={`Фактическое значение ${metric.name}`}
                    />
                  ) : (
                    <p className="font-semibold text-slate-950">
                      {metric.fact}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {editable ? (
                    <Select
                      value={metric.source}
                      onValueChange={(value) =>
                        onSourceChange(metric.id, value)
                      }
                    >
                      <SelectTrigger size="sm" className="w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Вручную">Вручную</SelectItem>
                        <SelectItem value="DWH">DWH</SelectItem>
                        <SelectItem value="BI-витрина">BI-витрина</SelectItem>
                        <SelectItem value="Мониторинг">Мониторинг</SelectItem>
                        <SelectItem value="Файл AdHoc">Файл AdHoc</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <Database className="size-3.5" />
                      {metric.source}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <RiskCounters risks={inheritedRisks} />
                </TableCell>
                <TableCell className="pr-5">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={Math.min(metric.progress, 100)}
                      className="h-1.5 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-800"
                    />
                    <span className="w-9 text-right text-xs font-semibold text-slate-700">
                      {metric.progress}%
                    </span>
                  </div>
                </TableCell>
                {editable && (
                  <TableCell className="pr-5 text-right">
                    <Button
                      onClick={() => onRemove(metric.id)}
                      variant="ghost"
                      size="icon-sm"
                      className="text-slate-400 hover:text-rose-600"
                      aria-label="Удалить метрику из QBR"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function QbrPeriodOverview({
  quarterIndex,
  metricItems,
  initiativeItems,
  qbrInitiativeIds,
  readiness,
}: {
  quarterIndex: number;
  metricItems: MetricItem[];
  initiativeItems: InitiativeItem[];
  qbrInitiativeIds: string[];
  readiness: number;
}) {
  const quarter = quarters[quarterIndex];
  const selectedInitiatives = initiativeItems.filter((initiative) =>
    qbrInitiativeIds.includes(initiative.id),
  );
  const unlinkedMetrics = metricItems.filter(
    (metric) =>
      !selectedInitiatives.some((initiative) =>
        initiative.linkedMetrics.includes(metric.name),
      ),
  );
  const unlinkedInitiatives = selectedInitiatives.filter(
    (initiative) => !initiative.linkedMetrics.length,
  );
  const connectivity = Math.max(
    0,
    100 -
      unlinkedMetrics.length * 12 -
      unlinkedInitiatives.length * 10 -
      metricItems.filter((metric) => metric.source === "Вручную").length * 6,
  );
  const strategicImpact = metricItems.length
    ? Math.round(
        metricItems.reduce(
          (sum, metric) => sum + Math.min(metric.progress, 100),
          0,
        ) / metricItems.length,
      )
    : 0;
  const supportedGoals = new Set(
    selectedInitiatives.map((initiative) => initiative.goal),
  );
  const weakestMetric = [...metricItems].sort(
    (a, b) => a.progress - b.progress,
  )[0];
  const strongestMetric = [...metricItems].sort(
    (a, b) => b.progress - a.progress,
  )[0];
  return (
    <main className="mx-auto w-full max-w-[1480px] px-4 pt-5 md:px-7">
      <section className="overflow-hidden rounded-2xl border border-slate-200 border-l-4 border-l-violet-500 bg-white">
        <div className="border-b border-slate-100 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-950">
                <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-violet-700">
                  <Sparkles className="size-5" />
                </span>
                AI-обзор периода
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <CircleDot className="size-3.5" /> Требует внимания
                </span>
                <span className="text-xs text-slate-400">{quarter.phase}</span>
              </div>
            </div>
            <Button className="bg-violet-600 text-white shadow-sm hover:bg-violet-700">
              <Sparkles className="size-4" />
              Обновить AI-обзор
            </Button>
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-950">
            {weakestMetric
              ? `Основная точка внимания — ${weakestMetric.name.toLowerCase()}`
              : "Для AI-обзора недостаточно данных"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {strongestMetric && weakestMetric
              ? `Лучший результат периода: «${strongestMetric.name}» — ${strongestMetric.progress}% плана. «${weakestMetric.name}» выполнена на ${weakestMetric.progress}%. На ревью стоит согласовать действия по отстающим показателям и зафиксировать решения по открытым вопросам.`
              : "Добавьте инициативы, метрики и вопросы, затем обновите AI-обзор."}
          </p>
        </div>
        <div className="grid lg:grid-cols-3">
          <div className="bg-slate-50/70 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Готовность к ревью
              </p>
              <span className="text-lg font-bold text-slate-950">
                {readiness}%
              </span>
            </div>
            <Progress
              value={readiness}
              className="mt-3 h-2 bg-slate-200 [&_[data-slot=progress-indicator]]:bg-[#ef3e42]"
            />
            <div className="mt-4 space-y-2 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check className="size-3.5" /> Метрики обновлены
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check className="size-3.5" /> Инициативы и вопросы заполнены
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="size-3.5" /> 2 замечания AI
              </span>
            </div>
          </div>
          <div className="border-t border-slate-200 p-5 lg:border-l lg:border-t-0 md:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Оценка связности
              </p>
              <span className="text-lg font-bold text-violet-700">
                {connectivity}%
              </span>
            </div>
            <Progress
              value={connectivity}
              className="mt-3 h-2 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-violet-600"
            />
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              {unlinkedMetrics.slice(0, 2).map((metric) => (
                <p key={metric.id} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                  <span>
                    <b>{metric.name}</b> — нет связанной инициативы
                  </span>
                </p>
              ))}
              {metricItems
                .filter((metric) => metric.source === "Вручную")
                .slice(0, 1)
                .map((metric) => (
                  <p key={metric.id} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                    <span>
                      <b>{metric.name}</b> — источник данных не подключен
                    </span>
                  </p>
                ))}
            </div>
          </div>
          <div className="border-t border-slate-200 p-5 lg:border-l lg:border-t-0 md:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Влияние на стратегические цели
              </p>
              <span className="text-lg font-bold text-blue-700">
                {strategicImpact}%
              </span>
            </div>
            <Progress
              value={strategicImpact}
              className="mt-3 h-2 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-blue-600"
            />
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <p className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                {russianCount(supportedGoals.size, [
                  "стратегическая цель поддержана",
                  "стратегические цели поддержаны",
                  "стратегических целей поддержаны",
                ])}{" "}
                инициативами
              </p>
              <p className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                {weakestMetric
                  ? `Минимальный вклад: ${weakestMetric.name} — ${weakestMetric.progress}%`
                  : "Добавьте метрики, чтобы оценить вклад"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function QbrOverview({
  mode,
  metricItems,
  setMetricItems,
  metricCatalog,
  initiativeItems,
  setInitiativeItems,
  qbrInitiativeIds,
  setQbrInitiativeIds,
  teams,
  questions,
  setQuestions,
  onOpenInitiatives,
}: {
  mode: string;
  metricItems: MetricItem[];
  setMetricItems: (items: MetricItem[]) => void;
  metricCatalog: MetricItem[];
  initiativeItems: InitiativeItem[];
  setInitiativeItems: (items: InitiativeItem[]) => void;
  qbrInitiativeIds: string[];
  setQbrInitiativeIds: (ids: string[]) => void;
  teams: TeamItem[];
  questions: QbrQuestion[];
  setQuestions: (items: QbrQuestion[]) => void;
  onOpenInitiatives: () => void;
}) {
  const editable = mode === "Подготовка";
  const reviewMode = mode === "Ревью";
  const selectedInitiatives = initiativeItems.filter((initiative) =>
    qbrInitiativeIds.includes(initiative.id),
  );
  const availableInitiatives = initiativeItems.filter(
    (initiative) => !qbrInitiativeIds.includes(initiative.id),
  );
  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [standaloneDecisionOpen, setStandaloneDecisionOpen] = useState(false);
  const [peopleInitiativeId, setPeopleInitiativeId] = useState<string | null>(
    null,
  );
  const [riskInitiativeId, setRiskInitiativeId] = useState<string | null>(null);
  const [ownerTeamInitiativeId, setOwnerTeamInitiativeId] = useState<
    string | null
  >(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("medium");
  const [riskName, setRiskName] = useState("");
  const [riskDescription, setRiskDescription] = useState("");
  const [ownerEditDraft, setOwnerEditDraft] = useState("");
  const [teamEditDraft, setTeamEditDraft] = useState("");
  const [questionTitleDraft, setQuestionTitleDraft] = useState("");
  const [questionTextDraft, setQuestionTextDraft] = useState("");
  const [decisionTitleDraft, setDecisionTitleDraft] = useState("");
  const [decisionDraft, setDecisionDraft] = useState("");
  const employeeDirectory = Array.from(
    new Set(
      teams.flatMap((team) => team.employees.map((employee) => employee.name)),
    ),
  );

  const updateMetric = (id: string, patch: Partial<MetricItem>) =>
    setMetricItems(
      metricItems.map((metric) =>
        metric.id === id
          ? recalculateMetric({ ...metric, ...patch })
          : metric,
      ),
    );
  const addInitiativeToQbr = (initiativeId: string) => {
    const initiative = initiativeItems.find((item) => item.id === initiativeId);
    if (!initiative) return;
    const linkedCatalogMetrics = metricCatalog.filter((metric) =>
      initiative.linkedMetrics.includes(metric.name),
    );
    setQbrInitiativeIds([...qbrInitiativeIds, initiativeId]);
    setMetricItems([
      ...metricItems,
      ...linkedCatalogMetrics
        .filter((metric) => !metricItems.some((item) => item.id === metric.id))
        .map((metric) => ({ ...metric })),
    ]);
  };
  const removeInitiativeFromQbr = (initiativeId: string) => {
    const remainingIds = qbrInitiativeIds.filter((id) => id !== initiativeId);
    const remainingMetricNames = new Set(
      initiativeItems
        .filter((initiative) => remainingIds.includes(initiative.id))
        .flatMap((initiative) => initiative.linkedMetrics),
    );
    setQbrInitiativeIds(remainingIds);
    setMetricItems(
      metricItems.filter((metric) => remainingMetricNames.has(metric.name)),
    );
  };
  const toggleEmployee = (initiativeId: string, employee: string) =>
    setInitiativeItems(
      initiativeItems.map((initiative) => {
        if (initiative.id !== initiativeId) return initiative;
        const employees = initiative.employees.includes(employee)
          ? initiative.employees.filter((person) => person !== employee)
          : [...initiative.employees, employee];
        return { ...initiative, employees, fte: employees.length };
      }),
    );
  const addRisk = () => {
    if (!riskInitiativeId || !riskName.trim() || !riskDescription.trim())
      return;
    setInitiativeItems(
      initiativeItems.map((initiative) =>
        initiative.id !== riskInitiativeId
          ? initiative
          : {
              ...initiative,
              risks: [
                ...initiative.risks,
                {
                  id: `R-${Date.now()}`,
                  level: riskLevel,
                  name: riskName.trim(),
                  description: riskDescription.trim(),
                },
              ],
            },
      ),
    );
    setRiskInitiativeId(null);
    setRiskName("");
    setRiskDescription("");
    setRiskLevel("medium");
  };
  const addQuestion = () => {
    if (!questionTitleDraft.trim() || !questionTextDraft.trim()) return;
    setQuestions([
      ...questions,
      {
        id: `Q-${Date.now()}`,
        title: questionTitleDraft.trim(),
        question: questionTextDraft.trim(),
        decision: "",
      },
    ]);
    setQuestionDialogOpen(false);
    setQuestionTitleDraft("");
    setQuestionTextDraft("");
  };
  const addStandaloneDecision = () => {
    if (!decisionTitleDraft.trim() || !decisionDraft.trim()) return;
    setQuestions([
      ...questions,
      {
        id: `D-${Date.now()}`,
        title: decisionTitleDraft.trim(),
        question: "Решение без привязки к вопросу",
        decision: decisionDraft.trim(),
      },
    ]);
    setStandaloneDecisionOpen(false);
    setDecisionTitleDraft("");
    setDecisionDraft("");
  };
  const peopleInitiative = initiativeItems.find(
    (initiative) => initiative.id === peopleInitiativeId,
  );
  const riskInitiative = initiativeItems.find(
    (initiative) => initiative.id === riskInitiativeId,
  );
  const ownerTeamInitiative = initiativeItems.find(
    (initiative) => initiative.id === ownerTeamInitiativeId,
  );

  return (
    <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
      {!editable && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Target}
              label="Цели и метрики"
              value={`${metricItems.length}`}
              note="включено в QBR"
              tone="blue"
            />
            <StatCard
              icon={Rocket}
              label="Инициативы"
              value={`${selectedInitiatives.length}`}
              note="включено в QBR"
              tone="amber"
            />
            <StatCard
              icon={BriefcaseBusiness}
              label="Ресурс инициатив"
              value={`${selectedInitiatives.reduce((sum, item) => sum + item.fte, 0)} FTE`}
              note="по составу команд"
              tone="violet"
            />
            <StatCard
              icon={ListChecks}
              label="Вопросы"
              value={`${questions.length}`}
              note={
                reviewMode ? "обсуждаются на ревью" : "подготовлено к встрече"
              }
              tone="red"
            />
          </section>
        </>
      )}

      {!editable && (
        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">
                Цели и метрики
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Результаты периода и инициативы, которые обеспечивают достижение
                цели
              </p>
            </div>
          </div>
          <div className="grid gap-4 bg-slate-50/50 p-4 xl:grid-cols-2">
            {metricItems.map((metric) => {
              const linked = selectedInitiatives.filter((initiative) =>
                initiative.linkedMetrics.includes(metric.name),
              );
              const inheritedRisks = linked.flatMap(
                (initiative) => initiative.risks,
              );
              return (
                <article
                  key={metric.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <StatusDot status={metric.status} />
                      <div>
                        <h4 className="font-semibold leading-5 text-slate-950">
                          {metric.name}
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                    <RiskCounters risks={inheritedRisks} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Целевое значение</p>
                      {editable ? (
                        <Input
                          value={metric.plan}
                          onChange={(event) =>
                            updateMetric(metric.id, {
                              plan: event.target.value,
                            })
                          }
                          className="mt-1 h-8"
                        />
                      ) : (
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                          {metric.plan}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        Фактическое значение
                      </p>
                      {editable ? (
                        <Input
                          value={metric.fact}
                          onChange={(event) =>
                            updateMetric(metric.id, {
                              fact: event.target.value,
                            })
                          }
                          className="mt-1 h-8"
                        />
                      ) : (
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                          {metric.fact}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Progress
                      value={Math.min(metric.progress, 100)}
                      className="h-2 flex-1 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-900"
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {metric.progress}%
                    </span>
                  </div>
                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                      Связанные инициативы
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {linked.length ? (
                        linked.map((initiative) => (
                          <span
                            key={initiative.id}
                            className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                          >
                            {initiative.id} · {initiative.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-amber-700">
                          Нет связанных инициатив
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    {editable ? (
                      <Select
                        value={metric.source}
                        onValueChange={(value) =>
                          updateMetric(metric.id, { source: value })
                        }
                      >
                        <SelectTrigger size="sm" className="w-[160px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Вручную">Вручную</SelectItem>
                          <SelectItem value="DWH">DWH</SelectItem>
                          <SelectItem value="BI-витрина">BI-витрина</SelectItem>
                          <SelectItem value="Мониторинг">Мониторинг</SelectItem>
                          <SelectItem value="Файл AdHoc">Файл AdHoc</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Database className="size-3.5" />
                        {metric.source}
                      </span>
                    )}
                    {editable && (
                      <Button
                        onClick={() =>
                          setMetricItems(
                            metricItems.filter((item) => item.id !== metric.id),
                          )
                        }
                        variant="ghost"
                        size="icon-sm"
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Rocket className="size-5 text-[#ef3e42]" />
              <h3 className="text-xl font-semibold text-slate-950">
                Инициативы квартала
              </h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Стратегия, ключевая метрика, статус, риски и состав команды
            </p>
          </div>
          {editable ? (
            <Button
              onClick={() => setInitiativeDialogOpen(true)}
              size="sm"
              className="bg-slate-950 text-white hover:bg-slate-800"
            >
              <Plus />
              Добавить из портфеля
            </Button>
          ) : (
            <Button onClick={onOpenInitiatives} variant="outline" size="sm">
              Открыть портфель <ArrowRight />
            </Button>
          )}
        </div>
        <InitiativesTable
          items={selectedInitiatives}
          editable={editable}
          onRemove={removeInitiativeFromQbr}
          onEditFte={setPeopleInitiativeId}
          onAddRisk={setRiskInitiativeId}
          onCurrentChange={(id, value) =>
            setInitiativeItems(
              initiativeItems.map((initiative) =>
                initiative.id === id
                  ? recalculateInitiative({ ...initiative, current: value })
                  : initiative,
              ),
            )
          }
          onStatusChange={(id, status) =>
            setInitiativeItems(
              initiativeItems.map((initiative) =>
                initiative.id === id
                  ? {
                      ...initiative,
                      status,
                      tone:
                        status === "Завершена"
                          ? "green"
                          : status === "Пауза"
                            ? "red"
                            : status === "В работе"
                              ? "blue"
                              : "slate",
                      progress: calculateProgress(
                        initiative.target,
                        initiative.current,
                      ),
                    }
                  : initiative,
              ),
            )
          }
          onEditOwnerTeam={(id) => {
            const initiative = initiativeItems.find((item) => item.id === id);
            setOwnerTeamInitiativeId(id);
            setOwnerEditDraft(initiative?.owner ?? "");
            setTeamEditDraft(initiative?.team ?? "");
          }}
        />
      </section>

      {editable && (
        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <ChartBar className="size-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-slate-950">
                  Метрики инициатив
                </h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Добавляются автоматически из связей выбранных инициатив
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {metricItems.length} метрик
            </span>
          </div>
          <MetricsTable
            items={metricItems}
            initiatives={selectedInitiatives}
            editable
            onPlanChange={(id, value) => updateMetric(id, { plan: value })}
            onFactChange={(id, value) => updateMetric(id, { fact: value })}
            onSourceChange={(id, value) => updateMetric(id, { source: value })}
            onRemove={(id) =>
              setMetricItems(metricItems.filter((metric) => metric.id !== id))
            }
          />
        </section>
      )}

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="size-5 text-[#ef3e42]" />
              <h3 className="text-xl font-semibold text-slate-950">
                Вопросы и решения
              </h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {editable
                ? "Подготовьте вопросы, риски и ограничения к встрече"
                : "Зафиксируйте решения по вопросам во время ревью"}
            </p>
          </div>
          {editable ? (
            <Button
              onClick={() => setQuestionDialogOpen(true)}
              size="sm"
              className="bg-slate-950 text-white hover:bg-slate-800"
            >
              <Plus />
              Добавить вопрос
            </Button>
          ) : reviewMode ? (
            <Button
              onClick={() => setStandaloneDecisionOpen(true)}
              size="sm"
              className="bg-slate-950 text-white hover:bg-slate-800"
            >
              <Plus />
              Решение
            </Button>
          ) : null}
        </div>
        <div className="divide-y divide-slate-100">
          {!questions.length && (
            <p className="p-8 text-center text-sm text-slate-500">
              Вопросов пока нет. Добавьте темы, которые нужно обсудить на ревью.
            </p>
          )}
          {questions.map((item, index) => (
            <article
              key={item.id}
              className="grid gap-4 p-5 lg:grid-cols-[36px_minmax(0,1fr)_minmax(240px,0.65fr)] lg:items-start"
            >
              <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {index + 1}
              </span>
              <div>
                <h4 className="font-semibold text-slate-950">{item.title}</h4>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Вопрос
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.question}
                </p>
                {editable && (
                  <Button
                    onClick={() =>
                      setQuestions(
                        questions.filter((question) => question.id !== item.id),
                      )
                    }
                    variant="ghost"
                    size="sm"
                    className="mt-2 px-0 text-rose-600"
                  >
                    <Trash2 />
                    Удалить
                  </Button>
                )}
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Решение
                </p>
                {reviewMode ? (
                  <Textarea
                    value={item.decision}
                    onChange={(event) =>
                      setQuestions(
                        questions.map((question) =>
                          question.id === item.id
                            ? { ...question, decision: event.target.value }
                            : question,
                        ),
                      )
                    }
                    placeholder="Зафиксируйте решение на встрече"
                    rows={3}
                    className="mt-2 bg-white text-slate-950 placeholder:text-slate-400"
                  />
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.decision || "Будет зафиксировано во время ревью"}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Dialog
        open={initiativeDialogOpen}
        onOpenChange={setInitiativeDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Добавить инициативу в QBR</DialogTitle>
            <DialogDescription>
              Выберите инициативы из портфеля текущего квартала.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {availableInitiatives.length ? (
              availableInitiatives.map((initiative) => (
                <div
                  key={initiative.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {initiative.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {initiative.id} · {initiative.goal}
                    </p>
                  </div>
                  <Button
                    onClick={() => addInitiativeToQbr(initiative.id)}
                    size="sm"
                    className="bg-slate-950 text-white hover:bg-slate-800"
                  >
                    <Plus />
                    Добавить
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                Все инициативы портфеля уже добавлены в QBR.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setInitiativeDialogOpen(false)}>
              Готово
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить вопрос</DialogTitle>
            <DialogDescription>
              Сформулируйте вопрос, который необходимо обсудить на QBR.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-title">Заголовок</Label>
              <Input
                id="question-title"
                value={questionTitleDraft}
                onChange={(event) => setQuestionTitleDraft(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-text">Вопрос</Label>
              <Textarea
                id="question-text"
                value={questionTextDraft}
                onChange={(event) => setQuestionTextDraft(event.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuestionDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={addQuestion}
              disabled={!questionTitleDraft.trim() || !questionTextDraft.trim()}
            >
              Добавить вопрос
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={standaloneDecisionOpen}
        onOpenChange={setStandaloneDecisionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить решение без вопроса</DialogTitle>
            <DialogDescription>
              Зафиксируйте решение, принятое во время ревью.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="decision-title">Заголовок</Label>
              <Input
                id="decision-title"
                value={decisionTitleDraft}
                onChange={(event) => setDecisionTitleDraft(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decision-text">Решение</Label>
              <Textarea
                id="decision-text"
                value={decisionDraft}
                onChange={(event) => setDecisionDraft(event.target.value)}
                rows={4}
                className="text-slate-950 placeholder:text-slate-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStandaloneDecisionOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={addStandaloneDecision}
              disabled={!decisionTitleDraft.trim() || !decisionDraft.trim()}
            >
              Сохранить решение
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(peopleInitiativeId)}
        onOpenChange={(open) => !open && setPeopleInitiativeId(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Состав и FTE инициативы</DialogTitle>
            <DialogDescription>
              {peopleInitiative?.title}. Один добавленный сотрудник учитывается
              как 1,0 FTE.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
            <span className="text-sm font-medium text-blue-900">
              Текущий ресурс
            </span>
            <span className="text-lg font-bold text-blue-800">
              {peopleInitiative?.fte.toFixed(1).replace(".", ",") ?? "0,0"} FTE
            </span>
          </div>
          <div className="grid max-h-[390px] gap-2 overflow-y-auto sm:grid-cols-2">
            {employeeDirectory.map((employee) => {
              const selected = peopleInitiative?.employees.includes(employee);
              return (
                <button
                  key={employee}
                  onClick={() =>
                    peopleInitiativeId &&
                    toggleEmployee(peopleInitiativeId, employee)
                  }
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selected ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <span
                    className={`grid size-8 place-items-center rounded-full text-xs font-semibold ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    {employee
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                    {employee}
                  </span>
                  <span
                    className={`text-xs font-semibold ${selected ? "text-rose-600" : "text-blue-700"}`}
                  >
                    {selected ? "Удалить" : "Добавить"}
                  </span>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => setPeopleInitiativeId(null)}>Готово</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(riskInitiativeId)}
        onOpenChange={(open) => !open && setRiskInitiativeId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить риск</DialogTitle>
            <DialogDescription>
              {riskInitiative?.title}. Укажите уровень и опишите влияние.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="risk-name">Имя риска</Label>
              <Input
                id="risk-name"
                value={riskName}
                onChange={(event) => setRiskName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Уровень риска</Label>
              <Select
                value={riskLevel}
                onValueChange={(value) => setRiskLevel(value as RiskLevel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-description">Описание риска</Label>
              <Textarea
                id="risk-description"
                value={riskDescription}
                onChange={(event) => setRiskDescription(event.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRiskInitiativeId(null)}>
              Отмена
            </Button>
            <Button
              onClick={addRisk}
              disabled={!riskName.trim() || !riskDescription.trim()}
            >
              <ShieldAlert />
              Добавить риск
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(ownerTeamInitiativeId)}
        onOpenChange={(open) => !open && setOwnerTeamInitiativeId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Владелец и команда</DialogTitle>
            <DialogDescription>
              {ownerTeamInitiative?.title}. При смене команды состав и FTE
              обновятся по справочнику.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Команда</Label>
              <Select
                value={teamEditDraft}
                onValueChange={(value) => {
                  const team = teams.find((item) => item.name === value);
                  setTeamEditDraft(value);
                  if (
                    team &&
                    !team.employees.some(
                      (employee) => employee.name === ownerEditDraft,
                    )
                  )
                    setOwnerEditDraft(team.employees[0]?.name ?? "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.name}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Владелец</Label>
              <Select value={ownerEditDraft} onValueChange={setOwnerEditDraft}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    teams.find((team) => team.name === teamEditDraft)
                      ?.employees ?? teams.flatMap((team) => team.employees)
                  ).map((employee) => (
                    <SelectItem key={employee.id} value={employee.name}>
                      {employee.name} · {employee.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOwnerTeamInitiativeId(null)}
            >
              Отмена
            </Button>
            <Button
              onClick={() => {
                const team = teams.find((item) => item.name === teamEditDraft);
                if (!ownerTeamInitiativeId || !team || !ownerEditDraft) return;
                setInitiativeItems(
                  initiativeItems.map((initiative) =>
                    initiative.id === ownerTeamInitiativeId
                      ? {
                          ...initiative,
                          owner: ownerEditDraft,
                          team: team.name,
                          employees: team.employees.map(
                            (employee) => employee.name,
                          ),
                          fte: team.employees.length,
                        }
                      : initiative,
                  ),
                );
                setOwnerTeamInitiativeId(null);
              }}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function QbrResults({
  metricItems,
  initiativeItems,
  qbrInitiativeIds,
  questions,
}: {
  metricItems: MetricItem[];
  initiativeItems: InitiativeItem[];
  qbrInitiativeIds: string[];
  questions: QbrQuestion[];
}) {
  const selectedInitiatives = initiativeItems.filter((initiative) =>
    qbrInitiativeIds.includes(initiative.id),
  );
  const decisions = questions.filter((item) => item.decision.trim());
  const completedMetrics = metricItems.filter(
    (metric) => metric.progress >= 100,
  ).length;
  const strongestMetric = [...metricItems].sort(
    (a, b) => b.progress - a.progress,
  )[0];
  const weakestMetric = [...metricItems].sort(
    (a, b) => a.progress - b.progress,
  )[0];
  return (
    <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
      <div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            Итоги квартального ревью
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Компактный отчет по результатам, инициативам и принятым решениям.
          </p>
        </div>
      </div>
      <section className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/70 p-5 md:p-6">
        <div className="flex items-center gap-2 text-violet-800">
          <span className="grid size-9 place-items-center rounded-xl bg-white shadow-sm">
            <Sparkles className="size-5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.12em]">
            AI-резюме
          </p>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-950">
          {metricItems.length
            ? `Выполнено ${completedMetrics} из ${metricItems.length} целевых метрик`
            : "В периоде не было целевых метрик"}
        </h3>
        <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-600">
          {strongestMetric && weakestMetric
            ? `Лучший результат — «${strongestMetric.name}» (${strongestMetric.progress}% плана). Основная зона внимания — «${weakestMetric.name}» (${weakestMetric.progress}%). На ревью зафиксировано ${russianCount(decisions.length, ["решение", "решения", "решений"])}.`
            : "Добавьте инициативы и метрики, чтобы сформировать содержательное AI-резюме."}
        </p>
      </section>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Target}
          label="Метрики выполнены"
          value={`${metricItems.filter((metric) => metric.progress >= 100).length} / ${metricItems.length}`}
          note="по итогам периода"
          tone="blue"
        />
        <StatCard
          icon={Rocket}
          label="Инициативы завершены"
          value={`${selectedInitiatives.filter((item) => item.status === "Завершена").length} / ${selectedInitiatives.length}`}
          note="в портфеле QBR"
          tone="amber"
        />
        <StatCard
          icon={BriefcaseBusiness}
          label="Использовано ресурсов"
          value={`${selectedInitiatives.reduce((sum, item) => sum + item.fte, 0)} FTE`}
          note="командный ресурс"
          tone="violet"
        />
        <StatCard
          icon={ListChecks}
          label="Решения"
          value={`${decisions.length}`}
          note="зафиксировано на ревью"
          tone="red"
        />
      </section>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-xl font-semibold text-slate-950">Цели и метрики</h3>
        <p className="mt-1 text-sm text-slate-500">
          Итоговый результат и инициативы, обеспечившие достижение целей
        </p>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {metricItems.map((metric) => {
            const linked = selectedInitiatives.filter((initiative) =>
              initiative.linkedMetrics.includes(metric.name),
            );
            return (
              <article
                key={metric.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-700">
                      Цель
                    </p>
                    <p className="mt-1 text-sm font-medium leading-5 text-slate-700">
                      {metric.goal}
                    </p>
                    <div className="mt-3 flex items-start gap-3 border-t border-slate-200 pt-3">
                      <StatusDot status={metric.status} />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                          Метрика
                        </p>
                        <h4 className="mt-1 font-semibold text-slate-950">
                          {metric.name}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-slate-950">
                    {metric.progress}%
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Цель</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {metric.plan}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Результат</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {metric.fact}
                    </p>
                  </div>
                </div>
                <Progress
                  value={Math.min(metric.progress, 100)}
                  className="mt-4 h-2 bg-white [&_[data-slot=progress-indicator]]:bg-slate-900"
                />
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Инициативы
                    </p>
                    <span className="text-xs font-semibold text-slate-600">
                      {linked.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {linked.length ? (
                      linked.map((initiative) => (
                        <div
                          key={initiative.id}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium text-slate-400">
                                {initiative.id}
                              </p>
                              <p className="mt-0.5 text-sm font-semibold leading-5 text-slate-900">
                                {initiative.title}
                              </p>
                            </div>
                            <InitiativeRiskSummary risks={initiative.risks} />
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <StatusPill
                              label={initiative.status}
                              tone={initiative.tone}
                            />
                            <Progress
                              value={initiative.progress}
                              className="h-1.5 flex-1 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-800"
                            />
                            <span className="text-xs font-semibold text-slate-700">
                              {initiative.progress}%
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                        Нет связанных инициатив
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-xl font-semibold text-slate-950">
          Принятые решения
        </h3>
        <div className="mt-4 space-y-3">
          {decisions.length ? (
            decisions.map((item, index) => {
              const hasQuestion =
                item.question !== "Решение без привязки к вопросу";
              return (
                <article
                  key={item.id}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[32px_minmax(0,1fr)]"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-950">
                      {item.title}
                    </h4>
                    {hasQuestion && (
                      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                          Вопрос
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {item.question}
                        </p>
                      </div>
                    )}
                    <div className={hasQuestion ? "mt-3" : "mt-2"}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                        Принятое решение
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {item.decision}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">
              Решения еще не зафиксированы.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto w-full max-w-[900px] p-7">
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <Users className="mx-auto size-8 text-slate-400" />
        <h2 className="mt-4 text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">
          Раздел сохранен в структуре макета и будет детализирован на следующем
          этапе.
        </p>
      </div>
    </main>
  );
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [globalPage, setGlobalPage] = useState<GlobalPage>("Мои QBR");
  const [mode, setMode] = useState("Подготовка");
  const [qbrName, setQbrName] = useState("Цифровые решения");
  const [quarterIndex, setQuarterIndex] = useState(1);
  const [metricCatalog, setMetricCatalog] = useState<MetricItem[]>(() =>
    strategicMetrics.map((metric) => recalculateMetric({ ...metric })),
  );
  const [metricItems, setMetricItems] = useState<MetricItem[]>(() => {
    const initialMetricNames = new Set(
      initiatives.slice(0, 4).flatMap((initiative) => initiative.linkedMetrics),
    );
    return strategicMetrics
      .filter((metric) => initialMetricNames.has(metric.name))
      .map((metric) => recalculateMetric({ ...metric }));
  });
  const [teams, setTeams] = useState<TeamItem[]>(() =>
    initialTeams.map((team) => ({
      ...team,
      employees: team.employees.map((employee) => ({ ...employee })),
    })),
  );
  const [initiativeItems, setInitiativeItems] = useState<InitiativeItem[]>(() =>
    initiatives.map((initiative) => ({
      ...initiative,
      employees: [...initiative.employees],
      risks: initiative.risks.map((risk) => ({ ...risk })),
    })),
  );
  const [qbrInitiativeIds, setQbrInitiativeIds] = useState<string[]>(() =>
    initiatives.slice(0, 4).map((initiative) => initiative.id),
  );
  const [questions, setQuestions] = useState<QbrQuestion[]>(() =>
    initialQbrQuestions.map((item) => ({ ...item })),
  );
  const qbrSnapshots = useRef<Record<string, QbrSnapshot>>({});
  const quarter = quarters[quarterIndex];
  const selectedQbrInitiatives = initiativeItems.filter((initiative) =>
    qbrInitiativeIds.includes(initiative.id),
  );
  const reviewReadiness = calculateReviewReadiness(
    metricItems,
    selectedQbrInitiatives,
    questions,
  );
  const questionsWithDecision = questions.filter((item) =>
    item.decision.trim(),
  ).length;

  const pageTitle =
    globalPage === "Стратегия"
      ? "Стратегия Группы Московская Биржа"
      : globalPage === "Мои QBR"
        ? qbrName
        : globalPage;
  const pageSubtitle =
    globalPage === "Стратегия"
      ? "Направления, драйверы и ключевые метрики группы компаний"
      : globalPage === "Метрики"
        ? "Единый каталог показателей"
        : globalPage === "Инициативы"
          ? "Работы, прогресс и статусы"
          : globalPage === "Команды"
            ? "Команды, подразделения и сотрудники"
            : "Квартальный обзор команды";
  const modeDescription =
    mode === "Подготовка"
      ? "Добавляйте метрики, инициативы и вопросы, обновляйте фактические значения, состав и риски."
      : mode === "Ревью"
        ? "Обсуждайте результаты и риски, фиксируйте решения по вопросам или отдельно от них."
        : "Проверьте основные результаты и решения, затем сохраните итоговый отчет.";

  const metricsForInitiatives = (
    initiativeIds: string[],
    portfolio: InitiativeItem[] = initiativeItems,
  ) => {
    const linkedMetricNames = new Set(
      portfolio
        .filter((initiative) => initiativeIds.includes(initiative.id))
        .flatMap((initiative) => initiative.linkedMetrics),
    );
    return metricCatalog
      .filter((metric) => linkedMetricNames.has(metric.name))
      .map((metric) => ({ ...metric }));
  };

  const snapshotKey = (name: string, index: number) => `${name}:${index}`;
  const saveCurrentSnapshot = () => {
    qbrSnapshots.current[snapshotKey(qbrName, quarterIndex)] = {
      mode,
      metricItems: cloneMetrics(metricItems),
      initiativeItems: cloneInitiatives(initiativeItems),
      initiativeIds: [...qbrInitiativeIds],
      questions: cloneQuestions(questions),
    };
  };
  const createSnapshot = (
    name: string,
    index: number,
    requestedMode?: string,
  ): QbrSnapshot => {
    const portfolio = cloneInitiatives(initiatives);
    const initiativeIds =
      index < 1
        ? initiatives.slice(0, 3).map((initiative) => initiative.id)
        : index > 1
          ? []
          : name === "Регистрация и онбординг"
            ? ["IN-237"]
            : initiatives.slice(0, 4).map((initiative) => initiative.id);
    const snapshotQuestions =
      index < 1
        ? initialQbrQuestions.map((item, itemIndex) => ({
            ...item,
            decision:
              item.decision ||
              [
                "Выделить 0,5 FTE аналитика из центра компетенций на следующий квартал.",
                "Подтвердить поэтапную поставку витрин с контрольной точкой раз в две недели.",
              ][itemIndex] ||
              "Решение зафиксировано по итогам ревью.",
          }))
        : index > 1
          ? []
          : name === "Регистрация и онбординг"
            ? [cloneQuestions(initialQbrQuestions)[0]]
            : cloneQuestions(initialQbrQuestions);
    return {
      mode:
        requestedMode ?? (index < 1 ? "Итоги" : index > 1 ? "Подготовка" : "Подготовка"),
      metricItems: metricsForInitiatives(initiativeIds, portfolio),
      initiativeItems: portfolio,
      initiativeIds,
      questions: snapshotQuestions,
    };
  };
  const loadSnapshot = (snapshot: QbrSnapshot) => {
    setMode(snapshot.mode);
    setMetricItems(cloneMetrics(snapshot.metricItems));
    setInitiativeItems(cloneInitiatives(snapshot.initiativeItems));
    setQbrInitiativeIds([...snapshot.initiativeIds]);
    setQuestions(cloneQuestions(snapshot.questions));
  };

  const handleQuarterChange = (nextIndex: number) => {
    saveCurrentSnapshot();
    setQuarterIndex(nextIndex);
    const key = snapshotKey(qbrName, nextIndex);
    const snapshot =
      qbrSnapshots.current[key] ?? createSnapshot(qbrName, nextIndex);
    qbrSnapshots.current[key] = snapshot;
    loadSnapshot(snapshot);
  };

  const openQbr = (name: string, status: string) => {
    saveCurrentSnapshot();
    setGlobalPage("Мои QBR");
    setQbrName(name);
    const key = snapshotKey(name, quarterIndex);
    const snapshot =
      qbrSnapshots.current[key] ??
      createSnapshot(name, quarterIndex, status);
    qbrSnapshots.current[key] = snapshot;
    loadSnapshot(snapshot);
  };

  return (
    <SidebarProvider>
      <Sidebar
        className="border-r-0 bg-[#111827] text-white"
        collapsible="icon"
      >
        <SidebarHeader className="border-b border-white/10 px-3 py-4">
          <div className="flex h-10 items-center gap-3 px-1">
            <img
              src="/favicon.svg"
              alt="MOEX"
              className="size-9 shrink-0 rounded-lg bg-white object-contain"
            />
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold tracking-tight">
                MOEX QBR Tool
              </p>
              <p className="truncate text-[10px] uppercase tracking-[0.16em] text-slate-400">
                Strategy & review
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-[#111827]">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500">
              Управление результатами
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ label, icon: Icon }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      onClick={() => setGlobalPage(label)}
                      isActive={globalPage === label}
                      tooltip={label}
                      className="h-10 text-slate-300 hover:bg-white/8 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:text-white"
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500">
              Доступные мне QBR
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {[
                  {
                    name: "Цифровые решения",
                    owner: "Алексей Иванов",
                    period: quarter.short,
                    status: qbrName === "Цифровые решения" ? mode : "Подготовка",
                  },
                  {
                    name: "Регистрация и онбординг",
                    owner: "Ольга Морозова",
                    period: "III кв. 2026",
                    status:
                      qbrName === "Регистрация и онбординг" ? mode : "Ревью",
                  },
                ].map((review) => (
                  <SidebarMenuItem key={review.name}>
                    <SidebarMenuButton
                      onClick={() => openQbr(review.name, review.status)}
                      className="h-auto rounded-xl border border-white/10 bg-white/5 p-2 text-white hover:bg-white/8"
                    >
                      <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 group-data-[collapsible=icon]:hidden">
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium">
                            {review.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                            {review.owner}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block whitespace-nowrap text-[10px] text-slate-400">
                            {review.period}
                          </span>
                          <span
                            className={`mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${review.status === "Итоги" ? "bg-emerald-400/15 text-emerald-300" : review.status === "Ревью" ? "bg-violet-400/15 text-violet-300" : "bg-amber-400/15 text-amber-300"}`}
                          >
                            {review.status}
                          </span>
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/10 bg-[#111827] p-3">
          <div className="flex items-center gap-3 rounded-xl p-1">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-700 text-xs font-semibold">
              АИ
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-medium text-white">
                Алексей Иванов
              </p>
              <p className="truncate text-[11px] text-slate-400">
                Владелец продукта
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Выйти"
              title="Выйти"
              onClick={onSignOut}
              className="ml-auto text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#f5f7fa]">
        <header className="sticky top-0 z-20 flex min-h-[84px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="md:hidden" />
            {globalPage === "Мои QBR" ? (
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                  {qbrName}
                </h1>
              </div>
            ) : (
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                  {pageTitle}
                </h1>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {pageSubtitle}
                </p>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {globalPage === "Мои QBR" && (
              <QuarterSwitcher
                index={quarterIndex}
                onChange={handleQuarterChange}
              />
            )}
            {globalPage === "Стратегия" && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden border-slate-300 bg-white font-semibold text-slate-900 hover:bg-slate-100 sm:flex"
              >
                <a
                  href="https://www.moex.com/files/4g62xymgykeh5zb9r40newqv42"
                  target="_blank"
                  rel="noreferrer"
                >
                  Источник <ExternalLink />
                </a>
              </Button>
            )}
          </div>
        </header>

        {globalPage === "Стратегия" && (
          <StrategyPage onOpenInitiatives={() => setGlobalPage("Инициативы")} />
        )}
        {globalPage === "Метрики" && (
          <MetricsPage
            items={metricCatalog}
            setItems={setMetricCatalog}
            onMetricRename={(previousName, nextName) => {
              setInitiativeItems(
                initiativeItems.map((initiative) => ({
                  ...initiative,
                  metric:
                    initiative.metric === previousName
                      ? nextName
                      : initiative.metric,
                  linkedMetrics: initiative.linkedMetrics.map((name) =>
                    name === previousName ? nextName : name,
                  ),
                })),
              );
              setMetricItems(
                metricItems.map((metric) =>
                  metric.name === previousName
                    ? { ...metric, name: nextName }
                    : metric,
                ),
              );
            }}
          />
        )}
        {globalPage === "Инициативы" && (
          <InitiativesPage
            items={initiativeItems}
            setItems={setInitiativeItems}
            metricCatalog={metricCatalog}
            teams={teams}
          />
        )}
        {globalPage === "Команды" && (
          <TeamsPage teams={teams} setTeams={setTeams} />
        )}
        {globalPage === "Мои QBR" && (
          <>
            <section className="border-b border-slate-200 bg-white px-4 py-4 md:px-7">
              <div className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {mode === "Подготовка" ? (
                    <Pencil className="mt-1 size-5 text-blue-600" />
                  ) : mode === "Ревью" ? (
                    <ListChecks className="mt-1 size-5 text-violet-600" />
                  ) : (
                    <CheckCircle2 className="mt-1 size-5 text-emerald-600" />
                  )}
                  <div>
                    <h2
                      className={`text-2xl font-semibold ${mode === "Подготовка" ? "text-blue-800" : mode === "Ревью" ? "text-violet-800" : "text-emerald-800"}`}
                    >
                      {mode}
                    </h2>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                      {modeDescription}
                    </p>
                  </div>
                </div>
                <div className="ml-auto flex min-h-[60px] shrink-0 items-start justify-end">
                  {mode === "Подготовка" && (
                    <div className="flex w-[220px] flex-col items-stretch gap-1.5">
                      <Button
                        onClick={() => setMode("Ревью")}
                        disabled={reviewReadiness < 70}
                        className="bg-sky-500 text-white hover:bg-sky-600"
                      >
                        Начать ревью <ArrowRight className="size-5" />
                      </Button>
                      <p className="text-center text-xs font-medium text-slate-500">
                        Готовность к ревью: {reviewReadiness}%
                      </p>
                    </div>
                  )}
                  {mode === "Ревью" && (
                    <div className="grid grid-cols-2 items-start gap-x-2 gap-y-1.5">
                      <Button
                        onClick={() => setMode("Подготовка")}
                        variant="outline"
                        className="border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                      >
                        <ArrowLeft className="size-5" />
                        Вернуть в подготовку
                      </Button>
                      <Button
                        onClick={() => setMode("Итоги")}
                        disabled={
                          questions.length > 0 &&
                          questionsWithDecision < questions.length
                        }
                        className="bg-sky-500 text-white hover:bg-sky-600"
                      >
                        Завершить ревью <ArrowRight className="size-5" />
                      </Button>
                      <p className="col-start-2 text-center text-xs font-medium text-slate-500">
                        {questionsWithDecision}/{questions.length} вопросов
                        имеют решение
                      </p>
                    </div>
                  )}
                  {mode === "Итоги" && (
                    <div className="flex w-[220px] items-start justify-end">
                      <Button
                        onClick={() => window.print()}
                        className="w-full bg-slate-950 text-white hover:bg-slate-800"
                      >
                        <FileDown />
                        PDF
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </section>
            {mode === "Ревью" && (
              <QbrPeriodOverview
                quarterIndex={quarterIndex}
                metricItems={metricItems}
                initiativeItems={initiativeItems}
                qbrInitiativeIds={qbrInitiativeIds}
                readiness={reviewReadiness}
              />
            )}
            {mode === "Итоги" ? (
              <QbrResults
                metricItems={metricItems}
                initiativeItems={initiativeItems}
                qbrInitiativeIds={qbrInitiativeIds}
                questions={questions}
              />
            ) : (
              <QbrOverview
                mode={mode}
                metricItems={metricItems}
                setMetricItems={setMetricItems}
                metricCatalog={metricCatalog}
                initiativeItems={initiativeItems}
                setInitiativeItems={setInitiativeItems}
                qbrInitiativeIds={qbrInitiativeIds}
                setQbrInitiativeIds={setQbrInitiativeIds}
                teams={teams}
                questions={questions}
                setQuestions={setQuestions}
                onOpenInitiatives={() => setGlobalPage("Инициативы")}
              />
            )}
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

function LoginScreen({ onSignedIn }: { onSignedIn: (session: AuthSession) => void }) {
  const [login, setLogin] = useState("moex_test");
  const [password, setPassword] = useState("moex_test");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try { onSignedIn(await authService.signIn(login.trim(), password)); }
    catch { setError("Неверный логин или пароль"); }
    finally { setPending(false); }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f5f8] p-5">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="mb-8 flex items-center gap-3">
          <img src="/favicon.svg" alt="MOEX" className="size-12 rounded-xl border border-slate-200 bg-white object-contain" />
          <div><h1 className="text-xl font-semibold text-slate-950">MOEX QBR Tool</h1><p className="text-sm text-slate-500">Quarterly Business Review</p></div>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Вход в систему</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Цели, метрики и инициативы продуктовых команд в едином квартальном обзоре.</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <div className="space-y-2"><Label htmlFor="login">Логин</Label><Input id="login" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="password">Пароль</Label><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={pending} className="w-full bg-slate-950 text-white hover:bg-slate-800">{pending ? "Входим…" : "Войти"}</Button>
        </form>
        {!isSupabaseConfigured && <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Для входа укажите публичные параметры Supabase в окружении.</p>}
      </section>
    </main>
  );
}

export default function Home() {
  const [session, setSession] = useState<AuthSession | null | undefined>(undefined);
  useEffect(() => { setSession(authService.session()); }, []);
  if (session === undefined) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Загрузка…</main>;
  if (!session) return <LoginScreen onSignedIn={setSession} />;
  return <Dashboard onSignOut={async () => { await authService.signOut(); setSession(null); }} />;
}

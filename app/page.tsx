"use client"

import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardList,
  Flag,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  MoreHorizontal,
  Presentation,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const metrics = [
  { name: "Активные пользователи", goal: "Рост вовлеченности", previous: "42,8 тыс.", plan: "50 тыс.", fact: "52,4 тыс.", progress: 105, status: "green", trend: "+22%" },
  { name: "Конверсия в целевое действие", goal: "Рост эффективности", previous: "14,1%", plan: "18%", fact: "16,3%", progress: 91, status: "yellow", trend: "+2,2 п.п." },
  { name: "Время обработки заявки", goal: "Улучшение клиентского опыта", previous: "4,6 мин.", plan: "3,0 мин.", fact: "3,8 мин.", progress: 79, status: "red", trend: "−17%" },
  { name: "Доступность сервиса", goal: "Операционная надежность", previous: "99,91%", plan: "99,95%", fact: "99,97%", progress: 100, status: "green", trend: "+0,06 п.п." },
]

const navItems = [
  { label: "Мои QBR", icon: LayoutDashboard, active: true },
  { label: "Команды", icon: Users },
  { label: "Шаблоны", icon: ClipboardList },
]

const reviewSections = ["Обзор", "Цели и метрики", "Достижения", "Риски", "Решения", "Следующий квартал"]

function StatusDot({ status }: { status: string }) {
  const color = status === "green" ? "bg-emerald-500" : status === "yellow" ? "bg-amber-400" : "bg-rose-500"
  return <span className={`mt-1.5 inline-block size-2.5 shrink-0 rounded-full ${color}`} />
}

function StatCard({ icon: Icon, label, value, note, tone }: { icon: typeof Target; label: string; value: string; note: string; tone: "blue" | "amber" | "red" | "violet" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", red: "bg-rose-50 text-rose-700", violet: "bg-violet-50 text-violet-700" }
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{note}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon className="size-5" /></div>
      </div>
    </article>
  )
}

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar className="border-r-0 bg-[#111827] text-white" collapsible="icon">
        <SidebarHeader className="border-b border-white/10 px-3 py-4">
          <div className="flex h-9 items-center gap-3 px-1">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#ef3e42] text-sm font-bold text-white">Q</div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold tracking-tight">QBR Tool</p>
              <p className="truncate text-[10px] uppercase tracking-[0.16em] text-slate-400">Product review</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-[#111827]">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500">Рабочее пространство</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ label, icon: Icon, active }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton isActive={active} tooltip={label} className="h-10 text-slate-300 hover:bg-white/8 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:text-white">
                      <Icon /><span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500">Текущий обзор</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="h-auto items-start rounded-xl border border-white/10 bg-white/5 p-3 text-white hover:bg-white/8">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-amber-400" />
                    <span className="min-w-0 group-data-[collapsible=icon]:hidden">
                      <span className="block truncate text-xs font-medium">Цифровые сервисы</span>
                      <span className="mt-1 block text-[11px] text-slate-400">III квартал 2026</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/10 bg-[#111827] p-3">
          <div className="flex items-center gap-3 rounded-xl p-1">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-700 text-xs font-semibold">АИ</div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-medium text-white">Алексей Иванов</p>
              <p className="truncate text-[11px] text-slate-400">Владелец продукта</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#f5f7fa]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="md:hidden" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-slate-950 md:text-base">Цифровые сервисы</h1>
                <button className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Выбрать команду"><ChevronDown className="size-4" /></button>
              </div>
              <p className="text-xs text-slate-500">Квартальный обзор · III квартал 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden border-slate-200 bg-white sm:flex"><Presentation />Режим ревью</Button>
            <Button size="sm" className="bg-[#ef3e42] text-white hover:bg-[#d92f34]">Завершить подготовку<ArrowRight /></Button>
          </div>
        </header>

        <div className="border-b border-slate-200 bg-white px-4 md:px-7">
          <div className="flex h-14 items-center justify-between gap-6 overflow-x-auto scrollbar-none">
            <nav className="flex h-full shrink-0 items-center gap-6" aria-label="Разделы квартального обзора">
              {reviewSections.map((item, index) => (
                <button key={item} className={`relative h-full whitespace-nowrap text-sm transition ${index === 0 ? "font-semibold text-slate-950" : "font-medium text-slate-500 hover:text-slate-900"}`}>
                  {item}{index === 0 && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#ef3e42]" />}
                </button>
              ))}
            </nav>
            <div className="hidden shrink-0 items-center gap-2 text-xs text-slate-500 xl:flex">
              <span>Заполнено</span><Progress value={86} className="h-1.5 w-24 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-emerald-500" /><span className="font-semibold text-slate-700">86%</span>
            </div>
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
          <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid lg:grid-cols-[1fr_310px]">
              <div className="relative p-5 md:p-6">
                <div className="absolute inset-y-0 left-0 w-1 bg-amber-400" />
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><CircleDot className="size-3.5" /> Общий статус: требует внимания</span>
                      <span className="text-xs text-slate-400">Обновлено сегодня, 14:32</span>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">Команда ускорила рост, но не достигла целевой конверсии</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Основные продуктовые метрики растут. Для достижения целей следующего квартала необходимо принять решение по ресурсу аналитики и сократить время обработки заявки.</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" className="text-slate-400" aria-label="Дополнительные действия"><MoreHorizontal /></Button>
                </div>
              </div>
              <div className="border-t border-slate-200 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
                <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Готовность к ревью</p><span className="text-sm font-bold text-slate-950">86%</span></div>
                <Progress value={86} className="mt-3 h-2 bg-slate-200 [&_[data-slot=progress-indicator]]:bg-[#ef3e42]" />
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700"><Check className="size-3.5" /> 6 разделов готовы</span>
                  <span className="flex items-center gap-1.5 text-amber-700"><AlertTriangle className="size-3.5" /> 2 замечания AI</span>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Target} label="Цели квартала" value="3 из 4" note="одна требует внимания" tone="blue" />
            <StatCard icon={TrendingUp} label="Среднее выполнение" value="93%" note="+8 п.п. к прошлому кварталу" tone="amber" />
            <StatCard icon={AlertTriangle} label="Критические риски" value="2" note="один требует эскалации" tone="red" />
            <StatCard icon={ListChecks} label="Требуются решения" value="3" note="до 15 октября" tone="violet" />
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div><h3 className="text-sm font-semibold text-slate-950">Ключевые метрики</h3><p className="mt-0.5 text-xs text-slate-500">План, факт и динамика к предыдущему кварталу</p></div>
                <Button variant="ghost" size="sm" className="text-slate-600">Все метрики <ArrowRight /></Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                    <TableHead className="pl-5 text-xs text-slate-500">Метрика</TableHead><TableHead className="text-xs text-slate-500">Прошлый кв.</TableHead><TableHead className="text-xs text-slate-500">План</TableHead><TableHead className="text-xs text-slate-500">Факт</TableHead><TableHead className="pr-5 text-xs text-slate-500">Выполнение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.name} className="border-slate-100">
                      <TableCell className="min-w-[240px] py-3.5 pl-5"><div className="flex items-start gap-3"><StatusDot status={metric.status} /><div><p className="font-medium text-slate-900">{metric.name}</p><p className="mt-1 text-xs text-slate-400">{metric.goal}</p></div></div></TableCell>
                      <TableCell className="text-slate-500">{metric.previous}</TableCell><TableCell className="font-medium text-slate-700">{metric.plan}</TableCell>
                      <TableCell><p className="font-semibold text-slate-950">{metric.fact}</p><p className={`text-xs ${metric.trend.startsWith("+") ? "text-emerald-600" : "text-slate-500"}`}>{metric.trend}</p></TableCell>
                      <TableCell className="min-w-[150px] pr-5"><div className="flex items-center gap-3"><Progress value={Math.min(metric.progress, 100)} className={`h-1.5 bg-slate-100 ${metric.status === "green" ? "[&_[data-slot=progress-indicator]]:bg-emerald-500" : metric.status === "yellow" ? "[&_[data-slot=progress-indicator]]:bg-amber-400" : "[&_[data-slot=progress-indicator]]:bg-rose-500"}`} /><span className="w-9 text-right text-xs font-semibold text-slate-700">{metric.progress}%</span></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="border-b border-slate-100 p-5"><div className="flex items-center gap-2"><div className="rounded-lg bg-violet-50 p-2 text-violet-700"><Bot className="size-4" /></div><div><h3 className="text-sm font-semibold text-slate-950">AI-проверка QBR</h3><p className="text-xs text-slate-500">2 замечания · 3 вывода</p></div><Sparkles className="ml-auto size-4 text-violet-500" /></div></div>
              <div className="space-y-4 p-5">
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5"><div className="flex gap-2.5"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" /><div><p className="text-xs font-semibold text-amber-900">Не объяснено отклонение</p><p className="mt-1 text-xs leading-5 text-amber-800">Время обработки заявки ниже плана на 21%, но причина не указана.</p></div></div></div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5"><div className="flex gap-2.5"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" /><div><p className="text-xs font-semibold text-amber-900">Риск без ответственного</p><p className="mt-1 text-xs leading-5 text-amber-800">Для зависимости от команды данных не назначен владелец.</p></div></div></div>
                <button className="flex w-full items-center justify-between rounded-xl border border-violet-100 bg-violet-50/60 p-3.5 text-left transition hover:bg-violet-50"><span><span className="block text-xs font-semibold text-violet-900">Сформировать резюме</span><span className="mt-1 block text-xs text-violet-700">Успехи, риски и вопросы к ревью</span></span><ArrowRight className="size-4 text-violet-600" /></button>
              </div>
            </aside>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" /><h3 className="text-sm font-semibold">Главные достижения</h3></div><ul className="mt-4 space-y-3 text-sm text-slate-600"><li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" /><span>Запущен новый сценарий онбординга: конверсия первого шага выросла на 12%.</span></li><li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" /><span>Доступность сервиса достигла 99,97% — лучший результат за год.</span></li></ul></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Flag className="size-4 text-rose-600" /><h3 className="text-sm font-semibold">Риски и зависимости</h3></div><ul className="mt-4 space-y-3 text-sm text-slate-600"><li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-500" /><span>Нехватка аналитического ресурса может сдвинуть запуск экспериментов.</span></li><li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" /><span>Зависимость от миграции витрины данных соседней командой.</span></li></ul></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Lightbulb className="size-4 text-violet-600" /><h3 className="text-sm font-semibold">Требуются решения</h3></div><ul className="mt-4 space-y-3 text-sm text-slate-600"><li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-violet-500" /><span>Выделить 0,5 FTE аналитика на IV квартал.</span></li><li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-violet-500" /><span>Подтвердить приоритет автоматизации обработки заявок.</span></li></ul></section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

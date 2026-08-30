# MOEX QBR Tool

Веб-приложение для проведения Quarterly Business Review: от стратегии и метрик до инициатив, решений и итогового PDF-отчёта.

**Production:** [moex-qbr-tool.rustamfarrakhov.ru](https://moex-qbr-tool.rustamfarrakhov.ru)

## Возможности

- единый обзор корпоративной стратегии;
- справочник целей и метрик с целевыми и фактическими значениями;
- портфель инициатив, статусы, прогресс, риски, владельцы, команды и FTE;
- автоматическое добавление связанных метрик при включении инициативы в QBR;
- цикл QBR: `Подготовка` → `Ревью` → `Итоги`;
- вопросы и фиксация решений во время ревью;
- AI-обзор периода через OpenRouter;
- печать итогового отчёта в PDF;
- интерактивный онбординг после входа;
- аутентификация и хранение данных в Supabase.

## Технологии

- Next.js 16, React 19, TypeScript;
- Tailwind CSS и компоненты Radix/shadcn;
- Supabase Auth, PostgreSQL, RLS и Edge Functions;
- OpenRouter для AI-анализа;
- Vercel для production-хостинга и custom domain.

## Структура проекта

```text
app/                         страницы и основной UI
components/ui/               переиспользуемые UI-компоненты
lib/                         Supabase-клиент и вычисления
public/                      логотип и favicon
supabase/migrations/         схема PostgreSQL и RLS
supabase/functions/          Edge Functions
supabase/seed.sql            демонстрационные данные
scripts/                     сборка и создание тестового пользователя
tests/                       unit- и render-тесты
docs/                        мастер-промпт и User Guide
```

## Локальный запуск

Требуется Node.js `>=22.13.0`.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Заполните в `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Не помещайте `SUPABASE_SERVICE_ROLE_KEY` и `OPENROUTER_API_KEY` во frontend или Git.

## Supabase

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase secrets set OPENROUTER_API_KEY=<key> AI_MODEL=openai/gpt-4.1-mini
supabase functions deploy ai-qbr-analysis
```

Для демонстрационного пользователя:

```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
  node scripts/seed-auth-user.mjs
```

После создания пользователя примените `supabase/seed.sql`.

## Проверки

```bash
npm run lint
npm test
npm run build:vercel
```

Локальный `npm test` использует GNU `timeout`; на macOS удобнее запускать production-сборку напрямую командой `npm run build:vercel`.

## Деплой в Vercel

1. Импортируйте репозиторий в Vercel.
2. Добавьте `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Укажите Build Command: `npm run build:vercel`.
4. Выполните production deployment.
5. Подключите custom domain и добавьте его в разрешённые Redirect URLs Supabase Auth.

## Документация

- [User Guide (PDF)](output/pdf/MOEX-QBR-Tool-User-Guide.pdf)
- [Бизнес-логика и сценарии](docs/MASTER-PROMPT-SUPABASE.md)

## Ограничения MVP

- AI-анализ требует активного ключа и доступного баланса OpenRouter;
- PDF формируется системной печатью браузера;
- живые LDAP, DWH/ETL-коннекторы и одновременное редактирование несколькими пользователями не входят в MVP.

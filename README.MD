# Aura Finance

Современный full-stack проект для финансового трекинга.

- `frontend`: React + TypeScript + Vite SPA
- `backend`: Express + TypeScript + Prisma
- `database`: PostgreSQL в Docker

Интерфейс собирается как single page application, а backend уже готов для локальной разработки через Prisma и PostgreSQL.

## Структура проекта

```text
FINANCE-TRACKER/
├── frontend/         # React SPA
├── backend/          # Express API + Prisma
├── references/       # Макеты и референсы
└── docker-compose.yml
```

## Что нужно перед стартом

Установите:

- `Node.js` 22+
- `npm` 10+
- `Docker Desktop`
- `Git`

Проверьте, что команды доступны:

```powershell
node -v
npm -v
docker -v
docker compose version
```

## Быстрый старт после clone

### 1. Клонировать проект

```powershell
git clone <URL_ВАШЕГО_РЕПО>
cd FINANCE-TRACKER
```

### 2. Установить зависимости

```powershell
cd D:\work\FINANCE-TRACKER\frontend
npm install

cd D:\work\FINANCE-TRACKER\backend
npm install
```

### 3. Поднять PostgreSQL в Docker

Из корня проекта:

```powershell
cd D:\work\FINANCE-TRACKER
docker compose up -d postgres
```

Проверить, что контейнер жив:

```powershell
docker compose ps
```

## Важный момент по порту базы

Контейнерный PostgreSQL проброшен на `localhost:5433`, а не на `5432`.

Это сделано специально, чтобы не конфликтовать с локально установленным PostgreSQL на Windows, если он у вас уже запущен как системный сервис.

## Настройка backend

Файл окружения уже предусмотрен:

- [backend/.env](D:\work\FINANCE-TRACKER\backend\.env)
- пример: [backend/.env.example](D:\work\FINANCE-TRACKER\backend\.env.example)

Основные значения по умолчанию:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/aura_finance?schema=public
JWT_SECRET=local-development-secret
```

## Инициализация базы

Перейдите в backend и выполните:

```powershell
cd D:\work\FINANCE-TRACKER\backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Что делают команды:

- `prisma:generate` генерирует Prisma Client
- `prisma:migrate` применяет миграции к локальной базе
- `prisma:seed` создаёт demo-пользователя и стартовые данные

## Запуск backend

```powershell
cd D:\work\FINANCE-TRACKER\backend
npm run dev
```

API будет доступен по адресу:

- [http://localhost:4000/api/health](http://localhost:4000/api/health)

## Запуск frontend

В отдельном терминале:

```powershell
cd D:\work\FINANCE-TRACKER\frontend
npm run dev
```

Frontend будет доступен по адресу:

- [http://localhost:5173](http://localhost:5173)

По умолчанию frontend ходит в backend по:

- `http://localhost:4000/api`

Если позже понадобится другой адрес API, можно добавить `.env` в `frontend`:

```env
VITE_API_URL=http://localhost:4000/api
```

## Полный локальный workflow

После первого клонирования типичный порядок такой:

```powershell
cd D:\work\FINANCE-TRACKER
docker compose up -d postgres

cd D:\work\FINANCE-TRACKER\backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Во втором терминале:

```powershell
cd D:\work\FINANCE-TRACKER\frontend
npm install
npm run dev
```

## Демо-аккаунт

После `npm run prisma:seed` можно войти под тестовым пользователем:

- email: `demo@aurafinance.local`
- password: `demodemo`

## Полезные команды

### Backend

```powershell
npm run dev
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run db:up
npm run db:down
npm run db:logs
```

### Frontend

```powershell
npm run dev
npm run build
npm run lint
```

## Проверка, что всё поднялось корректно

Минимальная проверка:

1. Открыть `http://localhost:5173`
2. Убедиться, что backend отвечает на `http://localhost:4000/api/health`
3. Выполнить вход через demo-аккаунт
4. Проверить, что dashboard загружается без ошибок

## Частые проблемы

### Порт `5433` занят

Проверьте, что его не использует другое приложение:

```powershell
netstat -ano | findstr 5433
```

Если порт уже кем-то занят, измените проброс порта в [docker-compose.yml](D:\work\FINANCE-TRACKER\docker-compose.yml) и синхронно обновите `DATABASE_URL` в [backend/.env](D:\work\FINANCE-TRACKER\backend\.env).

### Docker не запущен

Если `docker compose up -d postgres` не работает, сначала запустите Docker Desktop и дождитесь, пока он полностью поднимется.

### Prisma не может подключиться к базе

Проверьте:

- контейнер запущен через `docker compose ps`
- в `backend/.env` указан `localhost:5433`
- миграции были выполнены через `npm run prisma:migrate`

### Frontend не видит backend

Проверьте:

- backend реально запущен на `4000`
- `CLIENT_ORIGIN=http://localhost:5173` в `backend/.env`
- `VITE_API_URL`, если вы переопределяли API URL

## Текущее состояние

Сейчас проект рассчитан на локальную разработку в двух процессах:

- frontend отдельно через Vite
- backend отдельно через Express

База данных поднимается через Docker Compose.

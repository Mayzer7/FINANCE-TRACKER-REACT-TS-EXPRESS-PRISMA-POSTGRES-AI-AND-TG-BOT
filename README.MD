# Aura Finance

Локальный full-stack проект для учёта личных финансов:

- `frontend`: React + TypeScript + Vite
- `backend`: Express + TypeScript + Prisma
- `database`: PostgreSQL в Docker
- `telegram bot`: быстрый ввод доходов и расходов в тот же аккаунт

## Быстрый старт

### 1. Поднять базу

```powershell
docker compose up -d postgres
```

### 2. Настроить backend

Файл окружения:

- `backend/.env`
- пример: `backend/.env.example`

Минимальные переменные:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/aura_finance?schema=public
JWT_SECRET=local-development-secret
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
```

Инициализация:

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### 3. Запустить frontend

```powershell
cd frontend
npm install
npm run dev
```

Приложение:

- frontend: [http://localhost:5173](http://localhost:5173)
- backend health: [http://localhost:4000/api/health](http://localhost:4000/api/health)

## Telegram bot и `APP_URL`

Telegram умеет открывать кнопкой только публичные HTTPS URL. Локальные адреса вроде:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- private LAN IP

для inline-кнопок в Telegram не подходят.

### Режим 1: локальная разработка без tunnel

```env
APP_URL=http://localhost:5173
```

В этом режиме:

- бот не падает
- бот пишет понятный текст с адресом сайта
- ссылку нужно открыть вручную в браузере

### Режим 2: кликабельный переход из Telegram в dev

Используйте публичный HTTPS tunnel URL, например через:

- `ngrok`
- `cloudflared`
- другой аналогичный tunnel

Пример:

```env
APP_URL=https://example-tunnel.ngrok-free.app
```

В этом режиме:

- кнопка `Открыть сайт` в Telegram становится кликабельной
- Telegram показывает стандартное окно подтверждения перехода
- привязка бота и переходы на страницы сайта работают как в production

После смены `APP_URL` перезапустите backend.

## Demo-аккаунт

После `npm run prisma:seed`:

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
```

### Frontend

```powershell
npm run dev
npm run build
npm run lint
```

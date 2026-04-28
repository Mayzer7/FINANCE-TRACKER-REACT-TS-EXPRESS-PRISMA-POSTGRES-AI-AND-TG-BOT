![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/1bff534b5dc6dadc4954b865c2c02f46221da144/screenshots/1.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/2.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/3.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/4.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/5.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/6.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/7.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/8.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/9.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/10.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/11.jpg)
<br><br>
![image alt](https://github.com/Mayzer7/FINANCE-TRACKER-REACT-TS-EXPRESS-PRISMA-POSTGRES-AI-AND-TG-BOT/blob/21a28b03d50b927f74765293fd27b082b4bbad57/screenshots/12.jpg)

# Aura Finance

Aura Finance is a full-stack сервис для учета личных финансов с веб-интерфейсом, Telegram-ботом и AI-помощником. Проект помогает фиксировать доходы и расходы, управлять целями накоплений, видеть текущий баланс и выгружать данные в Excel.

## Features

- Регистрация и вход по `email/password`
- Учет доходов и расходов в одном аккаунте
- Категории операций с разделением по типам
- История всех транзакций и сводка по балансу
- Финансовые цели с прогрессом накоплений
- AI-чат по целям на основе данных пользователя
- Подключение Telegram-бота для быстрого ввода операций
- Excel export для расходов, доходов, транзакций, целей и категорий
- Профиль пользователя с настройкой баланса и Telegram linking

## Tech Stack

- Frontend: `React`, `TypeScript`, `Vite`, `React Router`
- Backend: `Express`, `TypeScript`, `Prisma`, `Zod`, `JWT`, `OpenAI SDK`, `Telegraf`
- Database: `PostgreSQL` в `Docker`
- Export/runtime libraries: `ExcelJS`, `FileSaver`

## Project Structure

- `frontend` - клиентское приложение на React
- `backend` - API, бизнес-логика, Prisma и Telegram-бот
- `docker-compose.yml` - локальный PostgreSQL для разработки

## Quick Start

### 1. Start PostgreSQL

Из корня проекта:

```powershell
docker compose up -d postgres
```

PostgreSQL поднимается на `localhost:5433`, чтобы не конфликтовать с локальной установкой на `5432`.

### 2. Configure backend

Файлы окружения:

- `backend/.env`
- пример: `backend/.env.example`

Минимальный пример `backend/.env`:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/aura_finance?schema=public"
JWT_SECRET="change-me-in-production"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4-mini"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_BOT_USERNAME=""
```

Описание переменных:

- `PORT` - порт backend API
- `CLIENT_ORIGIN` - origin фронтенда для CORS
- `APP_URL` - публичный URL приложения, который используется, в том числе, в сценариях Telegram
- `DATABASE_URL` - строка подключения к PostgreSQL
- `JWT_SECRET` - секрет для подписи JWT-токенов
- `OPENAI_API_KEY` - API key для AI-функций, в том числе чата по финансовым целям
- `OPENAI_MODEL` - модель OpenAI для AI-функций, по умолчанию `gpt-5.4-mini`
- `TELEGRAM_BOT_TOKEN` - токен Telegram-бота
- `TELEGRAM_BOT_USERNAME` - username Telegram-бота без обязательного префикса `@`

### 3. Run backend

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### 4. Run frontend

```powershell
cd frontend
npm install
npm run dev
```

Приложение будет доступно по адресам:

- frontend: [http://localhost:5173](http://localhost:5173)
- backend health: [http://localhost:4000/api/health](http://localhost:4000/api/health)

## Telegram and `APP_URL`

Telegram умеет открывать кнопкой только публичные `HTTPS` URL. Локальные адреса вроде `http://localhost:5173` подходят для обычной локальной разработки, но не для кликабельного перехода из Telegram.

### Local dev without tunnel

```env
APP_URL=http://localhost:5173
```

В этом режиме:

- backend и бот продолжают работать локально
- бот может отправлять текстовую подсказку с адресом сайта
- ссылку нужно открыть вручную в браузере

### Local dev with HTTPS tunnel

Для кликабельного перехода из Telegram используйте публичный tunnel URL, например через:

- `ngrok`
- `cloudflared`
- другой аналогичный tunnel

Пример:

```env
APP_URL=https://example-tunnel.ngrok-free.app
```

В этом режиме:

- кнопка перехода из Telegram становится кликабельной
- deep links и переходы в веб-приложение работают ближе к production-сценарию

После изменения `APP_URL` перезапустите backend.

## Demo Account

После `npm run prisma:seed` доступен demo-аккаунт:

- email: `demo@aurafinance.local`
- password: `demodemo`

## Useful Commands

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

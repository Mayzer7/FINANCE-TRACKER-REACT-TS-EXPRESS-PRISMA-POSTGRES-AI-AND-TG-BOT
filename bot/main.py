import asyncio
import logging
import os

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message
from dotenv import load_dotenv


load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")

dp = Dispatcher()


@dp.message(CommandStart())
async def handle_start(message: Message) -> None:
    user_name = message.from_user.first_name if message.from_user else "друг"
    await message.answer(
        f"Привет, {user_name}! Я бот Finance Tracker. Рад знакомству."
    )


async def main() -> None:
    if not BOT_TOKEN:
        raise ValueError(
            "Не найден BOT_TOKEN. Создайте .env файл в папке bot и укажите токен."
        )

    logging.basicConfig(level=logging.INFO)

    bot = Bot(token=BOT_TOKEN)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())

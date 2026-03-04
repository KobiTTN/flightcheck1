# ✈ FlightCheck

Сайт для перевірки статусу рейсів через AeroDataBox API.

## Локальний запуск

```bash
# 1. Встанови залежності
npm install

# 2. Створи .env файл
cp .env.example .env
# Відкрий .env і встав свій ключ

# 3. Запусти
npm run dev

# 4. Відкрий http://localhost:3000
```

## Деплой на Railway

1. Залий код на GitHub (без `.env` — він в .gitignore)
2. Зайди на [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Вибери репозиторій
4. В Railway: Settings → Variables → додай:
   - `RAPIDAPI_KEY` = твій ключ
5. Railway автоматично запустить `npm start` і дасть публічний URL

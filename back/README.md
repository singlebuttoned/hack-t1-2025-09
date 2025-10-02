# Backend API Server - FastAPI + Elasticsearch

Этот каталог содержит backend приложение на FastAPI для системы анализа Terraform логов с интеграцией Elasticsearch для поиска и хранения данных.

## 🏗️ Архитектура

FastAPI Backend (Port 8000)
├── API Endpoints (/trade/, /trade/{id}/)
├── Elasticsearch Integration (Port 9200)
├── CORS Configuration
└── Swagger Documentation (/docs)


## 🚀 Быстрый старт

### 1. Запуск через Docker (Рекомендуется)

```bash
# Из корневой директории проекта
docker-compose up -d

# Проверить статус
docker-compose ps
```

Backend будет доступен на `http://localhost:8000`

### 2. Локальная разработка

```bash
cd back

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## 📋 API Endpoints

### Основные маршруты

| Метод | URL | Описание | Параметры |
|-------|-----|----------|-----------|
| `GET` | `/` | Главная страница API | - |
| `GET` | `/docs` | Swagger документация | - |
| `GET` | `/trade/` | Список трейдов с поиском | `keyword`, `page`, `start`, `end` |
| `GET` | `/trade/{trade_id}/` | Детали конкретного трейда | `trade_id` (path) |

### Параметры поиска

**GET /trade/**
- `keyword` (optional) - Поиск по полям: counterparty, instrumentId, instrumentName, trader
- `page` (optional, default=1) - Номер страницы для пагинации
- `start` (optional) - Начальная дата фильтрации (ISO format)
- `end` (optional) - Конечная дата фильтрации (ISO format)

### Примеры запросов

```bash
# Базовая проверка
curl http://localhost:8000/

# Получить все трейды (первая страница)
curl http://localhost:8000/trade/

# Поиск по ключевому слову
curl "http://localhost:8000/trade/?keyword=USD&page=1"

# Фильтрация по датам
curl "http://localhost:8000/trade/?start=2024-01-01&end=2024-01-31"

# Получить конкретный трейд
curl "http://localhost:8000/trade/TRADE001/"
```

## 🔍 Elasticsearch Integration

### Подключение
- **URL**: `http://elasticsearch:9200` (внутри Docker)
- **Внешний доступ**: `http://localhost:9200`
- **Индекс**: `trade`

### Структура данных

```json
{
  "trade_id": "TRADE001",
  "counterparty": "Bank A", 
  "instrumentId": "USD001",
  "instrumentName": "USD Forward",
  "trader": "John Doe",
  "trade_date_time": "2024-01-15T10:30:00"
}
```

### Тестирование Elasticsearch

```bash
# Проверить статус кластера
curl http://localhost:9200/_cluster/health

# Посмотреть индексы
curl http://localhost:9200/_cat/indices

# Создать тестовый индекс
curl -X PUT "http://localhost:9200/trade" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "trade_id": {"type": "keyword"},
      "counterparty": {"type": "text"},
      "instrumentId": {"type": "keyword"},
      "instrumentName": {"type": "text"},
      "trader": {"type": "text"},
      "trade_date_time": {"type": "date"}
    }
  }
}'
```

## 📁 Структура проекта
back/
├── Dockerfile # Docker конфигурация
├── requirements.txt # Python зависимости
├── src/ # Исходный код FastAPI
│ ├── main.py # Главное приложение
│ └── es_connector.py # Коннектор к Elasticsearch
├── parser/ # Парсер Terraform логов
│ ├── parser.py # Основная логика парсинга
│ ├── example_run.py # Пример использования
│ └── data/ # Тестовые данные
└── README.md # Этот файл


## 🛠️ Разработка

### Зависимости

```txt
fastapi[all]           # Web framework
sqlalchemy            # ORM (для будущего использования)
asyncpg               # PostgreSQL драйвер
alembic               # Миграции БД
psycopg2-binary       # PostgreSQL адаптер
elasticsearch>=7.17.0 # Elasticsearch клиент
```

### Настройки CORS

Приложение настроено для работы с фронтендом на различных портах:
- `http://localhost:3000` (Next.js dev server)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8000` (локальная разработка)

### Переменные окружения

- `ELASTICSEARCH_URL` - URL Elasticsearch (default: http://elasticsearch:9200)
- `PYTHONUNBUFFERED=1` - Отключение буферизации Python

## 🧪 Тестирование

### Автоматические тесты

```bash
# Установить pytest
pip install pytest pytest-asyncio httpx

# Запустить тесты
pytest tests/
```

### Ручное тестирование

```bash
# Проверить статус сервисов
docker-compose ps

# Посмотреть логи
docker-compose logs backend

# Тестировать API
curl http://localhost:8000/docs  # Swagger UI
```

## 📊 Мониторинг

### Логи

```bash
# Логи backend в реальном времени
docker-compose logs -f backend

# Логи Elasticsearch
docker-compose logs -f elasticsearch
```

### Метрики

- **Health Check**: `GET /` - проверка работоспособности
- **Elasticsearch Health**: `GET http://localhost:9200/_cluster/health`
- **API Documentation**: `GET /docs` - Swagger UI

## 🔧 Troubleshooting

### Частые проблемы

1. **Elasticsearch недоступен**
   ```bash
   # Проверить статус
   curl http://localhost:9200/_cluster/health
   
   # Перезапустить сервисы
   docker-compose restart elasticsearch backend
   ```

2. **CORS ошибки**
   - Проверить настройки в `src/main.py`
   - Убедиться, что фронтенд запущен на разрешенном порту

3. **Порт занят**
   ```bash
   # Найти процесс на порту 8000
   netstat -ano | findstr :8000
   
   # Остановить Docker контейнеры
   docker-compose down
   ```

## 🚀 Deployment

### Production настройки

1. Отключить `--reload` в uvicorn
2. Настроить ограниченные CORS origins
3. Добавить аутентификацию и авторизацию
4. Настроить логирование в файлы
5. Использовать переменные окружения для конфигурации

### Docker Production

```dockerfile
# Использовать production образ
FROM python:3.11-slim

# Отключить debug режим
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📈 Roadmap

### Текущий функционал ✅
- [x] FastAPI приложение с Swagger docs
- [x] Elasticsearch интеграция
- [x] API для поиска трейдов
- [x] CORS настройка
- [x] Docker контейнеризация

### Планируется 🚧
- [ ] Интеграция с парсером Terraform логов
- [ ] Аутентификация и авторизация
- [ ] GraphQL API
- [ ] Кэширование запросов
- [ ] Метрики и мониторинг
- [ ] Unit и integration тесты
- [ ] CI/CD pipeline

## 📄 API Schema

Полная документация API доступна по адресу: http://localhost:8000/docs

Альтернативно: http://localhost:8000/redoc
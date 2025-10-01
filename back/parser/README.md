Парсер Terraform NDJSON логов

Кратко
- Главная функция: `parse_log(lines: List[str]) -> Result | Error` в `parser.py`.
- Вход: массив строк NDJSON (по одной записи на строку).
- Выход: `Result` с двумя полями:
  - `logs: List[Dict]` — распарсенные объекты логов;
  - `error_lines: List[Tuple[int, str]]` — ошибки парсинга отдельных строк (номер и сообщение).
- При глобальной ошибке возвращается `Error(message: str)`.

Архитектура
- `parse_log` — публичная функция для импорта из других модулей.
- `_parse_internal` — основная логика без побочных эффектов, собирает `logs` и `error_lines`.
- `_parse_line_to_dict` — преобразование одной строки NDJSON в `dict`, добавляет `timestamp` и `level`, пытается распарсить `tf_http_req_body`/`tf_http_res_body` как JSON.
- Мок-логгер `Logger` с методами `info`/`error` выводит сообщения в stdout.

Правила парсинга
- Если строка корректный JSON — используется как основа объекта.
- Если не JSON — сохраняется как `{"raw": <строка>}`.
- `timestamp`:
  - берётся из `@timestamp` или извлекается из сырой строки по ISO-формату;
  - если не найден — `unknown`.
- `level`:
  - берётся из `@level` или извлекается из сырой строки (`INFO|DEBUG|TRACE|WARN|ERROR|FATAL`, регистронезависимо);
  - приводится к нижнему регистру; если не найден — `unknown`.
- Тела `tf_http_req_body` и `tf_http_res_body` при наличии и если это строка — пытаемся `json.loads`, иначе оставляем как есть.

Пример использования
```python
from back.parser.parser import parse_log

lines = [
    '{"@timestamp":"2024-09-01T10:00:00Z","@level":"INFO","@message":"terraform plan"}',
    'not a json line',
]

result = parse_log(lines)
if isinstance(result, Exception):
    # в реальном коде проверяйте на Error dataclass, приведено упрощение для примера
    print("Global error", result)
else:
    print(len(result.logs), "logs;", len(result.error_lines), "errors")
```



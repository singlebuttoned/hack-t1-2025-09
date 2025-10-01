import json
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple


# Простой мок-логгер до интеграции с реальным бекенд-логгером
class Logger:
    def error(self, message: str):
        print("ERROR: " + str(message))

    def info(self, message: str):
        print("INFO: " + str(message))


logger = Logger()


# Регулярные выражения для извлечения типичных полей из сырой строки
TIMESTAMP_REGEX = re.compile(
    r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})"
)
LEVEL_REGEX = re.compile(r"\b(INFO|DEBUG|TRACE|WARN|ERROR|FATAL)\b", re.IGNORECASE)


@dataclass
class Error:
    message: str


@dataclass
class Result:
    logs: List[Dict[str, Any]]
    error_lines: List[Tuple[int, str]]


def _parse_line_to_dict(line: str) -> Dict[str, Any]:
    """
    Превращает одну NDJSON-строку в словарь, добавляя поля timestamp/level и
    пытаясь распарсить тела HTTP-запросов/ответов, если они представлены строкой JSON.
    """
    try:
        data = json.loads(line)
    except json.JSONDecodeError:
        data = {"raw": line}

    ts = data.get("@timestamp")
    if not ts and "raw" in data:
        match = TIMESTAMP_REGEX.search(data["raw"])
        if match:
            ts = match.group(0)
    data["timestamp"] = ts or "unknown"

    lvl = data.get("@level")
    if not lvl and "raw" in data:
        match = LEVEL_REGEX.search(data["raw"])
        if match:
            lvl = match.group(1).lower()
    data["level"] = (lvl or "unknown").lower()

    for field in ("tf_http_req_body", "tf_http_res_body"):
        if field in data:
            raw_body = data[field]
            try:
                data[field] = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
            except Exception:
                data[field] = raw_body

    return data


def _parse_internal(lines: List[str]) -> Result:
    """
    Внутренняя реализация парсинга: возвращает список разобранных логов и список ошибок строк.
    """
    logs: List[Dict[str, Any]] = []
    errors: List[Tuple[int, str]] = []

    for idx, raw_line in enumerate(lines, start=1):
        line = raw_line.strip()
        if not line:
            continue
        try:
            entry = _parse_line_to_dict(line)
            logs.append(entry)
        except Exception as e:
            # Локальная ошибка парсинга конкретной строки — не прерываем весь процесс
            errors.append((idx, str(e)))

    return Result(logs=logs, error_lines=errors)


def parse_log(lines: List[str]) -> Result | Error:
    """
    Парсит логи Terraform из NDJSON-строк.

    :param lines: массив строк, каждая строка — одна запись NDJSON
    :return: Result | Error — результат парсинга или глобальная ошибка
    """
    try:
        result = _parse_internal(lines)
    except Exception as e:
        logger.error(e)
        return Error(f"Произошла ошибка при попытке распарсить логи: {e}")

    logger.info(f"Успешно распарсили строк: {len(result.logs)}, ошибок: {len(result.error_lines)}")
    return result

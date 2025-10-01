import json
import sys
from pathlib import Path


# Обеспечиваем импорт модуля parser.py из этой же директории
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from parser import parse_log  # type: ignore


def _get_message(entry: dict) -> str:
    return entry.get("@message", "") or entry.get("raw", "")


def _is_plan(entry: dict) -> bool:
    msg = _get_message(entry).lower()
    return ("terraform" in msg) and ("plan" in msg)


def _is_apply(entry: dict) -> bool:
    msg = _get_message(entry).lower()
    return ("terraform" in msg) and ("apply" in msg)


def main() -> None:
    in_candidates = [
        CURRENT_DIR / "in.json",
        CURRENT_DIR.parent / "in.json",
    ]

    in_path: Path | None = None
    for candidate in in_candidates:
        if candidate.is_file():
            in_path = candidate
            break

    if not in_path:
        print("Не найден входной файл in.json ни по одному из путей:")
        for p in in_candidates:
            print(f"- {p}")
        sys.exit(1)

    with in_path.open("r", encoding="utf-8") as f:
        lines = [line.rstrip("\n") for line in f]

    result = parse_log(lines)

    out_path = CURRENT_DIR / "out.json"

    # Формируем исходную структуру вывода: один раздел с logs;
    # тип раздела определяется по первому встретившемуся ключевому слову (plan/apply)
    sections = []

    # Если глобальная ошибка — сохраняем пустой список секций, печатаем ошибку
    if hasattr(result, "message") and not hasattr(result, "logs"):
        print(f"Глобальная ошибка: {getattr(result, 'message', 'unknown error')}")
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(sections, f, ensure_ascii=False, indent=2)
        print(f"Результат сохранён в: {out_path}")
        return

    logs = getattr(result, "logs", [])

    current_section = None
    detected_type: str | None = None

    for entry in logs:
        if detected_type is None:
            if _is_plan(entry):
                detected_type = "plan"
            elif _is_apply(entry):
                detected_type = "apply"

        if current_section is None:
            current_section = {"type": detected_type or "unknown", "logs": []}
            sections.append(current_section)

        current_section["logs"].append(entry)

    with out_path.open("w", encoding="utf-8") as f:
        json.dump(sections, f, ensure_ascii=False, indent=2)

    print(f"Результат сохранён в: {out_path}")


if __name__ == "__main__":
    main()



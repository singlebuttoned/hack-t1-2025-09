import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
import os
import sys
import json

TIMESTAMP_REGEX = re.compile(
    r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})"
)
LEVEL_REGEX = re.compile(r"\b(INFO|DEBUG|TRACE|WARN|ERROR|FATAL)\b", re.IGNORECASE)

class TerraformLogParser:
    def __init__(self, filepath: str):
        self.filepath = Path(filepath)
        self.sections: List[Dict[str, Any]] = []

    def parse_file(self):
        current_section = None

        with self.filepath.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue

                entry = self._parse_line(line)

                # детект начала новой секции
                if self._is_plan(entry):
                    current_section = {"type": "plan", "logs": []}
                    self.sections.append(current_section)
                elif self._is_apply(entry):
                    current_section = {"type": "apply", "logs": []}
                    self.sections.append(current_section)

                # если секция активна — добавляем лог
                if current_section:
                    current_section["logs"].append(entry)

        return self.sections

    def _parse_line(self, line: str) -> Dict[str, Any]:
        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            data = {"raw": line}

        # timestamp
        ts = data.get("@timestamp")
        if not ts and "raw" in data:
            match = TIMESTAMP_REGEX.search(data["raw"])
            if match:
                ts = match.group(0)
        data["timestamp"] = ts or "unknown"

        # level
        lvl = data.get("@level")
        if not lvl and "raw" in data:
            match = LEVEL_REGEX.search(data["raw"])
            if match:
                lvl = match.group(1).lower()
        data["level"] = (lvl or "unknown").lower()

        # обработка JSON-блоков в http body
        for field in ("tf_http_req_body", "tf_http_res_body"):
            if field in data:
                raw_body = data[field]
                try:
                    data[field] = {
                        "hidden": True,
                        "data": json.loads(raw_body) if isinstance(raw_body, str) else raw_body,
                    }
                except Exception:
                    data[field] = {"hidden": True, "data": raw_body}

        return data

    @staticmethod
    def _is_plan(entry: Dict[str, Any]) -> bool:
        msg = entry.get("@message", "") or entry.get("raw", "")
        return "terraform" in msg and "plan" in msg

    @staticmethod
    def _is_apply(entry: Dict[str, Any]) -> bool:
        msg = entry.get("@message", "") or entry.get("raw", "")
        return "terraform" in msg and "apply" in msg


if __name__ == "__main__":
    # Кандидатные пути к 1.json: сначала в папке parser/data, затем fallback в back/data
    base_dir = os.path.dirname(__file__)
    candidates = [
        os.path.abspath(os.path.join(base_dir, "in.json")),
        os.path.abspath(os.path.join(base_dir, "..", "in.json")),
    ]

    data_path = None
    for candidate in candidates:
        if os.path.isfile(candidate):
            data_path = candidate
            break

    # Если файл не найден ни по одному пути — выводим понятную ошибку и завершаем выполнение
    if not data_path:
        print("Файл не найден. Проверьте наличие по путям:")
        for p in candidates:
            print(f"- {p}")
        sys.exit(1)


    parser = TerraformLogParser(data_path)
    sections = parser.parse_file()

    output_path = os.path.abspath(os.path.join(base_dir, "out.json"))
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(sections, f, ensure_ascii=False, indent=2)

    print(f"Результат сохранён в: {output_path}")

    # Если же вопрос был о текущем коде — он только печатает первые 3 лога каждой секции в консоль, ничего не сохраняя.

Оч классно. Работает. Спасибо большое. Еще и тесты, надеюсь, они тоже работают =)

Что еще надо:
- добавить файл с документацией README.md, коротко описать логику
- добавить логгер. Пока бекенда нет и нет логгера, использовать мок реализацию:
  ```python
  class Logger:
    def error(self, message: str):
      print("ERROR: " + message)
    
    def info(self, message: str):
      print("INFO: " + message)
    
    # ...
  
  logger = Logger()

  def foo():
    logger.info("foo")
  ```
- сейчас файл это скрипт. Переделать в модуль
- в файле есть одна главная функция, которую будут импортировать в другом месте
- приватные функции начинаются с _
- главная функция принимает 
  - на вход массив строк, каждая строка - это одна строка из исходного NDJSON файла
  - на выходе 
    - массив dict (json), каждый dict - это один распарсеный объект
    - массив ошибок: array of tuples (int, str), где int - это номер строки в исходном файле, str это текст ошибки парсинга строки
    - если произошла глобальная ошибка в процессе обработки, то возвращаем объект Error(message: str) вместо этого всего
- то есть, если кодом:
  ```python

  @dataclass
  class Error:
      message: str

  @dataclass
  class ErrorLine:
    line_number: int
    message: str

  @dataclass
  class Result:
    logs: List[Dict]
    error_lines: List[ErrorLine]


  def _parse_internal(lines: List[str]) -> Result:
    pass # реализация

  
  def parse_log(lines: List[str]) -> Result | Error:
    """
    Парсит логи terraform

    :param lines: массив строк, каждая строка - это одна строка из исходного NDJSON файла
    :return: Result | Error - результат парсинга или ошибка
    """
    try:
       result =  _parse_internal(lines)
    
    # тут обработка оибок и нормальный перевод в текст
    except Exception as e:
        logger.error(e)
        return Error(f"Произошла ошибка при попытке распарсить логи: {e}")
    
    return result
  ```
  
    
    
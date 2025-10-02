from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.es_connector import ES_connector

app = FastAPI(
    title="API Documentation",
    description="API documentation for the service",
    version="1.0.0",
    root_path="/api",
    docs_url="/docs"
)

# Настройка CORS
origins = [
    "http://localhost",
    "http://localhost:3000",  # Для React/Next.js frontend
    "http://localhost:8000",  # Для локальной разработки
    "http://localhost:5173",
    "*"  # Временно разрешаем все origins для отладки
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы
    allow_headers=["*"],  # Разрешаем все заголовки
    expose_headers=["*"],  # Разрешаем доступ ко всем заголовкам ответа
    max_age=3600,  # Кэширование предварительных запросов на 1 час
)

es = ES_connector()

total_result_per_page = 10 # we can put it in config file

@app.get("/")
def home():
    return "Welcome to SteelEye Test (Author-Gaurav Balyan)"


@app.get("/trade/{trade_id}/")
def trade_detail(trade_id: str):
    #todo: we can design query in seperate file 

    query = '{"query": {"match": {"trade_id": "%s"}}}' % (trade_id)
    trade_detail = es.get_data("trade", query)

    trade_ouput = None
    if trade_detail and trade_detail["hits"]["hits"]:
        trade_ouput = trade_detail["hits"]["hits"][0]["_source"]
    return {"trade_detail": trade_ouput}

@app.get("/trade/")
def trade(keyword: Optional[str] = None, page: Optional[int] = 1, start: Optional[str]=None, end: Optional[str]=None):
    #todo: we can design query in seperate file 

    start_from = (page - 1) * total_result_per_page
    if keyword:
        query = {
            "from": start_from,
            "query" : {
                "query_string" : {
                "query" : keyword,
                "fields"  : ["counterparty", "instrumentId", "instrumentName", "trader"]
                }
            },
            "sort": "trade_id"
            }
    else:
        if start and end:
            query = {
                "from": start_from,
                "query": { 
                    "bool": { 
                    "must": [
                        { "match_all": {}}
                    ],
                    "filter": [ 
                        { "range": { "trade_date_time": { "gte": start, "lte": end}}}
                    ]
                    }
                },
                "sort": "trade_id"
                }
        else:
            query = {
                "from": start_from,
                "query": {
                    "match_all": {}
                },
                "sort": "trade_id"
            }

    trade_detail = es.get_data("trade", query, total_result_per_page)
    trade_ouput = []
    if trade_detail and trade_detail["hits"]["hits"]:
        for trade_obj in trade_detail["hits"]["hits"]:
            trade_ouput.append(trade_obj["_source"])
    return trade_ouput
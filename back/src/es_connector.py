
import os
from elasticsearch import Elasticsearch

class ES_connector:
    def __init__(self) -> None:
        self.es_client = None
        self.connect()

    def connect(self):
        # Читаем URL из переменной окружения, по умолчанию из docker-compose
        es_url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
        # Клиент 7.17+ принимает строковый URL
        es = Elasticsearch(es_url)
        self.es_client = es

    def insert_document(self, index_name, document_type, document_id, document, refresh=False):
        try:
            return self.es_client.index(index=index_name, doc_type=document_type, id=document_id, body=document,
                                            refresh='wait_for', request_timeout=30)
        except Exception as e:
            print(e)

    def get_data(self, index_name, search_query, size=10): #size can come from config file
        try:
            result = self.es_client.search(index=index_name, body=search_query, allow_partial_search_results=True,
                                           size=size, request_timeout=120)
            return result
        except Exception as e:
            print(e)



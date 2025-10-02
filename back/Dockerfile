

# Для CUDA ядер
# # Use NVIDIA CUDA base image with CUDA 12.8 and cuDNN on Ubuntu 22.04
# FROM nvidia/cuda:12.8.0-cudnn-runtime-ubuntu22.04

# ENV DEBIAN_FRONTEND=noninteractive
# # Set working directory
# WORKDIR /code

# # Install Python 3.11 and pip
# RUN apt-get update && apt-get install -y \
#     software-properties-common \
#     git \
#     curl && \ 
#     add-apt-repository ppa:deadsnakes/ppa && \
#     apt-get update && \
#     apt-get install -y python3.11 python3.11-dev python3.11-distutils python3-pip && \
#     update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1 && \
#     python3 -m pip install --upgrade pip && \
#     apt-get clean && rm -rf /var/lib/apt/lists/*

# # Настройка переменных окружения для кэширования моделей
# ENV TRANSFORMERS_CACHE=/root/.cache/huggingface
# ENV HF_HOME=/root/.cache/huggingface
# ENV TORCH_HOME=/root/.cache/torch

# # Создание директорий для моделей
# RUN mkdir -p /root/.cache/huggingface \
#     && mkdir -p /root/.cache/torch \
#     && mkdir -p /code/models

# # Copy requirements file and install Python dependencies
# COPY ./requirements.txt /code/requirements.txt
# RUN python3 -m pip install --no-cache-dir --upgrade -r /code/requirements.txt

# # Copy source code
# COPY ./src /code/src

# # Expose port 8000
# EXPOSE 8000

# # Run FastAPI app with uvicorn
# CMD ["uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /code

# Настройка переменных окружения для кэширования моделей
ENV TRANSFORMERS_CACHE=/root/.cache/huggingface
ENV HF_HOME=/root/.cache/huggingface
ENV TORCH_HOME=/root/.cache/torch

# Создание директорий для кэша и моделей
RUN mkdir -p /root/.cache/huggingface \
    && mkdir -p /root/.cache/torch \
    && mkdir -p /code/models \
    && chmod -R 755 /root/.cache \
    && chmod -R 755 /code/models

# Установка зависимостей
COPY ./requirements.txt /code/requirements.txt
RUN pip install -r /code/requirements.txt

# Копирование исходного кода
COPY ./src /code/src

# Установка прав на папку src
RUN chmod -R 755 /code/src

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

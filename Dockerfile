# syntax=docker/dockerfile:1.5
FROM python:3.10-slim-bookworm as builder
LABEL org=edenartlab
WORKDIR /app

RUN apt-get update --fix-missing -y \
      && apt-get install -y --fix-missing git  \
      && rm -rf /var/lib/apt/lists/*  # Clean up to reduce layer size

COPY requirements.txt requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt

COPY abraham.py abraham.py

EXPOSE 80

CMD ["python", "-u", "abraham.py"]
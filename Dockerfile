# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster

WORKDIR /app

COPY . .

EXPOSE 8000

CMD [ "python3", "server.py"]
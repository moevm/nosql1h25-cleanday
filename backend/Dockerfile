FROM arangodb:3.12 AS arangodb

FROM python:3.12-alpine AS final

RUN apk add --no-cache \
    su-exec \
    tini \
    libstdc++ \
    tzdata \
    bash \
    tar \
    curl

COPY --from=arangodb /usr/bin/arangodump /usr/bin/arangodump
COPY --from=arangodb /usr/bin/arangorestore /usr/bin/arangorestore
COPY --from=arangodb /usr/bin/arangosh /usr/bin/arangosh
COPY --from=arangodb /etc/arangodb3 /etc/arangodb3
COPY --from=arangodb /usr/share/arangodb3 /usr/share/arangodb3

# Устанавливаем переменные окружения
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем файлы
COPY . .

EXPOSE 8000

CMD ["fastapi", "run", "src/main.py"]
FROM node:22-slim AS frontend-build

WORKDIR /app/chat-widget

COPY chat-widget/package*.json ./
RUN npm ci

COPY chat-widget/ ./
RUN npm run build

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend /app/backend
COPY --from=frontend-build /app/chat-widget/dist /app/chat-widget/dist

COPY index.html /app/index.html
COPY about.html /app/about.html
COPY style.css /app/style.css
COPY about.css /app/about.css
COPY script.js /app/script.js
COPY chat-loader.js /app/chat-loader.js
COPY manifest.json /app/manifest.json
COPY sw.js /app/sw.js
COPY assets /app/assets
COPY hatim.jpg /app/hatim.jpg
COPY hatim1.jpg /app/hatim1.jpg

EXPOSE 8000

CMD ["sh", "-c", "cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
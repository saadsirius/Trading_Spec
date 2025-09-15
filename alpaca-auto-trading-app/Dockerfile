# ---------- Stage 1: build wheels ----------
FROM python:3.11-slim AS deps

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Minimal native deps for scientific libs (pandas, httpx HTTP/2, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Leverage layer caching
COPY backend/requirements.txt .

RUN pip install --upgrade pip \
 && pip wheel --no-cache-dir --no-deps -w /wheels -r requirements.txt


# ---------- Stage 2: runtime ----------
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    APP_MODULE=app.main:app \
    PORT=8000 \
    WORKERS=2 \
    GRACEFUL_TIMEOUT=30 \
    TIMEOUT=60 \
    KEEPALIVE=5 \
    LOG_LEVEL=info

# Create unprivileged user & dirs
RUN adduser --disabled-password --gecos "" --home /home/appuser appuser
WORKDIR /app

# Install runtime deps from prebuilt wheels
COPY --from=deps /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

# Copy app code and gunicorn config/entrypoint
COPY backend/ .
COPY docker/gunicorn.conf.py /app/gunicorn.conf.py
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Security hardening
# - Make FS read-only except for /tmp and /app/data
RUN mkdir -p /app/data
VOLUME ["/app/data"]
EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python - <<'PY' || exit 1
import os, socket
s=socket.socket(); s.settimeout(2)
s.connect(("127.0.0.1", int(os.getenv("PORT","8000"))))
s.close()
PY

USER appuser

# Read-only root FS at runtime is enabled in Compose (see below)
ENTRYPOINT ["/app/entrypoint.sh"]
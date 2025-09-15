import multiprocessing, os

# Workers: 2 x CPU cores is a decent default for ASGI when using uvicorn workers.
# You can override with env WORKERS
workers = int(os.getenv("WORKERS", max(2, multiprocessing.cpu_count())))
worker_class = "uvicorn.workers.UvicornWorker"

bind = f"0.0.0.0:{os.getenv('PORT','8000')}"
graceful_timeout = int(os.getenv("GRACEFUL_TIMEOUT", "30"))
timeout = int(os.getenv("TIMEOUT", "60"))
keepalive = int(os.getenv("KEEPALIVE", "5"))

# Access/error logs to stdout/stderr (12-factor)
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("LOG_LEVEL", "info")

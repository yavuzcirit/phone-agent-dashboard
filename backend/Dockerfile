FROM python:3.12-slim

WORKDIR /app

# System dependencies:
#   build-essential — required to compile some Python packages
#   libsndfile1     — audio file I/O library required by piper-tts
#   espeak-ng       — phoneme backend required by piper-tts
#   curl            — used in Docker healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    espeak-ng \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data/chroma /app/data/piper_models

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

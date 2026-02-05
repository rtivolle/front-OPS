FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OCR
RUN apt-get update && apt-get install -y     tesseract-ocr     tesseract-ocr-fra     tesseract-ocr-eng     ocrmypdf     libxml2-dev     libxslt-dev     zlib1g-dev     && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

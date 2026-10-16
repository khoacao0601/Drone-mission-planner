# Copyright (c) 2026 Khoa Cao. All rights reserved.

# 1. Use official lightweight Python image based on Debian Linux
FROM python:3.11-slim

# 2. Set environment variables to optimize Python within Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set working directory inside container
WORKDIR /app

# 4. Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --require-hashes -r requirements.txt

# 5. Copy the backend application source code
COPY main.py seed.py ./
COPY api/ ./api/
COPY core/ ./core/
COPY crud/ ./crud/
COPY models/ ./models/
COPY schemas/ ./schemas/
COPY services/ ./services/

# 6. Create a non-root user and switch to it for security
RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

# 7. Expose API port
EXPOSE 8000

# 8. Start FastAPI server using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
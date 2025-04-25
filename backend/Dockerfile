FROM python:3.8-slim 

WORKDIR /app

COPY main.py .

RUN pip install --no-cache-dir fastapi uvicorn networkx pydantic

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
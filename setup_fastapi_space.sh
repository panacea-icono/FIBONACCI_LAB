#!/bin/bash

echo "🚀 Preparando entorno FastAPI con Docker..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instálalo primero."
    exit 1
fi

# Crear archivos base
echo "📄 Creando app.py..."
cat <<EOF > app.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"Hello": "World!"}
EOF

echo "📄 Creando requirements.txt..."
echo -e "fastapi\nuvicorn[standard]" > requirements.txt

echo "🐳 Creando Dockerfile..."
cat <<EOF > Dockerfile
FROM python:3.9

RUN useradd -m -u 1000 user && apt-get update && apt-get install -y nano

USER user
ENV PATH="/home/user/.local/bin:\$PATH"

WORKDIR /app

COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=user . /app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
EOF

echo "📄 Creando .gitignore..."
echo -e "venv/\n__pycache__/\n*.pyc" > .gitignore

# Confirmar ejecución Docker
echo "🐳 Construyendo contenedor Docker..."
docker build -t fastapi-app .

echo "🐳 Ejecutando contenedor Docker en puerto 7860..."
docker run -d -p 7860:7860 --name fastapi-running fastapi-app

echo "✅ Aplicación corriendo en http://localhost:7860"

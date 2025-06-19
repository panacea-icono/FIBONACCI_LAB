#!/bin/bash

echo "🌐 Creando carpeta frontend y archivos base..."

mkdir -p frontend

# Crear index.html
cat <<EOF > frontend/index.html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Fibonacci FrontPage</title>
</head>
<body>
    <h1>🌿 Bienvenida a Fibonacci Lab</h1>
    <button onclick="saludar()">Saludar al backend</button>
    <pre id="respuesta"></pre>

    <script src="script.js"></script>
</body>
</html>
EOF

# Crear script.js
cat <<EOF > frontend/script.js
async function saludar() {
    const respuesta = await fetch("http://localhost:7860/");
    const datos = await respuesta.json();
    document.getElementById("respuesta").textContent = JSON.stringify(datos, null, 2);
}
EOF

# Modificar app.py para servir el frontend
echo "⚙️ Configurando FastAPI para servir el frontend..."

cat <<EOF > app.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# Montar carpeta frontend
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

@app.get("/")
def root():
    return {"Hello": "World!"}

@app.get("/front")
def get_front():
    return FileResponse("frontend/index.html")
EOF

# Reconstrucción del contenedor
echo "🐳 Reconstruyendo imagen Docker..."
docker build -t fastapi-app .

# Reiniciar contenedor si existe
if docker ps -a --format '{{.Names}}' | grep -Eq '^fastapi-running$'; then
    docker stop fastapi-running && docker rm fastapi-running
fi

echo "🚀 Lanzando contenedor en puerto 7860..."
docker run -d -p 7860:7860 --name fastapi-running fastapi-app

echo "✅ Frontend disponible en: http://localhost:7860/front"

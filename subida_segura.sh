#!/bin/bash

echo "🚀 Iniciando subida segura de FIBONACCI_LAB..."

# Activar entorno virtual si existe
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
    echo "✅ Entorno virtual activado"
else
    echo "⚠️ No se encontró entorno virtual .venv"
fi

# Añadir .venv al .gitignore si no está
if ! grep -qxF ".venv/" .gitignore; then
    echo ".venv/" >> .gitignore
    echo "🛡️  Añadido '.venv/' a .gitignore"
fi

# Eliminar .venv del historial si ya fue trackeado
if git ls-files | grep -q "^.venv/"; then
    git rm -r --cached .venv
    echo "🧹 .venv eliminado del seguimiento"
fi

# Preparar commit
git add .
read -p "📝 Mensaje de commit: " msg
git commit -m "$msg"

# Verificar si se usa SSH o HTTPS
remote_url=$(git remote get-url origin)
if [[ $remote_url == git@* ]]; then
    echo "🔐 Usando autenticación SSH para $remote_url"
else
    echo "🌐 Usando autenticación HTTPS para $remote_url"
fi

# Push al repositorio
git push
echo "✅ Subida completada con éxito."


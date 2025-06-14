# https://huggingface.co/docs/hub/spaces-sdks-docker

FROM python:3.9

# Crear usuario no-root
RUN useradd -m -u 1000 user

# Instalar nano para edición dentro del contenedor (opcional)
RUN apt-get update && apt-get install -y nano

# Usar el usuario creado
USER user

# Configurar PATH para pip user installs
ENV PATH="/home/user/.local/bin:$PATH"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar primero el archivo de requirements para instalación temprana
COPY --chown=user ./requirements.txt requirements.txt

# Instalar dependencias
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copiar el resto de los archivos
COPY --chown=user . /app

# Comando para levantar el servidor FastAPI con uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]

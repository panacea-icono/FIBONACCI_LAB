FROM python:3.9

RUN useradd -m -u 1000 user && apt-get update && apt-get install -y nano

USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app
COPY --chown=user . /app
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt
 create mode 100644 venv/lib/python3.12/site-packages/typing_inspection/__init__.py
 create mode 100644 venv/lib/python3.12/site-packages/typing_inspection/__pycache__/__init__.cpython-312.pyc
 create mode 100644 venv/lib/python3.12/site-packages/typing_inspection/__pycache__/introspection.cpython-312.pyc
 create mode 100644 venv/lib/python3.12/site-packages/typing_inspection/__pycache__/typing_objects.cpython-312.pyc
 create mode 100644 venv/lib/python3.12/site-packages/typing_inspection/introspection.py
 create mode 100644 venv/lib/python3.12/site-packages/typing_inspection/py.typed
 create mode 100644 venv/lib/python3.12/site-packages/typing_inspection/typing_objects.py
 create mode 100644 venv/lib/python3.12/site-packages/typing_inspection/typing_objects.pyi
 create mode 120000 venv/lib64
 create mode 100644 venv/pyvenv.cfg
Enumerando objetos: 3277, listo.
Contando objetos: 100% (3277/3277), listo.
Compresión delta usando hasta 16 hilos
Comprimiendo objetos: 100% (3241/3241), listo.
Escribiendo objetos: 100% (3276/3276), 10.29 MiB | 2.90 MiB/s, listo.
Total 3276 (delta 538), reusados 0 (delta 0), pack-reusados 0
remote: Resolving deltas: 100% (538/538), completed with 1 local object.
To github.com:panacea-icono/FIBONACCI_LAB.git
   82c8f91..da6322c  main -> main
(venv) DRTV@DRTV-Sistema:~/Documentos/FIBONACCI_LAB$ git commit -m
error: switch `m' requiere un valor
(venv) DRTV@DRTV-Sistema:~/Documentos/FIBONACCI_LAB$ git commit -a
En la rama main
Tu rama está actualizada con 'origin/main'.

nada para hacer commit, el árbol de trabajo está limpio
(venv) DRTV@DRTV-Sistema:~/Documentos/FIBONACCI_LAB$ fastapi
uvicorn[standard]
fastapi: no se encontró la orden
uvicorn[standard]: no se encontró la orden
(venv) DRTV@DRTV-Sistema:~/Documentos/FIBONACCI_LAB$ git push
Everything up-to-date
(venv) DRTV@DRTV-Sistema:~/Documentos/FIBONACCI_LAB$ 

COPY --chown=user . /app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]

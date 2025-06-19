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

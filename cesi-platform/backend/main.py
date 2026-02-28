from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="CESI Platform API")

app.include_router(router)


@app.get("/")
def root():
    return {"message": "CESI Backend Running 🚀"}
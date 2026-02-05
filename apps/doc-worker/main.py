from fastapi import FastAPI, Request

app = FastAPI(title="Doc-Worker API")

@app.get("/")
async def root():
    return {"message": "Doc-Worker is running"}

@app.post("/hook/nextcloud")
async def nextcloud_hook(request: Request):
    # Task 6: Endpoint /hook/nextcloud pour valider et traiter les notifications HTTP
    data = await request.json()
    return {"status": "received", "data": data}

from fastapi import FastAPI

app = FastAPI(title="Doc-Worker API")

@app.get("/")
async def root():
    return {"message": "Doc-Worker is running"}

@app.post("/hook/nextcloud")
async def nextcloud_hook(data: dict):
    # TODO: Implement webhook logic
    return {"status": "received", "data": data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

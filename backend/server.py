from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Query, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import time
# from mongoType import Item, ChangeLog, User, Group
from .mongo.Item import BaseItem, MongoItem, Log
import uvicorn
import os 

from .routers import (
    user,
    item,
    expiration,
)

app = FastAPI()


MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "dentalclinic")

mongo_item_handler = BaseItem(
    MONGO_URL, MONGO_DB, 'item'
)

@app.get("/")
async def hello():
    return {"msg": "Server is online."}

# @app.post("/init/")
# async def init(file: UploadFile = File(...)):
#     # Process CSV file and initialize data
#     return []

# @app.get("/predict/", response_model=List[dict])
# async def predict():
#     # Predict future item needs or quantities
#     return []
# # More endpoints can be added similarly

app.include_router(user.router)
app.include_router(item.router)
app.include_router(expiration.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

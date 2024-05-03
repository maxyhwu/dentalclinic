from fastapi import APIRouter, FastAPI, HTTPException, File, UploadFile, Form, Query, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import time
# from mongoType import Item, ChangeLog, User, Group
from ..mongo.Item import BaseItem, MongoItem, Log
import os
import dataclasses

router = APIRouter(prefix="/expiration", tags=["Expiration"])

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "dentalclinic")

mongo_item_handler = BaseItem(
    MONGO_URL, MONGO_DB, 'item'
)

@router.get("/quantity/", response_model=List[dict])
async def get_expirations_by_quantity(group_name: str):
    items = mongo_item_handler.get_all_items(group_name)
    exp_list = []
    for item in items:
        if item.quantity < item.noti_quan:
            exp_list.append({
                "item_name": item.item_name,
                "quantity": item.quantity,
                "noti_quan":item.noti_quan,
            })

    return exp_list

@router.get("/days/")
async def get_expirations_by_days(group_name: str):
    items = mongo_item_handler.get_all_items(group_name)
    exp_list = []
    current_time = int(time.time())
    for item in items:
        start_time = current_time 
        end_time = current_time + item.noti_days * 86400
        logs: List[Log] = item.logs
        exp_logs: List[Log] = [log for log in logs if log["expiration_date"] is not None and start_time <= log["expiration_date"] <= end_time and (log["remain_quan"] != 0)]
        for log in exp_logs:
            exp_list.append({
                "item_name": item.item_name,
                "expiration_time": log["expiration_date"],
                "remain_quan": log["remain_quan"],
            })

    return exp_list

@router.post("/checkexp/")
async def update_expiration(group_name: str):
    items = mongo_item_handler.get_all_items(group_name)
    current_time = int(time.time())
    for item in items:
        logs = item.logs[::-1]
        total_exp = 0
        for log in logs:
            if log["remain_quan"] == 0:
                continue
            if log["expiration_date"] < current_time and log["remain_quan"] != 0:
                mongo_item_handler.set_remain_quan(group_name, item.item_name, log["create_time"], 0)
                total_exp = total_exp + log["remain_quan"]
        
        if total_exp > 0:
            mongo_item_handler.update_item(group_name, item.item_name, item.quantity-total_exp)
            mongo_item_handler.add_log_to_item(group_name, item.item_name, 
            Log(
                create_time=int(time.time()),
                change_quantity=-1 * total_exp,
                expiration_date=None,
                user_name="auto",
                note="auto_expiration",
                remain_quan=None
            ))
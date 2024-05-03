from fastapi import APIRouter, FastAPI, HTTPException, File, UploadFile, Form, Query, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import time
# from mongoType import Item, ChangeLog, User, Group
from ..mongo.Item import BaseItem, MongoItem, Log
import os
import dataclasses

router = APIRouter(prefix="/item", tags=["Item"])

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "dentalclinic")

mongo_item_handler = BaseItem(
    MONGO_URL, MONGO_DB, 'item'
)

@router.post("/")
async def add_item(
    group_name: str,
    item_name: str,
):
    try:
        item = mongo_item_handler.get_item(group_name, item_name)
        if item is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item {item_name} has been exist.",
            )
        mongo_item_handler.insert_item(MongoItem(
            group_name=group_name,
            item_name=item_name,
            quantity=0,
            noti_quan=0,
            noti_days=0,
            logs=[],
            last_update=int(time.time())
        ))

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {error}",
        )


@router.delete("/")
async def delete_item(
    group_name: str,
    item_name: str,
):
    try:
        item = mongo_item_handler.get_item(group_name, item_name)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item {item_name} is not exist.",
            )
        mongo_item_handler.delete_item_by_item_name(group_name, item_name)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {error}",
        )

@router.post("/set/")
async def set_item(
    group_name: str,
    item_name: str,
    noti_quan: float | None = None,
    noti_days: int | None = None,
):
    try:
        item = mongo_item_handler.get_item(group_name, item_name)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item {item_name} is not exist.",
            )
        mongo_item_handler.update_item(group_name, item_name, None, noti_quan, noti_days)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {error}",
        )

@router.post("/update/")
async def update_item(
    group_name: str,
    item_name: str,
    user_name: str,
    quantity: float | None = None,
    note: str = "", 
    expiration_date: int | None = None,
):
    try:
        item = mongo_item_handler.get_item(group_name, item_name)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item {item_name} is not exist.",
            )
        remain_quan = quantity
        if quantity <= 0:
            expiration_date = None
            remain_quan = 0
            update_remain_quan(group_name, item_name, abs(quantity))

        mongo_item_handler.update_item(group_name, item_name, item.quantity + quantity, None, None)
        mongo_item_handler.add_log_to_item(group_name, item_name, Log(
            create_time=int(time.time()),
            change_quantity=quantity,
            expiration_date=expiration_date,
            user_name=user_name,
            note=note,
            remain_quan=remain_quan,
        ))
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {error}",
        )

def update_remain_quan(group_name: str, item_name: str, used_quantity: float):
    item = mongo_item_handler.get_item(group_name, item_name)

    for log in item.logs:
        if log["remain_quan"] > 0:
            if (used_quantity-log["remain_quan"]) > 0: 
                mongo_item_handler.set_remain_quan(group_name, item_name, log["create_time"], 0)
                used_quantity = used_quantity - log["remain_quan"]
            else:
                mongo_item_handler.set_remain_quan(group_name, item_name, log["create_time"], abs(used_quantity-log["remain_quan"]))
                break

@router.get("/")
async def get_item(
    group_name: str,
    item_name: str = None,
    is_logs: bool = False
):
    try:
        if item_name is None:
            items = mongo_item_handler.get_all_items(group_name)
            if is_logs: 
                return items
            else:
                return [{k: v for k, v in (dataclasses.asdict(item)).items() if k != 'logs'} for item in items]      
        else:
            item = mongo_item_handler.get_item(group_name, item_name)
            if item is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Item {item_name} is not exist.",
                )
            if is_logs: 
                return item
            else:
                return {k: v for k, v in (dataclasses.asdict(item)).items() if k != 'logs'}
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {error}",
        )

@router.get("/logs")
async def get_logs(
    group_name: str,
    item_name: str,
):
    try:
        item = mongo_item_handler.get_item(group_name, item_name)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item {item_name} is not exist.",
            )
        re = {k: v for k, v in (dataclasses.asdict(item)).items() if k == 'logs'}
        return re["logs"]
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {error}",
        )
import dataclasses
from typing import Any, List, Optional
from pydantic import BaseModel, Field
import pymongo

@dataclasses.dataclass
class Log:
    create_time: int
    change_quantity: float
    expiration_date: int | None
    user_name: str
    note: str
    remain_quan: float | None

@dataclasses.dataclass
class MongoItem:
    group_name: str
    item_name: str
    quantity: float
    noti_quan: float
    noti_days: int
    logs: List[Log]
    last_update: int


class BaseItem:
    def __init__(
        self,
        mongo_url: str,
        mongo_db: str,
        mongo_collection: str,
    ) -> None:
        self.client = pymongo.MongoClient(mongo_url)
        self.db = self.client[mongo_db]
        self.collection = self.db[mongo_collection]
        self.collection.create_index("item")

    def insert_item(self, mongo_item: MongoItem) -> None:
        self.collection.insert_one(dataclasses.asdict(mongo_item))

    def get_item(
        self, group_name: str , item_name: str, with_id: bool = False
    ) -> dict | MongoItem | None:
        projection = None if with_id else {"_id": 0}
        item_data = self.collection.find_one(
            {"group_name": group_name, "item_name": item_name}, projection
        )
        if item_data is None:
            return None
        if with_id:
            return item_data
        else:
            return MongoItem(**item_data)

    def get_all_items(
        self, group_name: str, with_id: bool = False
    ) -> list[dict | MongoItem]:
        projection = None if with_id else {"_id": 0}
        item_list = self.collection.find({"group_name": group_name}, projection)
        if item_list is None:
            return []
        if with_id:
            return item_list
        else:
            return [MongoItem(**item) for item in item_list]

    def delete_item_by_item_name(self, group_name:str, item_name: str) -> None:
        return self.collection.delete_one({"group_name": group_name, "item_name": item_name})

    def update_item(
        self, group_name:str, item_name: str, quantity: float | None = None, noti_quan: float | None = None, noti_days: int | None = None
    ) -> None:
        update_data = {}
        if quantity is not None:
            update_data['quantity'] = quantity
        if noti_quan is not None:
            update_data['noti_quan'] = noti_quan
        if noti_days is not None:
            update_data['noti_days'] = noti_days
        self.collection.update_one(
            {"group_name": group_name, "item_name": item_name},
            {"$set": update_data},
        )

    def add_log_to_item(self, group_name: str, item_name: str, log: Log):
        log_dict = dataclasses.asdict(log)
        result = self.collection.update_one(
            {'group_name': group_name, 'item_name': item_name},
            {'$push': {'logs': log_dict}}
        )
        return result
    
    def set_remain_quan(self, group_name: str, item_name: str, create_time: int, remain_quan: float):
        result = self.collection.update_one(
            {'group_name': group_name, 'item_name': item_name, "logs.create_time": create_time},
            {"$set": {"logs.$.remain_quan": remain_quan}}
        )

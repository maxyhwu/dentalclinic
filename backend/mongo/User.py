import dataclasses
from typing import Any, List, Optional
from pydantic import BaseModel, Field
import pymongo

@dataclasses.dataclass
class MongoUser:
    group_name: str
    user_name: str
    password: str
    is_admin: bool = False

class BaseUser:
    def __init__(
        self,
        mongo_url: str,
        mongo_db: str,
        mongo_collection: str,
    ) -> None:
        self.client = pymongo.MongoClient(mongo_url)
        self.db = self.client[mongo_db]
        self.collection = self.db[mongo_collection]
        self.collection.create_index("user_name")

    def insert_user(self, mongo_user: MongoUser) -> None:
        self.collection.insert_one(dataclasses.asdict(mongo_user))

    def get_user(
        self, group_name: str , user_name: str, with_id: bool = False
    ) -> dict | MongoUser | None:
        projection = None if with_id else {"_id": 0}
        user_data = self.collection.find_one(
            {"group_name": group_name, "user_name": user_name}, projection
        )
        if user_data is None:
            return None
        if with_id:
            return user_data
        else:
            return MongoUser(**user_data)

    def get_all_users(
        self, group_name: str, with_id: bool = False
    ) -> list[dict | MongoUser]:
        projection = None if with_id else {"_id": 0}
        user_list = self.collection.find({"group_name": group_name}, projection)
        if user_list is None:
            return []
        if with_id:
            return user_list
        else:
            return [MongoUser(**user) for user in user_list]

    def delete_user_by_user_name(self, group_name:str, user_name: str) -> None:
        return self.collection.delete_one({"group_name": group_name, "user_name": user_name})

    def update_user(
        self, group_name:str, user_name: str, password: str
    ) -> None:
        return self.collection.update_one(
            {"group_name": group_name, "user_name": user_name},
            {"$set": {"password": password}},
        )

import os
from .mongo.Item import BaseItem, Log
import time

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "dentalclinic")

mongo_item_handler = BaseItem(
    MONGO_URL, MONGO_DB, 'item'
)

def update_expiration(group_name: str):
    items = mongo_item_handler.get_all_items(group_name)
    current_time = int(time.time())
    for item in items:
        logs = item.logs[::-1]
        for log in logs:
            if log.remain_quan == 0:
                break
            if log.expiration_date < current_time and log.remain_quan != 0:
                mongo_item_handler.update_item(group_name, item.item_name, quantity=item.quantity-log.remain_quan)
                mongo_item_handler.set_remain_quan(group_name, item.item_name, log.create_time, 0)
                mongo_item_handler.add_log_to_item(group_name, item.item_name, 
                Log(
                    create_time=int(time.time()),
                    quantity = -1 * log.remain_quan,
                    expiration_date=None,
                    user_name="auto",
                    note="auto_expiration",
                    remain_quan=None
                ))


                



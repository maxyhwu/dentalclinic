# Setup
1. 要開好mongo 且 port 為 27017
2. 
```bash
cd backend
```
3. 
```bash
pip install -r requirements.txt   
```
4. 
```bash
cd ..
```
5. 
```bash
python -m backend.server           
```

# Type
```python
@dataclasses.dataclass
class Log:  ＃可以想成是一筆進貨或耗費的單
    create_time: int  
    change_quantity: float ＃加減了多少
    expiration_date: int | None ＃加減了多少量
    user_name: str ＃誰做這筆操作
    note: str ＃註記
    remain_quan: float | None  ＃這筆進貨剩餘的量

@dataclasses.dataclass
class MongoItem:
    group_name: str 
    item_name: str
    quantity: float ＃ 目前存貨量
    noti_quan: float ＃ 低於多少存貨就發提醒
    noti_days: int ＃ 幾天內過期的耗材要發提醒
    logs: List[Log]
    last_update: int ＃目前沒用

@dataclasses.dataclass
class MongoUser:
    group_name: str
    user_name: str
    password: str
    is_admin: bool = False
```


# APIs

### /
呼叫確定這個server活著

## EXPIRATION
### GET /expiration/quantity
獲取所有現在存量低於最低提示存量 的 item 
```python
params=
group_name: str,
```

response example:
```JSON
[
  {
    "item_name": "item1",
    "quantity": 100, # 現在存量
    "noti_quan": 500 # 最低提示存量
  }
]
```

### GET /expiration/days
獲取所有還沒用完但在設定的天數（noti_days）內會到期的物品 
```python
params=
group_name: str,
```

response example:
```JSON
[
  {
    "item_name": "item1",
    "expiration_time": 1714770000,
    "remain_quan": 10
  },
  {
    "item_name": "item1",
    "expiration_time": 1714770001,
    "remain_quan": 2
  }
]
```

### GET /expiration/days
獲取所有還沒用完但在設定的天數（noti_days）內會到期的物品 
```python
params=
group_name: str,
```

response example:
```JSON
[
  {
    "item_name": "item1",
    "expiration_time": 1714770000,
    "remain_quan": 10
  },
  {
    "item_name": "item1",
    "expiration_time": 1714770001,
    "remain_quan": 2
  }
]
```

### POST /expiration/checkexp
去更新過期物品
```python
params=
group_name: str,
```
只回傳status = 200 沒有內容


## ITEM
### POST /item
加一個新的item種類，但不能初始化（因為一些log跟到期日啥的會很麻煩）
```python
params=
group_name: str,
item_name: str,
```
只回傳status = 200 沒有內容

### DELETE /item
刪掉item
```python
params=
group_name: str,
item_name: str,
```
只回傳status = 200 沒有內容

### GET /item
拿到這個 group 的全部 item
```python
params=
group_name: str,
is_log: bool, #要不要拿這個 item 的 log
```
response example:
```JSON
[
  {
    "group_name": "test",
    "item_name": "item1",
    "quantity": 100,
    "noti_quan": 500,
    "noti_days": 50,
    "last_update": 1714752836
  }
]
```

### GET /item
拿 item 的資料
```python
params=
group_name: str,
item_name: str | None, # 如果是 None 就返回全部item
is_log: bool, #要不要拿這個 item 的 log
```
response example:
```JSON
{
"group_name": "test",
"item_name": "item1",
"quantity": 100,
"noti_quan": 500,
"noti_days": 50,
"last_update": 1714752836
}
```

### GET /item/logs
拿到這個 item 的全部 logs
```python
params=
group_name: str,
item_name: str,
```
response example:
```JSON
[
  {
    "create_time": 1714752866,
    "change_quantity": 100,
    "expiration_date": 1714320000,
    "user_name": "chiao",
    "note": "",
    "remain_quan": 0
  },
  {
    "create_time": 1714752875,
    "change_quantity": 100,
    "expiration_date": 1713888000,
    "user_name": "chiao",
    "note": "",
    "remain_quan": 0
  }
]
```

### POST /item/set
設定此 item 的noti_quan以及noti_days
```python
params=
group_name: str,
item_name: str,
noti_quan: float, (optional)
noti_days: int (optional)
```
只回傳status = 200 沒有內容

### POST /item/update
用於進貨或是消耗耗材的更新
```python
params=
group_name: str,
item_name: str,
user_name: str, 
quantity: int , # 進貨10就 輸入10, 耗掉10就輸入-10
note: str, (optional)
expiration_date: int (optional)
```
只回傳status = 200 沒有內容

## USER

### POST /user/add_admin
加入admin的帳號
```python
params=
group_name: str,
user_name: str,
password: str,
```
只回傳status = 200 沒有內容

### POST /user/add_member
加入一般member的帳號
```python
params=
group_name: str,
user_name: str,
password: str,
```
只回傳status = 200 沒有內容

### POST /user/set_password
```python
params=
group_name: str,
user_name: str,
password: str,
```
只回傳status = 200 沒有內容

### DELETE /user
刪掉這個user的帳號
```python
params=
group_name: str,
user_name: str,
```
只回傳status = 200 沒有內容

### GET /user
獲得這個group全部users
```python
params=
group_name: str,
user_name: str,
```
response example:
```JSON
[
  {
    "group_name": "test",
    "user_name": "admin",
    "password": "admin",
    "is_admin": true
  },
  {
    "group_name": "test",
    "user_name": "qq",
    "password": "a",
    "is_admin": false
  }
]
```

### GET /login
登入
```python
params=
group_name: str,
user_name: str,
password: str,
```
response example:
```JSON
{
  "group_name": "test",
  "user_name": "admin",
  "isAdmin": true
}
```
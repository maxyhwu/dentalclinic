from typing import List, Optional
import os
from fastapi import APIRouter, HTTPException, Query, status
from ..mongo.User import BaseUser, MongoUser
router = APIRouter(prefix="/user", tags=["User"])

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "dentalclinic")

mongo_user_handler = BaseUser(
    MONGO_URL, MONGO_DB, 'user'
)

@router.post("/add_admin/")
async def add_member(group_name:str, user_name: str, password: str):
    if mongo_user_handler.get_user(group_name, user_name) is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User {user_name} has been exist.",
        )
    try:
        mongo_user_handler.insert_user(MongoUser(
            group_name=group_name,
            user_name=user_name,
            password=password,
            is_admin=True,
        ))
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {error}",
        )


@router.post("/add_member/")
async def add_member(group_name:str, user_name: str, password: str):
    if len(mongo_user_handler.get_all_users(group_name)) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"group_name {group_name} has not exist.",
        )
    if mongo_user_handler.get_user(group_name, user_name) is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User {user_name} has exist.",
        )
    try:
        mongo_user_handler.insert_user(MongoUser(
            group_name=group_name,
            user_name=user_name,
            password=password,
            is_admin=False,
        ))
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {error}",
        )

@router.post("/set_password/")
async def modify_member(group_name: str, user_name: str, password: str):
    # Modify an existing member's password
    if mongo_user_handler.get_user(group_name, user_name) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="user not found.",
        )
    try:
        mongo_user_handler.update_user(group_name, user_name, password)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {error}",
        )

@router.delete("/")
async def delete_member(group_name: str, user_name: str):
    if mongo_user_handler.get_user(group_name, user_name) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="user not found.",
        )
    try:
        mongo_user_handler.delete_user_by_user_name(group_name, user_name)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {error}",
        )
    
@router.get("/", response_model=List[MongoUser], status_code=status.HTTP_200_OK)
async def get_members(group_name: str):
    return mongo_user_handler.get_all_users(group_name)

@router.post("/login/")
async def login(group_name: str, user_name: str, password: str):
    user: MongoUser = mongo_user_handler.get_user(group_name, user_name)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="user not found.",
        )
    if password != user.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="password is worng.",
        )
    return {"group_name": user.group_name, "user_name": user.user_name, "isAdmin": user.is_admin}


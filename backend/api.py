from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from httpx import AsyncClient

app = FastAPI()


origins = [
    "http://localhost:3040",  # 允许本地开发服务器
    #"https://[].peopledata.org.cn",  # 允许你的前端应用的域名
    "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/")
async def root():
    return {f"message": "Hello, Welcome to Datomspace python API!"}


@app.get("/create")
async def create_datoms():
    return {f"message": "Hello, Create a datoms!"}


@app.get("/get")
async def get_datoms():
    return {f"message": "Hello, get a datoms by Key!"}



@app.get("/proxy/{path:path}")
async def proxy(path: str):
    async with AsyncClient() as client:
        response = await client.get(f"http://localhost:3000/{path}")
    return response.json()

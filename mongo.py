import os
import pymongo
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]

def get_latest_version_comfy():
    generator = db["generators"].find_one({
        "generatorName": "txt2vid"
    })
    defaultVersionId = generator['defaultVersionId']
    return defaultVersionId


def get_latest_version_video():
    generator = db["generators"].find_one({
        "generatorName": "real2real"
    })
    defaultVersionId = generator['defaultVersionId']
    return defaultVersionId

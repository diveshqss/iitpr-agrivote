from pymongo import MongoClient
from flask import current_app

client = None
db = None

def init_db(app):
    global client, db
    uri = app.config["MONGO_URI"]
    client = MongoClient(uri)
    db = client["agrivote"]   # your database name
    print("MongoDB Connected")
import os
import random

class Config:
    JWT_SECRET_KEY = random.randbytes(32)
    DB_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database')
    os.makedirs(DB_FOLDER, exist_ok=True)
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(DB_FOLDER, "orchestrix.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
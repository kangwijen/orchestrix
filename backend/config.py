import os
import random
import warnings
from datetime import timedelta

class Config:
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', random.randbytes(32))
    if os.getenv('JWT_SECRET_KEY') is None:
        warnings.warn("JWT_SECRET_KEY must be set in environment variables", UserWarning)
    
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_COOKIE_SECURE = True
    JWT_COOKIE_CSRF_PROTECT = True
    
    DB_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database')
    os.makedirs(DB_FOLDER, exist_ok=True)
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(DB_FOLDER, "orchestrix.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
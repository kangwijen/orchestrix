import random
import os
from dotenv import load_dotenv
from pathlib import Path

from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User, Tools
from config import Config

from auth.routes import auth_bp
from container.container.routes import container_bp
from container.network.routes import network_bp
from container.volume.routes import volume_bp
from server.routes import server_bp
from infrastructure.routes import infrastructure_bp

from waitress import serve

dotenv_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt = JWTManager(app)

    CORS(app, resources={
        r"/api/*": {
            "origins": [f"http://{os.getenv('NEXTJS_HOST')}:{os.getenv('NEXTJS_PORT')}"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    app.register_blueprint(auth_bp)
    app.register_blueprint(server_bp)
    app.register_blueprint(container_bp)
    app.register_blueprint(infrastructure_bp)
    app.register_blueprint(network_bp)
    app.register_blueprint(volume_bp)

    with app.app_context():
        db.create_all()
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            hashed_password = generate_password_hash('admin')
            admin_user = User(username='admin', password=hashed_password)
            db.session.add(admin_user)
            db.session.commit()

        if not Tools.query.all():
            tools = [
                Tools(name='docker', installed=False),
            ]
            db.session.bulk_save_objects(tools)
            db.session.commit()

    return app

if __name__ == '__main__':
    app = create_app()

    if os.getenv('FLASK_ENV') == 'development':
        app.run(debug=True, host=os.getenv('FLASK_HOST'), port=int(os.getenv('FLASK_PORT')))
    elif os.getenv('FLASK_ENV') == 'production':
        serve(app, host=os.getenv('FLASK_HOST'), port=int(os.getenv('FLASK_PORT')))
    else:
        print(f'Invalid .env configuration')

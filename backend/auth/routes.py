from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from werkzeug.security import check_password_hash
from models import User
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import re

auth_bp = Blueprint('auth', __name__)
limiter = Limiter(key_func=get_remote_address)

def validate_password(password):
    """Password must be at least 8 characters with numbers and letters"""
    if len(password) < 8:
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[a-zA-Z]", password):
        return False
    return True

@auth_bp.route('/api/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request data"}), 400
            
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"message": "Missing username or password"}), 400

        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            access_token = create_access_token(identity=username)
            return jsonify(access_token=access_token), 200

        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"message": "Server error"}), 500

@auth_bp.route('/api/user', methods=['GET'])
@jwt_required()
def user():
    current_user = get_jwt()
    if current_user:
        return jsonify({"message": "User found"}), 200
    
    return jsonify({"message": "User not found"}), 404

@auth_bp.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Successfully logged out"}), 200
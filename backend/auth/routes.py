from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from models import User, db
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

@auth_bp.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_username = get_jwt_identity()
        user = User.query.filter_by(username=current_username).first()
        
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        user_data = {
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
        
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@auth_bp.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_username = get_jwt_identity()
        user = User.query.filter_by(username=current_username).first()
        
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request data"}), 400
            
        if 'email' in data:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"message": "Email already in use"}), 400
            user.email = data['email']
            
        db.session.commit()
        
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@auth_bp.route('/api/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        current_username = get_jwt_identity()
        user = User.query.filter_by(username=current_username).first()
        
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        data = request.get_json()
        if not data or 'current_password' not in data or 'new_password' not in data:
            return jsonify({"message": "Missing required fields"}), 400
            
        if not check_password_hash(user.password, data['current_password']):
            return jsonify({"message": "Current password is incorrect"}), 401
            
        if not validate_password(data['new_password']):
            return jsonify({"message": "Password must be at least 8 characters with numbers and letters"}), 400
            
        user.password = generate_password_hash(data['new_password'])
        db.session.commit()
        
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Server error: {str(e)}"}), 500
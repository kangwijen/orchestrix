from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

import docker

from models import Tools

server_bp = Blueprint('server', __name__)

@server_bp.route('/api/server/sanity', methods=['GET'])
@jwt_required()
def server_status():
    return jsonify({"message": "Server is up and running."}), 200

@server_bp.route('/api/server/tools', methods=['GET'])
@jwt_required()
def list_tools():
    tools = Tools.query.all()
    return jsonify([
        {
            "id": tool.id,
            "name": tool.name,
            "installed": tool.installed
        }
        for tool in tools
    ])
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from flask_cors import cross_origin

import docker
from models import User
from datetime import datetime
import pytz
from dateutil.parser import isoparse

network_bp = Blueprint('network', __name__)

def get_docker_client():
    try:
        return docker.from_env(timeout=30)
    except docker.errors.DockerException as e:
        raise RuntimeError(f"Failed to connect to Docker daemon: {str(e)}")

@network_bp.route('/api/networks/list', methods=['GET'])
@jwt_required()
def list_networks():
    try:
        client = get_docker_client()
        networks = client.networks.list()
        
        networks_list = []
        for network in networks:
            network_info = {
                'id': network.short_id,
                'name': network.name,
                'driver': network.attrs['Driver'],
                'scope': network.attrs['Scope'],
                'created': isoparse(network.attrs['Created']) \
                .astimezone(pytz.UTC) \
                .strftime('%H:%M:%S %d-%m-%Y'),
                'containers': len(network.containers)
            }
            networks_list.append(network_info)

        return jsonify(networks_list), 200
    except Exception as e:
        return jsonify({"message": "Failed to list networks"}), 400
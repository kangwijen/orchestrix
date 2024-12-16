from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from flask_cors import cross_origin

import docker
from models import User
from datetime import datetime
import pytz
from dateutil.parser import isoparse

volume_bp = Blueprint('volume', __name__)

def get_docker_client():
    try:
        return docker.from_env(timeout=30)
    except docker.errors.DockerException as e:
        raise RuntimeError(f"Failed to connect to Docker daemon: {str(e)}")

@volume_bp.route('/api/volumes/list', methods=['GET'])
@jwt_required()
def list_volumes():
    try:
        client = get_docker_client()
        volumes = client.volumes.list()

        volumes_list = []
        for volume in volumes:
            volume_info = {
                'id': volume.short_id,
                'name': volume.name,
                'driver': volume.attrs['Driver'],
                'created': isoparse(volume.attrs['CreatedAt']) \
                .astimezone(pytz.UTC) \
                .strftime('%H:%M:%S %d-%m-%Y'),
            }
            volumes_list.append(volume_info)

        return jsonify(volumes_list), 200
    except Exception as e:
        return jsonify({"message": "Failed to list volumes"}), 400
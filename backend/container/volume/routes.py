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

@volume_bp.route('/api/volumes/list', methods=['GET'])
@jwt_required()
def list_volumes():
    client = docker.from_env()
    volumes = client.volumes.list()

    networks_list = []
    for volume in volumes:
        volume_info = {
            'id': volume.short_id,
            'name': volume.name,
            'driver': volume.attrs['Driver'],
            'created': isoparse(volume.attrs['CreatedAt']) \
            .astimezone(pytz.UTC) \
            .strftime('%H:%M:%S %d-%m-%Y'),
        }
        networks_list.append(volume_info)

    return jsonify(networks_list), 200
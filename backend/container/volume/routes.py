from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash

import docker
from models import User
import pytz
from dateutil.parser import isoparse
import re

volume_bp = Blueprint('volume', __name__)

def get_docker_client():
    try:
        return docker.from_env(timeout=30)
    except docker.errors.DockerException as e:
        raise RuntimeError(f"Failed to connect to Docker daemon: {str(e)}")

def validate_volume_name(volume_name):
    if not re.match(r"^[a-zA-Z0-9][a-zA-Z0-9_.-]+$", volume_name):
        raise ValueError("Invalid volume name format")
    return volume_name

def get_volume_usage_map(client):
    volume_usage = {}
    containers = client.containers.list(all=True)

    for container in containers:
        mounts = container.attrs.get('Mounts', [])
        for mount in mounts:
            if mount.get('Type') == 'volume':
                volume_name = mount.get('Name')
                if not volume_name:
                    continue
                volume_usage.setdefault(volume_name, []).append({
                    'id': container.short_id,
                    'name': container.name,
                    'status': container.status,
                    'mountpoint': mount.get('Destination'),
                    'container_id': container.id
                })
    return volume_usage

@volume_bp.route('/api/volumes/list', methods=['GET'])
@jwt_required()
def list_volumes():
    try:
        client = get_docker_client()
        volumes = client.volumes.list()
        usage_map = get_volume_usage_map(client)

        volumes_list = []
        for volume in volumes:
            usage_data = volume.attrs.get('UsageData') or {}
            volume_info = {
                'id': volume.short_id,
                'name': volume.name,
                'driver': volume.attrs.get('Driver'),
                'scope': volume.attrs.get('Scope'),
                'mountpoint': volume.attrs.get('Mountpoint'),
                'created': isoparse(volume.attrs['CreatedAt']) \
                    .astimezone(pytz.UTC) \
                    .strftime('%H:%M:%S %d-%m-%Y'),
                'size': usage_data.get('Size'),
                'containers': len(usage_map.get(volume.name, []))
            }
            volumes_list.append(volume_info)

        return jsonify(volumes_list), 200
    except Exception:
        return jsonify({"message": "Failed to list volumes"}), 400

@volume_bp.route('/api/volumes/create', methods=['POST'])
@jwt_required()
def create_volume():
    try:
        client = get_docker_client()
        data = request.get_json()

        if not data:
            return jsonify({"message": "Invalid request data"}), 400

        name = data.get('name')
        driver = data.get('driver', 'local')
        options = data.get('options', {})
        labels = data.get('labels', {})

        if name:
            validate_volume_name(name)

        if options and not isinstance(options, dict):
            return jsonify({"message": "Driver options must be a valid object"}), 400

        if labels and not isinstance(labels, dict):
            return jsonify({"message": "Labels must be a valid object"}), 400

        volume = client.volumes.create(
            name=name,
            driver=driver,
            driver_opts=options or None,
            labels=labels or None
        )

        return jsonify({
            "message": "Volume created successfully",
            "volume_name": volume.name
        }), 201

    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except docker.errors.APIError as e:
        return jsonify({"message": f"Docker API error: {str(e)}"}), 400
    except Exception:
        return jsonify({"message": "Failed to create volume"}), 500

@volume_bp.route('/api/volumes/remove/<string:volume_name>', methods=['DELETE'])
@jwt_required()
def remove_volume(volume_name):
    try:
        validate_volume_name(volume_name)
        client = get_docker_client()

        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request data"}), 400

        username = get_jwt_identity()
        password = data.get('password')
        force = bool(data.get('force', False))

        if not password or len(password) > 100:
            return jsonify({"message": "Invalid password"}), 403

        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password, password):
            return jsonify({"message": "Invalid password"}), 403

        volume = client.volumes.get(volume_name)

        if not force:
            usage = get_volume_usage_map(client).get(volume.name, [])
            if usage:
                return jsonify({
                    "message": f"Volume {volume_name} is attached to containers. Detach it or use force to remove."
                }), 400

        volume.remove(force=force)

        return jsonify({"message": f"Volume {volume_name} removed successfully"}), 200

    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except docker.errors.NotFound:
        return jsonify({"message": "Volume not found"}), 404
    except docker.errors.APIError as e:
        return jsonify({"message": f"Docker API error: {str(e)}"}), 400
    except Exception:
        return jsonify({"message": "Failed to remove volume"}), 500

@volume_bp.route('/api/volumes/inspect/<string:volume_name>', methods=['GET'])
@jwt_required()
def inspect_volume(volume_name):
    try:
        validate_volume_name(volume_name)
        client = get_docker_client()

        volume = client.volumes.get(volume_name)
        volume_data = client.api.inspect_volume(volume.name)

        return jsonify(volume_data), 200

    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except docker.errors.NotFound:
        return jsonify({"message": "Volume not found"}), 404
    except docker.errors.APIError as e:
        return jsonify({"message": f"Docker API error: {str(e)}"}), 400
    except Exception:
        return jsonify({"message": "Failed to inspect volume"}), 500

@volume_bp.route('/api/volumes/containers/<string:volume_name>', methods=['GET'])
@jwt_required()
def get_volume_containers(volume_name):
    try:
        validate_volume_name(volume_name)
        client = get_docker_client()

        containers = get_volume_usage_map(client).get(volume_name, [])
        return jsonify(containers), 200

    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except docker.errors.NotFound:
        return jsonify({"message": "Volume not found"}), 404
    except Exception:
        return jsonify({"message": "Failed to fetch volume containers"}), 500
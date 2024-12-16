from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from flask_cors import cross_origin

import docker
from models import User
from datetime import datetime
import pytz
from dateutil.parser import isoparse

container_bp = Blueprint('container', __name__)

@container_bp.route('/api/containers/list', methods=['GET'])
@jwt_required()
def list_containers():
    client = docker.from_env()
    containers = client.containers.list(all=True)
    server_tz = pytz.timezone(datetime.now(pytz.timezone('UTC')).tzname())

    container_list = []
    for container in containers:
        container_info = {
            'id': container.short_id,
            'name': container.name,
            'status': container.status,
            'image': container.image.tags[0] if container.image.tags else "unknown",
            'created': isoparse(container.attrs['Created']) \
                .astimezone(server_tz) \
                .strftime('%H:%M:%S %d-%m-%Y'),
            'ports': container.attrs['NetworkSettings']['Ports'],
        }
        container_list.append(container_info)

    return jsonify(container_list), 200

@container_bp.route('/api/containers/start/<string:container_id>', methods=['POST'])
@jwt_required()
def start_container(container_id):
    client = docker.from_env()
    try:
        container = client.containers.get(container_id)
        container.start()
        return jsonify({"message": f"Container {container_id} started successfully."}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
        
@container_bp.route('/api/containers/stop/<string:container_id>', methods=['POST'])
@jwt_required()
def stop_container(container_id):
    client = docker.from_env()
    try:
        container = client.containers.get(container_id)
        container.stop()
        return jsonify({"message": f"Container {container_id} stopped successfully."}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@container_bp.route('/api/containers/restart/<string:container_id>', methods=['POST'])
@jwt_required()
def restart_container(container_id):
    client = docker.from_env()
    try:
        container = client.containers.get(container_id)
        try:
            container.restart()
        except Exception as e:
            return jsonify({"message": str(e)}), 400
        return jsonify({"message": f"Container {container_id} restarted successfully."}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@container_bp.route('/api/containers/remove/<string:container_id>', methods=['DELETE'])
@jwt_required()
def remove_container(container_id):
    client = docker.from_env()
    data = request.get_json()
    username = get_jwt_identity()
    password = data.get('password')
    
    if not password:
        return jsonify({"message": "Password is required"}), 403
    
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid password"}), 403
    
    try:
        container = client.containers.get(container_id)
        if container.status == "running":
            return jsonify({"message": f"Container {container_id} is running, stop it before removing."}), 400
        container.remove()
        return jsonify({"message": f"Container {container_id} removed successfully."}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
@container_bp.route('/api/containers/logs/<string:container_id>', methods=['GET'])
@jwt_required()
def get_container_logs(container_id):
    client = docker.from_env()
    try:
        container = client.containers.get(container_id)
        logs = container.logs().decode('utf-8')
        return jsonify({"logs": logs}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
@container_bp.route('/api/containers/stats/<string:container_id>', methods=['GET'])
@jwt_required()
def get_container_stats(container_id):
    client = docker.from_env()
    try:
        container = client.containers.get(container_id)
        stats = container.stats(stream=True)
        return (stats), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@container_bp.route('/api/containers/create', methods=['POST'])
@jwt_required()
def create_container():
    client = docker.from_env()
    data = request.get_json()
    
    try:
        image_name = data.get('image', 'nginx:latest')
        container_name = data.get('name')
        ports = data.get('ports', {})
        environment = data.get('environment', {})
        
        try:
            client.images.pull(image_name)
        except docker.errors.ImageNotFound:
            return jsonify({"message": f"Image {image_name} not found"}), 404
        except docker.errors.APIError as e:
            return jsonify({"message": f"Error pulling image: {str(e)}"}), 400
        
        container = client.containers.create(
            image=image_name,
            name=container_name,
            ports=ports,
            environment=environment,
            detach=True
        )
        
        return jsonify({
            "message": "Container created successfully",
            "container_id": container.id
        }), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400


from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from flask_cors import cross_origin
from werkzeug.utils import secure_filename

from models import User

import docker
import tempfile
import os
import uuid
import shutil
import zipfile

import re
from datetime import datetime
import pytz
from dateutil.parser import isoparse

container_bp = Blueprint('container', __name__)

def validate_container_id(container_id):
    if not re.match("^[a-zA-Z0-9]+$", container_id):
        raise ValueError("Invalid container ID format")
    return container_id

def get_docker_client():
    try:
        return docker.from_env(timeout=30)
    except docker.errors.DockerException as e:
        raise RuntimeError(f"Failed to connect to Docker daemon: {str(e)}")

@container_bp.route('/api/containers/list', methods=['GET'])
@jwt_required()
def list_containers():
    try:
        client = get_docker_client()
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
    except Exception as e:
        return jsonify({"message": "Failed to list containers"}), 400

@container_bp.route('/api/containers/start/<string:container_id>', methods=['POST'])
@jwt_required()
def start_container(container_id):
    try:
        validate_container_id(container_id)
        client = get_docker_client()
        container = client.containers.get(container_id)
        container.start()
        return jsonify({"message": f"Container {container_id} started successfully."}), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except docker.errors.NotFound:
        return jsonify({"message": "Container not found"}), 404
    except docker.errors.APIError as e:
        error_msg = str(e)
        if "port is already allocated" in error_msg:
            port_match = re.search(r'Bind for 0.0.0.0:(\d+)', error_msg)
            if port_match:
                port = port_match.group(1)
                return jsonify({"message": f"Port {port} is already in use"}), 409
        return jsonify({"message": f"Error starting container: {error_msg}"}), 400
    except Exception as e:
        return jsonify({"message": "Operation failed"}), 400
        
@container_bp.route('/api/containers/stop/<string:container_id>', methods=['POST'])
@jwt_required()
def stop_container(container_id):
    try:
        validate_container_id(container_id)
        client = get_docker_client()
        container = client.containers.get(container_id)
        container.stop()
        return jsonify({"message": f"Container {container_id} stopped successfully."}), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "Operation failed"}), 400

@container_bp.route('/api/containers/restart/<string:container_id>', methods=['POST'])
@jwt_required()
def restart_container(container_id):
    try:
        validate_container_id(container_id)
        client = get_docker_client()
        container = client.containers.get(container_id)
        try:
            container.restart()
        except Exception as e:
            return jsonify({"message": str(e)}), 400
        return jsonify({"message": f"Container {container_id} restarted successfully."}), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "Operation failed"}), 400

@container_bp.route('/api/containers/remove/<string:container_id>', methods=['DELETE'])
@jwt_required()
def remove_container(container_id):
    try:
        validate_container_id(container_id)
        client = get_docker_client()
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request data"}), 400
            
        username = get_jwt_identity()
        password = data.get('password')
        
        if not password or len(password) > 100:
            return jsonify({"message": "Invalid password"}), 403
        
        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password, password):
            return jsonify({"message": "Invalid password"}), 403
        
        container = client.containers.get(container_id)
        if container.status == "running":
            return jsonify({"message": f"Container {container_id} is running, stop it before removing."}), 400
        container.remove()
        return jsonify({"message": f"Container {container_id} removed successfully."}), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "Operation failed"}), 400
    
@container_bp.route('/api/containers/logs/<string:container_id>', methods=['GET'])
@jwt_required()
def get_container_logs(container_id):
    try:
        validate_container_id(container_id)
        client = get_docker_client()
        container = client.containers.get(container_id)
        logs = container.logs(tail=1000).decode('utf-8')
        return jsonify({"logs": logs}), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "Failed to retrieve logs"}), 400
    
@container_bp.route('/api/containers/stats/<string:container_id>', methods=['GET'])
@jwt_required()
def get_container_stats(container_id):
    try:
        validate_container_id(container_id)
        client = get_docker_client()
        container = client.containers.get(container_id)
        stats = container.stats(stream=True)
        return (stats), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "Failed to retrieve stats"}), 400

@container_bp.route('/api/containers/create', methods=['POST'])
@jwt_required()
def create_container():
    try:
        client = get_docker_client()
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request data"}), 400

        image_name = data.get('image', 'nginx:latest')
        if not re.match("^[a-zA-Z0-9_./-]+:[a-zA-Z0-9_./-]+$", image_name):
            return jsonify({"message": "Invalid image name format"}), 400

        container_name = data.get('name')
        if container_name and not re.match("^[a-zA-Z0-9][a-zA-Z0-9_.-]+$", container_name):
            return jsonify({"message": "Invalid container name format"}), 400

        ports = data.get('ports', {})
        if not isinstance(ports, dict):
            return jsonify({"message": "Invalid ports format"}), 400

        environment = data.get('environment', {})
        if not isinstance(environment, dict):
            return jsonify({"message": "Invalid environment format"}), 400
        
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
        return jsonify({"message": "Container creation failed"}), 400

@container_bp.route('/api/containers/build/dockerfile', methods=['POST'])
@jwt_required()
def build_from_dockerfile():
    if 'dockerfile' not in request.files:
        return jsonify({"message": "No dockerfile provided"}), 400

    file = request.files['dockerfile']
    if file.filename == '':
        return jsonify({"message": "No dockerfile selected"}), 400

    name = request.form.get('name')
    if name and not re.match("^[a-zA-Z0-9][a-zA-Z0-9_.-]+$", name):
        return jsonify({"message": "Invalid container name format"}), 400

    try:
        client = get_docker_client()
        
        build_dir = os.path.join(tempfile.gettempdir(), f"docker_build_{uuid.uuid4().hex}")
        os.makedirs(build_dir, exist_ok=True)
        
        try:
            dockerfile_path = os.path.join(build_dir, "Dockerfile")
            file.save(dockerfile_path)
            
            image_tag = f"local-build-{uuid.uuid4().hex[:8]}"
            image, logs = client.images.build(
                path=build_dir,
                tag=image_tag,
                rm=True
            )
            
            container = client.containers.create(
                image=image_tag,
                name=name,
                detach=True
            )
            
            return jsonify({
                "message": "Container built successfully",
                "container_id": container.id,
                "image_id": image.id
            }), 201
            
        finally:
            if os.path.exists(build_dir):
                shutil.rmtree(build_dir)
                
    except docker.errors.BuildError as e:
        return jsonify({"message": f"Build error: {str(e)}"}), 400
    except docker.errors.APIError as e:
        return jsonify({"message": f"Docker API error: {str(e)}"}), 400
    except Exception as e:
        current_app.logger.error(f"Error in build_from_dockerfile: {str(e)}")
        return jsonify({"message": "Failed to build container"}), 500

@container_bp.route('/api/containers/build/zip', methods=['POST'])
@jwt_required()
def build_from_zip():
    if 'zipfile' not in request.files:
        return jsonify({"message": "No ZIP file provided"}), 400

    file = request.files['zipfile']
    if file.filename == '':
        return jsonify({"message": "No ZIP file selected"}), 400

    if not file.filename.endswith('.zip'):
        return jsonify({"message": "File must be a ZIP archive"}), 400

    name = request.form.get('name')
    if name and not re.match("^[a-zA-Z0-9][a-zA-Z0-9_.-]+$", name):
        return jsonify({"message": "Invalid container name format"}), 400

    try:
        client = get_docker_client()
        
        build_dir = os.path.join(tempfile.gettempdir(), f"docker_build_{uuid.uuid4().hex}")
        os.makedirs(build_dir, exist_ok=True)
        
        try:
            zip_path = os.path.join(build_dir, "source.zip")
            file.save(zip_path)
            
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(build_dir)
            
            dockerfile_path = None
            for root, _, files in os.walk(build_dir):
                for filename in files:
                    if filename.lower() == "dockerfile":
                        dockerfile_path = os.path.join(root, filename)
                        break
                if dockerfile_path:
                    break
            
            if not dockerfile_path:
                return jsonify({"message": "No Dockerfile found in the ZIP archive"}), 400
            
            dockerfile_dir = os.path.dirname(dockerfile_path)
            
            image_tag = f"local-build-{uuid.uuid4().hex[:8]}"
            image, logs = client.images.build(
                path=dockerfile_dir,
                tag=image_tag,
                rm=True
            )
            
            container = client.containers.create(
                image=image_tag,
                name=name,
                detach=True
            )
            
            return jsonify({
                "message": "Container built successfully from ZIP",
                "container_id": container.id,
                "image_id": image.id
            }), 201
            
        finally:
            if os.path.exists(build_dir):
                shutil.rmtree(build_dir)
                
    except zipfile.BadZipFile:
        return jsonify({"message": "Invalid ZIP file"}), 400
    except docker.errors.BuildError as e:
        return jsonify({"message": f"Build error: {str(e)}"}), 400
    except docker.errors.APIError as e:
        return jsonify({"message": f"Docker API error: {str(e)}"}), 400
    except Exception as e:
        current_app.logger.error(f"Error in build_from_zip: {str(e)}")
        return jsonify({"message": "Failed to build container from ZIP"}), 500


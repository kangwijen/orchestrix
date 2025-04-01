from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from flask_cors import cross_origin

import docker
import re
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

def validate_network_id(network_id):
    if not re.match("^[a-zA-Z0-9]+$", network_id):
        raise ValueError("Invalid network ID format")
    return network_id

@network_bp.route('/api/networks/list', methods=['GET'])
@jwt_required()
def list_networks():
    try:
        client = get_docker_client()
        networks = client.networks.list()
        
        networks_list = []
        for network in networks:
            network_data = client.api.inspect_network(network.id)
            
            connected_containers = 0
            if "Containers" in network_data:
                connected_containers = len(network_data["Containers"])
            
            network_info = {
                'id': network.short_id,
                'name': network.name,
                'driver': network.attrs['Driver'],
                'scope': network.attrs['Scope'],
                'created': isoparse(network.attrs['Created']) \
                .astimezone(pytz.UTC) \
                .strftime('%H:%M:%S %d-%m-%Y'),
                'containers': connected_containers
            }
            networks_list.append(network_info)

        return jsonify(networks_list), 200
    except Exception as e:
        return jsonify({"message": f"Failed to list networks: {str(e)}"}), 400

@network_bp.route('/api/networks/create', methods=['POST'])
@jwt_required()
def create_network():
    try:
        client = get_docker_client()
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "Invalid request data"}), 400
            
        name = data.get('name')
        driver = data.get('driver', 'bridge')
        
        if not name or not re.match("^[a-zA-Z0-9][a-zA-Z0-9_.-]+$", name):
            return jsonify({"message": "Invalid network name format"}), 400
            
        # Check if network with this name already exists
        existing_networks = client.networks.list(names=[name])
        if existing_networks:
            return jsonify({"message": f"Network with name '{name}' already exists"}), 409
            
        network = client.networks.create(
            name=name,
            driver=driver
        )
        
        return jsonify({
            "message": "Network created successfully",
            "network_id": network.id
        }), 201
        
    except docker.errors.APIError as e:
        return jsonify({"message": f"Docker API error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"message": f"Failed to create network: {str(e)}"}), 500

@network_bp.route('/api/networks/remove/<string:network_id>', methods=['DELETE'])
@jwt_required()
def remove_network(network_id):
    try:
        validate_network_id(network_id)
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
            
        network = client.networks.get(network_id)
        
        # Prevent removal of default networks
        if network.name in ['bridge', 'host', 'none']:
            return jsonify({"message": "Cannot remove built-in Docker networks"}), 400
            
        # Check if network has containers
        if network.containers:
            return jsonify({"message": f"Network {network_id} has connected containers. Disconnect them first."}), 400
            
        network.remove()
        
        return jsonify({"message": f"Network {network_id} removed successfully"}), 200
        
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except docker.errors.APIError as e:
        return jsonify({"message": f"Docker API error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"message": f"Failed to remove network: {str(e)}"}), 500

@network_bp.route('/api/networks/connect', methods=['POST'])
@jwt_required()
def connect_container():
    try:
        client = get_docker_client()
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "Invalid request data"}), 400
            
        network_id = data.get('networkId')
        container_id = data.get('containerId')
        
        if not network_id or not container_id:
            return jsonify({"message": "Missing network or container ID"}), 400
            
        validate_network_id(network_id)
        
        network = client.networks.get(network_id)
        container = client.containers.get(container_id)
        
        network.connect(container)
        
        return jsonify({"message": f"Container {container_id} connected to network {network_id}"}), 200
        
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except docker.errors.APIError as e:
        return jsonify({"message": f"Docker API error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"message": f"Failed to connect container to network: {str(e)}"}), 500

@network_bp.route('/api/networks/disconnect', methods=['POST'])
@jwt_required()
def disconnect_container():
    try:
        client = get_docker_client()
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "Invalid request data"}), 400
            
        network_id = data.get('networkId')
        container_id = data.get('containerId')
        
        if not network_id or not container_id:
            return jsonify({"message": "Missing network or container ID"}), 400
            
        validate_network_id(network_id)
        
        network = client.networks.get(network_id)
        container = client.containers.get(container_id)
        
        network.disconnect(container)
        
        return jsonify({"message": f"Container {container_id} disconnected from network {network_id}"}), 200
        
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except docker.errors.APIError as e:
        return jsonify({"message": f"Docker API error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"message": f"Failed to disconnect container from network: {str(e)}"}), 500

@network_bp.route('/api/networks/containers/<string:network_id>', methods=['GET'])
@jwt_required()
def get_network_containers(network_id):
    try:
        validate_network_id(network_id)
        client = get_docker_client()
        
        network = client.networks.get(network_id)
        network_data = client.api.inspect_network(network.id)
        
        containers_list = []
        if "Containers" in network_data and network_data["Containers"]:
            for container_id, container_info in network_data["Containers"].items():
                container = client.containers.get(container_id)
                containers_list.append({
                    'id': container.short_id,
                    'name': container.name,
                    'status': container.status,
                })
            
        return jsonify(containers_list), 200
        
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except docker.errors.APIError as e:
        return jsonify({"message": f"Docker API error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"message": f"Failed to get network containers: {str(e)}"}), 500
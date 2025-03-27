from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
import docker
from datetime import datetime, timedelta
import psutil
import os
import json

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')
docker_client = docker.from_env()

STATS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'prev_stats.json')

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        containers = docker_client.containers.list(all=True)
        container_count = len(containers)
        
        networks = docker_client.networks.list()
        network_count = len(networks)
        
        volumes = docker_client.volumes.list()
        volume_count = len(volumes)
        
        system_load = calculate_system_load()
        
        prev_stats = load_previous_stats()
        
        container_change = calculate_change(prev_stats.get('container_count', container_count), container_count)
        network_change = calculate_change(prev_stats.get('network_count', network_count), network_count)
        volume_change = calculate_change(prev_stats.get('volume_count', volume_count), volume_count)
        load_change = calculate_change(prev_stats.get('system_load', system_load), system_load)
        
        save_current_stats({
            'container_count': container_count,
            'network_count': network_count,
            'volume_count': volume_count,
            'system_load': system_load,
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'container_count': container_count,
            'network_count': network_count,
            'volume_count': volume_count,
            'system_load': system_load,
            'container_change': container_change,
            'network_change': network_change,
            'volume_change': volume_change,
            'load_change': load_change
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/activities', methods=['GET'])
@jwt_required()
def get_recent_activities():
    try:
        since = datetime.now() - timedelta(hours=24)
        until = datetime.now()
        
        since_ts = since.timestamp()
        until_ts = until.timestamp()
        
        events_list = list(docker_client.events(
            since=since_ts,
            until=until_ts,
            decode=True
        ))
        
        events = []
        for event in events_list[-10:]:
            events.append({
                'id': event.get('id', '')[:12] if event.get('id') else '',
                'name': event.get('Actor', {}).get('Attributes', {}).get('name', ''),
                'status': event.get('status', ''),
                'time': datetime.fromtimestamp(event.get('time', 0)).isoformat(),
                'type': event.get('Type', '')
            })
            
        return jsonify(events), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_system_load():
    cpu_percent = psutil.cpu_percent(interval=0.5)
    memory_percent = psutil.virtual_memory().percent
    disk_percent = psutil.disk_usage('/').percent

    system_load = (0.4 * cpu_percent) + (0.3 * memory_percent) + (0.3 * disk_percent)
    
    return round(system_load, 1)

def load_previous_stats():
    try:
        if os.path.exists(STATS_FILE):
            with open(STATS_FILE, 'r') as f:
                return json.load(f)
        return {}
    except Exception:
        return {}

def save_current_stats(stats):
    try:
        with open(STATS_FILE, 'w') as f:
            json.dump(stats, f)
    except Exception:
        pass

def calculate_change(previous, current):
    if previous == 0:
        return 0 if current == 0 else 100
    
    change_percent = ((current - previous) / previous) * 100
    return round(change_percent, 1)

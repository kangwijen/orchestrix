from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

import ansible_runner

infrastructure_bp = Blueprint('infrastructure', __name__)

# @infrastructure_bp.route('/api/ansible/list', methods=['GET'])
# @jwt_required()
# def list_playbooks():
#     playbooks = ansible_runner.Runner.list_playbooks()
#     return jsonify(playbooks)
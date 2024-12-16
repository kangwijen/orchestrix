# Orchestrix
**All-in-One DevOps Management Platform**  

Orchestrix is a modern DevOps management platform to streamline the management of tools like Docker, Ansible, and more. 

Simplify workflows, monitor deployments, and manage your infrastructure seamlessly, all in one place.

## Project Structure
- `/frontend` - React-based web application
- `/backend` - Python backend server

## Quick Start

### Frontend Setup
See [Frontend Documentation](./frontend/README.md) for detailed instructions.
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
See [Backend Documentation](./backend/README.md) for detailed instructions.
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Running Orchestrix
1. Start the backend server first
2. Start the frontend development server
3. Access the application at `http://localhost:3000`

## Features
### Docker

Container Management
- [x] List all containers
- [x] Create a container from an image
- [ ] Create a container from custom Dockerfile
- [x] Remove a container
- [x] Start a container
- [x] Stop a container
- [x] Restart a container
- [ ] Pause a container
- [ ] Unpause a container
- [ ] Inspect a container
- [x] Get logs of a container
- [x] Get stats of a container

Network Management
- [ ] List networks
- [ ] Create a network
- [ ] Remove a network
- [ ] Inspect a network
- [ ] Connect a container to a network
- [ ] Disconnect a container from a network

Volume Management
- [ ] List volumes
- [ ] Create a volume
- [ ] Remove a volume
- [ ] Inspect a volume
- [ ] Mount a volume to a container

System Management
- [ ] Get Docker version & info
- [ ] Prune unused objects
- [ ] Monitor events & stats
- [ ] Configure Docker settings


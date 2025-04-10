# Orchestrix
**All-in-One DevOps Management Platform**  

Orchestrix is a modern DevOps management platform to streamline the management of tools like Docker, Ansible, and more. 

Simplify workflows, monitor deployments, and manage your infrastructure seamlessly, all in one place.

## Project Structure
- `/frontend-new` - Next.js based web application
- `/backend` - Python backend server

## Quick Start

### Frontend Setup
See [Frontend Documentation](./frontend-new/README.md) for detailed instructions.
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
1. Setup .env in the parent directory, use .env.example as an example
2. Start the backend server first
3. Start the frontend development server
4. Access the application at `http://localhost:3000`

## Features
### Docker

Container Management
- [x] List all containers
- [x] Create a container from an image
- [x] Create a container from custom Dockerfile
- [ ] Create a container from custom Compose file
- [x] Remove a container
- [x] Start a container
- [x] Stop a container
- [x] Restart a container
- [ ] Pause a container
- [ ] Unpause a container
- [ ] Inspect a container
- [x] Get logs of a container
- [ ] Get stats of a container

Network Management
- [x] List networks
- [x] Create a network
- [x] Remove a network
- [ ] Inspect a network
- [x] Connect a container to a network
- [x] Disconnect a container from a network

Volume Management
- [ ] List volumes
- [ ] Create a volume
- [ ] Remove a volume
- [ ] Inspect a volume
- [ ] Mount a volume to a container
- [ ] Unmount a volume from a container

System Management
- [ ] Get Docker version & info
- [ ] Prune unused objects
- [ ] Configure Docker settings


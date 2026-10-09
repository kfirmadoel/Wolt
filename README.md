# Wolt Clone — Web Application

This project runs the web application in `src/web`:

- **Frontend:** React single-page application.
- **Backend:** Node.js/Express REST API.
- **Backend tests:** Mocha and Supertest tests run in temporary container.

The commands in this guide use Docker only. Run them from the repository root, where `docker-compose.yml` and `.env` are located.

## Ports

Change the ports in the root `.env` file if needed:

```dotenv
FRONTEND_PORT=3001
BACKEND_PORT=3000
```

- `FRONTEND_PORT` is the host port for the website.
- `BACKEND_PORT` is the host and container port for the API.

The frontend image is built with the API address `http://localhost:<BACKEND_PORT>`. Rebuild the images after changing either port.

## Before starting: clean up this project's old containers

If you have run an older version of this project, first run:

```sh
docker compose down --remove-orphans
```

This stops and removes containers belonging to this Compose project, including old project services no longer listed in the current Compose file. It doesn't remove unrelated containers from other projects, and it does not delete project source files.

Then inspect running containers and their published ports:

```sh
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

If another container is using one of this project's ports, either change the corresponding value in `.env`, or stop that specific container only after confirming it is safe to stop:

```sh
docker stop <container-name-or-id>
```

Do not remove or stop every Docker container just to resolve a port conflict; an unrelated container may belong to another project or user.

## Build the images

Build both web service images:

```sh
docker compose --profile app build
```

The backend image contains the Node.js API. The frontend image first builds the React app, then copies its static output into an Nginx image.

Build just one service if needed:

```sh
docker compose --profile backend build backend
docker compose --profile frontend build frontend
```

## Start services separately or together

### Frontend only

```sh
docker compose --profile frontend up --build -d frontend
```

The website files load at `http://localhost:<FRONTEND_PORT>`. The frontend can be viewed without the backend, but API-dependent features such as login, registration, restaurant data, and orders will not work.

### Backend only

```sh
docker compose --profile backend up --build -d backend
```

The API is available at `http://localhost:<BACKEND_PORT>`. Check that it is responding at `http://localhost:<BACKEND_PORT>/api/health`.

### Frontend and backend together (normal app use)

```sh
docker compose --profile app up --build -d
```

This starts both services. Use this option for normal app functionality: the browser loads the frontend, and the frontend sends API requests to the backend.

## Run backend tests

Run the test suite in Docker:

```sh
docker compose --profile test run --build --rm backend-tests
```

The tests use Supertest to call the Express app directly inside the test process. They do not send requests to the running backend container, so test-created users, restaurants, products, and orders stay in the test process's in-memory database. When the test process exits, that test data is discarded; it does not dirty or change a separately running backend container.

The backend itself also uses an in-memory database. Its data lasts only while that backend process is running and is cleared when the backend container is recreated.

## Stop the web services

Stop and remove the frontend and backend containers:

```sh
docker compose down
```

This does not delete source files or Docker images. To stop only one service:

```sh
docker compose stop frontend
docker compose stop backend
```

## C++ recommendation server

This Compose setup is for `src/web` only. It does not build or start the C++ server or the separate TCP client.

# Exercise 3 - Web Server Integration with C++ Recommendation Server

## Project Overview

This exercise builds a Node.js web server that integrates with the C++ recommendation TCP server from Exercise 2.
The web server exposes user-facing HTTP endpoints while using the C++ service internally for user tracking and recommendations.

## Architecture

### Components

- **Node.js Web Server** (`src/web/`)
  - Express.js HTTP API
  - MVC structure with routes, controllers, models, and services
  - TCP client module for communication with the C++ server

- **C++ TCP Server** (`src/server/`)
  - Processes `POST`, `GET`, `PATCH`, `DELETE`, and `HELP` commands
  - Maintains persistent user tracking data
  - Serves recommendation requests over TCP

- **Docker Compose**
  - Runs both services in the same internal network
  - Ensures service readiness with health checks
  - Keeps the C++ server internal to the application network

## Integration Protocol

The web server sends text-based commands to the C++ server over TCP.

### Supported Commands

- `post <userId> <productId>`
  - Record a user product view
  - Returns `201 Created`, `400 Bad Request`, or `404 Not Found`

- `get <userId> <productId>`
  - Retrieve recommendations for the user
  - Returns `200 Ok` plus recommended product IDs or an error status

- `patch <userId> <product1> <product2> ...`
  - Update a user's product data

- `delete <userId>`
  - Remove a user record

## Key Web API Integration

The main integration point is the product view endpoint:

- `GET /api/restaurants/:id/products/:productId`

When the request includes an `x-user-id` header:

- the web server records the view using the C++ server
- the command sent is `post <userId> <productId>`
- the HTTP response remains non-blocking even if TCP communication is delayed

## How to Build and Run

### Option 1: Docker Compose (Recommended)

From the project root:

```bash
docker-compose up --build
```

This starts:

- `cpp-server` on internal port `12345`
- `web-server` on port `3000`

### Option 2: Local Development

```bash
cd src/web
npm install
cd ../..
cd src/server && mkdir -p build && cd build && cmake .. && make server
./src/server/build/server 12345
cd ../../src/web
npm start
```

### Environment Variables

The web server reads:

- `CPP_SERVER_HOST` (default: `cpp-server`)
- `CPP_SERVER_PORT` (default: `12345`)

## Docker Compose Services

- `cpp-server`: C++ recommendation server
- `web-server`: Node.js HTTP server
- `client`: Python TCP client for manual tests
- `tests`: C++ unit tests

`web-server` depends on `cpp-server` and connects to it via internal service name resolution.

## Important Files

- `src/web/services/tcpClient.js`
  - TCP client layer for C++ communication
  - Manages socket connection, timeout, and response parsing

- `src/web/controllers/productsController.js`
  - Records product views when a user requests product details
  - Uses non-blocking TCP integration

- `src/web/index.js`
  - Starts the Express application
  - Exposes health checks and API routes

- `docker-compose.yml`
  - Defines service dependencies, internal network, and ports

- `src/web/Dockerfile.web`
  - Builds the Node.js web server container

## Requirements Covered

- TCP socket integration between Node.js and C++ server
- HTTP endpoint that records product views via `post <userId> <productId>`
- Non-blocking asynchronous TCP communication
- Internal Docker networking with service name resolution
- Health checks for both C++ and web services
- Clear separation: web clients access only the Node.js API

## Troubleshooting

### Connection refused

- Verify services are running:

```bash
docker-compose ps
```

- View C++ server logs:

```bash
docker-compose logs cpp-server
```

- Check connectivity from web container:

```bash
docker exec web-server nc -zv cpp-server 12345
```

### Product view not recorded

- Ensure `x-user-id` is included in the request
- Check web server logs:

```bash
docker-compose logs web-server
```

- Test the C++ server directly:

```bash
echo "get user1 prod1" | nc localhost 12345
```

## Notes

- The C++ server is kept internal and is not exposed directly to HTTP clients
- Product view recording is fire-and-forget to keep the API responsive
- Configuration via environment variables avoids hardcoding service details

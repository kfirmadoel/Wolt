# Exercise 3 - Web Server with C++ Server Integration

## Overview

This exercise implements a Node.js web server (MVC architecture) that communicates with the C++ server from Exercise 2 via TCP sockets. The web server acts as a client connecting to the C++ TCP server for user tracking and product recommendations.

## Architecture

### Components

1. **Node.js Web Server** (`src/web/`)
   - Express.js HTTP API server
   - MVC architecture with routes, controllers, models
   - TCP client module for C++ communication

2. **C++ TCP Server** (`src/server/`)
   - TCP server listening for client connections
   - Processes commands: POST, GET, PATCH, DELETE, HELP
   - Maintains user product tracking database

3. **Docker Setup**
   - Both services run in Docker containers
   - Internal network for service-to-service communication
   - Health checks ensure services are ready

## Integration Details

### TCP Communication Protocol

The Web server communicates with the C++ server using a simple text-based protocol:

#### Commands

- **POST** - Create user with initial products
  ```
  post <userId> <product1> <product2> ...
  ```
  Response: `201 Created` or `400 Bad Request` or `404 Not Found`

- **GET** - Get recommendations
  ```
  get <userId> <productId>
  ```
  Response: `200 Ok\n\n<product1> <product2> ...` or error codes

- **PATCH** - Update user products
  ```
  patch <userId> <product1> <product2> ...
  ```

- **DELETE** - Remove user
  ```
  delete <userId>
  ```

### Integration Points

#### 1. Product View Recording

**Location**: `src/web/controllers/productsController.js`

When a user views a product via `GET /api/restaurants/:id/products/:productId`:

1. The endpoint checks for authentication via `x-user-id` header (middleware)
2. If user is authenticated, an asynchronous TCP message is sent to the C++ server
3. The message format: `post <userId> <productId>`
4. This records the product view for recommendation purposes
5. **Important**: The HTTP response is not blocked by C++ communication

```javascript
if (req.userId) {
    tcpClient.recordProductView(req.userId, req.params.pId).catch(error => {
        console.error(`Warning: Failed to record product view: ${error.message}`);
    });
}
```

### TCP Client Module

**Location**: `src/web/services/tcpClient.js`

Provides three main functions:

1. **`sendCommandToCppServer(command, host, port)`**
   - Low-level TCP communication
   - Handles socket connection, timeouts, error handling
   - Returns a Promise with the server response
   - **Timeout**: 5 seconds per connection

2. **`recordProductView(userId, productId, host, port)`**
   - High-level function to record product views
   - Automatically uses configured C++ server address
   - Gracefully handles failures
   - Non-blocking (fire-and-forget pattern)

3. **`getRecommendations(userId, productId, host, port)`**
   - High-level function to fetch recommendations
   - Parses C++ server response
   - Returns array of recommended product IDs

### Error Handling

The TCP client implements graceful error handling:

1. **Connection Timeout** (5 seconds)
   - If no response within 5 seconds, connection is destroyed
   - Error is logged but doesn't block the API request

2. **Connection Errors**
   - Network errors are caught and logged
   - API continues normally (graceful degradation)

3. **Malformed Responses**
   - Unexpected responses are logged as warnings
   - API request is not affected

4. **Non-blocking**
   - Socket operations use Node.js async patterns
   - Main thread is never blocked
   - Uses Promises for clean async/await syntax

## Docker Setup

### docker-compose.yml Structure

```yaml
networks:
  wolt-network:
    driver: bridge

services:
  cpp-server:     # C++ TCP server
  web-server:     # Node.js web server
  client:         # Python test client
  tests:          # C++ unit tests
```

### Service Dependencies

- **web-server** depends on **cpp-server**
- Health checks ensure cpp-server is ready before web-server starts
- Services communicate via internal Docker network using service names

### Environment Variables

The Web server reads from environment:

- `CPP_SERVER_HOST` (default: `cpp-server`)
- `CPP_SERVER_PORT` (default: `12345`)

These can be overridden in `docker-compose.yml` or when running containers manually.

### Health Checks

1. **cpp-server**: Uses `nc` (netcat) to check TCP port
2. **web-server**: Uses `curl` to check `/api/health` endpoint
3. Both have startup periods and retry logic

## Running the Application

### Option 1: Docker Compose (Recommended)

```bash
cd /home/kfir/Wolt
docker-compose up --build
```

This will:
1. Build both Docker images
2. Create internal network
3. Start C++ server first (with health check)
4. Start Web server (after C++ is ready)
5. Expose ports: 12345 (C++), 3000 (Web)

### Option 2: Manual Docker Build

```bash
# Build C++ server
docker build -t wolt-cpp-server ./src/server -f ./src/server/Dockerfile.server

# Build Web server
docker build -t wolt-web-server ./src/web -f ./src/web/Dockerfile.web

# Create network
docker network create wolt-network

# Run C++ server
docker run --network wolt-network --name cpp-server -p 12345:12345 \
  -v $(pwd)/data:/usr/src/wolt_project/data wolt-cpp-server ./build/server 12345

# Run Web server
docker run --network wolt-network --name web-server -p 3000:3000 \
  -e CPP_SERVER_HOST=cpp-server -e CPP_SERVER_PORT=12345 wolt-web-server
```

### Option 3: Local Development

```bash
# Install dependencies
npm install

# Install C++ dependencies and build
cd src/server && mkdir build && cd build && cmake .. && make server && cd ../../..

# Start C++ server in terminal 1
./src/server/build/server 12345

# Start Node.js server in terminal 2
npm start
```

## Testing the Integration

### Test Product View Recording

```bash
# 1. Create a user via C++ server
echo "post user1 product1 product2" | nc localhost 12345

# 2. View a product via Web API with user header
curl -X GET http://localhost:3000/api/restaurants/1/products/prod1 \
  -H "x-user-id: user1"

# 3. Verify product was recorded
echo "get user1 product1" | nc localhost 12345
```

### Docker Compose Health Check

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs cpp-server
docker-compose logs web-server

# Access web server
curl http://localhost:3000/api/health
```

## Files Created/Modified

### New Files

1. **`src/web/services/tcpClient.js`**
   - TCP client module for C++ communication
   - Handles all socket operations asynchronously

2. **`src/web/Dockerfile.web`**
   - Docker image for Node.js web server
   - Based on Node.js 18-alpine
   - Includes health check

3. **`EXERCISE3_README.md`** (this file)
   - Documentation and integration guide

### Modified Files

1. **`src/web/index.js`**
   - Added `0.0.0.0` host binding for Docker
   - Added health check endpoint

2. **`src/web/controllers/productsController.js`**
   - Integrated TCP client
   - Records product views asynchronously
   - Graceful error handling

3. **`src/web/package.json`**
   - Updated metadata and scripts
   - Ensured Express.js is included

4. **`docker-compose.yml`**
   - Added internal network
   - Added web-server service
   - Updated cpp-server configuration
   - Added health checks
   - Added service dependencies

## Requirements Met

### 1. TCP Socket Integration ✅
- Web server opens TCP connections to C++ server
- Communication via `src/web/services/tcpClient.js`
- Non-blocking async operations

### 2. API Endpoint Identification ✅
- Product view endpoint: `GET /api/restaurants/:id/products/:productId`
- Triggers POST command to C++ server

### 3. Message Format ✅
- Uses C++ server protocol: `post <userId> <productId>`
- Follows existing command format

### 4. Error Handling ✅
- Connection timeouts (5 seconds)
- Connection refused handling
- Malformed response handling
- Graceful degradation

### 5. Asynchronous Operations ✅
- Uses Node.js Promises and async/await
- Non-blocking socket operations
- Main thread never blocked

### 6. Web Server Encapsulation ✅
- C++ server not exposed directly to clients
- All communication through Node.js middleware

### 7. Dockerfile ✅
- Official Node.js base image
- Copies only necessary files
- Installs dependencies with npm
- Exposes port 3000
- Runs via `node` command
- Clean, minimal, secure

### 8. docker-compose.yml ✅
- Internal Docker network
- Services communication via service names
- Web server depends on C++ server
- No external C++ server ports
- Both images built from Dockerfiles
- Health checks for reliability

## Troubleshooting

### "Connection refused" error

1. Verify C++ server is running and healthy:
   ```bash
   docker-compose ps
   ```

2. Check C++ server logs:
   ```bash
   docker-compose logs cpp-server
   ```

3. Test TCP connection manually:
   ```bash
   docker exec web-server nc -zv cpp-server 12345
   ```

### Web server can't connect to C++ server

1. Verify network configuration:
   ```bash
   docker network inspect wolt-network
   ```

2. Ensure both containers are on the network:
   ```bash
   docker exec web-server ping cpp-server
   ```

### Product view not recorded

1. Verify user header is sent:
   ```bash
   curl -X GET http://localhost:3000/api/restaurants/1/products/prod1 \
     -H "x-user-id: user1" -v
   ```

2. Check Web server logs:
   ```bash
   docker-compose logs web-server
   ```

3. Verify C++ server is accepting connections:
   ```bash
   echo "get user1 prod1" | docker exec -i cpp-server nc localhost 12345
   ```

## Performance Considerations

1. **Async Recording**: Product view recording doesn't block HTTP response
2. **Timeouts**: 5-second timeout prevents hanging connections
3. **Connection Pooling**: Each request opens a new connection (simple model)
4. **Graceful Degradation**: API works even if C++ server is unavailable

## Security Considerations

1. **Internal Network**: C++ server only accessible within Docker network
2. **Health Checks**: Verify service readiness before accepting traffic
3. **No Credentials**: No secrets or tokens in Docker image
4. **Environment Variables**: Configuration via environment (not hardcoded)

## Future Enhancements

1. **Connection Pooling**: Reuse connections for better performance
2. **Caching**: Cache recommendations to reduce C++ server load
3. **Message Queuing**: Queue messages if C++ server is unavailable
4. **Metrics**: Add Prometheus metrics for monitoring
5. **Logging**: Centralized logging system (ELK, Loki, etc.)
6. **API Versioning**: Support multiple C++ server versions

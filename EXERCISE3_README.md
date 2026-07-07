# Exercise 3 - Web Server Integration with C++ Recommendation Server

## Project Overview

This assignment adds a Node.js web frontend to the C++ recommendation server built in Exercise 2. The web server exposes an HTTP API and internally uses the C++ TCP service to record product views and fetch recommendations.

The system is implemented in **Node.js/Express** on the web layer, and continues to use the **C++** TCP server from Ex2 for the core recommendation logic. The web layer communicates with the C++ server over a line-based text protocol.

## Architecture & SOLID Principles Analysis

Following the same approach as Ex2, this integration adheres to the **Open-Closed Principle (OCP)**: the existing C++ core is extended, not modified.

### 1. Web server extension without modifying core logic
**Did it require changing the C++ application core?** No.
**Explanation:** The Node.js service communicates with the existing C++ server using the same TCP command protocol from Ex2. The C++ recommendation engine, its command classes, and its storage layer remain unchanged.

### 2. Clean separation between HTTP and recommendation logic
**Did it require changing existing command handling?** No.
**Explanation:** The web server only forwards requests to the C++ TCP server and relays responses back to HTTP clients. The `tcpClient.js` module is the single point of contact with the C++ service, keeping HTTP concerns and recommendation logic isolated from one another.

### 3. Docker runtime options
**Did it require changes to Docker behavior?** Yes.
**Explanation:** The compose setup was extended (not rewritten) to support a fast default app startup, plus optional profiles for running tests or the client separately. The core service definitions (`cpp-server`, `web-server`) did not need to change to support these additional run modes.

## How to Build and Run

### Option 1: Run the app only (fast startup)

From the project root:

```bash
docker-compose up --build
```

This starts the application services:

- `cpp-server` — internal TCP service
- `web-server` — HTTP API on port `3000`

### Option 2: Run the app plus all tests

To run the application and execute both the C++ and Node.js test suites:

```bash
docker-compose --profile tests up --build
```

This starts the application services and additionally runs:

- `tests` — C++ test binary
- `web-tests` — Node.js web test suite

### Option 3: Run only the C++ tests

```bash
docker-compose run --rm tests
```

### Option 4: Run only the Node.js tests

```bash
docker-compose --profile tests run --rm web-tests
```

### Option 5: Run the Python client manually

```bash
docker-compose run --rm client 127.0.0.1 12345
```

### Cleaning up

To stop and remove all containers, including those started under the `tests` profile:

```bash
docker-compose --profile tests down --remove-orphans
```

### Environment Variables

The web service reads:

| Variable          | Default      | Description                          |
|-------------------|--------------|---------------------------------------|
| `CPP_SERVER_HOST` | `cpp-server` | Hostname of the C++ TCP server        |
| `CPP_SERVER_PORT` | `12345`      | Port the C++ TCP server listens on    |

## Docker Compose Services

- `cpp-server` — C++ TCP recommendation server
- `web-server` — Node.js HTTP server
- `client` — Python TCP client (manual/debug use)
- `tests` — runs the C++ test suite
- `web-tests` — runs the Node.js test suite

`docker-compose up --build` starts the main app services only. The `tests` and `web-tests` services live under the `tests` profile, so they only start when that profile is explicitly requested.

## Integration Protocol

The web server sends line-based text commands to the C++ service and receives status-coded responses:

- `POST <userId> <productId>`
  - Records a product view for a user
  - Returns `201 Created`, `400 Bad Request`, or `404 Not Found`

- `GET <userId> <productId>`
  - Requests recommendations for the user
  - Returns `200 OK` plus recommended product IDs, or `404 Not Found`

- `PATCH <userId> <product1> <product2> ...`
  - Updates an existing user's product list
  - Returns `204 No Content` or `404 Not Found`

- `DELETE <userId>`
  - Deletes a user record
  - Returns `204 No Content` or `404 Not Found`

## Notes

- The C++ server is internal and exposed only to the web server, not to outside clients directly.
- All automated tests run through the `tests` and `web-tests` services, both gated behind the `tests` profile.
- The default app run path (`docker-compose up --build`) starts only `cpp-server` and `web-server` — no test containers.
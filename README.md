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

### Option 1: Run servers only (fast startup)

From the project root:

```bash
docker-compose --profile dev up --build
```

This starts the application services:

- `cpp-server` — internal TCP service
- `web-server` — HTTP API on port `3000`

### Option 2: Run full test suite (everything)

To run the application and execute both the C++ and Node.js test suites:

```bash
docker-compose --profile full up --build
```
**important Note: The api tests make the server dirty mean that before start to work with the server close all instances (Cleaning Up) and open with dev profile (Option 1)**

This starts all services and runs:

- `cpp-server` — internal TCP service
- `web-server` — HTTP API
- `cpp-tests` — C++ test suite
- `api-tests` — Node.js API test suite

### Option 3: Run only API tests

```bash
docker-compose --profile api up --build
```

**important Note: The api tests make the server dirty mean that before start to work with the server close all instances (Cleaning Up) and open with dev profile (Option 1)**

This runs:

- `cpp-server` — internal TCP service
- `web-server` — HTTP API
- `api-tests` — Node.js API test suite

### Option 4:


```bash
docker-compose --profile unit up --build
```

This runs:

- `cpp-server` — internal TCP service
- `cpp-tests` — C++ test suite (GTest)

### Cleaning up

To stop and remove all containers:

```bash
docker compose --profile "*" down --remove-orphans
```

### Environment Variables

The web service reads:

| Variable          | Default      | Description                           |
|-------------------|--------------|---------------------------------------|
| `CPP_SERVER_HOST` | `cpp-server` | Hostname of the C++ TCP server        |
| `CPP_SERVER_PORT` | `12345`      | Port the C++ TCP server listens on    |

## Docker Compose Services

- `cpp-server` — C++ TCP recommendation server
- `web-server` — Node.js HTTP server
- `cpp-tests` — C++ test suite using GTest
- `api-tests` — Node.js API test suite

**Profiles:**
- `dev` — Servers only (fastest startup )
- `api` — Servers + API tests
- `unit` — C++ server + C++ tests
- `full` — Everything (all servers and all tests)

## API structure

types

- `User`:
  - `id` (string) — unique user id (e.g. `user_161790...`)
  - `username` (string)
  - `password` (string)
  - `name` (string)
  - `phone` (string)
  - `address` (string)

- `Restaurant`:
  - `id` (string) — unique restaurant id (e.g. `rest_...`)
  - `name` (string)
  - `description` (string)
  - `address` (string)
  - `phone` (string)

- `Product`:
  - `id` (string) — unique product id (e.g. `prod_...`)
  - `restaurantId` (string)
  - `name` (string)
  - `description` (string)
  - `price` (number)

- `Order`:
  - `id` (string)
  - `userId` (string)
  - `restaurantId` (string)
  - `items` (array of object) — each item: `{ "productId": string, "quantity": number }`
  - `totalPrice` (number)
  - `status` (string) — e.g. `pending`, `completed`
  - `createdAt` (ISO timestamp string)

Endpoints

Users

- POST /api/users
  - Create user
  - Request body:
    {
      "username": "alice",
      "password": "hunter2",
      "name": "Alice Example",     
      "phone": "123-4567",         
      "address": "Street 1"        
    }
  - Success (201):
    {
      "message": "User created successfully",
      "id": "user_1617..."
    }
  - Errors: 400 (missing fields), 409 (username taken)

- POST /api/tokens
  - Authenticate user
  - Request body: `{ "username": "alice", "password": "hunter2" }`
  - Success (200): `{ "id": "user_1617..." }` — clients may use `id` in subsequent calls 
  - Errors: 400 (missing fields), 401 (invalid credentials)

- GET /api/users/:User_Id
  - Get user details
  - Success (200): full `User` object (password is not returned)
  - Errors: 404

Restaurants

- GET /api/restaurants
  - Returns: `[ Restaurant, ... ]` (200)

- POST /api/restaurants
  - Create restaurant
  - Request body: `{ "name": "Tasty Place", "description": "...", "address": "...", "phone": "..." }`
  - Success (201): Location header points to `/api/restaurants/:id`

- GET /api/restaurants/:restaurant_Id
  - Returns: `Restaurant` (200) or 404 (Not found)

- PATCH /api/restaurants/:restaurant_Id
  - Body: fields to update (name/description/address/phone)
  - Success: 204 No Content

- DELETE /api/restaurants/:restaurant_id
  - Success: 204 No Content

Products

- GET /api/restaurants/:restaurant_Id/products
  - Returns: `[ Product, ... ]` (200)

- POST /api/restaurants/:restaurant_Id/products
  - Create product
  - Body: `{ "name": "Burger", "price": 5, "description": "..." }`
  - Success (201): Location header `/api/restaurants/:restaurant_Id/products/:product_Id`
  - Errors: 400 for invalid price or missing name

- GET /api/restaurants/:restaurant_Id/products/:product_Id
  - Returns: `Product` (200)

- PATCH /api/restaurants/:restaurant_Id/products/:product_Id
  - Body: partial product object (name/description/price)
  - Success: 204 No Content

- DELETE /api/restaurants/:restaurant_Id/products/:product_Id
  - Success: 204 No Content

Orders

- GET /api/orders
  - Returns orders for the current user
  - Response: `[ Order, ... ]` (200)

- POST /api/orders
  - Create order for the current user
  - Request body:
    {
      "userId": "user_...",
      "restaurantId": "rest_...",
      "items": [ { "productId": "prod_...", "quantity": 2 }, ... ]
    }
  - Success (201): Location header `/api/orders/:Order_id` with empty body
  - Errors: 400 for missing restaurantId or empty items or empty userId

- GET /api/orders/:Order_Id
  - Returns: `Order` (200) or 404

- PATCH /api/orders/:Order_Id
  - Update order . Supported fields: `status` and `items`
  - Success: 204 No Content

- DELETE /api/orders/:Order_Id
  - Success: 204 No Content

Search

- GET /api/search/:query
  - Returns: `{ "restaurants": [...], "products": [...] }` (200)


## Notes

- All Docker Compose commands require a profile: `dev` (servers), `api` (servers + API tests), `unit` (C++ tests), or `full` (everything).
- Use `--profile dev up` for fast startup.
- Use `--profile full up` to run the complete test suite.

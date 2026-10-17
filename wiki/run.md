# Build and run

## Requirements

- Docker Engine/Desktop with the Docker Compose plugin, running Linux containers.
- Free host ports `3000` for the website/API and `8081` for Expo/Metro.
- Expo Go compatible with this project's Expo SDK 57, on an Android device or emulator. Android Debug Bridge (`adb`) is used for the emulator connection below.
- Internet access for the first build to download base images, npm packages and GoogleTest.

Node.js is not required on the host for the Compose setup. For local development, use Node 24.3 or later in the Node 24 release line. Use `npm ci` in each application directory to install the committed lockfile.

## Configure the environment

From the repository root, copy the example file once.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux/macOS shell:

```bash
cp .env.example .env
```

Set `JWT_SECRET` to a locally chosen value in `.env`. Do not commit this file or copy its values into screenshots. Changing the secret invalidates existing login tokens, so sign in again afterwards.

| Variable | Default / use |
| --- | --- |
| `WEB_PORT` | `3000`, the published website/API port |
| `METRO_PORT` | `8081`, the published Metro port |
| `EXPO_PUBLIC_API_URL` | `http://127.0.0.1:3000`, reached from the device |
| `EXPO_PACKAGER_PROXY_URL` | `http://127.0.0.1:8081`, the Metro URL advertised to Expo Go |

The two URLs are device-facing addresses, not Docker service names. The defaults use ADB reverse. If using a phone over LAN, replace `127.0.0.1` in both URLs with the computer's reachable LAN address and allow the two ports through its firewall. If changing a published port, update the corresponding URL and device connection too. Physical-device LAN connections have not been tested.

## Start the full system

These commands work in PowerShell and a Linux shell:

```bash
docker compose config --quiet
docker compose up --build -d
docker compose ps
docker compose logs --tail=80 web-server mobile
```

| Service | Role | Host access |
| --- | --- | --- |
| `mongo` | MongoDB application data | Internal Compose network only |
| `cpp-server` | TCP recommendation service on `12345` | Internal Compose network only |
| `web-server` | Express API and built React website | `http://localhost:3000` |
| `mobile` | Expo/Metro development server | `http://localhost:8081` |

The Node server waits for MongoDB before listening. Compose also waits for MongoDB and C++ health checks before starting it, and waits for the web server before starting Metro. Check `docker compose ps` for service health and use the logs if a service does not become ready.

Open [the website](http://localhost:3000). The Docker build compiles React and copies the result into the Node image. Express serves the website and the API at the same origin, so the production website sends requests to `/api/...` without a separate frontend port. Direct page URLs such as `/orders` return the React app; unknown `/api/...` URLs return JSON errors.

For a readiness check, open [the API health endpoint](http://localhost:3000/api/health), which returns `{"status":"ok"}` only while MongoDB is connected. Metro exposes its status at [http://localhost:8081/status](http://localhost:8081/status).

## Local certificate error during npm installation

If HTTPS inspection causes a certificate verification error during `npm ci`, supply its trusted public root CA to the build. Docker documents [CA trust for HTTPS inspection](https://docs.docker.com/engine/network/ca-certs/) and [temporary build secret mounts](https://docs.docker.com/build/building/secrets/). Skip this section when the build succeeds without a custom certificate.

Export that trusted public certificate as a PEM file outside the repository, with no private key. Set `NPM_CA_FILE` to its absolute path in the ignored root `.env` file; use forward slashes on Windows, for example `C:/certificates/local-root-ca.pem`.

Create `.env.ca-build.yml` in the repository root with the following contents. That local override filename is covered by the existing `.gitignore`.

```yaml
secrets:
  npm_ca:
    file: ${NPM_CA_FILE}
services:
  web-server:
    build:
      secrets: [npm_ca]
  api-tests:
    build:
      secrets: [npm_ca]
  mobile:
    build:
      secrets: [npm_ca]
```

Use both Compose files for commands that build Node images:

```bash
docker compose -f docker-compose.yml -f .env.ca-build.yml config --quiet
docker compose -f docker-compose.yml -f .env.ca-build.yml up --build -d
docker compose -f docker-compose.yml -f .env.ca-build.yml --profile api run --build --rm api-tests
```

The Dockerfiles use the optional certificate only while `npm ci` runs. It is not copied into an image or mounted into the running application. Without this override, the same Dockerfiles run normal `npm ci`. TLS verification stays enabled; do not use `strict-ssl=false` or `NODE_TLS_REJECT_UNAUTHORIZED=0`. This build option does not change trust in Docker itself or in external services contacted by Metro at runtime.

## Connect Android / Expo Go

Start the Android emulator on the host and make sure Expo Go is installed. Docker runs Metro, not the emulator. With one Android device connected, run:

```bash
adb devices
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
adb reverse --list
```

Open `exp://127.0.0.1:8081` in Expo Go. If more than one device is listed, select the intended device with `adb -s <device>` for each reverse command. If `adb` is not on PATH, run it from the installed Android platform-tools directory. Repeat the reverse commands after reconnecting or restarting the emulator.

Port `8081` loads the app bundle; port `3000` loads its data. If the app opens but restaurants fail to load, check the API URL and the reverse rule for `3000`.

## Data, stopping and restarting

A new `mongo-data` volume starts empty. Register through either client, then use a restaurant-owner account to add a restaurant and its menu. [Demo data and image credits](../src/web/backend/demo/README.md) explain how to recreate the sample restaurants through the UI or API. Starting the server does not import `restaurants.json` or copy a database from another computer.

| Volume | Container directory | Contents |
| --- | --- | --- |
| `mongo-data` | `/data/db` | Users, restaurants, dishes and orders |
| `cpp-data` | `/usr/src/wolt_project/data` | Recommendation view history |

Compose prefixes volume names with the project name. Keep the same project directory/name when restarting to reuse the same volumes.

Both MongoDB services use the official `mongo:8.3.9` image. Keep existing MongoDB volumes on this version; do not attach an older MongoDB version to a volume created by a newer server. Use a separate Compose project and fresh volumes for experiments.

```bash
docker compose stop
docker compose start
```

To remove containers and the project network while retaining data:

```bash
docker compose --profile api --profile unit down --remove-orphans
```

Run `docker compose up --build -d` again after source or environment changes. Do not add `-v` to routine shutdown: it removes the saved volumes.

## Tests

Run from the repository root:

```bash
docker compose --profile api run --build --rm api-tests
docker compose --profile unit run --build --rm cpp-tests
```

The `api` profile starts `mongo-tests` for the test runner. The tests create a uniquely named `wolt_test_...` database, call the imported Express app through Supertest, and drop only that database during cleanup. They do not send requests to `web-server` or use the application's `mongo-data` volume. Product detail reads in this suite are public, so they do not add views to the shared C++ server.

The `unit` profile builds and runs the C++ GoogleTest executable in its own container, without `cpp-data`. Each command exits with its suite's result. The Mongo test container can remain running afterwards; stop it with `docker compose --profile api stop mongo-tests`, or use the shutdown command above when finished with the whole environment.

For local API tests, use a local test MongoDB server. `TEST_MONGO_URI` must point to the server without a database name. From `src/web/backend`, after `npm ci`:

PowerShell:

```powershell
$env:TEST_MONGO_URI = 'mongodb://127.0.0.1:27017'
npm test
```

Linux/macOS:

```bash
TEST_MONGO_URI=mongodb://127.0.0.1:27017 npm test
```

The same temporary-database guard applies locally. Use a different port in the URI if your test MongoDB uses one. The test helper accepts only local addresses or the Compose `mongo-tests` hostname.

## Local development

This option runs Node, React and Metro on the host. It needs a running local MongoDB on `27017` and a C++ server reachable on `12345`. The Compose MongoDB/C++ ports are internal and cannot be used by host processes with the unmodified Compose configuration. Avoid starting a second backend or Metro on ports already used by Compose.

To compile and run the C++ server on Linux/WSL, from `src/server`:

```bash
mkdir -p data
cmake -S . -B build
cmake --build build --target server
./build/server 12345
```

This requires CMake and a C++17 compiler. Keep the working directory at `src/server` when starting the executable so its `data` directory is used. Native Windows compilation is not covered by these POSIX socket sources; use the Docker setup or a Linux environment.

In a separate terminal, from `src/web/backend`, install packages with `npm ci` and configure the connection to the local services.

PowerShell:

```powershell
$env:MONGO_URI = 'mongodb://127.0.0.1:27017/wolt'
$env:CPP_SERVER_HOST = '127.0.0.1'
$env:CPP_SERVER_PORT = '12345'
$env:BACKEND_PORT = '3000'
npm start
```

Linux/macOS:

```bash
export MONGO_URI=mongodb://127.0.0.1:27017/wolt
export CPP_SERVER_HOST=127.0.0.1
export CPP_SERVER_PORT=12345
export BACKEND_PORT=3000
npm start
```

Set `JWT_SECRET` in that shell before starting Node. The root `.env` file is used by Compose; the local Node command does not load it automatically.

For the website, open another terminal at `src/web/frontend`, run `npm ci`, then use port `3001` so it does not conflict with the API:

PowerShell:

```powershell
$env:PORT = '3001'
$env:REACT_APP_API_BASE_URL = 'http://localhost:3000'
npm start
```

Linux/macOS:

```bash
PORT=3001 REACT_APP_API_BASE_URL=http://localhost:3000 npm start
```

Open [http://localhost:3001](http://localhost:3001). This development server calls Node on port `3000`. To use the same-origin setup locally instead, clear `REACT_APP_API_BASE_URL` from the frontend shell before running `npm run build` in `src/web/frontend`, then restart the backend and open port `3000`.

For mobile, open a terminal at `src/mobile` and run `npm ci`. With the ADB reverse rules above:

PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL = 'http://127.0.0.1:3000'
$env:EXPO_PACKAGER_PROXY_URL = 'http://127.0.0.1:8081'
npm start -- --go --lan --port 8081
```

Linux/macOS:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000 EXPO_PACKAGER_PROXY_URL=http://127.0.0.1:8081 npm start -- --go --lan --port 8081
```

Open the same `exp://127.0.0.1:8081` address in Expo Go. Restart Metro after changing its environment variables. The emulator's default `10.0.2.2` address is not used by this ADB reverse setup.

## Verification status

The Docker setup was tested with the repository's Dockerfiles and MongoDB 8.3.9. Mobile testing used Expo Go with Expo SDK 57 on an Android 9 emulator and ADB reverse.

| Check | Result |
| --- | --- |
| Build and startup | Application and test images built; MongoDB, C++, Web and Metro became healthy |
| API suite | 39 tests passed in a temporary database, which was removed after the run |
| C++ suite | 14 tests passed |
| Data persistence | MongoDB records and C++ recommendation history survived service restart and container recreation with the same named volumes |
| Website routing | Direct React page URLs loaded the app; unknown API routes returned JSON 404 |
| Metro | Android manifest and JavaScript bundle loaded successfully |
| Mobile flows | Registration with picture selection, login, checkout, order editing and order deletion worked against the Compose API |

The API tests cover input validation, duplicate and concurrent registration, ownership, deleted restaurants and dishes, and preserved order history. Run the commands in [Tests](#tests) to repeat the API and C++ suites.

See the [application walkthrough](flows.md) for screenshots and the main client flows. iOS and physical-device LAN connections have not been tested.

## Dependency maintenance

The locked backend dependencies include `proxy-addr` 2.0.7 with a [critical advisory](https://github.com/advisories/GHSA-jqcg-44mw-7w3h) and `qs` 6.15.3 with [parsing](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx) and [serialization](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g) advisories. Their affected configurations are not used here: Express has `trust proxy=false`, uses the simple query parser and JSON bodies, and the application does not call `qs.stringify`. Patched releases are `proxy-addr` 2.0.8 and `qs` 6.16.0; the current lockfile retains the versions listed above.

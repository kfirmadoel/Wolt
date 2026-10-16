# Exercise 5 - Wolt

The project includes a React website and a React Native mobile app. Both clients use the same Node.js/Express API for users, restaurants, menus and orders. This data is stored in MongoDB. The C++ TCP server from Exercise 2 records product views and provides recommendations.

Users can browse and search restaurants, view menus, manage a cart and create, edit or delete their orders. Restaurant owners can manage their restaurants and dishes. Both clients include a profile page and light/dark themes.

## Project structure

| Directory | Contents |
| --- | --- |
| `src/server` | C++ recommendation server and GoogleTest tests |
| `src/client` | Python TCP client from Exercise 2 |
| `src/web/backend` | Express API, Mongoose models and API tests |
| `src/web/frontend` | React website |
| `src/mobile` | React Native app with Expo |
| `wiki` | Run instructions and application walkthrough |

## How to build and run

Install Docker with the Compose plugin and use Linux containers. Run the commands from the project root. Copy `.env.example` to `.env` and set a local `JWT_SECRET`; keep `.env` out of Git.

```bash
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

The default setup starts MongoDB, the C++ server, the Node server with the built React website, and Expo/Metro. Open [http://localhost:3000](http://localhost:3000) for the website. Expo Go and the Android emulator run on the host computer and connect to Metro on port `8081`.

See [the run guide](wiki/run.md) for Windows/Linux commands, the emulator connection, local development, stopping the services and the current verification status. The old `dev` and `full` profiles are no longer needed.

## Tests

Run each suite separately from the project root:

```bash
docker compose --profile api run --build --rm api-tests
docker compose --profile unit run --build --rm cpp-tests
```

API tests use their own MongoDB service and a temporary database. They call an imported Express app, not the running application server. The C++ tests do not mount the recommendation server's data volume. See [test details](wiki/run.md#tests) for the local test command.

The final container suites passed: 39 API tests and 14 C++ tests. The repository configuration uses the verified MongoDB 8.3.9 image. Saved application and recommendation data survived both service restart and container recreation. The [run guide](wiki/run.md#verification-status) records the checks and an optional build certificate setup for computers using HTTPS inspection.

The website and Expo Go were checked against the same Compose API. Registration, restaurant and menu management, cart and order flows are documented in [the recorded flows](wiki/flows.md), which distinguishes captured results from user-reported checks. The final edge-case checks also cover simultaneous registration, menu deletion, pending checkout and delayed profile responses.

## Data and images

MongoDB uses the `mongo-data` volume. Recommendation history uses the `cpp-data` volume. Stopping or recreating the containers preserves these volumes.

A fresh database is empty. Register test accounts and add restaurants and dishes through the owner screens. The [demo data and photo credits](src/web/backend/demo/README.md) include six fictional restaurants, sample menus and reusable food photos. These files are references for creating records; the clients always load their data from the API.

## Work process

Work is divided into Jira epics, stories and tasks. Tasks are assigned before implementation, and their status is updated as work progresses. Feature branches and commit messages include Jira issue keys. Changes are submitted through pull requests; the other team members must review and approve before merging.

Exercise 5 builds on the earlier work: MongoDB replaces the Node server's in-memory storage, the mobile app uses the existing API, and the website remains available. HTTP controllers and the TCP client stay separate from the C++ command implementation. This keeps the integration within the earlier separation of responsibilities and Open-Closed Principle approach.

The [project wiki](wiki/README.md) describes the main application flows. Submission details and personal identifiers belong in the separate `details.txt` submitted to the course, not in this repository.

See [team review and submission](wiki/review.md) for the PR review path, the remaining team steps and the required Moodle file format.

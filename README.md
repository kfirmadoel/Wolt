# Exercise 5 - Wolt

The project includes a React website and a React Native mobile app. Both clients use the same Node.js/Express API for users, restaurants, menus and orders. This data is stored in MongoDB. The C++ TCP server from Exercise 2 records product views and provides recommendations.

Users can browse and search restaurants, view menus, manage a cart and create, edit or delete their orders. Restaurant owners can manage their restaurants and dishes. Both clients include a profile page and light/dark themes.

Login uses JWT. The mobile app saves the token and user ID with AsyncStorage so the user stays signed in after reopening the app.

## Project structure

| Directory | Contents |
| --- | --- |
| `src/server` | C++ recommendation server and GoogleTest tests |
| `src/client` | Python TCP client from Exercise 2 |
| `src/web/backend` | Express API, Mongoose models and API tests |
| `src/web/frontend` | React website |
| `src/mobile` | React Native app with Expo |
| `wiki` | Run instructions and application walkthrough |

## Exercise branches

| Exercise | Branch |
| --- | --- |
| 1 | [ex1](https://github.com/kfirmadoel/Wolt/tree/ex1) |
| 2 | [ex2](https://github.com/kfirmadoel/Wolt/tree/ex2) |
| 3 | [main-ex3](https://github.com/kfirmadoel/Wolt/tree/main-ex3) |
| 4 | [ex4](https://github.com/kfirmadoel/Wolt/tree/ex4) |
| 5 | [ex5](https://github.com/kfirmadoel/Wolt/tree/ex5) |

Use the README on the selected branch for that exercise's run instructions. Exercise 5 feature branches are reviewed before merging into `ex5`; the earlier exercise branches keep their own versions.

## How to build and run

Install Docker with the Compose plugin and use Linux containers. Run the commands from the project root. Copy `.env.example` to `.env` and set a local `JWT_SECRET`; keep `.env` out of Git.

```bash
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

The default setup starts MongoDB, the C++ server, the Node server with the built React website, and Expo/Metro. Open [http://localhost:3000](http://localhost:3000) for the website. Expo Go and the Android emulator run on the host computer and connect to Metro on port `8081`.

Complete the first setup by [loading the demo data](wiki/run.md#load-initial-data). This creates six restaurants and twelve dishes with pictures, plus the `wolt_demo_owner` account. Choose a password for this demo account when loading a new database.

See [the run guide](wiki/run.md) for Windows/Linux commands, connecting the emulator, local development and stopping the services.

## Tests

Run each suite separately from the project root:

```bash
docker compose --profile api run --build --rm api-tests
docker compose --profile unit run --build --rm cpp-tests
docker compose --profile api run --build --rm api-tests npm run test:demo
```

API tests use their own MongoDB service and a temporary database. They call an imported Express app, not the running application server. The C++ tests do not mount the recommendation server's data volume. See [test details](wiki/run.md#tests) for the local test command.

The container suites passed with 39 API tests, 14 C++ tests and 8 demo import tests. Saved application and recommendation data were retained after service restart and container recreation. See [test results](wiki/run.md#verification-status) and the [application walkthrough with screenshots](wiki/flows.md).

## Data and images

MongoDB uses the `mongo-data` volume. Recommendation history uses the `cpp-data` volume. Stopping or recreating the containers preserves these volumes.

The initial data is loaded once during setup, rather than on every server start. Repeating the import preserves existing records and edits, adds missing demo records and does not create duplicates. Both clients load restaurants and dishes from the API. See [demo data and photo credits](src/web/backend/demo/README.md) for the import command and sample account details.

## Work process

Work is divided into Jira epics, stories and tasks. Tasks are assigned before implementation, and their status is updated as work progresses. Feature branches and commit messages include Jira issue keys. Changes are submitted through pull requests; the other team members must review and approve before merging.

Exercise 5 builds on the earlier work: MongoDB replaces the Node server's in-memory storage, the mobile app uses the existing API, and the website remains available. HTTP controllers and the TCP client stay separate from the C++ command implementation. This keeps the integration within the earlier separation of responsibilities and Open-Closed Principle approach.

The [project wiki](wiki/README.md) describes registration, login, restaurant and menu management, and cart and order flows in both clients.

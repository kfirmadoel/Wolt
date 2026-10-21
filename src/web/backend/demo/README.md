# Demo restaurants

These are fictional restaurants and sample menus for the local demo. Prices are in shekels. Photos illustrate the food and do not represent these businesses.

`restaurants.json` contains fixed demo IDs, names, descriptions, prices, locations and image filenames. The JPEG files are in `images/`. The importer uses the existing Mongoose models to load them into MongoDB. Both clients load restaurants and products through the existing API.

## Import

After starting Compose, load this data to complete setup. Choose a password used only for the demo owner account, with at least eight characters, including letters and numbers.

PowerShell:

```powershell
$env:DEMO_PASSWORD = Read-Host 'Choose a demo password (8+ characters, letters and numbers)'
```

Linux/macOS Bash:

```bash
read -rs -p 'Choose a demo password: ' DEMO_PASSWORD
export DEMO_PASSWORD
```

From the repository root:

```bash
docker compose exec -e DEMO_PASSWORD web-server npm run demo
```

For local development, set `MONGO_URI` to the same database used by the server, as described in the [run guide](../../../../wiki/run.md#local-development). Set `DEMO_PASSWORD` in that shell as above, then run from `src/web/backend`:

```bash
npm run demo
```

On a new database, this creates one restaurant owner, six restaurants and twelve dishes, with their pictures. The account username is `wolt_demo_owner`, its display name is **Demo Owner**, and its profile picture is the coffee illustration. Sign in with the chosen password to manage the demo restaurants. Register a separate customer account for ordering. Keep the password locally and out of Git.

Run one import at a time. Fixed IDs prevent duplicate demo records, including after names have been edited. The importer preserves existing records, passwords, ownership and orders, and restores missing demo records on a later run. It checks for conflicting usernames, owners and record IDs before inserting anything. It does not run automatically when the server starts.

The password is required only when the demo owner is first created. To repeat the import after that, run `docker compose exec web-server npm run demo`, or `npm run demo` for local development, without setting a new password.

## Import tests

From the repository root:

```bash
docker compose --profile api run --build --rm api-tests npm run test:demo
```

For local tests, configure `TEST_MONGO_URI` as described in the [test instructions](../../../../wiki/run.md#tests), then run `npm run test:demo` from `src/web/backend`. The eight checks use their own temporary database. They cover the initial data and owner login, repeat imports, preservation of edits and orders, missing records, invalid passwords and ID or ownership conflicts.

## Photo credits

The files are the 960px previews provided by Wikimedia Commons. They have not been edited locally.

| File | Photo and creator | License |
| --- | --- | --- |
| pizza.jpg | [PizzaMargherita.jpg](https://commons.wikimedia.org/wiki/File:PizzaMargherita.jpg), SIG SG 510 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| burger.jpg | [The Diner Cheeseburger.jpg](https://commons.wikimedia.org/wiki/File:The_Diner_Cheeseburger.jpg), Theipu | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| coffee.jpg | [Cappuccino (50544608617).jpg](https://commons.wikimedia.org/wiki/File:Cappuccino_(50544608617).jpg), Mustang Joe | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| sushi.jpg | [Sushi platter (3756636539).jpg](https://commons.wikimedia.org/wiki/File:Sushi_platter_(3756636539).jpg), Alpha | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| salad.jpg | [A Caesar salad.jpg](https://commons.wikimedia.org/wiki/File:A_Caesar_salad.jpg), Altitonantis | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| croissant.jpg | [Creamy golden croissant.jpg](https://commons.wikimedia.org/wiki/File:Creamy_golden_croissant.jpg), Fumikas Sagisavas | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

The sushi image remains under CC BY-SA 2.0. Keep its attribution and license when redistributing it; adaptations of that image must follow the same license.

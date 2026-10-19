# Exercise 5 Wiki

Start with [Build and run](run.md). It covers the full Compose setup, connecting Expo Go, local development, tests and data persistence.

See [Application flows and screenshots](flows.md) for examples of the screens and main operations.

The [exercise branch list](../README.md#exercise-branches) links to the separate versions of Exercises 1–5.

Both clients use the same API and MongoDB database. The website is served by Node on port `3000`; Expo/Metro serves the mobile JavaScript bundle on port `8081`. The emulator and Expo Go run outside Docker.

## Application walkthrough

The examples use fictional accounts and demonstration restaurants. Guests can browse the restaurant list. Register a customer to place orders, or a restaurant owner to manage restaurants and menus.

### Registration and login

1. Open **Sign up** on the website or mobile login screen.
2. Enter the required fields, choose a role, select a profile picture and confirm the password. The form explains the password and coordinate requirements.
3. Check the picture preview before submitting. On mobile, the picture can come from the gallery or camera, subject to device permissions.
4. Log in with the new account. Invalid credentials display an error. Log out through the navigation menu/header when finished.

### Restaurants and dishes

On the website, open **Profile** as a restaurant owner. The restaurant manager appears below the profile. On mobile, open **My restaurants** from the drawer.

1. Create a restaurant with a name, category, picture and location. Fill the remaining fields as shown in the form.
2. Select **Edit restaurant** on the website or **Edit** on mobile. Change the details and save, then check the restaurant list.
3. The website menu manager is inside **Edit restaurant**. On mobile, open **Manage menu**. Add a dish with a name, description, category, picture and positive price.
4. Edit the dish and check the updated menu. Delete a dish and confirm the deletion.
5. Delete a temporary restaurant and confirm. Its menu is removed too; existing orders keep the details saved when they were placed.

Create a record in one client and refresh the other client to check that both read the same server data. Only the owner of a restaurant can change it or its menu.

### Cart and orders

1. Open a restaurant, view a dish and add it to the cart. Change quantities or remove an item.
2. Place the order while signed in. The server calculates prices and identifies the user from the JWT.
3. Open **Order history** and select the order to view its details.
4. Edit item quantities or remove an item, keeping at least one item, then save. Editing items uses the current menu prices. If a dish was deleted, remove it from the edit before saving.
5. Delete the order and confirm. Refresh the history to check the result.

Sign in with the same account in the other client to see the same order history. A second account cannot read or change that order. If a connection fails during submission, check the history before trying again; the client does not automatically submit another order.

### Profile and appearance

Open **Profile** on the website or **My profile** on mobile to view account details and update latitude/longitude. The saved location is used for nearby restaurants. Check the main screens in both light and dark mode.

## Demo data

Load the initial six restaurants and twelve dishes during [first setup](run.md#load-initial-data). Sign in as `wolt_demo_owner` with the password chosen during import to manage them, or register another account. The import preserves existing records and is not run automatically at startup. See [demo restaurants and photo licenses](../src/web/backend/demo/README.md) for details.

See [test results](run.md#verification-status) for the test suites and environment used.

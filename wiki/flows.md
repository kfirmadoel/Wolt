# Application flows

The website and mobile app use the same Node API and MongoDB database. The examples below use fictional accounts and restaurant data. Mobile screenshots show Expo Go in BlueStacks.

## Start the system

Follow [Build and run](run.md) to build and start MongoDB, the C++ server, the website/API and Expo/Metro with Docker Compose. The default ports are `3000` for the website/API and `8081` for Metro. The Compose examples below use separate installations on `3002`/`8082` and `3003`/`8083`; the Basil Pizza and Maple Cafe examples use the local development dataset.

![Docker Desktop showing the Compose application services and the separate MongoDB test service running](images/docker-final-verify-running.jpg)

## Registration and login

Enter a username, password, matching password confirmation, display name and coordinates, choose an account role and select a profile picture. The form displays password requirements before submission and validation messages for invalid input. After registration, log in with the new account.

### Website

The empty form displays neutral password hints. The filled example shows **Maya Levi** with a selected coffee picture; after login, the profile displays the account name, picture and role.

![Fresh website registration with neutral password hints](images/ex5-web-registration-neutral.jpg)

![Website registration with a selected profile picture](images/ex5-web-registration.jpg)

![Website profile after logging in as Maya Levi](images/ex5-web-login-profile.jpg)

### Mobile

Choose a picture from the gallery or take one with the camera. The selected picture appears in the form. The example shows **Leo Moran** registering, receiving the account-created message and logging in.

<img src="images/ex5-mobile-registration.png" alt="Filled native registration form with gray password hints and selected picture" width="320">

<img src="images/ex5-mobile-account-created.png" alt="Native Account created confirmation" width="320">

<img src="images/ex5-mobile-login-home.png" alt="Native home after login showing Leo Moran and the selected picture" width="320">

Submitting an incomplete form displays the required-field and coordinate errors:

<img src="images/ex5-part3-mobile-registration-validation.png" alt="Mobile registration form with required-field errors and coordinate validation messages" width="320">

## Browsing and appearance

The home page loads restaurants, pictures and categories from the server. Use the category buttons or search to find a restaurant or dish, then open the restaurant's menu. Signed-in users can switch between light and dark mode from the navigation controls.

<img src="images/mobile-home.png" alt="Mobile home with restaurant categories and promoted restaurants" width="320">

<img src="images/mobile-menu.png" alt="Basil Pizza menu showing Margherita Pizza at 42 shekels" width="320">

The Compose example shows **Olive Pizza** under promoted restaurants while browsing as a guest:

<img src="images/ex5-part3-compose-mobile-home.png" alt="Native guest home showing Olive Pizza as a promoted restaurant with its picture and Pizza category" width="320">

## Restaurant management

Restaurant owners open **Profile** on the website or **My restaurants** on mobile. Create a restaurant with its name, category, picture and location. Use **Edit** to change its details. To remove a restaurant, choose **Delete**, confirm and refresh the list. Deleting a restaurant also removes its menu; existing orders retain their saved details.

The mobile example shows **Maple Cafe** after creation with a coffee picture:

<img src="images/mobile-restaurant-created.png" alt="Mobile My restaurants showing the newly created Maple Cafe with a coffee picture" width="320">

Maple was renamed to **Maple Cafe and Bakery** and later deleted. A second restaurant, **Oak Bakery**, was created on the website and renamed to **Oak Cafe and Bakery**. Refreshing the mobile list displays the shared server data:

<img src="images/ex5-part3-mobile-owner-sync.png" alt="Mobile My restaurants showing Oak Cafe and Bakery in the Bakery category after website changes" width="320">

## Dish management

Open **Manage menu** on mobile or the menu section inside **Edit restaurant** on the website. Add a dish with a name and positive price, and optionally a description, category and picture.

The owner added **Cappuccino** to Maple Cafe and Bakery at **₪18**, with category **Drinks** and a coffee picture. The same dish appears in the mobile menu and website details:

<img src="images/ex5-part3-mobile-dish-created.png" alt="Mobile menu for Maple Cafe and Bakery showing Cappuccino at 18 shekels with a coffee picture" width="320">

![Website showing Maple Cafe and Bakery and Cappuccino details with Drinks category and price of 18 shekels](images/ex5-part3-web-dish-created.jpg)

Editing the price to **₪20** updates the menu. Deleting the dish and confirming returns to an empty menu:

<img src="images/ex5-part3-mobile-dish-updated.png" alt="Mobile menu showing Cappuccino at the updated price of 20 shekels" width="320">

<img src="images/ex5-part3-mobile-dish-deleted.png" alt="Mobile menu for Maple Cafe and Bakery showing no dishes after Cappuccino was deleted" width="320">

The website example shows **Flat White** after its price changed from **₪19** to **₪21**, with restaurant and menu update messages. To delete a website dish, select its **Delete** action, confirm and refresh the menu.

![Website owner page showing successful restaurant and menu updates and Flat White at 21 shekels](images/ex5-part3-web-owner-updated.jpg)

## Cart and orders

Open a restaurant, add dishes to the cart and adjust their quantities. **Place order** submits the cart for the signed-in user. Open order history to view details, edit quantities or remove items, keeping at least one item. Both clients read the saved orders from the same API.

### Shared order history

One **Margherita Pizza** from Basil Pizza costs **₪42**. The mobile receipt and website details show the same order. The following updates show two pizzas at **₪84** on the website and three at **₪126** on mobile.

<img src="images/mobile-order-confirmation.png" alt="Mobile order confirmation for 42 shekels with an empty cart" width="320">

![Website order details showing one Margherita Pizza and a total of 42 shekels](images/web-order-details.jpg)

![Website order history showing two pizzas and a total of 84 shekels](images/web-order-updated.jpg)

<img src="images/mobile-order-history.png" alt="Mobile order history showing three items and a total of 126 shekels" width="320">

### Website checkout

**Dana Amir** adds one **Classic Pizza** from Olive Pizza at **₪42**. After **Place order**, the website displays the confirmation and the new order in history.

![Website cart with one Classic Pizza from Olive Pizza and total 42 shekels before submission](images/ex5-part3-compose-web-cart.jpg)

![Website order history with successful order confirmation and the new Olive Pizza order at 42 shekels](images/ex5-part3-compose-web-order.jpg)

### Mobile checkout, editing and deletion

**Leo Moran** adds one Classic Pizza at **₪42** and one **Garden Salad** at **₪28** from Olive Pizza. Checkout returns a **₪70** receipt and empties the cart.

<img src="images/ex5-mobile-compose-cart.png" alt="Native cart with one pizza and one salad totaling 70 shekels" width="320">

<img src="images/ex5-mobile-compose-receipt.png" alt="Native order receipt for 70 shekels and empty cart" width="320">

In the edit screen, changing pizza quantity to two and removing the salad gives **₪84**. Saving updates history and the order details.

<img src="images/ex5-mobile-compose-order-updated.png" alt="Native order history after saving two pizzas at 84 shekels" width="320">

<img src="images/ex5-mobile-compose-order-details.png" alt="Native order details with quantity two and total 84 shekels" width="320">

**Delete order** opens a confirmation. Cancel keeps the order; confirming deletion removes it. The refreshed mobile history below is empty.

<img src="images/ex5-mobile-compose-order-deleted.png" alt="Refreshed native history showing no orders after confirmed deletion" width="320">

### Website editing and deletion

**Maya Levi** changes a Cappuccino order from Garden Cafe and Bakery to two cups at **₪20** each. The updated history shows **₪40**.

![Website order history after saving two Cappuccinos at 40 shekels](images/ex5-web-order-final-updated.jpg)

The website order details provide **Edit items** and **Delete order** actions. This example shows **Noa Shalev**'s Cappuccino order from **Willow Cafe** at **₪20**. Canceling deletion keeps the order. To delete it, choose **Delete order**, confirm and refresh order history.

![Website order details after canceling deletion and refreshing](images/ex5-web-order-before-delete.jpg)

## Profile location

Open **Profile** on the website or **My profile** on mobile to update latitude and longitude. After saving, the profile shows the updated coordinates and a confirmation message. The saved location is used for nearby restaurants.

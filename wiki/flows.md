# Application flows

These screenshots were captured during local checks on 15 October 2026. Mobile checks used Expo Go in BlueStacks; website checks used the browser. Both clients read the same Node API and MongoDB database. The account names and demonstration records shown here are fictional.

The images are original captures, copied without cropping or changing pixels. No mouse pointer is visible. The round settings button in the mobile captures belongs to BlueStacks. The screenshots record the stages described below; they are not a complete record of every screen in the final version.

See [Build and run](run.md) for startup and test commands, and [the walkthrough](README.md#application-walkthrough) for the application steps.

## Home and restaurant menu

The mobile home loads restaurant data, pictures and categories from the server. Selecting **Basil Pizza** opens its menu, including **Margherita Pizza** at ₪42.00. These two captures are from the end of part 2, before cart controls were added in part 3.

<img src="images/mobile-home.png" alt="Mobile home with restaurant categories and promoted restaurants" width="320">

<img src="images/mobile-menu.png" alt="Basil Pizza menu showing Margherita Pizza at 42 shekels" width="320">

## Order shared between mobile and website

1. A signed-in customer added one Margherita Pizza from Basil Pizza and placed the order in the mobile app. The confirmation showed ₪42.00 and the cart became empty.
2. The same account opened the order details on the website. The item, price and order ID matched the mobile confirmation.
3. Quantity changes were saved during the check. The website showed two items at ₪84.00, and a later mobile history capture showed three items at ₪126.00. Refreshing the other client showed the updated server data.
4. The order was later deleted from mobile after testing Cancel and then confirming Delete. Both histories were checked and were empty. The images below were taken before this deletion; no deletion-result screenshot has been added yet.

Mobile confirmation after placing the order:

<img src="images/mobile-order-confirmation.png" alt="Mobile order confirmation for 42 shekels with an empty cart" width="320">

The matching order on the website:

![Website order details showing one Margherita Pizza and a total of 42 shekels](images/web-order-details.jpg)

The website after a quantity update:

![Website order history showing two pizzas and a total of 84 shekels](images/web-order-updated.jpg)

A later mobile history capture:

<img src="images/mobile-order-history.png" alt="Mobile order history showing three items and a total of 126 shekels" width="320">

The light and dark captures also show both appearance modes. The pictures establish the displayed states; they do not identify which client initiated each quantity change.

## Restaurant owner flow

A restaurant owner created **Maple Cafe** in the mobile app. A project coffee picture was selected through the system's individual-photo chooser. Broad media access remained denied. After saving, the restaurant appeared in **My restaurants** with its picture and the **Edit** and **Manage menu** actions.

<img src="images/mobile-restaurant-created.png" alt="Mobile My restaurants showing the newly created Maple Cafe with a coffee picture" width="320">

The name was then changed in mobile to **Maple Cafe and Bakery**. The website was checked and showed the updated name and an empty menu. The capture above is from before that rename. The dish captures below show the new name in both clients after a dish was added.

## Dish creation, editing and deletion

The owner opened **Manage menu** for Maple Cafe and Bakery and added **Cappuccino**, with a price of ₪18.00, category **Drinks** and a coffee picture. The picture was chosen through the individual-photo chooser while broad media access remained denied. After saving, the dish appeared in the mobile menu with its name, price, picture and **Edit Cappuccino** action. The category was entered during the check and is not displayed on this menu card.

<img src="images/ex5-part3-mobile-dish-created.png" alt="Mobile menu for Maple Cafe and Bakery showing Cappuccino at 18 shekels with a coffee picture" width="320">

The same restaurant was opened on the website. Opening **Dish details** fetched Cappuccino from the API and displayed its **Drinks** category, ₪18.00 price and coffee picture. This checks the website reading the dish created on mobile; it does not show creation from the website.

![Website showing Maple Cafe and Bakery and Cappuccino details with Drinks category and price of 18 shekels](images/ex5-part3-web-dish-created.jpg)

The owner edited the dish in mobile and changed the price from ₪18.00 to ₪20.00. After saving, **Manage menu** showed the new price and kept the coffee picture. Reloading the website also showed ₪20.00; the website image above was taken before this update.

<img src="images/ex5-part3-mobile-dish-updated.png" alt="Mobile menu showing Cappuccino at the updated price of 20 shekels" width="320">

The owner then tested **Delete** in the mobile edit form. Choosing **Cancel** kept the form open. Confirming deletion returned to **Manage menu**, which showed that the restaurant had no dishes. The following capture records the result after confirmation, not the confirmation dialog itself.

<img src="images/ex5-part3-mobile-dish-deleted.png" alt="Mobile menu for Maple Cafe and Bakery showing no dishes after Cappuccino was deleted" width="320">

## Restaurant deletion and website owner changes

The owner deleted **Maple Cafe and Bakery** in mobile. **Cancel** was checked first, then deletion was confirmed. The app returned to **My restaurants**, and Maple was no longer listed.

On the website, the owner created **Oak Bakery** with a coffee picture, the **Bakery** category and **Not promoted**, then renamed it to **Oak Cafe and Bakery**. Refreshing **My restaurants** in mobile showed the new name and picture. The following capture shows Oak after this refresh and no Maple entry; it does not show either client's creation form or the mobile deletion dialog.

<img src="images/ex5-part3-mobile-owner-sync.png" alt="Mobile My restaurants showing Oak Cafe and Bakery in the Bakery category after website changes" width="320">

On the website, the owner also added **Flat White** at ₪19.00 with category **Drinks** and a coffee picture, then edited its price to ₪21.00. The saved website view below shows **Restaurant details updated**, **Menu item updated** and Flat White at ₪21. The dish category and its picture are not visible in this capture.

![Website owner page showing successful restaurant and menu updates and Flat White at 21 shekels](images/ex5-part3-web-owner-updated.jpg)

Website deletion of Flat White was attempted, but the browser automation could not answer its native confirmation dialog. No confirmed deletion is recorded here. This website check remains manual.

## Saved profile location

In mobile, the owner changed the profile latitude from **32.0853** to **32.1**, keeping longitude **34.7818**, and saved it. The profile then displayed **Saved location: 32.1, 34.7818** and a green success message. This capture confirms the saved values and feedback; it does not show the nearby-restaurants list after the change.

<img src="images/ex5-part3-mobile-profile-saved.png" alt="Mobile profile showing saved coordinates 32.1, 34.7818 and successful location update feedback" width="320">

## Website cart and order in the Compose environment

The website was also checked against the separate Compose environment on port **3002**. The customer **Dana Amir** added one **Classic Pizza** from **Olive Pizza**. The cart displayed quantity **1**, a total of **₪42.00**, quantity controls and **Place order**. This capture is from before submission and does not establish that this order was placed.

![Website cart in Compose with one Classic Pizza from Olive Pizza and total 42 shekels before submission](images/ex5-part3-compose-web-cart.jpg)

The customer then selected **Place order**. The website displayed a success message for **order_1792089653471_959** and a new Olive Pizza entry at **21:40:53**, with one Classic Pizza and a total of **₪42.00**. An earlier order is also visible in the history.

![Website order history in Compose with successful order confirmation and the new Olive Pizza order at 42 shekels](images/ex5-part3-compose-web-order.jpg)

Expo Go was connected to the same Compose API on **3002** and Metro on **8082**. Logging in as Dana Amir and opening order history showed both Olive Pizza orders, including the new entry at 21:40:53 for ₪42.00. This native history check was observed but not captured. It verifies reading the order placed on the website, not submitting an order from mobile against Compose.

The following native capture shows the guest home in that Compose environment. **Olive Pizza** appears under **Promoted restaurants** with its picture, Pizza category and description. **All categories** is selected and **Log in** is visible. This records the loaded guest home; it does not show a search, login or checkout action.

<img src="images/ex5-part3-compose-mobile-home.png" alt="Native guest home connected to Compose showing Olive Pizza as a promoted restaurant with its picture and Pizza category" width="320">

## Mobile registration validation

The registration screen was checked in Expo Go against the rebuilt Compose mobile service. Submitting an empty form displayed required-field and password feedback. The latitude and longitude messages wrapped fully within their respective columns after the layout correction.

Following user testing, password requirements now start in gray without failure marks. Submitting an invalid form displays red errors; corrected password requirements turn green. Leaving and reopening registration clears the previous validation and server errors while preserving the entered values. Eight focused component checks cover this behavior; the screenshot below still shows the state after an invalid submission.

<img src="images/ex5-part3-mobile-registration-validation.png" alt="Mobile registration form with required-field errors and coordinate validation messages contained within both columns" width="320">

This capture contains no entered credentials and demonstrates validation only. Seven automated checks covered the registration picture chooser, including cancellation, failure and camera denial. Those checks do not establish that a complete native registration was performed.

## Screenshots still to add

The list tracks missing demonstration captures, not a claim that every unchecked feature is unimplemented. Automated API and state checks are recorded separately from visual checks.

- [ ] Compose build/start and running services, plus a native order-history capture. The website checkout and observed native login/history checks against Compose are described above.
- [ ] Complete registration and login captures in each client, including profile-picture selection. Mobile validation feedback is captured above. Do not show passwords or tokens.
- [ ] Website restaurant creation/editing forms and deletion confirmation/result. The saved update and the refreshed mobile result are captured above.
- [ ] Mobile restaurant deletion confirmation. The later My restaurants result is captured above; the dialog is not.
- [ ] Website dish creation/editing forms and deletion confirmation/result. The saved website price update is captured above. Mobile creation, the updated price and the deletion result are also captured; the mobile editing controls and deletion dialog are not pictured yet.
- [ ] Mobile cart quantities before submission and mobile checkout against Compose. The website cart, successful website order and earlier mobile order against local services are captured above.
- [ ] Order editing controls and deletion results in both clients. Mobile deletion was checked, but its empty-history result is not pictured here. Website deletion confirmation still needs a complete visual check.
- [ ] Saved location changes on the website and updated nearby restaurants in both clients. The mobile saved-location result is captured above.
- [ ] Data remaining after a controlled restart of the Compose services, including MongoDB records and the C++ view data.

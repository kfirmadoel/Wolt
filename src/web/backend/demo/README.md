# Demo restaurants

These are fictional restaurants and sample menus for the local demo. Prices are in shekels. Photos illustrate the food and do not represent these businesses.

`restaurants.json` contains the names, descriptions, prices and image filenames. The JPEG files are in `images/`. The mobile app does not import this file. It loads restaurants and products through the existing API from MongoDB.

To reuse this data, sign in as a restaurant owner and use the existing restaurant and product creation screens. Alternatively, use `POST /api/restaurants` and `POST /api/restaurants/:id/products` with the owner's JWT. Choose a valid restaurant location and send each image as a `data:image/jpeg;base64,...` string in `picture`. Create each restaurant first, then its products using the returned restaurant ID. The `products` array in this file is a menu reference, not a field accepted by the restaurant creation endpoint.

The sample data is not inserted automatically when the server starts. Existing users, ownership and other records should be preserved.

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

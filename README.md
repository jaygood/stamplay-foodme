# stamplay-foodme
=======================

**This project is built on the [Stamplay](https://stamplay.com) platform and [AngularJS](http://angularjs.org) to show how to build a take-out food ordering application, let's say something similar to [JustEat](http://about.me) but done in the blink of an eye.**

You can test it anytime simply creating a new project on Stamplay and uploading all the frontend assets with our client or our browser based code editor. 

Feel free to implement more cool features (see the last paragraph for ideas), contribute to this repo or clone it to use it by your own scopes. For any question drop an email to [giuliano.iacobelli@stamplay.com](mailto:giuliano.iacobelli@stamplay.com)

![FoodMe](http://2.bp.blogspot.com/-WL8GetRAOog/ULT1dTj-4PI/AAAAAAABGCg/_oSuT6xY2Uo/s1600/foodme.png "FoodMe")

-----------------------
## FoodMe

This is a demo of what you can achieve with [Stamplay](http://stamplay.com).

It's somewhat a clone of [JustEat](http://justeat.com). [View demo](https://e33b72.stamplay.com)

We love javascript and front end framework and this time we show you how you can create this app using [AngularJS](http://angularjs.org) to implement the client side logic. We started from the very good workshop made by Igor Minar that can be seen [here](https://github.com/IgorMinar/foodme). Here are the user stories for this example:

* Guest users can signup with email and password
* Sort and filter restaurants by categories, rating and pricing
* Both logged and guest users can place an orders to listed restaurants 
* Logged users can rate restaurants
* When an order is submitted, both restaurant owner and user are notified
* Admins can add more restaurants and meals using the "Admin" section
* Admins can review user's orders and manage them

Best of all, we used AngularJS and Grunt to compile the assets to be compliant to the actual Stamplay apps' skeleton. Prepare to be amazed.


-----------------------
# Anatomy

FoodMe is built around the following building blocks

* [Users](http://docs.stamplay.apiary.io/#user)
* [Custom Objects](http://docs.stamplay.apiary.io/#customobject)
* [Email](http://docs.stamplay.apiary.io/#email)


## Requirements

Go to [your account](http://editor.stamplay.com/apps) and create a new app.


## Configuring the components

After creating a new app on [Stamplay](https://editor.stamplay.com) let's start by picking the component we want to use in our app that are: **User**, **Email** and **Custom Objects**.

Lets see one-by-one how they are configured:

### User
the app use the classic email + password login. This is used by default by the user component as you can see from the image below. 

![Local login](http://blog.stamplay.com/wp-content/uploads/2014/09/Schermata-2014-09-02-alle-16.31.04.png "Local login")


### Custom Object
Let's define the entities for this app, we will define **Restaurants**, **Meals** and **Orders** that are defined as follows:

##### Restaurant

* Name: `name`, Type: `string`, The background image of the page
* Name: `description`, Type: `string`, The avatar image of the page
* Name: `cusine`, Type: `string`, The title of the page
* Name: `photo`, Type: `file`, Text describing user's bio
* Name: `meals`, Type: `meals`, A list of user's locations
* Name: `price`, Type: `price`, The first RGB color for the layout
* Name: `owner_email`, Type: `string`, The first RGB color for the layout

##### Meal

* Name: `name`, Type: `string`, The background image of the page
* Name: `photo`, Type: `file`, The avatar image of the page
* Name: `description`, Type: `string`, The title of the page
* Name: `price`, Type: `number`, User's favorite quote

##### Order

* Name: `email`, Type: `string`, The background image of the page
* Name: `surname`, Type: `string`, The background image of the page
* Name: `address`, Type: `string`, The background image of the page
* Name: `meals`, Type: `array_string`, The avatar image of the page
* Name: `price`, Type: `number`, The title of the page
* Name: `delivered`, Type: `boolean`, User's favorite quote
* Name: `notes`, Type: `string`, User's favorite quote


After setting up this Stamplay will instantly expose Restful APIs for our newly resources the following URIs: 

* `https://APPID.stamplay.com/api/cobject/v0/restaurant`
* `https://APPID.stamplay.com/api/cobject/v0/meal`
* `https://APPID.stamplay.com/api/cobject/v0/order`


### Email
This component doesn't need any setup, couldn't be easier than that ;)


-----------------------


## Creating the server side logic with Tasks

Now let's add the tasks that will define the server side of our app. For our app we want that:

### When a new user submits the contact form of an About page, send an email to the page owner 

Trigger : Form - On Submit

Action: Email - Send Email

**Form submit configuration**

	Form: contact form

**Send Email configuration**

	to: {{entry.data.to}} //The recipient address taken from the form entry 
	from: {{user.email}} //Will be replaced with logged user's email
	name: {{entry.data.name}} //The sender's name taken from the form entry 
	Subject: "New contact from your AboutPage!"
	Body: {{entry.data.message}} //The sender's message taken from the form entry 







_______________________________


## The frontend and AngularJS

The whole app is written in two files: `app.js` e `restaurantrating.js`
**App.js** has all the controllers and two factories while **restaurantRating.js** has the directive to handle restaurant ratings.


### App.js

#### Factory UserStatus:
This Factory is in charge of tracking user status via the **User** `getStatus` API call and expose it to controllers who require it. It acts as a simple caching layer between user status and controllers
Whenever one or more controller on the same page are in need to know the user status the API call would be effectively done only one time

#### Factory globalVariable:
This component provides access to global functionalities and variables to avoid code duplication. 

#### Controller NavbarCtrl:
This controller is the only one present in every view of this app since it's binded to the main navigation bar of the app.

It must be able to recognize user status showing `Login/Logout` button, and moreover it is responsible of understanding the current page visited by the user to highlight it on the navigation bar (check `function RouteIs`).

#### Controller LoginCtrl:
This is the controller in charge to make the API call to the login endpoint for email+passowrd authentication.

#### Controller RegistrationCtrl
This controller is in charge for to make the API requests to the singup endpoint for email+passowrd authentication. 

#### Controller RestaurantCtrl
This controller handles the restaurant list. It listens for filter selection on the home page and update the list accordingly. It has also expose sorting functionalities to rank restaurant by Name, rating or price.

#### Controller MenuCtrl
This controller is in charge for orders and displaying menu details of the restaurant.
`getRestaurant` retrieves params from the URL and lookup for the restaurant instance by  `_id`.
Once loaded it:
* check the userstatus (if he is logged, we need to know if he already rated this restaurant)
* loads the meals related to the current restaurant and retrieves details for each one
* `addToCart` and `removeToCart` functions are responsible to add or remove items from the cart
* `checkout` function triggers the order completion process. It validates every field before sending the data to the server.




### restaurantRating.js

Questo file contiene la dichiarazione di una direttiva custom  chiamata fm-rating. Questa direttiva ci permette di creare un elemento che rappresenti graficamente un voto espresso da 1 a 5 ad un oggetto. Si possono utilizzare simboli custom, dalle stelle ai dollari.
Tale direttiva è altamente modificabile. Permette di essere in modalità readonly ovvero fornisce un dato di sola lettura. Esempio nella tabella di riepilogo dei ristoranti.
Altra modalità è quella di fornire solamente dell'input, quindi un valore che vada da 1 a 5. Questo tipo di funzionalità viene usata nel filtraggio dei ristoranti presente in home page.
E come ultima operazione questa direttiva è in grado di interfacciarsi anche con il server nel caso l'utente voglia esprime il suo giudizio riguardo un particolare ristorante.



## Miglioramenti possibili
Accorpare i controller di login e registration creando una singola pagina che gestisca entrambi i casi.
Aggiunta di login social con appropriate azioni quali post su facebook o altro.
Modificare la gestione del carrello in modo tale che gestisca le pietanze uguali raggruppandole.
Aggiunta di una parte di amministrazione dove sia possibile creare i ristoranti, modificare il proprio menù e vedere gli ordini.
Aggiunta dei commenti sui ristoranti. 

## Annotazioni
Attualmente la differenza tra utente loggato e non è quella di non poter dare un giudizio ad un ristorante.

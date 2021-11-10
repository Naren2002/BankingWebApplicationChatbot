# Banking Web application with an In-built Chabot

## Objective

The objective of the project is to build a banking website and a chatbot that adequately supplements the website. The website is built using Node.js, Passport.js, MongoDB, Ejs, Flask and several other tools. Node.js serves the backend of the website, interacts with the MongoDB database and authenticates users and customers using Passport.js and renders the website on the user’s browser using an Ejs template. The flask is the backend server that is used for running the chatbot which is built using Python, Tensorflow, nltk, Keras and spellchecker.

## Functionality

### Admins and Clients

On the admin side, the admins can add a user account, view their account details, view the loans attached to users’ accounts, grant a loan to a user, deposit money into a user’s account and on the user’s side, the users will be able to look into their account details, their loan transactions, can add a payee to transfer money into their account, and remove the added payee. They can also view their history of transactions and their loan history. The customer and the admin are authenticated by Passport.js when they enter their username and passport, thus ensuring the security of the contents of their respective pages.

### Chatbot

The chatbot can interact with the user and answer several types of their queries on several types of loans, and can also help the user transfer funds, add and remove a payee and pay loans. The backend for this is a network of Neural Networks that has learned several types of users queries from the dataset that we have built, and can classify into the type of query that the user is asking, and can predict the appropriate response it can provide the user with. The chatbot gets the user’s query as a POST request in the flask server from the node.js server and responds with the appropriate response to the node server.

## Using the project

1. Download or clone the repository
2. `npm init` in the command line of your choice
3. `node app.js`
4.  Open another CLI in the same folder
5. `cd chatbotModel`
6. `export FLASK_APP=flaskApp` or `set FLASK_APP=flaskApp` depending on the operating system
7. Open `localhost:3000` in your preferred browser, the app should work
8. Go to `localhost:3000/adminAdd`, the admin with the email address and password will be added to the database.
9. Go to `localhost:3000/loginAdmin`, login with the given email address and password.
10. You can add accounts and grant loans to an already added user on the admin page.
11. Go to `localhost:3000`, here you can login as a client and look at the client side dashboard. You can transfer money to other clients by adding a payee in the add payee tab. But, that account should already be within the bank. Make sure to specify the correct name when adding it or else the process might fail.
12. You can view the transactions, interact with the chatbot on banking related queries. For the intents and responses, you can go to `intents.json` and other `...Intents.json` files to get an idea of what kind of queries the chatbot can understand.

The chatbot is built locally and doesn't use already existing solutions like RASA or DialogFlow.

The dark mode can be toggled on and off with the button on the top right.
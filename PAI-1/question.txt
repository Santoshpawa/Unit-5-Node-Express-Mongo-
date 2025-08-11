Problem Statement: Video Game Catalog API
Core Objective:
This task is designed to assess your ability to build a well-structured backend API for a video game catalog. The primary focus is on implementing the MVC (Model-View-Controller) pattern, defining and linking data models using Mongoose, and creating a clean, logical set of RESTful endpoints. Authentication and user accounts are not part of this task.

Project Requirements:
Project Foundation:
Initialize a new Node.js project and install express, mongoose, and dotenv.
Use a .env file to store your sensitive configuration, such as the MONGO_URI and PORT.
Strict MVC Architecture:
You must organize your application code into the following folder structure:
models/: Contains your Mongoose schema and model definitions.
controllers/: Holds the logic for handling requests and sending responses.
routes/: Defines the API endpoints using Express Router.
Your main server.js file should be kept minimal, focusing on server setup, middleware application, and mounting your routers.
Custom Middleware:
Create a custom middleware function. For every incoming request, this middleware should add a new property to the request object called requestTimestamp containing the current ISO date string (e.g., req.requestTimestamp = new Date().toISOString();).
Apply this middleware globally so it runs for every request made to your API.
Data Models:
You will create two interconnected Mongoose models.

Publisher Model (models/publisherModel.js):
name: String, must be required and unique.
location: String.
yearEstablished: Number, must be a minimum of 1950.
Game Model (models/gameModel.js):
title: String, must be required.
genre: String, must be one of the following values: 'RPG', 'Action', 'Adventure', 'Strategy', or 'Sports'. Use a Mongoose enum for this validation.
releaseDate: Date.
publisher: This is the most important field. It must be a mongoose.Schema.Types.ObjectId that creates a reference to the Publisher model. It is a required field.
API Endpoints:
You are to implement a full set of CRUD (Create, Read, Update, Delete) endpoints for both models.

Publisher Routes (defined in routes/publisherRoutes.js)
POST /api/publishers: Creates a new game publisher.
GET /api/publishers: Retrieves a list of all publishers.
GET /api/publishers/:id: Retrieves a single publisher by their unique ID.
PUT /api/publishers/:id: Updates an existing publisher.
DELETE /api/publishers/:id: Deletes a publisher.
Game Routes (defined in routes/gameRoutes.js)
POST /api/games: Creates a new game. The request body must include the ID of an existing publisher.
GET /api/games: Retrieves a list of all games. In the response, the publisher field for each game should be populated with its name and location.
GET /api/games/:id: Retrieves a single game by its ID, with its publisher details populated.
PUT /api/games/:id: Updates a game's details.
DELETE /api/games/:id: Deletes a game.
Relationship-Based Endpoint (Crucial)
GET /api/publishers/:publisherId/games: This endpoint should retrieve all games released by a single, specific publisher, identified by :publisherId.
Documentation Requirement:
Create a file named DESIGN_LOG.md in your project's root directory. Inside this file, provide a brief answer to the following question:

"In the Game model, we are storing a reference to the Publisher. Explain the benefits of this 'referencing' strategy. What potential problems or inefficiencies might arise if we chose to embed the entire publisher document inside every game document instead?"

Topics Evaluated:
Node.js/Express Fundamentals: Server setup, modules, package management.
Express: Request-Response cycle, dynamic routing (:id), routers, and custom middleware.
MVC Pattern: Code organization and separation of concerns.
MongoDB/Mongoose: Database connection, CRUD operations (create, find, findById, findByIdAndUpdate, findByIdAndDelete).
Mongoose Schemas: Defining schemas with types, validations (required, unique, enum, min).
Mongoose Relationships: Establishing a one-to-many relationship using ref and using populate() to retrieve related data.
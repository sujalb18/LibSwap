# LibSwap

 

Library Management and Student Book Swapping System

 

## Prerequisites

 

- Docker Desktop

- Git

 

## Configuration

 

Create a `.env` file in the project root directory.

 

```env

JWT_SECRET=your_secret

JWT_EXPIRES_IN=1d

STUDENT_NAME=Sujal Ganesh Bhatt

STUDENT_ID=226510298

```

 

The `.env` file contains runtime configuration and should not be committed to GitHub.

 

## Run the Application

 

Build and start the application using Docker Compose:

 

```bash

docker compose up --build

```

 

Docker Compose starts both the LibSwap application and MongoDB containers.

 

The application will be available at:

 

http://localhost:3000

 

## Student Identity API

 

The required student information endpoint is:

 

http://localhost:3000/api/student

 

The endpoint should return the student's full name and student ID in JSON format:

 

```json

{

  "name": "Sujal Ganesh Bhatt",

  "studentId": "226510298"

}

```

 

## Database

 

LibSwap uses MongoDB as its database.

 

MongoDB runs in a separate Docker container and the application connects to it through the Docker Compose network.

 

MongoDB data is stored using a Docker volume so that database data can persist between container restarts.

 

The database-dependent application functionality can be tested through features such as user registration, login, and book management.

 

## Application Functionality

 

The existing LibSwap application functionality is preserved while running inside Docker.

 

The application communicates with the MongoDB container for database-dependent operations.

 

After starting the containers, the application can be accessed through:

 

http://localhost:3000

 

## Check Running Containers

 

To check the status of the application and MongoDB containers:

 

```bash

docker compose ps

```

 

MongoDB should show a `healthy` status.

 

## Stop the Application

 

To stop the running containers:

 

```bash

docker compose down

```

 

To stop the containers and remove the MongoDB volume:

 

```bash

docker compose down -v

```

 

## Docker Services

 

The Docker Compose setup contains two services:

 

- `app` - Node.js/Express LibSwap application

- `mongo` - MongoDB database

 

The application is exposed on port `3000`, while MongoDB runs on port `27017`.

 

## Project Structure

 

```text

LibSwap/

├── Dockerfile

├── docker-compose.yml

├── .dockerignore

├── .env

├── .env.example

├── package.json

├── server.js

├── routes/

├── models/

├── controllers/

└── public/

```

 

## Environment Example

 

The `.env.example` file should contain:

 

```env

JWT_SECRET=your_secret

JWT_EXPIRES_IN=1d

STUDENT_NAME=Sujal Ganesh Bhatt

STUDENT_ID=226510298

```

 

Use the `.env.example` file as a template when creating the local `.env` file. Do not commit the actual `.env` file to GitHub.


Final checks before pushing:

README.md is saved in the repository root.
.env is listed in .gitignore and is NOT committed.
.env.example contains the required variable names.
docker-compose.yml passes STUDENT_NAME and STUDENT_ID to the app.
docker compose up --build starts both app and MongoDB.
docker compose ps shows MongoDB as healthy.
http://localhost:3000/api/student returns the name and student ID.
A database-backed feature such as signup/login is tested successfully.
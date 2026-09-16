# LibSwap

Library Management and Student Book Swapping System

## Overview

LibSwap is a web-based application that combines traditional university library management with student-to-student book swapping functionality.

The system uses a layered web architecture with a browser-based frontend, a Node.js and Express backend, and MongoDB for persistent data storage.

Current development includes catalogue browsing and searching, filtering and sorting, student dashboard functionality, personal-book management, and administrative library-book management.

## Technology Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- HTML
- CSS
- JavaScript
- dotenv
- bcryptjs
- JSON Web Tokens (JWT)

## Current Functionality

### US02 - Browse and Search Library Catalogue

Completed functionality includes:

- Display all library books
- Search by title, author or genre
- Case-insensitive searching
- Dynamic genre filtering
- Availability filtering
- Sorting by title and author
- Loading and error handling
- No-result handling
- Manual test documentation

### US10 - Admin Library Book Management

Current implementation includes:

- Create new library books
- Retrieve existing books
- Update existing books
- Delete library books
- Required-field validation
- Availability type validation
- Admin book-management interface

Further frontend/API integration, access control and automated testing are being developed.

## Student Dashboard

The Student Dashboard is the main interface that loads after a successful user login. It displays the student's book catalogue and provides access to the Swap Request section.

### Dashboard Features

#### Login to Dashboard Flow

- The default page is the login screen.
- After entering valid credentials, the dashboard loads.

#### Catalogue Display

- Shows the student's listed books.
- Provides a scrollable catalogue interface.

#### Pause / Resume Interaction

- Pause freezes the catalogue and stops interactions.
- Resume restores interactivity and continues the timer.

#### Navigation

- A button allows the student to switch to the Swap Request dashboard.

## Project Structure

```text
controllers/
    Application logic and request handling

models/
    Mongoose schemas and models

routes/
    Express API routes

middleware/
    Shared Express middleware

public/
    Frontend HTML, CSS and JavaScript files

tests/
    Test documentation

server.js
    Main Express server entry point
```

## Book API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/books` | Retrieve all books |
| GET | `/api/books?search=value` | Search books |
| POST | `/api/books` | Create a new book |
| PUT | `/api/books/:id` | Update an existing book |
| DELETE | `/api/books/:id` | Delete an existing book |

## Running the Project

### 1. Install dependencies

```text
npm install
```

### 2. Configure environment variables

Create a `.env` file using `.env.example` as a guide.

Required configuration includes:

```text
MONGODB_URI=
PORT=3000
JWT_SECRET=
JWT_EXPIRES_IN=1d
```

Do not commit the real `.env` file or private credentials.

### 3. Start the application

```text
npm start
```

The application runs by default at:

```text
http://localhost:3000
```

The library catalogue can be accessed at:

```text
http://localhost:3000/catalogue.html
```

## Testing

US02 currently includes documented manual testing for:

- Catalogue loading
- Search by title, author and genre
- Case-insensitive searching
- No-result searching
- Genre filtering
- Availability filtering
- Sorting
- Combined search and filtering
- Backend failure handling

The manual test documentation is available in:

```text
tests/US02-manual-tests.md
```

Automated API testing is being added to provide repeatable verification of catalogue and book-management functionality.

## Development Approach

Features are developed using separate Git branches and incremental commits.

Completed work is reviewed using GitHub pull requests before being merged into the shared `main` branch.

US02 was developed progressively through separate backend/API and frontend/UI pull requests.

US10 is being developed progressively through backend CRUD functionality, validation, frontend integration, automated testing and real-time functionality.
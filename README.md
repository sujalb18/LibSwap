# LibSwap

Library Management and Student Book Swapping System

## Overview

LibSwap is a web-based library and book-swapping application developed for SIT725.

The project combines traditional library catalogue functionality with student book-management and swapping features. It uses a browser-based frontend, a Node.js and Express backend, MongoDB for persistent storage, JWT-based authentication, role-based authorization, and Socket.IO for real-time catalogue updates.

The current project contains functionality for:

- User registration and login
- JWT authentication
- Student and staff user roles
- Library catalogue browsing and searching
- Genre and availability filtering
- Catalogue sorting
- Administrative library-book management
- Staff-only create, update and delete operations
- Real-time catalogue synchronization
- Student dashboard functionality
- Personal-book interfaces
- Swap-request dashboard data
- Manual testing
- Automated API testing

---

## Technology Stack

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.IO

### Frontend

- HTML
- CSS
- JavaScript
- Fetch API
- Socket.IO browser client

### Authentication and Security

- JSON Web Tokens (JWT)
- bcryptjs
- Authentication middleware
- Staff role authorization middleware

### Configuration

- dotenv
- `.env` environment variables

### Testing

- Jest
- Supertest
- MongoDB Memory Server
- Manual browser and API testing

---

# Current Project Features

## User Authentication

The project contains registration and login functionality for users.

Implemented functionality includes:

- Register a new user
- Validate required registration information
- Prevent duplicate usernames or email addresses
- Hash passwords using bcrypt
- Login using email and password
- Generate JWT authentication tokens
- Verify JWT tokens through authentication middleware
- Retrieve the currently authenticated user using `/api/auth/me`
- Support `student` and `staff` user roles
- Store the user's role inside the JWT

New users are registered as students by default.

---

## User Roles

The current user model supports two roles:

```text
student
staff
```

Roles are used to distinguish normal student functionality from protected library-management operations.

For administrative book management:

```text
No token
    ↓
401 Unauthorized

Student token
    ↓
403 Forbidden

Staff token
    ↓
Protected operation allowed
```

---

# US02 - Browse and Search Library Catalogue

The catalogue allows users to browse the library collection and find books using several search, filter and sorting options.

Implemented functionality includes:

- Display all books stored in MongoDB
- Search by book title
- Search by author
- Search by genre
- Case-insensitive searching
- Dynamically generate genre filter options
- Filter by genre
- Filter by availability
- Sort books by title A-Z
- Sort books by title Z-A
- Sort books by author A-Z
- Combine searching with filtering
- Loading-state handling
- Empty-result handling
- Backend/API error handling
- Dynamic book-card rendering
- Integration with the Express/Mongoose book API
- Real-time catalogue refresh after library-book changes

### Catalogue Page

```text
http://localhost:3000/catalogue.html
```

### Catalogue Flow

```text
Browser
    ↓
catalogue.js
    ↓
GET /api/books
    ↓
bookRoutes.js
    ↓
bookController.js
    ↓
Book Mongoose model
    ↓
MongoDB
    ↓
JSON response
    ↓
Catalogue cards
```

### Search Flow

Example:

```text
/api/books?search=harry
```

The backend searches:

- title
- author
- genre

using case-insensitive MongoDB regular-expression matching.

---

# US10 - Admin Library Book Management

US10 provides an administrative interface for managing the shared library catalogue.

Implemented functionality includes:

- Retrieve existing library books
- Add a new library book
- Edit an existing library book
- Change book availability
- Delete a library book
- Validate required title and author fields
- Validate the availability data type
- Handle invalid MongoDB IDs
- Handle missing book IDs
- Display success and error messages
- Admin frontend connected to the backend API
- Confirmation before deleting a book
- JWT authentication for protected requests
- Staff-only authorization
- Real-time catalogue synchronization
- Automated API testing

### Admin Page

```text
http://localhost:3000/admin-books.html
```

---

## US10 API

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/books` | Retrieve all library books | Public |
| GET | `/api/books?search=value` | Search library books | Public |
| POST | `/api/books` | Add a library book | Staff only |
| PUT | `/api/books/:id` | Update a library book | Staff only |
| DELETE | `/api/books/:id` | Delete a library book | Staff only |

Protected operations require:

```text
Authorization: Bearer <JWT>
```

---

# Staff Authorization

Administrative book-management operations use two middleware stages.

```text
Request
    ↓
authMiddleware
    ↓
JWT verified
    ↓
req.user created
    ↓
staffOnly middleware
    ↓
role === "staff" ?
    ↓
Yes → continue
No  → 403 Forbidden
```

### Authentication Middleware

Authentication middleware checks:

- whether an Authorization header exists
- whether it uses the Bearer format
- whether the JWT is valid
- whether the token has expired

Invalid or missing authentication returns a `401` response.

### Staff Authorization Middleware

The staff authorization middleware checks the role stored in the authenticated JWT.

Students cannot use:

```text
POST /api/books
PUT /api/books/:id
DELETE /api/books/:id
```

The public GET catalogue remains accessible without authentication.

---

# Real-Time Catalogue Updates

LibSwap uses Socket.IO to synchronize administrative book changes with catalogue pages that are already open.

When a staff user creates, edits or deletes a library book:

```text
Admin interface
    ↓
POST / PUT / DELETE
    ↓
Express controller
    ↓
MongoDB updated
    ↓
Socket.IO emits "booksChanged"
    ↓
Connected catalogue receives event
    ↓
loadBooks() runs automatically
    ↓
Catalogue updates without browser refresh
```

Real-time behaviour has been manually demonstrated for:

- Creating a book
- Updating a book
- Changing availability
- Deleting a book

The catalogue does not require a manual refresh to see these changes.

---

# Student Dashboard

The repository also contains a student dashboard module.

The dashboard is intended to provide one location where students can view information related to their books and swap activity.

Current dashboard functionality includes routes for:

- Retrieving books associated with a user
- Retrieving swap requests received by a user
- Retrieving swap requests sent by a user
- Displaying dashboard sections
- Reading stored login information from local storage
- Logout functionality

Dashboard API routes include:

```text
GET /dashboard/my-books/:userId
GET /dashboard/swap-received/:userId
GET /dashboard/swap-sent/:userId
```

The dashboard frontend contains sections for:

- My Books
- Swap Requests Received
- Swap Requests Sent
- User welcome information
- Logout

### Dashboard Integration Note

The current branch contains the dashboard frontend and backend routes, but this module still requires further integration verification with the shared book ownership model and current application port before being treated as fully complete.

---

# Swap Request Data

The project contains a `SwapRequest` model and dashboard functionality for retrieving swap-request information.

The current dashboard routes support:

### Requests Received

```text
/dashboard/swap-received/:userId
```

This retrieves swap requests where the user is the owner of the requested book.

### Requests Sent

```text
/dashboard/swap-sent/:userId
```

This retrieves requests created by the requesting user.

The routes also populate related book and user information where available.

---

# Personal Book Interfaces

The repository contains separate frontend interfaces for student/personal book functionality.

Current pages include:

```text
add-book.html
delete-personal-book.html
```

Associated JavaScript files include:

```text
public/js/add-book.js
public/js/delete-personal-book.js
```

These interfaces provide UI flows for:

- Adding a book
- Displaying books available for deletion
- Confirming book deletion
- Showing success and error messages

### Current Integration Note

These personal-book pages currently use the shared `/api/books` routes.

Since POST and DELETE library-book operations are now protected for staff users, the personal-book functionality requires separate ownership-aware student endpoints before it should be considered fully integrated.

This separation prevents student personal-book management from bypassing the staff-only library-management rules.

---

# Automated Testing

Automated testing was added to provide repeatable verification rather than relying only on manual testing.

Testing uses:

- Jest
- Supertest
- MongoDB Memory Server

MongoDB Memory Server provides an isolated temporary MongoDB database so automated CRUD tests do not modify the real MongoDB Atlas data.

Run the tests using:

```text
npm test
```

## Current Automated Test Result

```text
Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
```

The automated suite verifies:

### Catalogue/API Tests

- GET all books
- Search by title
- Case-insensitive searching
- Search by author

### POST Tests

- Reject requests without authentication
- Reject student users
- Allow staff users
- Create a valid book
- Reject missing required title
- Reject invalid availability

### PUT Tests

- Reject requests without authentication
- Reject student users
- Allow staff users
- Update an existing book
- Return 404 for a missing book
- Reject an invalid MongoDB ID

### DELETE Tests

- Reject requests without authentication
- Reject student users
- Allow staff users
- Delete an existing book
- Return 404 for a missing book
- Reject an invalid MongoDB ID

---

# Manual Testing

US02 also includes documented manual testing.

The manual test file is:

```text
tests/US02-manual-tests.md
```

Manual testing covers:

- Catalogue loading
- Search by title
- Search by author
- Search by genre
- Case-insensitive searching
- No search results
- Genre filtering
- Availability filtering
- Title sorting
- Author sorting
- Combined filters
- Backend failure handling

US10 has also been manually tested for:

- Admin catalogue loading
- Book creation
- Book editing
- Availability changes
- Book deletion
- Frontend/API integration
- Real-time creation updates
- Real-time editing updates
- Real-time deletion updates
- Unauthenticated management restriction

Further staff/student browser regression testing can be completed before final merge.

---

# Application Architecture

The application follows a layered/MVC-oriented structure.

```text
Browser / Frontend
        ↓
HTML + CSS + JavaScript
        ↓
Fetch API / Socket.IO
        ↓
Express Routes
        ↓
Authentication / Authorization Middleware
        ↓
Controllers
        ↓
Mongoose Models
        ↓
MongoDB Atlas
```

Socket.IO operates alongside the Express API to provide real-time catalogue events.

---

# Project Structure

```text
LibSwap/
│
├── app.js
├── server.js
├── package.json
├── package-lock.json
├── .env.example
│
├── controllers/
│   ├── authController.js
│   └── bookController.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── staffOnly.js
│
├── model/
│   └── User.js
│
├── models/
│   ├── Book.js
│   └── SwapRequest.js
│
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   └── dashboardRoutes.js
│
├── public/
│   ├── catalogue.html
│   ├── admin-books.html
│   ├── add-book.html
│   ├── delete-personal-book.html
│   ├── dashboard.html
│   │
│   ├── css/
│   │
│   └── js/
│       ├── catalogue.js
│       ├── admin-books.js
│       ├── add-book.js
│       ├── delete-personal-book.js
│       └── dashboard.js
│
└── tests/
    ├── US02-manual-tests.md
    └── bookApi.test.js
```

---

# Express Application Structure

The application setup is separated into two files.

## `app.js`

`app.js` configures:

- Express
- JSON request parsing
- Static frontend files
- Authentication routes
- Book routes
- Dashboard routes

Separating the Express application from the server allows Supertest to import the app during automated testing without starting the normal production server.

## `server.js`

`server.js` handles:

- Environment variables
- MongoDB Atlas connection
- HTTP server creation
- Socket.IO configuration
- Server startup

---

# Authentication API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new student |
| POST | `/api/auth/login` | Authenticate a user and return a JWT |
| GET | `/api/auth/me` | Verify JWT and return authenticated user information |

---

# Environment Variables

Create a `.env` file using `.env.example` as a guide.

Required configuration includes:

```text
MONGODB_URI=
PORT=3000
JWT_SECRET=
JWT_EXPIRES_IN=1d
```

The real `.env` file must not be committed to GitHub.

---

# Running the Project

Install dependencies:

```text
npm install
```

Start the application:

```text
npm start
```

The application normally runs at:

```text
http://localhost:3000
```

Useful pages include:

```text
http://localhost:3000/catalogue.html
http://localhost:3000/admin-books.html
http://localhost:3000/dashboard.html
http://localhost:3000/add-book.html
http://localhost:3000/delete-personal-book.html
```

---

# Development Approach

The project uses separate Git branches and incremental commits to demonstrate development progression.

US02 was developed progressively through:

- Catalogue API
- Catalogue frontend
- Search integration
- Filtering and sorting
- Error handling
- Manual test documentation

US10 was developed progressively through:

- Admin CRUD API
- Admin book-management interface
- Input validation
- Integration with the latest shared `main` branch
- Frontend/API integration
- Automated API testing
- Real-time Socket.IO catalogue synchronization
- JWT-based staff authorization
- Extended automated authorization tests

Important US10 progression commits include:

```text
c59b3a9  feat: add admin book CRUD API
c1778a6  feat: add admin book management UI
969caac  feat: add admin book validation
a789f98  merge latest main into US10 branch
bf6ea88  feat: integrate admin book management with API
1a7d676  test: add automated book API tests
093d19e  feat: add real-time catalogue updates
```

The final staff-authorization changes are being completed on:

```text
feature/us10-admin-books
```

before opening the final pull request to `main`.

---

# Current Development Status

### Completed and verified

- User registration and login backend
- JWT authentication
- Student/staff roles
- Library catalogue browsing
- Catalogue searching
- Filtering and sorting
- Admin library-book CRUD
- Admin frontend/API integration
- Input validation
- Automated book API testing
- Real-time Socket.IO catalogue updates
- Staff-only API authorization
- 18 passing automated API tests

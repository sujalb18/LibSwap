# LibSwap

Library Management and Student Book Swapping System

LibSwap is a web-based application developed for SIT725 that combines library catalogue management with student book borrowing, reservations, personal book management, peer-to-peer swapping, reviews, moderation, notifications, and missing-book requests.
## US03 – Borrow and Return Library Books

As a student, I want to borrow and return library books and view my borrowing status.

- **US03.1 – Borrowing history:** View current and returned loans with their borrowing and return dates.
- **US03.2 – Due dates:** View the 14-day due date for each new loan and see when a loan is overdue.
- **US03.3 – Book availability:** Automatically update availability when a book is borrowed or returned, respecting existing reservations.

The application uses a browser-based frontend, Node.js and Express backend, MongoDB with Mongoose, JWT-based authentication and role-based authorization, and Socket.IO for real-time updates.

## Key Features

### Authentication and Roles
- Student registration and login
- Password hashing with bcryptjs
## US04 – Reserve Unavailable Library Books

As a student, I want to reserve unavailable library books and track my reservation status.

- **US04.1 – Reservation status:** See whether a reservation is waiting or ready to borrow.
- **US04.2 – Reservation queue:** See my position in the first-come, first-served queue without exposing other students' identities.
- **US04.3 – Availability notification:** Receive an in-app notification when my reserved book becomes available for me to borrow.

**Your Reservations** shows waiting/ready status and your position in the first-come
queue, without exposing other students' identities. When a book is returned, the
first student receives an in-app notification and can borrow it from this section.
The book remains unavailable to other students until the queue is served.
Existing Socket.IO events refresh dashboard and catalogue availability. Use
**Refresh status** if the live connection is interrupted.

### Borrowing and reservation APIs

- `GET /api/books/circulation`: your loan history, book actions and queue positions.
- `POST /api/books/borrow/:bookId`: borrow an available book or your ready reservation.
- `POST /api/books/return/:bookId`: return your current loan.
- `POST /api/books/reserve/:bookId`: join an unavailable book's reservation queue.

Library staff cannot mark a borrowed book available or delete a book with loan
history. Marking an unavailable, unborrowed book available alerts its first queued
student. Personal swap books remain separate from library borrowing.

Run `npm test` for the existing suite, or `npm test -- --runTestsByPath tests/bookApi.test.js`
for book and circulation integration tests. Tests use temporary MongoDB databases.


# Swap Request Dashboard

The Swap Request Dashboard allows students to submit a request to swap a book. It is accessed from the main Student Dashboard.

## Features Implemented

### 1. Dashboard Navigation
- Students can switch from the main dashboard to the Swap Request dashboard using the navigation button.

### 2. Swap Request Form
- Simple form layout for entering swap details.
- Clean and easy-to-understand interface.

### 3. Return Navigation
- Students can return to the main dashboard.
=======
=======

## Overview

LibSwap is a web-based library and book-swapping application developed for SIT725.

The project combines traditional library catalogue functionality with student book-management and swapping features. It uses a browser-based frontend, a Node.js and Express backend, MongoDB for persistent storage, JWT-based authentication, role-based authorization, and Socket.IO for real-time catalogue updates.

The current project contains functionality for:

- User registration and login
- JWT authentication
- Authentication middleware for protected routes
- Student and staff roles
- Staff-only authorization for administrative operations
- Authenticated user retrieval through `/api/auth/me`
- Logout support

The shared authentication frontend is used by both student and staff users. Logout clears the authentication values stored in localStorage and redirects the user back to the login page, providing a consistent sign-out flow across the application.

### Library Catalogue
- Browse the shared library catalogue
- Search by title, author, or genre
- Case-insensitive searching
- Filter by genre and availability
- Sort by title or author
- Combine searching, filtering, and sorting
- Loading, empty-result, and API-error handling
- Safe dynamic DOM rendering
- Real-time catalogue refresh through Socket.IO

Catalogue page:

```text
http://localhost:3000/catalogue.html
```

### Staff Library Management
Staff users can manage the shared library catalogue through the administrative interface.

Implemented functionality includes:
- Add library books
- Edit library books
- Change availability
- Delete eligible library books
- Input validation
- Invalid/missing ID handling
- JWT-protected requests
- Staff-only authorization
- Real-time catalogue synchronization
- Protection against invalid circulation changes, such as deleting books with loan history

Admin page:

```text
http://localhost:3000/admin-books.html
```

Main catalogue API:

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/books` | Retrieve/search books | Public |
| POST | `/api/books` | Add a library book | Staff |
| PUT | `/api/books/:id` | Update a library book | Staff |
| DELETE | `/api/books/:id` | Delete a library book | Staff |

Protected operations use:

```text
Authorization: Bearer <JWT>
```

### Borrowing and Returning
Students can borrow eligible library books and return their current loans.

The circulation functionality includes:
- Current borrowed books
- 14-day due dates for new loans
- Borrowing history
- Overdue status
- Return functionality
- Protection against double borrowing
- Separation between library books and personal swap books

Relevant endpoints:

```text
GET  /api/books/circulation
POST /api/books/borrow/:bookId
POST /api/books/return/:bookId
```

### Reservation Queue
Students can reserve unavailable library books.

Implemented functionality includes:
- First-come reservation queue
- Waiting and ready states
- Queue-position display without exposing other students' identities
- Notification when the first student becomes eligible to borrow
- Protection against other students borrowing a book while the reservation queue is being served
- Dashboard/circulation refresh after availability changes

Reservation endpoint:

```text
POST /api/books/reserve/:bookId
```

### Student Dashboard
The student dashboard provides a central interface for student functionality.

It includes:
- Student information and navigation
- Personal books
- Borrowed books and borrowing history
- Reservations
- Swap functionality
- Notifications
- Logout

Dashboard page:

```text
http://localhost:3000/dashboard.html
```

### Personal Book Management
Authenticated students can add personal books for peer-to-peer swapping.

Book addition includes:
- Required title and author validation
- Rejection of whitespace-only values
- Maximum field lengths
- Duplicate prevention for the same owner
- Automatic ownership assignment from the authenticated JWT
- Frontend success/error handling

Students can also delete eligible personal books.

Deletion protection includes:
- JWT user validation
- Cross-user deletion prevention
- Borrowed/reserved book protection
- Swap-history checks
- Original-uploader deletion rules for swapped books
- Invalid/missing ObjectID handling

Relevant routes include:

```text
GET    /dashboard/my-books/:userId
POST   /dashboard/my-books/:userId
DELETE /dashboard/my-books/:userId/:bookId
```

### Book Swapping
Students can request peer-to-peer book swaps using their personal books.

Implemented functionality includes:
- Select a requested book
- Select a personal book to offer
- Send swap requests
- View sent and received requests
- Pending, accepted, rejected, and cancelled statuses
- Accept incoming requests
- Reject incoming requests
- Cancel outgoing pending requests
- Transfer book ownership after acceptance
- Prevent unauthorized swap actions
- Prevent processing non-pending requests
- Prevent books that are borrowed or reserved from being swapped
- Prevent conflicting active swaps
- Automatically reject competing pending swaps after an accepted swap
- Refresh swap requests and personal-book ownership after actions

The final integrated application was also manually checked to confirm that swap requests load correctly, duplicate active offers are blocked, cancellation works, and a fresh swap request can be created successfully.

### Reviews and Ratings
LibSwap includes review and rating functionality integrated with the shared application.
Students can submit ratings from 1 to 5 together with written comments for books in the catalogue.

Review functionality includes:
- Create a review for a book
- View approved reviews
- View personal submitted reviews
- Edit personal reviews
- Delete personal reviews
- Ownership checks for review management
- Validation for ratings and comments
- Duplicate-review prevention
- Re-authentication through JWT-protected requests

New reviews are initially stored with a pending moderation status. When a student edits an existing review, the updated review returns to the moderation workflow before being displayed publicly again.

The review workflow is:

```text
Student submits review
        ↓
Pending moderation
        ↓
Staff reviews submission
        ↓
Approve / Remove
        ↓
Approved review becomes visible

Relevant review endpoints include:
POST   /api/books/:bookId/reviews
GET    /api/books/:bookId/reviews
GET    /api/reviews/me
PATCH  /api/reviews/:reviewId
DELETE /api/reviews/:reviewId

The final repository contains automated coverage for the review API as part of the integrated Jest test suite.

### Review Moderation

This fits **much better** because your current README already has the moderation section immediately after Reviews. :contentReference[oaicite:3]{index=3}

---

# 3. Tere 2 integration fixes

Ye **best location is at the bottom**, because README already has:

```md
## Development Workflow at line 476.
 
Moderation functionality includes:
- Retrieve review data for moderation
- Approve reviews
- Remove reviews
- Staff-only authorization
- Input and request validation
- Frontend moderation interface
- Real-time update support
- Automated API tests

### Notifications and Missing-Book Requests
The integrated application includes:
- In-app notifications
- Reservation-related notifications
- Missing-book request functionality
- Student-facing notification/request interfaces

## Real-Time Updates

LibSwap uses Socket.IO alongside the Express API.

For example, staff catalogue changes follow this flow:

```text
Staff interface
    ↓
POST / PUT / DELETE request
    ↓
Express route/controller
    ↓
MongoDB update
    ↓
Socket.IO event
    ↓
Connected frontend receives update
    ↓
Displayed data refreshes
```

Real-time catalogue behaviour has been manually demonstrated for creating, editing, availability changes, and deleting eligible books.

## Application Architecture

LibSwap follows a layered/MVC-oriented structure:

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

`app.js` configures the Express application, middleware, static frontend content, and application routes.

`server.js` loads environment configuration, connects to MongoDB, creates the HTTP server, configures Socket.IO, and starts the application.

Keeping the Express application separate from server startup also allows Supertest to test the application without starting the normal production server.

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
- Staff authorization middleware
- Backend validation
- Ownership/permission checks

### Testing
- Jest
- Supertest
- MongoDB Memory Server
- Manual browser testing

## Automated Testing

The final integrated application uses automated tests across the major application areas.

Run all tests with:

```text
npm test
```

The final integration checkpoint produced:

```text
Test Suites: 7 passed, 7 total
Tests:       79 passed, 79 total
Snapshots:   0 total
```

The seven test suites are:

```text
tests/reviewApi.test.js
tests/bookApi.test.js
tests/swap.test.js
tests/moderationApi.test.js
tests/adddeletepersonalbooks.test.js
tests/auth.test.js
tests/authMiddleware.test.js
```

Together these tests cover areas including:
- Registration and login
- JWT/authentication middleware
- Catalogue and book APIs
- Staff authorization
- Administrative CRUD
- Borrowing and circulation behaviour
- Reservation behaviour
- Personal-book addition/deletion
- Swap functionality
- Reviews/ratings
- Review moderation

MongoDB Memory Server is used by applicable tests to provide isolated temporary databases so automated testing does not modify the main MongoDB Atlas data.

## Manual Testing

Manual browser testing has also been used throughout development.

Verified areas include:
- Registration/login flows
- Catalogue loading, searching, filtering, and sorting
- Staff book creation/editing/deletion
- Staff authorization restrictions
- Real-time catalogue updates
- Student borrowing
- Student dashboard integration
- Swap-request display
- Swap status display
- Duplicate active swap prevention
- Swap cancellation
- Fresh swap-request creation

US02 manual test documentation is available in:

```text
tests/US02-manual-tests.md
```

## Authentication API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new student |
| POST | `/api/auth/login` | Authenticate and return a JWT |
| GET | `/api/auth/me` | Return the authenticated user |

Administrative routes distinguish authentication from authorization:

```text
No valid token
    ↓
401 Unauthorized

Valid student token
    ↓
403 Forbidden for staff-only operation

Valid staff token
    ↓
Staff-only operation allowed
```

## Environment Configuration

Create a local `.env` file using `.env.example` as the configuration guide.

Required application configuration includes:

```text
MONGODB_URI=
PORT=3000
JWT_SECRET=
JWT_EXPIRES_IN=1d
```

The real `.env` file contains private configuration and must not be committed to the repository.

## Running LibSwap

Install dependencies:

```text
npm install
```

Start the application:

```text
npm start
```

Run automated tests:

```text
npm test
```

By default, the application is available at:

```text
http://localhost:3000
```

Useful application pages include:

```text
http://localhost:3000/login.html
http://localhost:3000/catalogue.html
http://localhost:3000/dashboard.html
http://localhost:3000/admin-books.html
```

## Development Workflow

LibSwap was developed collaboratively using Git and GitHub with feature branches and pull requests.

The final integration branch combines the team's implemented functionality and provides a common point for regression testing before the final merge into `main`.

The final integrated checkpoint successfully passed all 79 automated tests across 7 Jest test suites.

### Final Integration Fixes

During final application integration, I identified and resolved two cross-feature UI issues. The staff administration page was missing the expected logout control, and the catalogue frontend was affected by an integration regression after changes from other feature branches were combined.


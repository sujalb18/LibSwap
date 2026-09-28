# LibSwap

Library Management and Student Book Swapping System

LibSwap is a web-based application developed for SIT725 that combines library catalogue management with student book borrowing, reservations, personal book management, peer-to-peer swapping, reviews, moderation, notifications, and missing-book requests.

The application uses a browser-based frontend, Node.js and Express backend, MongoDB with Mongoose, JWT-based authentication and role-based authorization, and Socket.IO for real-time updates.

## Key Features

### Authentication and Roles
- Student registration and login
- Password hashing with bcryptjs
- JWT authentication
- Authentication middleware for protected routes
- Student and staff roles
- Staff-only authorization for administrative operations
- Authenticated user retrieval through `/api/auth/me`
- Logout support

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

The final repository contains automated coverage for the review API as part of the integrated Jest test suite.

### Review Moderation
Staff users can moderate submitted reviews.

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

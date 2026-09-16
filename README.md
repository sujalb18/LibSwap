# LibSwap

Library Management and Student Book Swapping System

## Overview

LibSwap is a web-based application that combines traditional university library management with student-to-student book swapping functionality.

The system is being developed using a layered web architecture, with a browser-based frontend, a Node.js and Express backend, and MongoDB for persistent data storage.

Current Sprint 1 development includes catalogue browsing and searching, book filtering and sorting, and administrative library-book management functionality.

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

Final frontend/API integration, access control and full scenario testing are still in progress.

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
    Manual test documentation

server.js
    Main Express server entry point
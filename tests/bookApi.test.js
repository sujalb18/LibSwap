const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const Book = require('../models/Book');

// Give Jest enough time for the temporary MongoDB server
jest.setTimeout(120000);

let mongoServer;
let databaseReady = false;

// Start a temporary MongoDB database before the tests run
beforeAll(async () => {

    // mongodb-memory-server normally only waits 10 seconds
    // for MongoDB to start, so we increase that for Windows
    mongoServer = await MongoMemoryServer.create({
        instance: {
            launchTimeout: 60000
        }
    });

    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);

    databaseReady = true;
});

// Remove test books after every test
// Only do this if the temporary database successfully started
afterEach(async () => {
    if (
        databaseReady &&
        mongoose.connection.readyState === 1
    ) {
        await Book.deleteMany({});
    }
});

// Close the temporary database safely after all tests finish
afterAll(async () => {

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Book API automated tests', () => {

    test('GET /api/books returns all books', async () => {
        await Book.create([
            {
                title: 'Book One',
                author: 'Author One',
                genre: 'Fantasy',
                available: true
            },
            {
                title: 'Book Two',
                author: 'Author Two',
                genre: 'Programming',
                available: false
            }
        ]);

        const response = await request(app)
            .get('/api/books')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(2);
    });

    test('GET /api/books searches by title case-insensitively', async () => {
        await Book.create([
            {
                title: 'Harry Potter',
                author: 'J.K. Rowling',
                genre: 'Fantasy'
            },
            {
                title: 'Clean Code',
                author: 'Robert Martin',
                genre: 'Programming'
            }
        ]);

        const response = await request(app)
            .get('/api/books?search=harry')
            .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe('Harry Potter');
    });

    test('GET /api/books can search by author', async () => {
        await Book.create([
            {
                title: 'A Game of Thrones',
                author: 'George R. R. Martin',
                genre: 'Fantasy'
            },
            {
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                genre: 'Fantasy'
            }
        ]);

        const response = await request(app)
            .get('/api/books?search=martin')
            .expect(200);

        expect(response.body).toHaveLength(1);

        expect(response.body[0].author).toBe(
            'George R. R. Martin'
        );
    });

    test('POST /api/books creates a valid book', async () => {
        const newBook = {
            title: 'Automated Test Book',
            author: 'Test Author',
            genre: 'Testing',
            available: true
        };

        const response = await request(app)
            .post('/api/books')
            .send(newBook)
            .expect(201);

        expect(response.body.message).toBe(
            'Book added successfully'
        );

        expect(response.body.book.title).toBe(
            'Automated Test Book'
        );

        const savedBook = await Book.findOne({
            title: 'Automated Test Book'
        });

        expect(savedBook).not.toBeNull();
        expect(savedBook.author).toBe('Test Author');
    });

    test('POST /api/books rejects a book without a title', async () => {
        const response = await request(app)
            .post('/api/books')
            .send({
                author: 'Test Author',
                genre: 'Testing',
                available: true
            })
            .expect(400);

        expect(response.body.message).toBe(
            'Title and author are required'
        );
    });

    test('POST /api/books rejects invalid availability', async () => {
        const response = await request(app)
            .post('/api/books')
            .send({
                title: 'Invalid Availability Book',
                author: 'Test Author',
                genre: 'Testing',
                available: 'yes'
            })
            .expect(400);

        expect(response.body.message).toBe(
            'Availability must be true or false'
        );
    });

    test('PUT /api/books/:id updates an existing book', async () => {
        const book = await Book.create({
            title: 'Original Title',
            author: 'Original Author',
            genre: 'Fantasy',
            available: true
        });

        const response = await request(app)
            .put(`/api/books/${book._id}`)
            .send({
                title: 'Updated Title',
                author: 'Updated Author',
                genre: 'Programming',
                available: false
            })
            .expect(200);

        expect(response.body.message).toBe(
            'Book updated successfully'
        );

        expect(response.body.book.title).toBe(
            'Updated Title'
        );

        expect(response.body.book.available).toBe(false);

        const updatedBook = await Book.findById(book._id);

        expect(updatedBook.title).toBe('Updated Title');
        expect(updatedBook.available).toBe(false);
    });

    test('PUT /api/books/:id returns 404 for a missing book', async () => {
        const missingBookId =
            new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/books/${missingBookId}`)
            .send({
                title: 'Missing Book',
                author: 'Test Author',
                genre: 'Testing',
                available: true
            })
            .expect(404);

        expect(response.body.message).toBe(
            'Book not found'
        );
    });

    test('PUT /api/books/:id rejects an invalid book ID', async () => {
        const response = await request(app)
            .put('/api/books/not-a-valid-id')
            .send({
                title: 'Test Book',
                author: 'Test Author',
                genre: 'Testing',
                available: true
            })
            .expect(400);

        expect(response.body.message).toBe(
            'Invalid book ID'
        );
    });

    test('DELETE /api/books/:id deletes an existing book', async () => {
        const book = await Book.create({
            title: 'Book To Delete',
            author: 'Test Author',
            genre: 'Testing',
            available: true
        });

        const response = await request(app)
            .delete(`/api/books/${book._id}`)
            .expect(200);

        expect(response.body.message).toBe(
            'Book deleted successfully'
        );

        const deletedBook = await Book.findById(book._id);

        expect(deletedBook).toBeNull();
    });

    test('DELETE /api/books/:id returns 404 for a missing book', async () => {
        const missingBookId =
            new mongoose.Types.ObjectId();

        const response = await request(app)
            .delete(`/api/books/${missingBookId}`)
            .expect(404);

        expect(response.body.message).toBe(
            'Book not found'
        );
    });

    test('DELETE /api/books/:id rejects an invalid book ID', async () => {
        const response = await request(app)
            .delete('/api/books/not-a-valid-id')
            .expect(400);

        expect(response.body.message).toBe(
            'Invalid book ID'
        );
    });

});
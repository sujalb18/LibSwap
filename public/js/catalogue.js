// Getting the main page elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const bookList = document.getElementById('bookList');
const message = document.getElementById('message');

const genreFilter = document.getElementById('genreFilter');
const availabilityFilter = document.getElementById('availabilityFilter');
const sortSelect = document.getElementById('sortSelect');
const reviewModal = document.getElementById('reviewModal');

const closeReviewModal =
    document.getElementById('closeReviewModal');

const reviewForm =
    document.getElementById('reviewForm');

const reviewBookTitle =
    document.getElementById('reviewBookTitle');

const reviewBookAuthor =
    document.getElementById('reviewBookAuthor');

const ratingStars =
    document.querySelectorAll('.star-button');

const ratingText =
    document.getElementById('ratingText');

const reviewComment =
    document.getElementById('reviewComment');

const commentCount =
    document.getElementById('commentCount');

const submitReviewButton =
    document.getElementById('submitReviewButton');

const reviewMessage =
    document.getElementById('reviewMessage');

// Stores the currently selected book for review
let selectedBookId = null;
let selectedRating = 0;

// Connect this catalogue page to Socket.IO
const socket = io();

// Stores the books returned by the backend
let currentBooks = [];

// Enables or disables the catalogue controls while data is loading
const setLoadingState = (isLoading) => {
    searchButton.disabled = isLoading;
    searchInput.disabled = isLoading;
    genreFilter.disabled = isLoading;
    availabilityFilter.disabled = isLoading;
    sortSelect.disabled = isLoading;

    searchButton.textContent = isLoading ? 'Searching...' : 'Search';
};

// Adds the available genres to the genre dropdown
const updateGenreOptions = (books) => {
    const selectedGenre = genreFilter.value;

    const genres = [
        ...new Set(
            books
                .map((book) => book.genre)
                .filter((genre) => genre)
        )
    ].sort();

    genreFilter.innerHTML = '<option value="">All genres</option>';

    genres.forEach((genre) => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });

    // Keep the selected genre if it still exists in the new results
    if (genres.includes(selectedGenre)) {
        genreFilter.value = selectedGenre;
    }
};

// Shows the books on the page
const displayBooks = (books) => {
    bookList.innerHTML = '';
    message.textContent = '';

    // If there are no matching books, show a message
    if (books.length === 0) {
        message.textContent = 'No books found.';
        return;
    }

    // Create one card for each book
    books.forEach((book) => {
        const card = document.createElement('div');
        card.classList.add('book-card');

        // Showing the book information
        card.innerHTML = `
            <h2>${book.title}</h2>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Genre:</strong> ${book.genre || 'Not specified'}</p>
            <p><strong>Availability:</strong> ${book.available ? 'Available' : 'Unavailable'}</p>
        `;

        card.innerHTML = `
    <h2>${book.title}</h2>

    <p>
        <strong>Author:</strong>
        ${book.author}
    </p>

    <p>
        <strong>Genre:</strong>
        ${book.genre || 'Not specified'}
    </p>

    <p>
        <strong>Availability:</strong>
        <span class="${book.available ? 'available' : 'unavailable'}">
            ${book.available ? 'Available' : 'Unavailable'}
        </span>
    </p>

    <div class="book-review-actions">

        <button
            type="button"
            class="view-reviews-button"
            data-book-id="${book._id}"
        >
            View Reviews
        </button>

        <button
            type="button"
            class="write-review-button"
            data-book-id="${book._id}"
            data-book-title="${encodeURIComponent(book.title)}"
            data-book-author="${encodeURIComponent(book.author)}"
        >
            Write Review
        </button>

    </div>
`;

        // Add the card to the page
        bookList.appendChild(card);
    });
};

// Applies the selected filters and sorting
const applyFiltersAndSorting = () => {
    let booksToDisplay = [...currentBooks];

    const selectedGenre = genreFilter.value;
    const selectedAvailability = availabilityFilter.value;
    const selectedSort = sortSelect.value;

    // Filter books by genre
    if (selectedGenre) {
        booksToDisplay = booksToDisplay.filter(
            (book) => book.genre === selectedGenre
        );
    }

    // Filter books by availability
    if (selectedAvailability === 'available') {
        booksToDisplay = booksToDisplay.filter(
            (book) => book.available === true
        );
    }

    if (selectedAvailability === 'unavailable') {
        booksToDisplay = booksToDisplay.filter(
            (book) => book.available === false
        );
    }

    // Sort books using the selected option
    if (selectedSort === 'title-asc') {
        booksToDisplay.sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }

    if (selectedSort === 'title-desc') {
        booksToDisplay.sort((a, b) =>
            b.title.localeCompare(a.title)
        );
    }

    if (selectedSort === 'author-asc') {
        booksToDisplay.sort((a, b) =>
            a.author.localeCompare(b.author)
        );
    }

    displayBooks(booksToDisplay);
};

// This function loads books from our backend API
const loadBooks = async (searchTerm = '') => {
    try {
        // Show a loading message while we wait for the server
        message.textContent = 'Loading books...';

        // Clear old book results before showing new ones
        bookList.innerHTML = '';

        setLoadingState(true);

        // Build the API URL
        let url = '/api/books';

        // If the user searched for something, add it to the URL
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }

        // Ask the backend for the books
        const response = await fetch(url);

        // If the server gives an error, stop here
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        // Convert the response into JavaScript data
        const books = await response.json();

        // Make sure the API returned a list of books
        if (!Array.isArray(books)) {
            throw new Error('Invalid book data received from server');
        }

        currentBooks = books;

        // Add the genres returned by the backend to the filter
        updateGenreOptions(books);

        // Display the books using the selected filters and sorting
        applyFiltersAndSorting();

    } catch (error) {
        // Remove old data so failed requests do not leave stale results
        currentBooks = [];
        bookList.innerHTML = '';

        // Show a simple error message if something goes wrong
        message.textContent = 'Unable to load books. Please try again.';
        console.error(error);

    } finally {
        // Re-enable the controls after the request finishes
        setLoadingState(false);
    }
};

// When the search button is clicked, search using the typed text
searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    loadBooks(searchTerm);
});

// Also allow the Enter key to search
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        loadBooks(searchTerm);
    }
});

// Apply filters whenever a filter option changes
genreFilter.addEventListener('change', applyFiltersAndSorting);
availabilityFilter.addEventListener('change', applyFiltersAndSorting);
sortSelect.addEventListener('change', applyFiltersAndSorting);

// Listen for real-time book changes from the server
socket.on('booksChanged', () => {
    // Keep the current search term when refreshing the catalogue
    const searchTerm = searchInput.value.trim();

    // Reload the catalogue automatically without refreshing the browser
    loadBooks(searchTerm);
});

// Open the review form for a selected book
document.addEventListener('click', (event) => {

    const writeButton =
        event.target.closest('.write-review-button');

    if (!writeButton) {
        return;
    }

    const token = localStorage.getItem('token');

    // User must be logged in to submit a review
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    selectedBookId = writeButton.dataset.bookId;

    const title = decodeURIComponent(
        writeButton.dataset.bookTitle
    );

    const author = decodeURIComponent(
        writeButton.dataset.bookAuthor
    );

    reviewBookTitle.textContent = title;
    reviewBookAuthor.textContent = `by ${author}`;

    // Reset form
    reviewForm.reset();
    selectedRating = 0;

    updateRatingStars();

    ratingText.textContent =
        'Select a rating';

    commentCount.textContent = '0';

    reviewMessage.textContent = '';

    reviewModal.classList.remove('hidden');

    reviewComment.focus();
});

const updateRatingStars = () => {

    ratingStars.forEach((star) => {

        const rating =
            Number(star.dataset.rating);

        star.classList.toggle(
            'selected',
            rating <= selectedRating
        );
    });

    if (selectedRating > 0) {
        ratingText.textContent =
            `${selectedRating} out of 5`;
    }
};


ratingStars.forEach((star) => {

    star.addEventListener('click', () => {

        selectedRating =
            Number(star.dataset.rating);

        updateRatingStars();
    });

});

reviewComment.addEventListener('input', () => {

    commentCount.textContent =
        reviewComment.value.length;
});

const closeReviewModalHandler = () => {

    reviewModal.classList.add('hidden');

    selectedBookId = null;
    selectedRating = 0;

    reviewForm.reset();

    updateRatingStars();

    ratingText.textContent =
        'Select a rating';

    commentCount.textContent = '0';

    reviewMessage.textContent = '';
};


closeReviewModal.addEventListener(
    'click',
    closeReviewModalHandler
);


reviewModal.addEventListener('click', (event) => {

    if (event.target === reviewModal) {
        closeReviewModalHandler();
    }

});

reviewForm.addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();

        const token =
            localStorage.getItem('token');

        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        if (!selectedRating) {

            reviewMessage.textContent =
                'Please select a rating.';

            return;
        }

        const comment =
            reviewComment.value.trim();

        if (!comment) {

            reviewMessage.textContent =
                'Please enter a review.';

            return;
        }

        submitReviewButton.disabled = true;

        submitReviewButton.textContent =
            'Submitting...';

        reviewMessage.textContent = '';

        try {

            const response = await fetch(
                `/api/books/${selectedBookId}/reviews`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        rating: selectedRating,
                        comment
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                reviewMessage.textContent =
                    data.message ||
                    'Unable to submit review.';

                return;
            }

            reviewMessage.textContent =
                'Review submitted successfully and is awaiting moderation.';

            setTimeout(() => {
                closeReviewModalHandler();
            }, 1500);

        } catch (error) {

            console.error(
                'Review submission error:',
                error
            );

            reviewMessage.textContent =
                'Unable to connect to the server.';

        } finally {

            submitReviewButton.disabled = false;

            submitReviewButton.textContent =
                'Submit Review';
        }
    }
);

// Load all books when the page first opens
loadBooks();
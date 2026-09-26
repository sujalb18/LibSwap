// Get form elements
const form = document.getElementById('addBookForm');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const genreInput = document.getElementById('genre');
const submitButton = document.getElementById('submitButton');
const message = document.getElementById('message');

// Handle form submission
form.addEventListener('submit', async (event) => {
    // Prevent the default browser form submission (which refreshes the page)
    event.preventDefault();

    // Clear any previous messages
    message.textContent = '';
    message.className = 'message';

    // Disable the button so the user doesn't click twice while it's loading
    submitButton.disabled = true;
    submitButton.textContent = 'Adding...';

    // Get the values from the inputs
    const newBook = {
        title: titleInput.value.trim(),
        author: authorInput.value.trim(),
        genre: genreInput.value.trim()
    };

    try {
        // Send a POST request to our backend
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        });

        if (!response.ok) {
            throw new Error('Failed to add the book.');
        }

        // If successful, show a success message
        message.textContent = 'Book added successfully!';
        message.classList.add('success');

        // Clear the form for the next entry
        form.reset();

    } catch (error) {
        // If something goes wrong, show an error message
        message.textContent = error.message || 'Unable to add book. Please try again.';
        message.classList.add('error');
        console.error(error);
    } finally {
        // Re-enable the button
        submitButton.disabled = false;
        submitButton.textContent = 'Add Book';
    }
});
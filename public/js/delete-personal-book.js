document.addEventListener('DOMContentLoaded', () => {
    const deleteList = document.getElementById('delete-list');
    const statusMessage = document.getElementById('status-message');

    // Fetch and display books when the page loads
    const loadBooksForDeletion = async () => {
        try {
            const response = await fetch('/api/books');
            if (!response.ok) throw new Error('Failed to fetch books');
            
            const books = await response.json();
            
            deleteList.innerHTML = ''; // Clear loading text

            if (books.length === 0) {
                deleteList.innerHTML = '<li>No books available to delete.</li>';
                return;
            }

            // Create a list item for each book
            books.forEach(book => {
                const li = document.createElement('li');
                li.className = 'delete-list-item';
                
                li.innerHTML = `
                    <div class="book-info">
                        <span class="book-title">${book.title}</span>
                        <span class="book-author">by ${book.author}</span>
                    </div>
                    <button class="btn-delete" data-id="${book._id}">Delete</button>
                `;
                
                deleteList.appendChild(li);
            });

            attachDeleteListeners();

        } catch (error) {
            console.error(error);
            deleteList.innerHTML = '<li class="error">Error loading books. Make sure the server is running.</li>';
        }
    };

    // Handle the delete button clicks
    const attachDeleteListeners = () => {
        const deleteButtons = document.querySelectorAll('.btn-delete');
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const bookId = e.target.getAttribute('data-id');
                
                // Confirm before deleting
                if (!confirm('Are you absolutely sure you want to delete this book?')) return;

                try {
                    const response = await fetch(`/api/books/${bookId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) throw new Error('Failed to delete the book');

                    // Show success message and reload the list
                    statusMessage.textContent = 'Book deleted successfully.';
                    statusMessage.className = 'success';
                    
                    setTimeout(() => { statusMessage.textContent = ''; }, 3000);

                    loadBooksForDeletion(); 

                } catch (error) {
                    console.error(error);
                    statusMessage.textContent = 'Error deleting book. Please try again.';
                    statusMessage.className = 'error';
                }
            });
        });
    };

    loadBooksForDeletion();
});
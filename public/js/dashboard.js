// ⭐ Read user from localStorage (set during login)
const demoUser = JSON.parse(localStorage.getItem("movieflixUser"));
const token = localStorage.getItem("movieflixToken");
const userId = demoUser.id;

// ⭐ Load initial sections
loadMyBooks();
loadStudentInfo();
loadBorrowedBooks();
loadReservations();
loadSwapRequests();

/* -------------------------------------------
   STUDENT INFO
-------------------------------------------- */
function loadStudentInfo() {
  const container = document.getElementById("student-details");
  container.innerHTML = `
    <p><strong>Name:</strong> ${demoUser.fullName}</p>
    <p><strong>Username:</strong> ${demoUser.username}</p>
    <p><strong>Email:</strong> ${demoUser.email}</p>
    <p><strong>Role:</strong> Student</p>
  `;
}

/* -------------------------------------------
   BORROWED BOOKS
-------------------------------------------- */
async function loadBorrowedBooks() {
  const list = document.getElementById("borrowed-list");

  try {
    const res = await fetch(`/dashboard/borrowed/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    if (!result.success || result.data.length === 0) {
      list.innerHTML = "<li>No books borrowed yet.</li>";
      return;
    }

    list.innerHTML = "";
    result.data.forEach(book => {
      list.innerHTML += `<li>${book.title} by ${book.author}</li>`;
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>Error loading borrowed books.</li>";
  }
}

/* -------------------------------------------
   RESERVATIONS
-------------------------------------------- */
async function loadReservations() {
  const list = document.getElementById("reservation-list");

  try {
    const res = await fetch(`/dashboard/reservations/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    if (!result.success || result.data.length === 0) {
      list.innerHTML = "<li>No reservations yet.</li>";
      return;
    }

    list.innerHTML = "";
    result.data.forEach(book => {
      list.innerHTML += `<li>${book.title} by ${book.author}</li>`;
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>Error loading reservations.</li>";
  }
}

/* -------------------------------------------
   SWAP REQUESTS (Sent + Received)
-------------------------------------------- */
async function loadSwapRequests() {
  const sentList = document.getElementById("swap-sent-list");
  const receivedList = document.getElementById("swap-received-list");

  try {
    const res = await fetch(`/dashboard/swap-all/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    if (!result.success) {
      sentList.innerHTML = "<li>Error loading swap requests.</li>";
      receivedList.innerHTML = "<li>Error loading swap requests.</li>";
      return;
    }

    const { sent, received } = result.data;

    /* ----- SENT REQUESTS ----- */
    if (sent.length === 0) {
      sentList.innerHTML = "<li>No sent swap requests.</li>";
    } else {
      sentList.innerHTML = "";
      sent.forEach(req => {
        sentList.innerHTML += `
          <li class="swap-card">
            <p><strong>You requested:</strong> ${req.requestedBookId.title}</p>
            <p><strong>You offered:</strong> ${req.offeredBookId.title}</p>
            <p>Status: ${req.status}</p>

            ${req.status === "pending" ? `
              <button class="cancel-btn" data-id="${req._id}">Cancel</button>
            ` : ""}
          </li>
        `;
      });
    }

    /* ----- RECEIVED REQUESTS ----- */
    if (received.length === 0) {
      receivedList.innerHTML = "<li>No received swap requests.</li>";
    } else {
      receivedList.innerHTML = "";
      received.forEach(req => {
        receivedList.innerHTML += `
          <li class="swap-card">
            <p><strong>Requested from you:</strong> ${req.requestedBookId.title}</p>
            <p><strong>They offered:</strong> ${req.offeredBookId.title}</p>
            <p>Status: ${req.status}</p>

            ${req.status === "pending" ? `
              <button class="accept-btn" data-id="${req._id}">Accept</button>
              <button class="reject-btn" data-id="${req._id}">Reject</button>
            ` : ""}
          </li>
        `;
      });
    }

    attachSwapButtons();

  } catch (err) {
    console.error(err);
    sentList.innerHTML = "<li>Error loading swap requests.</li>";
    receivedList.innerHTML = "<li>Error loading swap requests.</li>";
  }
}

/* -------------------------------------------
   BUTTON HANDLERS (Accept / Reject / Cancel)
-------------------------------------------- */
function attachSwapButtons() {
  document.querySelectorAll(".accept-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await fetch(`/swap/accept/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSwapRequests();
    });
  });

  document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await fetch(`/swap/reject/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSwapRequests();
    });
  });

  document.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await fetch(`/swap/cancel/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSwapRequests();
    });
  });
}

/* -------------------------------------------
   MY BOOKS (Owned) - FETCH, ADD, & DELETE
-------------------------------------------- */
async function loadMyBooks() {
  const list = document.getElementById("my-books-list");
  if (!list) return; 

  try {
    const res = await fetch(`/dashboard/my-books/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();

    if (!result.success || result.data.length === 0) {
      list.innerHTML = "<li>You haven't added any personal books yet.</li>";
      return;
    }

    list.innerHTML = "";
    result.data.forEach(book => {
      list.innerHTML += `
        <li style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; max-width: 400px;">
          <span><strong>${book.title}</strong> by ${book.author}</span>
          <button class="delete-btn" onclick="deleteMyBook('${book._id}')" style="background: red; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">Delete</button>
        </li>
      `;
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>Error loading your books.</li>";
  }
}

// Handle Add Book Form Submission with Client-Side Validation
const addBookForm = document.getElementById("dashboardAddBookForm");
if (addBookForm) {
  addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const msg = document.getElementById("addBookMessage");
    
    // 1. Get values and immediately trim whitespace from the edges
    const title = document.getElementById("newBookTitle").value.trim();
    const author = document.getElementById("newBookAuthor").value.trim();
    const genre = document.getElementById("newBookGenre").value.trim();
    
    // 2. Check if they are empty AFTER trimming (prevents spacebar bypassing)
    if (!title || !author) {
      msg.style.color = "red";
      msg.textContent = "Title and Author cannot be empty or just spaces.";
      return; 
    }

    // 3. Disable button to prevent double-clicks/spam submissions
    const submitBtn = addBookForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Adding...";
    msg.textContent = ""; 

    try {
      const res = await fetch(`/dashboard/my-books/${userId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        // Send the safely trimmed values
        body: JSON.stringify({ title, author, genre })
      });

      const result = await res.json();

      if (result.success) {
        msg.style.color = "green";
        msg.textContent = "Book added successfully!";
        addBookForm.reset();
        loadMyBooks(); // Instantly refresh the list
      } else {
        msg.style.color = "red";
        msg.textContent = result.message || "Failed to add book.";
      }
    } catch (err) {
      console.error(err);
      msg.style.color = "red";
      msg.textContent = "Server error.";
    } finally {
      // 4. Re-enable the button regardless of success or failure
      submitBtn.disabled = false;
      submitBtn.textContent = "Add Book";
    }
  });
}

// Handle Deleting a Book with Safety Checks
async function deleteMyBook(bookId) {
  // 1. Client-side confirmation
  if (!confirm("Are you sure you want to permanently delete this book?")) return;

  try {
    const res = await fetch(`/dashboard/my-books/${userId}/${bookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();

    if (result.success) {
      loadMyBooks(); // Instantly refresh the list to reflect deletion
    } else {
      // If the backend blocked it (e.g., currently borrowed), show the backend error message
      alert(result.message || "Failed to delete book.");
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting book.");
  }
}
// ⭐ Read user securely from shared login keys
const userId = localStorage.getItem("userId");
const fullName = localStorage.getItem("fullName");
const username = localStorage.getItem("username");
const email = localStorage.getItem("email");
const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

// redirect if not logged in
if (!userId || !token) {
  window.location.href = "login.html";
}

// Load initial dashboard sections
loadMyBooks();
loadStudentInfo();
loadBorrowedBooks();
loadReservations();
loadSwapRequests();

/* -------------------------------------------
   LOGOUT BUTTONS
-------------------------------------------- */
document.querySelectorAll("#logoutBtn, .logout-button, [data-logout]").forEach(btn => {
  btn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
});

/* -------------------------------------------
   STUDENT INFO (XSS-safe)
-------------------------------------------- */
function loadStudentInfo() {
  const container = document.getElementById("student-details");

  container.innerHTML = `
    <p><strong>Name:</strong> <span id="ui-name"></span></p>
    <p><strong>Username:</strong> <span id="ui-username"></span></p>
    <p><strong>Email:</strong> <span id="ui-email"></span></p>
    <p><strong>Role:</strong> <span id="ui-role"></span></p>
  `;

  document.getElementById("ui-name").textContent = fullName;
  document.getElementById("ui-username").textContent = username;
  document.getElementById("ui-email").textContent = email;
  document.getElementById("ui-role").textContent = role;
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
      const li = document.createElement("li");
      li.textContent = `${book.title} by ${book.author}`;
      list.appendChild(li);
    });

  } catch (err) {
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
      const li = document.createElement("li");
      li.textContent = `${book.title} by ${book.author}`;
      list.appendChild(li);
    });

  } catch (err) {
    list.innerHTML = "<li>Error loading reservations.</li>";
  }
}

/* -------------------------------------------
   SWAP REQUESTS
-------------------------------------------- */
async function loadSwapRequests() {
  const sentList = document.getElementById("swap-sent-list");
  const receivedList = document.getElementById("swap-received-list");

  try {
    const res = await fetch(`/swap/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    if (!result.success) {
      sentList.innerHTML = "<p class='empty-swap-msg'>Error loading swap requests.</p>";
      receivedList.innerHTML = "<p class='empty-swap-msg'>Error loading swap requests.</p>";
      return;
    }

    const { sent, received } = result.data;

    /* ----- SENT REQUESTS ----- */
    sentList.innerHTML = sent.length === 0 ? "<p class='empty-swap-msg'>No sent swap requests.</p>" : "";
    sent.forEach(req => {
      sentList.appendChild(createSwapCard(req, true));
    });

    /* ----- RECEIVED REQUESTS ----- */
    receivedList.innerHTML = received.length === 0 ? "<p class='empty-swap-msg'>No received swap requests.</p>" : "";
    received.forEach(req => {
      receivedList.appendChild(createSwapCard(req, false));
    });

    attachSwapButtons();

  } catch (err) {
    sentList.innerHTML = "<p class='empty-swap-msg'>Error loading swap requests.</p>";
    receivedList.innerHTML = "<p class='empty-swap-msg'>Error loading swap requests.</p>";
  }
}

/* Helper function to generate a swap card element */
function createSwapCard(req, isSent) {
  const li = document.createElement("li");
  li.className = "swap-card";

  const reqLabel = isSent ? "You requested:" : "Requested from you:";
  const offLabel = isSent ? "You offered:" : "They offered:";

  const requestedTitle = req.requestedBookId?.title || "Unknown Book";
  const offeredTitle = req.offeredBookId?.title || "Unknown Book";

  // Book Requested Line
  const p1 = document.createElement("p");
  const strong1 = document.createElement("strong");
  strong1.textContent = `${reqLabel} `;
  p1.appendChild(strong1);
  p1.appendChild(document.createTextNode(requestedTitle));

  // Book Offered Line
  const p2 = document.createElement("p");
  const strong2 = document.createElement("strong");
  strong2.textContent = `${offLabel} `;
  p2.appendChild(strong2);
  p2.appendChild(document.createTextNode(offeredTitle));

  // Status Line
  const p3 = document.createElement("p");
  const strong3 = document.createElement("strong");
  strong3.textContent = "Status: ";
  
  const statusBadge = document.createElement("span");
  statusBadge.className = `swap-status-badge status-${(req.status || "pending").toLowerCase()}`;
  statusBadge.textContent = req.status;

  p3.appendChild(strong3);
  p3.appendChild(statusBadge);

  li.append(p1, p2, p3);

  // Buttons for Pending Status
  if (req.status === "pending") {
    const actions = document.createElement("div");
    actions.className = "swap-actions";

    if (isSent) {
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "cancel-btn";
      cancelBtn.dataset.id = req._id;
      cancelBtn.textContent = "Cancel Request";
      actions.appendChild(cancelBtn);
    } else {
      const acceptBtn = document.createElement("button");
      acceptBtn.className = "accept-btn";
      acceptBtn.dataset.id = req._id;
      acceptBtn.textContent = "Accept";

      const rejectBtn = document.createElement("button");
      rejectBtn.className = "reject-btn";
      rejectBtn.dataset.id = req._id;
      rejectBtn.textContent = "Reject";

      actions.append(acceptBtn, rejectBtn);
    }

    li.appendChild(actions);
  }

  return li;
}

/* -------------------------------------------
   SWAP BUTTON HANDLERS
-------------------------------------------- */
function attachSwapButtons() {
  document.querySelectorAll(".accept-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        const res = await fetch(`/swap/accept/${btn.dataset.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (!result.success) {
          alert(result.message || "Failed to accept swap request.");
        }
      } catch (err) {
        console.error("Error accepting swap:", err);
        alert("Error accepting swap request.");
      } finally {
        // Refresh both swap requests and personal books
        await Promise.all([loadSwapRequests(), loadMyBooks()]);
      }
    });
  });

  document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        const res = await fetch(`/swap/reject/${btn.dataset.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (!result.success) {
          alert(result.message || "Failed to reject swap request.");
        }
      } catch (err) {
        console.error("Error rejecting swap:", err);
        alert("Error rejecting swap request.");
      } finally {
        await Promise.all([loadSwapRequests(), loadMyBooks()]);
      }
    });
  });

  document.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        const res = await fetch(`/swap/cancel/${btn.dataset.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (!result.success) {
          alert(result.message || "Failed to cancel swap request.");
        }
      } catch (err) {
        console.error("Error canceling swap:", err);
        alert("Error canceling swap request.");
      } finally {
        await Promise.all([loadSwapRequests(), loadMyBooks()]);
      }
    });
  });
}

/* -------------------------------------------
   BORROW A BOOK — SHOW LIST
-------------------------------------------- */
document.getElementById("loadBorrowBooksBtn").addEventListener("click", () => {
  document.getElementById("borrow-section").classList.add("active");
  loadBorrowableBooks();
});

async function loadBorrowableBooks() {
  const container = document.getElementById("borrow-books-container");
  container.innerHTML = "Loading...";

  const res = await fetch(`/api/books`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const books = await res.json();
  const available = books.filter(b => b.available && !b.borrowedBy);

  container.innerHTML = "";

  available.forEach(book => {
    const div = document.createElement("div");
    div.className = "book-card";
    div.innerHTML = `
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <button class="borrow-btn" data-id="${book._id}">Borrow</button>
    `;
    container.appendChild(div);
  });

  attachBorrowButtons();
}

function attachBorrowButtons() {
  document.querySelectorAll(".borrow-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const res = await fetch(`/api/books/borrow/${btn.dataset.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();
      alert(result.message);

      loadBorrowedBooks();
    });
  });
}

/* -------------------------------------------
   RESERVE A BOOK — SHOW LIST
-------------------------------------------- */
document.getElementById("loadReservationBooksBtn").addEventListener("click", () => {
  document.getElementById("reserve-section").classList.add("active");
  loadReservableBooks();
});

async function loadReservableBooks() {
  const container = document.getElementById("reserve-books-container");
  container.innerHTML = "Loading...";

  const res = await fetch(`/api/books`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const books = await res.json();
  const reservable = books.filter(b => !b.borrowedBy && !b.reservedBy);

  container.innerHTML = "";

  reservable.forEach(book => {
    const div = document.createElement("div");
    div.className = "book-card";
    div.innerHTML = `
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <button class="reserve-btn" data-id="${book._id}">Reserve</button>
    `;
    container.appendChild(div);
  });

  attachReserveButtons();
}

function attachReserveButtons() {
  document.querySelectorAll(".reserve-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const res = await fetch(`/api/books/reserve/${btn.dataset.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();
      alert(result.message);

      loadReservations();
    });
  });
}

/* -------------------------------------------
   LOAD MY BOOKS (Owned)
-------------------------------------------- */
async function loadMyBooks() {
  const list = document.getElementById("my-books-list");
  if (!list) return;

  try {
    const res = await fetch(`/dashboard/my-books/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    if (!result.success || !result.data || result.data.length === 0) {
      list.innerHTML = "<li>You haven't added any personal books yet.</li>";
      return;
    }

    list.innerHTML = "";
    result.data.forEach(book => {
      const li = document.createElement("li");

      // Left Container: Title + Author + Badge
      const infoSpan = document.createElement("span");

      const strong = document.createElement("strong");
      strong.textContent = book.title;
      infoSpan.appendChild(strong);
      infoSpan.appendChild(document.createTextNode(` by ${book.author} `));

      // Determine ownership & availability flags
      const isUnavailable = Boolean(book.borrowedBy) || Boolean(book.reservedBy) || !book.available;
      const isOriginalOwner = book.isOriginalUploader !== false;
      const isDeletable = !isUnavailable && isOriginalOwner;

      // Status Badge
      const statusBadge = document.createElement("span");
      statusBadge.className = "status-badge";

      if (isUnavailable) {
        statusBadge.classList.add("badge-not-available");
        statusBadge.textContent = "Not Available";
      } else if (!isOriginalOwner) {
        statusBadge.classList.add("badge-swapped");
        statusBadge.textContent = "Not Original Owner";
      } else {
        statusBadge.classList.add("badge-available");
        statusBadge.textContent = "Available";
      }
      infoSpan.appendChild(statusBadge);

      // Right Container: Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";

      if (!isDeletable) {
        deleteBtn.disabled = true;
        deleteBtn.classList.add("disabled-btn");

        if (isUnavailable) {
          deleteBtn.title = "Cannot delete a book that is currently borrowed or reserved.";
        } else if (!isOriginalOwner) {
          deleteBtn.title = "You cannot delete a book acquired through a swap. Only the original uploader can delete it.";
        }
      } else {
        deleteBtn.title = "Delete this personal book";
        deleteBtn.addEventListener("click", () => deleteMyBook(book._id));
      }

      // Append left side and right side to <li>
      li.appendChild(infoSpan);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });

  } catch (err) {
    console.error("Error loading personal books:", err);
    list.innerHTML = "<li>Error loading your books.</li>";
  }
}

/* -------------------------------------------
   ADD BOOK FORM
-------------------------------------------- */
const addBookForm = document.getElementById("dashboardAddBookForm");
if (addBookForm) {
  addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const msg = document.getElementById("addBookMessage");

    const title = document.getElementById("newBookTitle").value.trim();
    const author = document.getElementById("newBookAuthor").value.trim();
    const genre = document.getElementById("newBookGenre").value.trim();

    if (!title || !author) {
      msg.style.color = "red";
      msg.textContent = "Title and Author cannot be empty or just spaces.";
      return;
    }

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
        body: JSON.stringify({ title, author, genre })
      });

      const result = await res.json();

      if (result.success) {
        msg.style.color = "green";
        msg.textContent = "Book added successfully!";
        addBookForm.reset();
        loadMyBooks();
      } else {
        msg.style.color = "red";
        msg.textContent = result.message || "Failed to add book.";
      }

    } catch (err) {
      msg.style.color = "red";
      msg.textContent = "Server error.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Add Book";
    }
  });
}

/* -------------------------------------------
   DELETE BOOK
-------------------------------------------- */
async function deleteMyBook(bookId) {
  if (!confirm("Are you sure you want to permanently delete this book?")) return;

  try {
    const res = await fetch(`/dashboard/my-books/${userId}/${bookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    if (result.success) {
      loadMyBooks();
    } else {
      alert(result.message || "Failed to delete book.");
    }

  } catch (err) {
    alert("Error deleting book.");
  }
}
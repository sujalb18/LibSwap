// ⭐ Read user from localStorage (set during login)
const demoUser = JSON.parse(localStorage.getItem("movieflixUser"));
const token = localStorage.getItem("movieflixToken");
const userId = demoUser.id;

// ⭐ Load initial sections
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
   BORROWED BOOKS (Backend)
-------------------------------------------- */
async function loadBorrowedBooks() {
  const list = document.getElementById("borrowed-list");

  try {
    // ⭐ FIXED: Correct endpoint for borrowed books
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
   LOAD AVAILABLE BOOKS FOR BORROW (Backend)
-------------------------------------------- */
async function loadAvailableBooksForBorrow() {
  const container = document.getElementById("borrowBooksContainer");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(`/api/books/all`);
    const result = await res.json();

    const books = result.data.filter(b => b.available === true);
    container.innerHTML = "";

    books.forEach(book => {
      const div = document.createElement("div");
      div.className = "book-card";

      div.innerHTML = `
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <button>Select</button>
      `;

      div.querySelector("button").addEventListener("click", async () => {

        // ⭐ Backend borrow request
        const borrowRes = await fetch(`/borrow/${userId}/${book._id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });

        const borrowResult = await borrowRes.json();

        if (borrowResult.success) {
          div.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p style="color: green; font-weight: bold;">✔ Book Borrowed</p>
          `;
          div.style.pointerEvents = "none";
          loadBorrowedBooks();
        }
      });

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    container.textContent = "Error loading books.";
  }
}

/* -------------------------------------------
   RESERVATION BOOKS (Backend)
-------------------------------------------- */
function loadReservationBooks() {
  const container = document.getElementById("reservationBooksContainer");
  container.innerHTML = "Loading...";

  fetch(`/api/books/all`)
    .then(res => res.json())
    .then(result => {
      const books = result.data;
      container.innerHTML = "";

      books.forEach(book => {
        const div = document.createElement("div");
        div.className = "book-card";

        div.innerHTML = `
          <h3>${book.title}</h3>
          <p>Author: ${book.author}</p>
          <button class="reserve-btn">Reserve</button>
        `;

        div.querySelector(".reserve-btn").addEventListener("click", async () => {

          const reserveRes = await fetch(`/reserve/${userId}/${book._id}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          });

          const reserveResult = await reserveRes.json();

          if (reserveResult.success) {
            div.innerHTML = `
              <h3>${book.title}</h3>
              <p>Author: ${book.author}</p>
              <p style="color: orange; font-weight: bold;">✔ Book Reserved</p>
            `;
            div.style.pointerEvents = "none";
            loadReservations();
          }
        });

        container.appendChild(div);
      });
    });
}

/* -------------------------------------------
   RESERVATION LIST (Backend)
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
   SWAP REQUESTS (Backend)
-------------------------------------------- */
function loadSwapRequestBooks() {
  const container = document.getElementById("swapRequestBooksContainer");
  container.innerHTML = "Loading...";

  fetch(`/api/books/all`)
    .then(res => res.json())
    .then(result => {
      const books = result.data;
      container.innerHTML = "";

      books.forEach(book => {
        const div = document.createElement("div");
        div.className = "book-card";

        div.innerHTML = `
          <h3>${book.title}</h3>
          <p>Author: ${book.author}</p>
          <button class="swap-btn">Request Swap</button>
        `;

        div.querySelector(".swap-btn").addEventListener("click", async () => {

          const swapRes = await fetch(`/swap/request`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              requesterId: userId,
              requestedBookId: book._id
            })
          });

          const swapResult = await swapRes.json();

          if (swapResult.success) {
            div.innerHTML = `
              <h3>${book.title}</h3>
              <p>Author: ${book.author}</p>
              <p style="color: blue; font-weight: bold;">✔ Swap Requested</p>
            `;
            div.style.pointerEvents = "none";
            loadSwapRequests();
          }
        });

        container.appendChild(div);
      });
    });
}

async function loadSwapRequests() {
  const list = document.getElementById("swap-list");

  try {
    const res = await fetch(`/dashboard/swap-sent/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    if (!result.success || result.data.length === 0) {
      list.innerHTML = "<li>No swap requests yet.</li>";
      return;
    }

    list.innerHTML = "";
    result.data.forEach(req => {
      list.innerHTML += `<li>Swap requested for: ${req.requestedBookId.title}</li>`;
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>Error loading swap requests.</li>";
  }
}

/* -------------------------------------------
   EVENT LISTENERS
-------------------------------------------- */
document.getElementById("loadBorrowBooksBtn")
  .addEventListener("click", loadAvailableBooksForBorrow);

document.getElementById("loadReservationBooksBtn")
  .addEventListener("click", loadReservationBooks);

// ⭐ This button exists only in swap.html
const swapBtn = document.getElementById("loadSwapRequestBooksBtn");
if (swapBtn) {
  swapBtn.addEventListener("click", loadSwapRequestBooks);
}

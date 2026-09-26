// read user securely from localStorage
const userString = localStorage.getItem("user");
const token = localStorage.getItem("token");

// redirect if not logged in, change to landing page/or start page
if (!userString || !token) {
  window.location.href = "login.html";
}

// parse the user object safely
const currentUser = JSON.parse(userString);
const userId = currentUser.id; 

// load initial sections
loadStudentInfo();
loadBorrowedBooks();
loadReservations();
loadSwapRequests();

/* -------------------------------------------
   STUDENT INFO (Secured against XSS)
-------------------------------------------- */
function loadStudentInfo() {
  const container = document.getElementById("student-details");
  
  // Build the HTML structure safely (NO user variables here)
  container.innerHTML = `
    <p><strong>Name:</strong> <span id="ui-name"></span></p>
    <p><strong>Username:</strong> <span id="ui-username"></span></p>
    <p><strong>Email:</strong> <span id="ui-email"></span></p>
    <p><strong>Role:</strong> <span id="ui-role"></span></p>
  `;

  // Inject the data using textContent to prevent script execution
  document.getElementById("ui-name").textContent = currentUser.fullName;
  document.getElementById("ui-username").textContent = currentUser.username;
  document.getElementById("ui-email").textContent = currentUser.email;
  document.getElementById("ui-role").textContent = currentUser.role;
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
    // changed route to /swap/all (removed ${userId} parameter)
    const res = await fetch(`/swap/all`, {
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

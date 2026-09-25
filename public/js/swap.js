// ⭐ Read user from localStorage (same as dashboard)
const demoUser = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
const userId = demoUser._id;

// Redirect if not logged in
if (!demoUser || !token) {
  window.location.href = "login.html";
}

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

let selectedBookId = null;
let selectedMyBookId = null;
let selectedBookOwnerId = null;   // ⭐ FIXED

// Load available books
loadAvailableBooks();

// Load my books
loadMyBooks();

// ---------- Load Available Books ----------
async function loadAvailableBooks() {
  const container = document.getElementById("availableBooks");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(`/api/books/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    // ⭐ FIXED ownerId comparison
    const books = result.data.filter(b => b.ownerId.toString() !== userId);

    container.innerHTML = "";

    books.forEach(book => {
      const div = document.createElement("div");
      div.className = "book-card";
      div.innerHTML = `
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <button>Select</button>
      `;

      div.querySelector("button").addEventListener("click", () => {
        selectedBookId = book._id;
        selectedBookOwnerId = book.ownerId;   // ⭐ FIXED
        highlightSelection(container, div);
        enableSendButton();
      });

      container.appendChild(div);
    });

  } catch (err) {
    container.textContent = "Error loading books.";
  }
}

// ---------- Load My Books ----------
async function loadMyBooks() {
  const container = document.getElementById("myBooks");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(`/dashboard/my-books/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();
    const books = result.data;

    container.innerHTML = "";

    books.forEach(book => {
      const div = document.createElement("div");
      div.className = "book-card";
      div.innerHTML = `
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <button>Select</button>
      `;

      div.querySelector("button").addEventListener("click", () => {
        selectedMyBookId = book._id;
        highlightSelection(container, div);
        enableSendButton();
      });

      container.appendChild(div);
    });

  } catch (err) {
    container.textContent = "Error loading your books.";
  }
}

// ---------- Highlight Selected Card ----------
function highlightSelection(container, selectedDiv) {
  [...container.children].forEach(div => div.classList.remove("selected"));
  selectedDiv.classList.add("selected");
}

// ---------- Enable Send Button ----------
function enableSendButton() {
  const btn = document.getElementById("sendRequestBtn");
  btn.disabled = !(selectedBookId && selectedMyBookId);
}

// ---------- Send Swap Request ----------
document.getElementById("sendRequestBtn").addEventListener("click", async () => {
  const statusMsg = document.getElementById("statusMsg");

  try {
    const res = await fetch(`/api/swap/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        requesterId: userId,
        requestedBookId: selectedBookId,
        offeredBookId: selectedMyBookId,
        ownerId: selectedBookOwnerId   // ⭐ FIXED
      })
    });

    const result = await res.json();

    if (!result.success) {
      statusMsg.textContent = result.message;
      return;
    }

    statusMsg.textContent = "Swap request sent successfully!";
    statusMsg.style.color = "green";

  } catch (err) {
    statusMsg.textContent = "Error sending request.";
  }
});

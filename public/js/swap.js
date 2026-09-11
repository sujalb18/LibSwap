const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

// if (!userId || !token) {
//   window.location.href = "login.html";
// }

// document.getElementById("backBtn").addEventListener("click", () => {
//   window.location.href = "dashboard.html";
// });

let selectedBookId = null;
let selectedMyBookId = null;

// Load available books (books from other users)
loadAvailableBooks();

// Load my books (books owned by logged-in user)
loadMyBooks();

// ---------- Load Available Books ----------
async function loadAvailableBooks() {
  const container = document.getElementById("availableBooks");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(`/books/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    if (!result.success) {
      container.textContent = result.message;
      return;
    }

    const books = result.data.filter(b => b.ownerId !== userId);

    if (books.length === 0) {
      container.textContent = "No books available.";
      return;
    }

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

    if (!result.success) {
      container.textContent = result.message;
      return;
    }

    const books = result.data;

    if (books.length === 0) {
      container.textContent = "You have no books.";
      return;
    }

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

  if (!selectedBookId || !selectedMyBookId) {
    statusMsg.textContent = "Select both books first.";
    return;
  }

  try {
    const res = await fetch(`/swap/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        requesterId: userId,
        bookId: selectedBookId,
        offeredBookId: selectedMyBookId
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

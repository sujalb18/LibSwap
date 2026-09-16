// Get user info from localStorage (set during login)
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");
const fullName = localStorage.getItem("fullName");

// If not logged in, redirect to login
// if (!userId || !token) {
//   window.location.href = "login.html";
// }

// Show welcome text
const welcomeText = document.getElementById("welcomeText");
if (welcomeText && fullName) {
  welcomeText.textContent = `Welcome, ${fullName}`;
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// Load all dashboard data on page load
loadMyBooks();
loadSwapReceived();
loadSwapSent();

// ---------- My Books ----------
async function loadMyBooks() {
  const container = document.getElementById("myBooks");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(
      `http://localhost:5000/dashboard/my-books/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      container.textContent = data.message || "Failed to load books";
      return;
    }

    if (!data.books || data.books.length === 0) {
      container.textContent = "No books found.";
      return;
    }

    container.innerHTML = "";

    data.books.forEach(book => {
      const div = document.createElement("div");
      div.className = "book-card";
      div.innerHTML = `
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <p>Genre: ${book.genre || "N/A"}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading books:", err);
    container.textContent = "Error loading books.";
  }
}

// ---------- Swap Requests Received ----------
async function loadSwapReceived() {
  const container = document.getElementById("swapReceived");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(
      `http://localhost:5000/dashboard/swap-received/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      container.textContent = data.message || "Failed to load received swaps";
      return;
    }

    if (!data.requests || data.requests.length === 0) {
      container.textContent = "No swap requests received.";
      return;
    }

    container.innerHTML = "";

    data.requests.forEach(req => {
      const div = document.createElement("div");
      div.className = "swap-card";
      div.innerHTML = `
        <p><strong>From:</strong> ${req.fromUserName}</p>
        <p><strong>Book:</strong> ${req.bookTitle}</p>
        <p><strong>Status:</strong> ${req.status}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading received swaps:", err);
    container.textContent = "Error loading received swaps.";
  }
}

// ---------- Swap Requests Sent ----------
async function loadSwapSent() {
  const container = document.getElementById("swapSent");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(
      `http://localhost:5000/dashboard/swap-sent/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      container.textContent = data.message || "Failed to load sent swaps";
      return;
    }

    if (!data.requests || data.requests.length === 0) {
      container.textContent = "No swap requests sent.";
      return;
    }

    container.innerHTML = "";

    data.requests.forEach(req => {
      const div = document.createElement("div");
      div.className = "swap-card";
      div.innerHTML = `
        <p><strong>To:</strong> ${req.toUserName}</p>
        <p><strong>Book:</strong> ${req.bookTitle}</p>
        <p><strong>Status:</strong> ${req.status}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading sent swaps:", err);
    container.textContent = "Error loading sent swaps.";
  }
}

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

if (!userId || !token) {
  window.location.href = "login.html";
}

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

loadIncomingRequests();

async function loadIncomingRequests() {
  const container = document.getElementById("incomingContainer");
  const statusMsg = document.getElementById("statusMsg");
  container.innerHTML = "Loading requests...";

  try {
    const res = await fetch(`/swap/incoming/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    if (!result.success) {
      statusMsg.textContent = result.message;
      return;
    }

    const requests = result.data;

    if (requests.length === 0) {
      container.innerHTML = "<p>No incoming requests for your books.</p>";
      return;
    }

    container.innerHTML = "";

    requests.forEach(req => {
      const card = document.createElement("div");
      card.className = `request-card ${req.status}`;

      const requestedBook = req.bookId ? `${req.bookId.title} by ${req.bookId.author}` : "Unknown Book";
      const requesterName = req.requesterId ? (req.requesterId.name || req.requesterId.email) : "Another Student";

      card.innerHTML = `
        <h3>Request from ${requesterName}</h3>
        <p><strong>Book Requested:</strong> ${requestedBook}</p>
        <p><strong>Status:</strong> <span class="badge ${req.status}">${req.status.toUpperCase()}</span></p>
        ${
          req.status === "pending"
            ? `
              <div class="action-btns">
                <button class="btn success" onclick="respondRequest('${req._id}', 'accepted')">Accept & Transfer Ownership</button>
                <button class="btn cancel" onclick="respondRequest('${req._id}', 'rejected')">Reject</button>
              </div>
            `
            : ""
        }
      `;

      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = "Error loading incoming requests.";
  }
}

async function respondRequest(requestId, status) {
  const statusMsg = document.getElementById("statusMsg");

  try {
    // Note the updated path: /swap/incoming/respond/${requestId}
    const res = await fetch(`/swap/incoming/respond/${requestId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const result = await res.json();

    if (!result.success) {
      statusMsg.textContent = result.message;
      return;
    }

    statusMsg.textContent = `Request ${status} successfully!`;
    statusMsg.style.color = status === "accepted" ? "green" : "red";

    loadIncomingRequests();
  } catch (err) {
    statusMsg.textContent = "Error updating request.";
  }
}
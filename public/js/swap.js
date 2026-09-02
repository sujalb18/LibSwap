// Dummy values (replace with actual values from your backend)
const bookId = "BOOK_ID_HERE";
const ownerId = "OWNER_ID_HERE";
const requesterId = "REQUESTER_ID_HERE"; // logged-in user ID

// Elements
const swapBtn = document.getElementById("swapBtn");
const swapModal = document.getElementById("swapModal");
const closeModal = document.getElementById("closeModal");
const sendSwap = document.getElementById("sendSwap");
const swapMessage = document.getElementById("swapMessage");

// Open modal
swapBtn.onclick = () => {
  swapModal.style.display = "block";
};

// Close modal
closeModal.onclick = () => {
  swapModal.style.display = "none";
};

// Send swap request
sendSwap.onclick = async () => {
  const payload = {
    bookId,
    ownerId,
    requesterId,
    message: swapMessage.value
  };

  try {
    const res = await fetch("http://localhost:5000/swap/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      alert("Swap request sent successfully");
      swapModal.style.display = "none";
      swapMessage.value = "";
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

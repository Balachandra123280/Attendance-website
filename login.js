// ========== Client Login Script ==========

// Hardcoded client credentials (You can extend or move this to a backend in production)
const clientCredentials = {
  client1: { password: "pass123", hub: "HUB 1", checkpost: "Checkpost A" },
  client2: { password: "client456", hub: "HUB 2", checkpost: "Checkpost B" },
};

// Main login function
function loginClient() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const msgBox = document.getElementById("loginMsg");

  const username = usernameInput?.value.trim().toLowerCase(); // Normalize
  const password = passwordInput?.value.trim();

  // Clear previous messages
  msgBox.innerText = "";
  msgBox.className = "";

  // Validate presence of input fields
  if (!username || !password) {
    showLoginMessage("⚠️ Please enter both username and password.", "warning");
    return;
  }

  // Check credentials
  const user = clientCredentials[username];
  if (user && user.password === password) {
    // Store session info in localStorage
    localStorage.setItem("loggedInClient", username);
    localStorage.setItem("hub", user.hub);
    localStorage.setItem("checkpost", user.checkpost);

    showLoginMessage("✅ Login successful! Redirecting...", "success");

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = "employee.html";
    }, 1000);
  } else {
    showLoginMessage("❌ Invalid username or password.", "error");
  }
}

// Utility to display styled login messages
function showLoginMessage(message, type = "info") {
  const msgBox = document.getElementById("loginMsg");
  msgBox.innerText = message;

  // Remove previous type classes
  msgBox.className = "login-msg";

  // Add new style based on type
  switch (type) {
    case "success":
      msgBox.classList.add("login-success");
      break;
    case "error":
      msgBox.classList.add("login-error");
      break;
    case "warning":
      msgBox.classList.add("login-warning");
      break;
    default:
      msgBox.classList.add("login-info");
  }
}

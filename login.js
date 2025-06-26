// ========== Client Login Script ==========

// Hardcoded client credentials (You can move this to backend/API in production)
const clientCredentials = {
  client1: { password: "pass123", hub: "HUB 1", checkpost: "Checkpost A" },
  client2: { password: "client456", hub: "HUB 2", checkpost: "Checkpost B" },
};

// Main login function
function loginClient() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const msgBox = document.getElementById("loginMsg");

  if (!usernameInput || !passwordInput || !msgBox) return;

  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  // Clear previous message and class
  msgBox.innerText = "";
  msgBox.className = "login-msg";

  if (!username || !password) {
    showLoginMessage("⚠️ Please enter both username and password.", "warning");
    return;
  }

  const user = clientCredentials[username];

  if (user && user.password === password) {
    localStorage.setItem("loggedInClient", username);
    localStorage.setItem("hub", user.hub);
    localStorage.setItem("checkpost", user.checkpost);

    showLoginMessage("✅ Login successful! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "employee.html";
    }, 1000);
  } else {
    showLoginMessage("❌ Invalid username or password.", "error");
  }
}

// Utility to show styled login messages
function showLoginMessage(message, type = "info") {
  const msgBox = document.getElementById("loginMsg");
  if (!msgBox) return;

  msgBox.innerText = message;
  msgBox.className = "login-msg";

  const typeClasses = {
    success: "login-success",
    error: "login-error",
    warning: "login-warning",
    info: "login-info"
  };

  msgBox.classList.add(typeClasses[type] || "login-info");
}


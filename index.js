const roleButtons = document.querySelectorAll(".role-option");
const loginForm = document.getElementById("loginForm");
const loginInput = document.getElementById("loginInput");
const passwordInput = document.getElementById("passwordInput");
const nameField = document.getElementById("nameField");
const nameInput = document.getElementById("nameInput");
const rememberMe = document.getElementById("rememberMe");
const loginHint = document.getElementById("loginHint");
const splashScreen = document.getElementById("splashScreen");
const loginShell = document.querySelector(".login-shell");

let currentRole = "resident";
const rememberKey = "securegate-login-memory";

const defaultPasswords = {
  resident: "1234",
  guard: "guard123",
  secretary: "sec123"
};

function setRole(role) {
  currentRole = role;

  roleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.role === role);
  });

  if (role === "resident") {
    loginInput.value = "A-302";
    passwordInput.value = defaultPasswords.resident;
    nameField.classList.remove("hidden");
    nameInput.value = "Ananya Patel";
    loginHint.textContent = "Resident example: ID A-302, password 1234";
  } else if (role === "guard") {
    loginInput.value = "Main Gate";
    passwordInput.value = defaultPasswords.guard;
    nameField.classList.add("hidden");
    loginHint.textContent = "Guard example: ID Main Gate, password guard123";
  } else {
    loginInput.value = "Office";
    passwordInput.value = defaultPasswords.secretary;
    nameField.classList.add("hidden");
    loginHint.textContent = "Secretary example: ID Office, password sec123";
  }
}

function saveRememberedLogin() {
  const payload = {
    role: currentRole,
    loginId: loginInput.value.trim(),
    password: passwordInput.value,
    name: nameInput.value.trim(),
    remember: rememberMe.checked
  };

  if (rememberMe.checked) {
    localStorage.setItem(rememberKey, JSON.stringify(payload));
  } else {
    localStorage.removeItem(rememberKey);
  }
}

function loadRememberedLogin() {
  try {
    const raw = localStorage.getItem(rememberKey);
    if (!raw) {
      setRole("resident");
      return;
    }

    const saved = JSON.parse(raw);
    setRole(saved.role || "resident");
    loginInput.value = saved.loginId || loginInput.value;
    passwordInput.value = saved.password || passwordInput.value;
    nameInput.value = saved.name || nameInput.value;
    rememberMe.checked = Boolean(saved.remember);
  } catch (_error) {
    setRole("resident");
  }
}

roleButtons.forEach((button) => {
  button.addEventListener("click", () => setRole(button.dataset.role));
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveRememberedLogin();

  if (currentRole === "guard") {
    window.location.href = "guard.html";
  } else if (currentRole === "secretary") {
    window.location.href = "secretary.html";
  } else {
    const flat = encodeURIComponent(loginInput.value.trim() || "A-302");
    const name = encodeURIComponent(nameInput.value.trim() || "Resident");
    window.location.href = `resident.html?flat=${flat}&name=${name}`;
  }
});

function runSplashAnimation() {
  document.body.classList.add("splash-active");
  loginShell.classList.add("is-hidden");

  window.setTimeout(() => {
    splashScreen.classList.add("is-hidden");
    loginShell.classList.remove("is-hidden");
    document.body.classList.remove("splash-active");
  }, 1800);
}

loadRememberedLogin();
runSplashAnimation();

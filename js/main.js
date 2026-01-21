"use strict";

/* ===== Helpers ===== */
function qs(sel) {
  return document.querySelector(sel);
}
function qsa(sel) {
  return document.querySelectorAll(sel);
}

/* ===== Year ===== */
qs("#year").textContent = new Date().getFullYear();

/* ===== Cookies banner (localStorage) ===== */
const cookieBanner = qs("#cookieBanner");
const cookieAccept = qs("#cookieAccept");

(function initCookies() {
  const accepted = localStorage.getItem("cookiesAccepted");
  if (accepted !== "true") {
    cookieBanner.classList.add("show");
  }
})();

cookieAccept.addEventListener("click", function () {
  localStorage.setItem("cookiesAccepted", "true");
  cookieBanner.classList.remove("show");
});

/* ===== Burger menu ===== */
const burgerBtn = qs("#burgerBtn");
const mobileMenu = qs("#mobileMenu");

function closeMenu() {
  mobileMenu.classList.remove("open");
  burgerBtn.setAttribute("aria-expanded", "false");
}

burgerBtn.addEventListener("click", function () {
  const isOpen = mobileMenu.classList.toggle("open");
  burgerBtn.setAttribute("aria-expanded", String(isOpen));
});

/* Close menu on mobile link click */
qsa(".mobile-link").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

/* ===== Header background on scroll (extra JS logic) + Scroll-to-top ===== */
const header = qs("#siteHeader");
const scrollTopBtn = qs("#scrollTopBtn");

window.addEventListener("scroll", function () {
  const y = window.scrollY;

  // header bg change on scroll
  if (y > 50) header.classList.add("scrolled");
  else header.classList.remove("scrolled");

  // scroll to top button show/hide
  if (y > 300) scrollTopBtn.classList.add("show");
  else scrollTopBtn.classList.remove("show");
});

scrollTopBtn.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ===== Fetch GET (async/await) ===== */
const loadPostsBtn = qs("#loadPosts");
const postsGrid = qs("#postsGrid");
const apiStatus = qs("#apiStatus");

function renderPostCard(post) {
  return `
    <article class="card">
      <h3 class="card-title">${escapeHtml(post.title)}</h3>
      <p class="card-text">${escapeHtml(post.body)}</p>
      <span class="muted">Post ID: ${post.id}</span>
    </article>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadPostsBtn.addEventListener("click", async function () {
  apiStatus.textContent = "Loading...";
  postsGrid.innerHTML = "";

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=6");
    if (!res.ok) throw new Error("Request failed");
    const data = await res.json();

    apiStatus.textContent = "Loaded successfully.";
    postsGrid.innerHTML = data.map(renderPostCard).join("");
  } catch (err) {
    apiStatus.textContent = "Error: could not load data.";
  }
});

/* ===== Form validation (required + regex + show/hide password) ===== */
const form = qs("#registerForm");
const fullName = qs("#fullName");
const email = qs("#email");
const password = qs("#password");
const confirmPassword = qs("#confirmPassword");
const terms = qs("#terms");
const result = qs("#formResult");

const togglePassBtn = qs("#togglePass");

togglePassBtn.addEventListener("click", function () {
  const isPassword = password.type === "password";
  password.type = isPassword ? "text" : "password";
  togglePassBtn.textContent = isPassword ? "Hide" : "Show";
});

/* Regex rules */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// მინ 8, მინ 1 დიდი ასო, მინ 1 ციფრი
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

function setError(fieldName, msg) {
  const el = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (el) el.textContent = msg;
}

function setInputError(inputEl, hasError) {
  if (!inputEl) return;
  if (hasError) inputEl.classList.add("input-error");
  else inputEl.classList.remove("input-error");
}

function clearErrors() {
  qsa(".error").forEach((e) => (e.textContent = ""));
  setInputError(fullName, false);
  setInputError(email, false);
  setInputError(password, false);
  setInputError(confirmPassword, false);
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();
  result.textContent = "";

  let ok = true;

  // required full name
  if (fullName.value.trim().length < 2) {
    ok = false;
    setError("fullName", "Full name is required (min 2 chars).");
    setInputError(fullName, true);
  }

  // required email + regex
  if (!emailRegex.test(email.value.trim())) {
    ok = false;
    setError("email", "Enter a valid email address.");
    setInputError(email, true);
  }

  // password regex
  if (!passwordRegex.test(password.value)) {
    ok = false;
    setError("password", "Password must be 8+ chars, 1 uppercase, 1 number.");
    setInputError(password, true);
  }

  // confirm password match
  if (confirmPassword.value !== password.value || confirmPassword.value === "") {
    ok = false;
    setError("confirmPassword", "Passwords do not match.");
    setInputError(confirmPassword, true);
  }

  // terms checkbox
  if (!terms.checked) {
    ok = false;
    setError("terms", "You must agree to the terms.");
  }

  if (ok) {
    result.textContent = "✅ Form submitted successfully (demo).";
    form.reset();
    togglePassBtn.textContent = "Show";
    password.type = "password";
  } else {
    result.textContent = "❌ Please fix the errors above.";
  }
});

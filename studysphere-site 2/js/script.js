// ===================== StudySphere — main script =====================

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------------------------------------------------------------
   Supabase client
--------------------------------------------------------------------- */
const supabaseConfigured =
  STUDYSPHERE_CONFIG.SUPABASE_URL &&
  !STUDYSPHERE_CONFIG.SUPABASE_URL.includes("YOUR_") &&
  STUDYSPHERE_CONFIG.SUPABASE_ANON_KEY &&
  !STUDYSPHERE_CONFIG.SUPABASE_ANON_KEY.includes("YOUR_");

const sb = supabaseConfigured
  ? window.supabase.createClient(STUDYSPHERE_CONFIG.SUPABASE_URL, STUDYSPHERE_CONFIG.SUPABASE_ANON_KEY)
  : null;

if (!supabaseConfigured) {
  console.warn(
    "StudySphere: Supabase isn't configured yet. Edit js/supabase-config.js with your project URL and anon key. See SETUP.md."
  );
}

/* ---------------------------------------------------------------------
   Toasts
--------------------------------------------------------------------- */
function toast(message, type = "ok") {
  const c = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `toast glass-strong ${type}`;
  el.textContent = message;
  c.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

/* ---------------------------------------------------------------------
   Navigation / mobile menu
--------------------------------------------------------------------- */
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const iconMenu = document.getElementById("iconMenu");
const iconClose = document.getElementById("iconClose");

menuToggle.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("hidden") === false;
  iconMenu.classList.toggle("hidden", open);
  iconClose.classList.toggle("hidden", !open);
});

document.querySelectorAll("[data-nav]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.querySelector(btn.getAttribute("data-nav"));
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    mobileMenu.classList.add("hidden");
    iconMenu.classList.remove("hidden");
    iconClose.classList.add("hidden");
  });
});

document.querySelectorAll("[data-auth]").forEach((btn) => {
  btn.addEventListener("click", () => setAuthMode(btn.getAttribute("data-auth")));
});

/* ---------------------------------------------------------------------
   Render: Features, Tools, Pricing, Testimonials
--------------------------------------------------------------------- */
const ICONS = {
  cap: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/></svg>',
  brain: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.5"/><path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.5"/></svg>',
  calc: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="8" y2="11"/><line x1="12" y1="11" x2="12" y2="11"/><line x1="16" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="8" y2="15"/><line x1="12" y1="15" x2="12" y2="15"/><line x1="16" y1="15" x2="16" y2="19"/><line x1="8" y1="19" x2="8" y2="19"/><line x1="12" y1="19" x2="12" y2="19"/></svg>',
  layers: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  folder: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
  quiz: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>',
  trend: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  file: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  list: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3" y2="6"/><line x1="3" y1="12" x2="3" y2="12"/><line x1="3" y1="18" x2="3" y2="18"/></svg>',
  calendar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  bulb: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7c.5.4.8 1 .8 1.7v.6h6.4v-.6c0-.7.3-1.3.8-1.7A7 7 0 0012 2z"/></svg>',
  pen: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
  flask: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v6L3 19a2 2 0 002 3h14a2 2 0 002-3l-6-11V2"/><path d="M9 2h6"/></svg>',
  book: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
  star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>',
};

const FEATURES = [
  { icon: "cap", title: "SVG Tutor", desc: "A personal lion AI tutor that answers questions, explains lessons, solves equations step by step, summarizes notes, creates quizzes, and helps students study anytime." },
  { icon: "brain", title: "AI Study Assistant", desc: "Smart support for understanding difficult topics, reviewing lessons, and staying on track." },
  { icon: "calc", title: "Math Problem Solver", desc: "Step-by-step help for algebra, geometry, calculus, formulas, and equations." },
  { icon: "layers", title: "Flashcards", desc: "Create and review flashcards to memorize important terms, facts, and concepts." },
  { icon: "folder", title: "Notes Organizer", desc: "Keep class notes, summaries, subjects, and study materials organized in one place." },
  { icon: "quiz", title: "Quiz Generator", desc: "Turn notes and lessons into practice quizzes for better exam preparation." },
  { icon: "trend", title: "Progress Tracking", desc: "Track study streaks, completed topics, quiz performance, and academic growth." },
  { icon: "file", title: "Smart Summaries", desc: "Convert long chapters or notes into clear, simple summaries." },
];

const TOOLS = [
  { icon: "calc", name: "Equation Helper", tag: "Math" },
  { icon: "folder", name: "Subject Folders", tag: "Organize" },
  { icon: "file", name: "Smart Summaries", tag: "AI" },
  { icon: "list", name: "Practice Tests", tag: "Exam" },
  { icon: "layers", name: "Flashcard Builder", tag: "Memory" },
  { icon: "calendar", name: "Study Planner", tag: "Schedule" },
  { icon: "bulb", name: "Homework Helper", tag: "Help" },
  { icon: "pen", name: "Essay Outline Assistant", tag: "Writing" },
  { icon: "flask", name: "Science Concept Explainer", tag: "Science" },
  { icon: "book", name: "Reading Comprehension", tag: "Reading" },
];

const PLANS = [
  { id: "free", name: "Free", price: "$0", period: "forever", features: ["Basic notes organization", "Limited flashcards", "Limited SVG Tutor questions", "Basic study tools"], cta: "Start Free", featured: false },
  { id: "pro", name: "Student Pro", price: "$9", period: "/month", features: ["Unlimited flashcards", "More SVG Tutor questions", "Quiz generation", "Smart summaries", "Progress tracking"], cta: "Go Pro", featured: true },
  { id: "scholar", name: "Premium Scholar", price: "$19", period: "/month", features: ["Unlimited SVG Tutor access", "Advanced math solving", "Full study dashboard", "Practice exams", "Priority support", "All premium tools"], cta: "Become Scholar", featured: false },
];

const TESTIMONIALS = [
  { name: "Amara K.", role: "High School Senior", quote: "StudySphere helped me understand math instead of just memorizing it. The step-by-step solutions actually click." },
  { name: "Daniel R.", role: "Pre-Med Student", quote: "SVG Tutor feels like having a study coach available anytime. It's changed how I prep for exams." },
  { name: "Priya S.", role: "Engineering Major", quote: "The quizzes and flashcards made exam prep so much easier. My grades jumped two letter grades this semester." },
];

document.getElementById("featuresGrid").innerHTML = FEATURES.map(
  (f) => `
  <div class="feature-card glass">
    <div class="feature-icon">${ICONS[f.icon]}</div>
    <h3>${f.title}</h3>
    <p>${f.desc}</p>
  </div>`
).join("");

document.getElementById("toolsGrid").innerHTML = TOOLS.map(
  (t) => `
  <button class="tool-item glass">
    <span class="tool-icon">${ICONS[t.icon]}</span>
    <span>
      <span class="t-name" style="display:block;">${t.name}</span>
      <span class="t-tag">${t.tag}</span>
    </span>
  </button>`
).join("");

document.getElementById("pricingGrid").innerHTML = PLANS.map(
  (p) => `
  <div class="plan-card glass ${p.featured ? "featured gold-border" : ""}">
    ${p.featured ? '<div class="plan-badge">Most Popular</div>' : ""}
    <h3 class="${p.featured ? "gold-text" : ""}">${p.name}</h3>
    <div class="plan-price"><span class="amt">${p.price}</span><span class="per">${p.period}</span></div>
    <ul class="plan-features">
      ${p.features.map((f) => `<li><span class="check">${ICONS.check}</span>${f}</li>`).join("")}
    </ul>
    <button class="plan-cta ${p.featured ? "primary" : "secondary"}" data-plan="${p.id}">${p.cta}</button>
  </div>`
).join("");

document.getElementById("testimonialGrid").innerHTML = TESTIMONIALS.map(
  (t) => `
  <div class="testimonial-card glass">
    <div class="stars">${ICONS.star.repeat(5)}</div>
    <p class="quote">"${t.quote}"</p>
    <div class="testimonial-author">
      <div class="testimonial-avatar">${t.name[0]}</div>
      <div>
        <div class="t-name">${t.name}</div>
        <div class="t-role">${t.role}</div>
      </div>
    </div>
  </div>`
).join("");

// Pricing CTA buttons: take the user to sign up with the chosen plan remembered.
document.querySelectorAll("[data-plan]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const planId = btn.getAttribute("data-plan");
    window.__selectedPlan = planId;
    if (planId === "free") {
      setAuthMode("signup");
    } else {
      setAuthMode("signup");
      toast(`Great choice! Create your account to start your ${btn.closest(".plan-card").querySelector("h3").textContent} plan.`, "ok");
    }
    document.querySelector("#auth").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ---------------------------------------------------------------------
   AI Tutor chat
--------------------------------------------------------------------- */
const chatBody = document.getElementById("chatBody");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatNote = document.getElementById("chatNote");

let chatHistory = [
  { role: "assistant", text: "Hello — I'm SVG, your personal lion tutor. What are we mastering today?" },
];

const aiConfigured =
  STUDYSPHERE_CONFIG.AI_CHAT_ENDPOINT && !STUDYSPHERE_CONFIG.AI_CHAT_ENDPOINT.includes("YOUR_");

chatNote.textContent = aiConfigured
  ? ""
  : "Demo mode — connect the AI Chat Edge Function (see SETUP.md) for real SVG Tutor responses.";

function renderChat() {
  chatBody.innerHTML = chatHistory
    .map((m) => {
      if (m.role === "user") {
        return `
        <div class="msg user">
          <div class="msg-avatar user-av">YOU</div>
          <div class="msg-bubble">${escapeHtml(m.text)}</div>
        </div>`;
      }
      return `
      <div class="msg tutor">
        <div class="msg-avatar"><img src="assets/svg-tutor.png" alt=""></div>
        <div class="msg-bubble glass">${escapeHtml(m.text)}</div>
      </div>`;
    })
    .join("");
  chatBody.scrollTop = chatBody.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function setTyping(on) {
  let el = document.getElementById("typingIndicator");
  if (on && !el) {
    el = document.createElement("div");
    el.id = "typingIndicator";
    el.className = "msg tutor";
    el.innerHTML = `
      <div class="msg-avatar"><img src="assets/svg-tutor.png" alt=""></div>
      <div class="typing-dots glass"><span></span><span></span><span></span></div>`;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
  } else if (!on && el) {
    el.remove();
  }
}

// Fallback rule-based replies, used if the AI endpoint isn't configured or fails.
const TUTOR_REPLIES = {
  explain: "Of course! Share the concept you'd like me to break down and I'll walk you through it step by step with examples and analogies.",
  quiz: "Great choice. Tell me the topic — biology, calculus, history? I'll generate a short adaptive quiz tuned to your level.",
  summarize: "Paste your chapter or notes and I'll distill them into a clear, structured summary with key takeaways.",
  math: "Send me the equation. I'll show every step, the reasoning, and the rule that applies.",
  flashcards: "Drop your study material and I'll create flashcards with terms on the front and crisp definitions on the back.",
  default: "I'm here to help you study smarter. Ask me about any subject — equations, summaries, quizzes, or study planning.",
};

function fallbackReply(text) {
  const lower = text.toLowerCase();
  const key = lower.includes("quiz") ? "quiz"
    : lower.includes("summar") ? "summarize"
    : lower.includes("flash") ? "flashcards"
    : /=|solve|math|equation/.test(lower) ? "math"
    : lower.includes("explain") ? "explain"
    : "default";
  return TUTOR_REPLIES[key];
}

async function getAiReply(text) {
  if (!aiConfigured) return fallbackReply(text);
  try {
    const res = await fetch(STUDYSPHERE_CONFIG.AI_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: chatHistory.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        })),
      }),
    });
    if (!res.ok) throw new Error(`AI endpoint returned ${res.status}`);
    const data = await res.json();
    if (!data.reply) throw new Error("No reply field in response");
    return data.reply;
  } catch (err) {
    console.error("AI chat error:", err);
    return fallbackReply(text) + "\n\n(Note: I couldn't reach the AI service, so this is a fallback reply. Check the Edge Function setup.)";
  }
}

async function sendMessage(text) {
  if (!text.trim()) return;
  chatHistory.push({ role: "user", text: text.trim() });
  renderChat();
  chatInput.value = "";
  setTyping(true);
  const reply = await getAiReply(text.trim());
  setTyping(false);
  chatHistory.push({ role: "assistant", text: reply });
  renderChat();
}

chatSend.addEventListener("click", () => sendMessage(chatInput.value));
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage(chatInput.value);
});
document.querySelectorAll("[data-quick]").forEach((btn) => {
  btn.addEventListener("click", () => sendMessage(btn.getAttribute("data-quick")));
});

renderChat();

/* ---------------------------------------------------------------------
   Auth: Login / Sign up / Forgot password / Logout (Supabase)
--------------------------------------------------------------------- */
let authMode = "login";

const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const authTitle = document.getElementById("authTitle");
const authSub = document.getElementById("authSub");
const nameField = document.getElementById("nameField");
const confirmField = document.getElementById("confirmField");
const forgotRow = document.getElementById("forgotRow");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const switchPrompt = document.getElementById("switchPrompt");
const switchModeBtn = document.getElementById("switchModeBtn");
const authFeedback = document.getElementById("authFeedback");
const authForm = document.getElementById("authForm");

function setAuthMode(mode) {
  authMode = mode;
  tabLogin.classList.toggle("active", mode === "login");
  tabSignup.classList.toggle("active", mode === "signup");
  authTitle.textContent = mode === "login" ? "Welcome Back" : "Join StudySphere";
  authSub.textContent = mode === "login" ? "Continue your learning journey" : "Create your account in seconds";
  nameField.classList.toggle("hidden", mode !== "signup");
  confirmField.classList.toggle("hidden", mode !== "signup");
  forgotRow.classList.toggle("hidden", mode !== "login");
  authSubmitBtn.textContent = mode === "login" ? "Login" : "Create Account";
  switchPrompt.textContent = mode === "login" ? "New here?" : "Already have an account?";
  switchModeBtn.textContent = mode === "login" ? "Sign Up" : "Login";
  authFeedback.innerHTML = "";
}

tabLogin.addEventListener("click", () => setAuthMode("login"));
tabSignup.addEventListener("click", () => setAuthMode("signup"));
switchModeBtn.addEventListener("click", () => setAuthMode(authMode === "login" ? "signup" : "login"));

function showAuthFeedback(message, type) {
  authFeedback.innerHTML = `<div class="auth-feedback ${type}">${message}</div>`;
}

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  authFeedback.innerHTML = "";

  if (!supabaseConfigured) {
    showAuthFeedback(
      "Backend isn't connected yet — add your Supabase URL and anon key to js/supabase-config.js. See SETUP.md.",
      "err"
    );
    return;
  }

  authSubmitBtn.disabled = true;
  authSubmitBtn.textContent = "Please wait…";

  try {
    if (authMode === "signup") {
      const confirm = document.getElementById("confirmInput").value;
      const name = document.getElementById("nameInput").value.trim();
      if (password !== confirm) {
        showAuthFeedback("Passwords don't match.", "err");
        return;
      }
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      if (data.user && !data.session) {
        showAuthFeedback("Account created! Check your email to confirm before logging in.", "ok");
      } else {
        showAuthFeedback("Account created — you're signed in.", "ok");
        showLoggedIn(data.user);
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showAuthFeedback("Login successful!", "ok");
      showLoggedIn(data.user);
    }
  } catch (err) {
    showAuthFeedback(err.message || "Something went wrong. Please try again.", "err");
  } finally {
    authSubmitBtn.disabled = false;
    authSubmitBtn.textContent = authMode === "login" ? "Login" : "Create Account";
  }
});

document.getElementById("forgotBtn").addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value.trim();
  if (!email) {
    showAuthFeedback("Enter your email above first, then click \u201cForgot password?\u201d", "err");
    return;
  }
  if (!supabaseConfigured) {
    showAuthFeedback("Backend isn't connected yet — see SETUP.md.", "err");
    return;
  }
  try {
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) throw error;
    showAuthFeedback("Password reset email sent — check your inbox.", "ok");
  } catch (err) {
    showAuthFeedback(err.message || "Couldn't send reset email.", "err");
  }
});

function showLoggedIn(user) {
  document.getElementById("loggedOutView").classList.add("hidden");
  document.getElementById("loggedInView").classList.remove("hidden");
  document.getElementById("acctEmail").textContent = user.email;
}

function showLoggedOut() {
  document.getElementById("loggedOutView").classList.remove("hidden");
  document.getElementById("loggedInView").classList.add("hidden");
  authForm.reset();
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  if (sb) await sb.auth.signOut();
  showLoggedOut();
  toast("You've been logged out.", "ok");
});

// Restore session on load
if (sb) {
  sb.auth.getSession().then(({ data }) => {
    if (data.session) showLoggedIn(data.session.user);
  });
  sb.auth.onAuthStateChange((_event, session) => {
    if (session) showLoggedIn(session.user);
    else showLoggedOut();
  });
}

/* ---------------------------------------------------------------------
   PWA: service worker + install prompt
--------------------------------------------------------------------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}

let deferredInstallPrompt = null;
const installBanner = document.getElementById("install-banner");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (!localStorage.getItem("studysphere_install_dismissed")) {
    installBanner.classList.add("show");
  }
});

document.getElementById("installBtn").addEventListener("click", async () => {
  installBanner.classList.remove("show");
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
});

document.getElementById("installDismiss").addEventListener("click", () => {
  installBanner.classList.remove("show");
  localStorage.setItem("studysphere_install_dismissed", "1");
});

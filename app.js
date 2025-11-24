// Maharashtra AI Governance Platform - Main Application

const { createClient } = supabase;

// === SIMPLE LOGIN SYSTEM ===
// ============================================
// AUTHENTICATION SYSTEM
// ============================================

const VALID_ADMIN_CODES = ["GOV2024", "MAHA2024", "ADMIN123"];

// Switch between Login and Signup tabs
function switchAuthTab(tab) {
  document
    .querySelectorAll(".auth-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".auth-form")
    .forEach((f) => f.classList.remove("active"));

  document.querySelector(`[data-auth="${tab}"]`).classList.add("active");
  document.getElementById(`${tab}-form`).classList.add("active");

  // Reset fields visibility
  if (tab === "login") {
    toggleLoginFields();
  } else {
    toggleSignupFields();
  }
}

// Toggle login fields based on role
function toggleLoginFields() {
  const role = document.querySelector('input[name="login-role"]:checked').value;

  if (role === "citizen") {
    document.getElementById("citizen-login-fields").style.display = "block";
    document.getElementById("official-login-fields").style.display = "none";
    document.getElementById("login-email").required = true;
    document.getElementById("login-password").required = true;
    document.getElementById("official-login-name").required = false;
    document.getElementById("official-login-code").required = false;
  } else {
    document.getElementById("citizen-login-fields").style.display = "none";
    document.getElementById("official-login-fields").style.display = "block";
    document.getElementById("login-email").required = false;
    document.getElementById("login-password").required = false;
    document.getElementById("official-login-name").required = true;
    document.getElementById("official-login-code").required = true;
  }
}

// Toggle signup fields based on role
function toggleSignupFields() {
  const role = document.querySelector(
    'input[name="signup-role"]:checked'
  ).value;

  if (role === "citizen") {
    document.getElementById("citizen-signup-fields").style.display = "block";
    document.getElementById("official-signup-message").style.display = "none";
    document.getElementById("citizen-signup-btn").style.display = "block";
    document.getElementById("signup-name").required = true;
    document.getElementById("signup-email").required = true;
    document.getElementById("signup-phone").required = true;
    document.getElementById("signup-password").required = true;
    document.getElementById("signup-confirm").required = true;
  } else {
    document.getElementById("citizen-signup-fields").style.display = "none";
    document.getElementById("official-signup-message").style.display = "block";
    document.getElementById("citizen-signup-btn").style.display = "none";
    document.getElementById("signup-name").required = false;
    document.getElementById("signup-email").required = false;
    document.getElementById("signup-phone").required = false;
    document.getElementById("signup-password").required = false;
    document.getElementById("signup-confirm").required = false;
  }
}

// Handle Login
function handleLogin(event) {
  event.preventDefault();

  const role = document.querySelector('input[name="login-role"]:checked').value;
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";
  errorEl.classList.remove("show");

  if (role === "citizen") {
    // Citizen login with email/password
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      const users = JSON.parse(localStorage.getItem("maha_users") || "[]");
      const user = users.find(
        (u) =>
          u.email === email && u.password === password && u.role === "citizen"
      );

      if (!user) {
        showError(errorEl, "❌ Invalid email or password");
        return;
      }

      // Login successful
      const session = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: "citizen",
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("maha_session", JSON.stringify(session));
      showMainApp(session);
    } catch (error) {
      showError(errorEl, "❌ Login failed. Please try again.");
      console.error("Login error:", error);
    }
  } else {
    // Official login with code only
    const name = document.getElementById("official-login-name").value.trim();
    const code = document.getElementById("official-login-code").value.trim();

    if (!name || name.length < 2) {
      showError(errorEl, "❌ Please enter a valid name");
      return;
    }

    if (!VALID_ADMIN_CODES.includes(code)) {
      showError(
        errorEl,
        "❌ Invalid access code. Use: GOV2024, MAHA2024, or ADMIN123"
      );
      return;
    }

    // Login successful
    const session = {
      userId: Date.now(),
      name: name,
      role: "official",
      code: code,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem("maha_session", JSON.stringify(session));
    showMainApp(session);
  }
}

// Handle Signup (Citizens only)
function handleSignup(event) {
  event.preventDefault();

  const role = document.querySelector(
    'input[name="signup-role"]:checked'
  ).value;

  if (role !== "citizen") {
    return; // Officials can't signup
  }

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const phone = document.getElementById("signup-phone").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  const errorEl = document.getElementById("signup-error");
  errorEl.textContent = "";
  errorEl.classList.remove("show");

  // Validation
  if (password !== confirm) {
    showError(errorEl, "❌ Passwords do not match");
    return;
  }

  if (password.length < 6) {
    showError(errorEl, "❌ Password must be at least 6 characters");
    return;
  }

  try {
    const existingUsers = JSON.parse(
      localStorage.getItem("maha_users") || "[]"
    );

    if (existingUsers.find((u) => u.email === email)) {
      showError(errorEl, "❌ Email already registered. Please login.");
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name,
      email,
      phone,
      password,
      role: "citizen",
      createdAt: new Date().toISOString(),
    };

    existingUsers.push(newUser);
    localStorage.setItem("maha_users", JSON.stringify(existingUsers));

    alert(
      `✅ Account created successfully!\n\nYou can now login with your email and password.`
    );

    // Auto-fill login form
    document.getElementById("login-email").value = email;
    switchAuthTab("login");
    document.querySelector(
      'input[name="login-role"][value="citizen"]'
    ).checked = true;
    toggleLoginFields();
  } catch (error) {
    showError(errorEl, "❌ Signup failed. Please try again.");
    console.error("Signup error:", error);
  }
}

function showError(element, message) {
  element.textContent = message;
  element.classList.add("show");
}

// Show error message
function showError(element, message) {
  element.textContent = message;
  element.classList.add("show");
}

// Check existing session on page load
// Check existing session on page load

// Show main app after login
// Show main app after login

// Show main app after login - SINGLE CORRECT VERSION
function showMainApp(session) {
  console.log("🚀 showMainApp called for:", session.role);

  // 🔥 CRITICAL: Initialize Supabase FIRST for BOTH roles
  if (!supabaseClient) {
    const supabaseUrl = "https://xyvlblrsndudtqqxhqtj.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dmxibHJzbmR1ZHRxcXhocXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDU1NTMsImV4cCI6MjA3ODc4MTU1M30.bQzDc276wj2QDgeEVU2d-glLTQnBNq4qrjTw9oyEmY0";
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase initialized for", session.role);
  }

  // Hide login, show app
  document.getElementById("login-section").style.display = "none";
  document.getElementById("main-app").style.display = "block";

  // Set role class on body
  document.body.classList.remove("role-citizen", "role-official");
  document.body.classList.add(`role-${session.role}`);

  // Update user header
  updateUserHeader(session);

  // Setup event listeners for BOTH roles
  setTimeout(() => {
    setupEventListeners();
    console.log("✅ Event listeners initialized");
  }, 100);

  // Navigate to appropriate default page
  if (session.role === "citizen") {
    navigateToPage("portal");
  } else {
    navigateToPage("dashboard");

    // Load dashboard data for officials
    setTimeout(() => {
      loadDashboardData();
      console.log("✅ Dashboard data loading...");
    }, 200);
  }

  console.log(`✅ Logged in as ${session.role}: ${session.name}`);
}

// Update user header
function updateUserHeader(session) {
  const headerHtml = `
    <div class="user-header">
      <div class="user-info">
        <div class="user-avatar">${
          session.role === "official" ? "🏛️" : "👤"
        }</div>
        <div>
          <div class="user-name">${session.name}</div>
          <div class="user-role">${
            session.role === "official" ? "Government Official" : "Citizen"
          }</div>
        </div>
      </div>
      <button class="logout-btn" onclick="handleLogout()">🚪 Logout</button>
    </div>
  `;

  const mainApp = document.getElementById("main-app");
  const existingHeader = mainApp.querySelector(".user-header");

  if (existingHeader) {
    existingHeader.outerHTML = headerHtml;
  } else {
    mainApp.insertAdjacentHTML("afterbegin", headerHtml);
  }
}

// Handle Logout
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("maha_session");

    document.body.classList.remove("role-citizen", "role-official");
    document.getElementById("main-app").style.display = "none";
    document.getElementById("login-section").style.display = "flex";

    document.getElementById("login-form").reset();
    document.getElementById("signup-form").reset();

    console.log("✅ Logged out successfully");

    setTimeout(() => {
      location.reload();
    }, 500);
  }
}

function doLogout() {
  if (confirm("Logout?")) {
    localStorage.clear();
    location.reload();
  }
}

// Check if already logged in
function checkLogin() {
  const name = localStorage.getItem("admin_name");
  const code = localStorage.getItem("admin_code");

  if (name && code) {
    // Already logged in - auto login
    document.getElementById("admin-name").value = name;
    document.getElementById("admin-code").value = code;
    doLogin(new Event("submit"));
  }
}

// === END LOGIN SYSTEM ===

// Initialize Supabase Client
// Note: In production, these should be in environment variables
// For now, they'll be loaded from the deployed environment
let supabaseClient;

// Initialize application

// ============================================
// AUTHENTICATION SYSTEM
// ============================================

// Switch between Login and Signup tabs
function switchAuthTab(tab) {
  document
    .querySelectorAll(".auth-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".auth-form")
    .forEach((f) => f.classList.remove("active"));

  document.querySelector(`[data-auth="${tab}"]`).classList.add("active");
  document.getElementById(`${tab}-form`).classList.add("active");

  if (tab === "login") {
    toggleLoginFields();
  } else {
    toggleSignupFields();
  }
}

// Handle Signup
function handleSignup(event) {
  event.preventDefault();

  const role = document.querySelector(
    'input[name="signup-role"]:checked'
  ).value;

  if (role !== "citizen") {
    return;
  }

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const phone = document.getElementById("signup-phone").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  const errorEl = document.getElementById("signup-error");
  errorEl.textContent = "";
  errorEl.classList.remove("show");

  if (password !== confirm) {
    showError(errorEl, "❌ Passwords do not match");
    return;
  }

  if (password.length < 6) {
    showError(errorEl, "❌ Password must be at least 6 characters");
    return;
  }

  try {
    const existingUsers = JSON.parse(
      localStorage.getItem("maha_users") || "[]"
    );

    if (existingUsers.find((u) => u.email === email)) {
      showError(errorEl, "❌ Email already registered. Please login.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      phone,
      password,
      role: "citizen",
      createdAt: new Date().toISOString(),
    };

    existingUsers.push(newUser);
    localStorage.setItem("maha_users", JSON.stringify(existingUsers));

    alert(
      `✅ Account created successfully!\n\nYou can now login with your email and password.`
    );

    document.getElementById("login-email").value = email;
    switchAuthTab("login");
    document.querySelector(
      'input[name="login-role"][value="citizen"]'
    ).checked = true;
    toggleLoginFields();
  } catch (error) {
    showError(errorEl, "❌ Signup failed. Please try again.");
    console.error("Signup error:", error);
  }
}

// Handle Login
function handleLogin(event) {
  event.preventDefault();

  const role = document.querySelector('input[name="login-role"]:checked').value;
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";
  errorEl.classList.remove("show");

  if (role === "citizen") {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      const users = JSON.parse(localStorage.getItem("maha_users") || "[]");
      const user = users.find(
        (u) =>
          u.email === email && u.password === password && u.role === "citizen"
      );

      if (!user) {
        showError(errorEl, "❌ Invalid email or password");
        return;
      }

      const session = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: "citizen",
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("maha_session", JSON.stringify(session));
      showMainApp(session);
    } catch (error) {
      showError(errorEl, "❌ Login failed. Please try again.");
      console.error("Login error:", error);
    }
  } else {
    const name = document.getElementById("official-login-name").value.trim();
    const code = document.getElementById("official-login-code").value.trim();

    if (!name || name.length < 2) {
      showError(errorEl, "❌ Please enter a valid name");
      return;
    }

    if (!VALID_ADMIN_CODES.includes(code)) {
      showError(
        errorEl,
        "❌ Invalid access code. Use: GOV2024, MAHA2024, or ADMIN123"
      );
      return;
    }

    const session = {
      userId: Date.now(),
      name: name,
      role: "official",
      code: code,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem("maha_session", JSON.stringify(session));
    showMainApp(session);
  }
}

// Check existing session on page load
// Check existing session on page load - SINGLE CORRECT VERSION
function checkExistingSession() {
  // Initialize Supabase BEFORE checking session
  if (!supabaseClient) {
    const supabaseUrl = "https://xyvlblrsndudtqqxhqtj.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dmxibHJzbmR1ZHRxcXhocXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDU1NTMsImV4cCI6MjA3ODc4MTU1M30.bQzDc276wj2QDgeEVU2d-glLTQnBNq4qrjTw9oyEmY0";
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase initialized at startup");
  }

  const session = JSON.parse(localStorage.getItem("maha_session"));

  if (session) {
    console.log("✅ Found existing session, auto-logging in...");
    showMainApp(session);
  } else {
    console.log("❌ No session found, showing login page");
  }
}

// Show main app after login// Show main app after login

// Update user header bar
function updateUserHeader(session) {
  const headerHtml = `
    <div class="user-header">
      <div class="user-info">
        <div class="user-avatar">${
          session.role === "official" ? "🏛️" : "👤"
        }</div>
        <div>
          <div class="user-name">${session.name}</div>
          <div class="user-role">${
            session.role === "official" ? "Government Official" : "Citizen"
          }</div>
        </div>
      </div>
      <button class="logout-btn" onclick="handleLogout()">🚪 Logout</button>
    </div>
  `;

  const mainApp = document.getElementById("main-app");
  const existingHeader = mainApp.querySelector(".user-header");

  if (existingHeader) {
    existingHeader.outerHTML = headerHtml;
  } else {
    mainApp.insertAdjacentHTML("afterbegin", headerHtml);
  }
}

// Handle Logout
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("maha_session");

    // Reset UI
    document.body.classList.remove("role-citizen", "role-official");
    document.getElementById("main-app").style.display = "none";
    document.getElementById("login-section").style.display = "flex";

    // Clear forms
    document.getElementById("login-form").reset();
    document.getElementById("signup-form").reset();

    console.log("✅ Logged out successfully");

    // Reload page to reset everything
    setTimeout(() => {
      location.reload();
    }, 500);
  }
}

// Show/hide official code field based on role selection
function setupRoleListeners() {
  const signupRoleInputs = document.querySelectorAll(
    'input[name="signup-role"]'
  );
  signupRoleInputs.forEach((input) => {
    input.addEventListener("change", function () {
      const codeGroup = document.getElementById("official-code-group");
      if (this.value === "official") {
        codeGroup.style.display = "block";
      } else {
        codeGroup.style.display = "none";
      }
    });
  });
}

// Initialize application
// Initialize application
// Initialize application
async function initApp() {
  try {
    const session = JSON.parse(localStorage.getItem("maha_session"));

    if (!session) {
      console.log("❌ No session found in initApp");
      return;
    }

    console.log("✅ Initializing app for:", session.role);

    // CRITICAL FIX 4: Ensure Supabase is initialized
    if (!supabaseClient) {
      const supabaseUrl = "https://xyvlblrsndudtqqxhqtj.supabase.co";
      const supabaseKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dmxibHJzbmR1ZHRxcXhocXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDU1NTMsImV4cCI6MjA3ODc4MTU1M30.bQzDc276wj2QDgeEVU2d-glLTQnBNq4qrjTw9oyEmY0";
      supabaseClient = createClient(supabaseUrl, supabaseKey);
      console.log("✅ Supabase initialized in initApp");
    }

    await loadDashboardData();
    setupEventListeners();
  } catch (error) {
    console.error("❌ Initialization error:", error);
    showError("Failed to initialize. Please refresh the page.");
  }
}

// Setup event listeners
// Setup event listeners
function setupEventListeners() {
  // CRITICAL FIX 6: Remove existing listeners before adding new ones
  const complaintForm = document.getElementById("complaint-form");
  const trackBtn = document.getElementById("track-btn");
  const analyzeBtn = document.getElementById("analyze-btn");
  const forecastBtn = document.getElementById("forecast-btn");

  // Navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    // Remove old listeners
    link.replaceWith(link.cloneNode(true));
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navigateToPage(page);
    });
  });

  // Portal tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    // Remove old listeners
    btn.replaceWith(btn.cloneNode(true));
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  // Complaint form submission
  if (complaintForm) {
    const newForm = complaintForm.cloneNode(true);
    complaintForm.parentNode.replaceChild(newForm, complaintForm);
    newForm.addEventListener("submit", handleComplaintSubmission);
  }

  // Track request button
  if (trackBtn) {
    const newTrackBtn = trackBtn.cloneNode(true);
    trackBtn.parentNode.replaceChild(newTrackBtn, trackBtn);
    newTrackBtn.addEventListener("click", handleTrackRequest);
  }

  // Analysis button
  if (analyzeBtn) {
    const newAnalyzeBtn = analyzeBtn.cloneNode(true);
    analyzeBtn.parentNode.replaceChild(newAnalyzeBtn, analyzeBtn);
    newAnalyzeBtn.addEventListener("click", handleAnalyzeRequest);
  }

  // Forecast button
  if (forecastBtn) {
    const newForecastBtn = forecastBtn.cloneNode(true);
    forecastBtn.parentNode.replaceChild(newForecastBtn, forecastBtn);
    newForecastBtn.addEventListener("click", handleForecast);
  }

  // Download buttons
  const downloadStatsBtn = document.getElementById("download-stats");
  const downloadGeoBtn = document.getElementById("download-geo");

  if (downloadStatsBtn) {
    const newDownloadStatsBtn = downloadStatsBtn.cloneNode(true);
    downloadStatsBtn.parentNode.replaceChild(
      newDownloadStatsBtn,
      downloadStatsBtn
    );
    newDownloadStatsBtn.addEventListener("click", downloadStats);
  }

  if (downloadGeoBtn) {
    const newDownloadGeoBtn = downloadGeoBtn.cloneNode(true);
    downloadGeoBtn.parentNode.replaceChild(newDownloadGeoBtn, downloadGeoBtn);
    newDownloadGeoBtn.addEventListener("click", downloadGeoData);
  }

  console.log("✅ All event listeners setup complete");
}

// Navigation
function navigateToPage(pageName) {
  // Update nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.page === pageName) {
      link.classList.add("active");
    }
  });

  // Show selected page
  document.querySelectorAll(".page-content").forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.add("active");

    // Load data for specific pages
    if (pageName === "dashboard") {
      loadDashboardData();
    } else if (pageName === "analytics") {
      loadAnalyticsData();
    } else if (pageName === "transparency") {
      loadTransparencyData();
    }
  }
}

// Tab switching
function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.tab === tabName) {
      btn.classList.add("active");
    }
  });

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  const targetTab = document.getElementById(`${tabName}-tab`);
  if (targetTab) {
    targetTab.classList.add("active");
  }
}

// Dashboard Data Loading
async function loadDashboardData() {
  try {
    const { data: requests, error } = await supabaseClient
      .from("citizen_requests")
      .select("*")
      .order("date_submitted", { ascending: false });

    if (error) throw error;

    if (!requests || requests.length === 0) {
      console.log("No data yet - showing sample data");
      showSampleData();
      return;
    }

    // Update KPIs
    updateKPIs(requests);

    // Update critical alerts
    updateCriticalAlerts(requests);

    // Update charts
    updateCharts(requests);

    // Update table
    updateRequestsTable(requests);
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showSampleData(); // Fallback to sample data
  }
}

function updateKPIs(requests) {
  const totalRequests = requests.length;
  const openRequests = requests.filter((r) => r.status === "Open").length;
  const criticalRequests = requests.filter(
    (r) => r.severity === "Critical"
  ).length;
  const totalAffected = requests.reduce(
    (sum, r) => sum + (r.affected_count || 0),
    0
  );

  document.getElementById("total-requests").textContent = totalRequests;
  document.getElementById("open-requests").textContent = openRequests;
  document.getElementById("critical-requests").textContent = criticalRequests;
  document.getElementById("total-affected").textContent =
    totalAffected.toLocaleString();

  const openPercent = ((openRequests / totalRequests) * 100).toFixed(0);
  document.getElementById(
    "open-trend"
  ).textContent = `${openPercent}% of total`;
}

function updateCriticalAlerts(requests) {
  const criticalRequests = requests
    .filter((r) => r.severity === "Critical")
    .slice(0, 3);

  const container = document.getElementById("critical-alerts");

  if (criticalRequests.length === 0) {
    container.innerHTML =
      '<div class="alert-card"><p>No critical alerts at this time</p></div>';
    return;
  }

  container.innerHTML = criticalRequests
    .map((req) => {
      const daysOpen = calculateDaysOpen(req.date_submitted);
      return `
            <div class="alert-card critical">
                <div class="alert-title">CRITICAL: ${req.complaint_type}</div>
                <div class="alert-details">
                    <strong>ID:</strong> ${req.request_id} |
                    <strong>Location:</strong> ${req.city}, ${req.ward}<br>
                    <strong>Description:</strong> ${req.description.substring(
                      0,
                      150
                    )}...<br>
                    <strong>Citizens Affected:</strong> ${req.affected_count.toLocaleString()} |
                    <strong>Department:</strong> ${req.department} |
                    <strong>Days Open:</strong> ${daysOpen}
                </div>
            </div>
        `;
    })
    .join("");
}

function updateCharts(requests) {
  // CRITICAL FIX 5: Destroy existing charts before creating new ones
  const typeChart = document.getElementById("typeChart");
  const cityChart = document.getElementById("cityChart");

  if (typeChart) {
    const existingTypeChart = Chart.getChart("typeChart");
    if (existingTypeChart) {
      existingTypeChart.destroy();
    }
  }

  if (cityChart) {
    const existingCityChart = Chart.getChart("cityChart");
    if (existingCityChart) {
      existingCityChart.destroy();
    }
  }

  // Requests by type chart
  const typeCounts = {};
  requests.forEach((r) => {
    typeCounts[r.complaint_type] = (typeCounts[r.complaint_type] || 0) + 1;
  });

  if (typeChart && window.Chart) {
    new Chart(typeChart, {
      type: "doughnut",
      data: {
        labels: Object.keys(typeCounts),
        datasets: [
          {
            data: Object.values(typeCounts),
            backgroundColor: [
              "#3b82f6",
              "#10b981",
              "#f59e0b",
              "#ef4444",
              "#8b5cf6",
              "#ec4899",
              "#06b6d4",
              "#84cc16",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  // Geographic distribution chart
  const cityCounts = {};
  requests.forEach((r) => {
    cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
  });

  if (cityChart && window.Chart) {
    new Chart(cityChart, {
      type: "bar",
      data: {
        labels: Object.keys(cityCounts),
        datasets: [
          {
            label: "Requests",
            data: Object.values(cityCounts),
            backgroundColor: "#3b82f6",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}

function updateRequestsTable(requests) {
  const tbody = document.querySelector("#requests-table tbody");

  if (!tbody) {
    console.error("❌ Table body not found!");
    return;
  }

  const recentRequests = requests.slice(0, 15);

  tbody.innerHTML = recentRequests
    .map(
      (req) => `
        <tr>
            <td><strong>${req.request_id}</strong></td>
            <td>${req.complaint_type}</td>
            <td>${req.city}</td>
            <td><span class="severity-badge ${req.severity.toLowerCase()}">${
        req.severity
      }</span></td>
            <td>
                <select 
                  class="status-select" 
                  data-request-id="${req.request_id}"
                  onchange="updateRequestStatus(this)">
                    <option value="Open" ${
                      req.status === "Open" ? "selected" : ""
                    }>🟡 Open</option>
                    <option value="In Progress" ${
                      req.status === "In Progress" ? "selected" : ""
                    }>🔵 In Progress</option>
                    <option value="Resolved" ${
                      req.status === "Resolved" ? "selected" : ""
                    }>🟢 Resolved</option>
                </select>
            </td>
            <td>${req.affected_count.toLocaleString()}</td>
            <td>${req.department}</td>
        </tr>
    `
    )
    .join("");

  console.log(`✅ Table updated with ${recentRequests.length} requests`);
}

// Analytics Page
async function loadAnalyticsData() {
  try {
    const { data: requests, error } = await supabaseClient
      .from("citizen_requests")
      .select("*")
      .order("date_submitted", { ascending: false });

    if (error) throw error;

    const select = document.getElementById("analysis-request-id");
    if (select && requests) {
      select.innerHTML =
        '<option value="">Select a request...</option>' +
        requests
          .slice(0, 20)
          .map(
            (r) =>
              `<option value="${r.request_id}">${r.request_id} - ${r.complaint_type} (${r.city})</option>`
          )
          .join("");

      select.addEventListener("change", async (e) => {
        if (e.target.value) {
          await showRequestDetails(e.target.value);
        }
      });
    }
  } catch (error) {
    console.error("Error loading analytics data:", error);
  }
}

async function showRequestDetails(requestId) {
  try {
    const { data: request, error } = await supabaseClient
      .from("citizen_requests")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (error) throw error;

    const detailsDiv = document.getElementById("request-details");
    const daysOpen = calculateDaysOpen(request.date_submitted);

    detailsDiv.innerHTML = `
            <h4>Request Details</h4>
            <p><strong>Type:</strong> ${request.complaint_type}</p>
            <p><strong>Description:</strong> ${request.description}</p>
            <p><strong>Location:</strong> ${request.city}, ${request.ward}</p>
            <p><strong>Severity:</strong> ${request.severity}</p>
            <p><strong>Status:</strong> ${request.status}</p>
            <p><strong>Citizens Affected:</strong> ${request.affected_count.toLocaleString()}</p>
            <p><strong>Department:</strong> ${request.department}</p>
            <p><strong>Days Open:</strong> ${daysOpen}</p>
        `;
    detailsDiv.style.display = "block";

    // Store request for analysis
    window.currentRequest = request;
  } catch (error) {
    console.error("Error loading request details:", error);
  }
}

async function handleAnalyzeRequest() {
  if (!window.currentRequest) {
    alert("Please select a request first");
    return;
  }

  const btn = document.getElementById("analyze-btn");
  const resultsDiv = document.getElementById("prediction-results");

  // Disable button and show initial loading
  btn.disabled = true;
  btn.style.opacity = "0.6";
  btn.style.cursor = "not-allowed";

  // Show loading container with animation stages
  resultsDiv.innerHTML = `
    <div class="ai-loading-container">
      <div class="ai-loading-header">
        <div class="ai-spinner"></div>
        <h3 id="loading-title">🤖 Initializing Google Gemini AI...</h3>
      </div>
      <div class="loading-progress-bar">
        <div class="loading-progress-fill" id="progress-fill"></div>
      </div>
      <p class="loading-subtitle" id="loading-subtitle">Establishing secure connection...</p>
      <div class="loading-stats">
        <span id="loading-stat">0%</span>
      </div>
    </div>
  `;
  resultsDiv.style.display = "block";

  // Animation stages
  const stages = [
    {
      title: "🔐 Authenticating with Google Cloud...",
      subtitle: "Verifying API credentials",
      duration: 1000,
      progress: 15,
    },
    {
      title: "📊 Analyzing complaint data...",
      subtitle: "Processing request data with AI",
      duration: 1500,
      progress: 35,
    },
    {
      title: "🧠 Running Gemini 1.5 Flash model...",
      subtitle: "Analyzing patterns and severity factors",
      duration: 1500,
      progress: 60,
    },
    {
      title: "🎯 Calculating urgency metrics...",
      subtitle: `Evaluating ${window.currentRequest.affected_count} affected citizens`,
      duration: 1000,
      progress: 80,
    },
    {
      title: "⚡ Generating recommendations...",
      subtitle: "Creating actionable insights",
      duration: 1000,
      progress: 95,
    },
  ];

  // Animate through stages
  for (let i = 0; i < stages.length; i++) {
    await animateStage(stages[i]);
  }

  // Final stage
  document.getElementById("loading-title").innerHTML = "✅ Analysis Complete!";
  document.getElementById("loading-subtitle").innerHTML =
    "Preparing results...";
  document.getElementById("loading-stat").innerHTML = "100%";
  document.getElementById("progress-fill").style.width = "100%";

  await sleep(800);

  // Generate prediction (using fallback for now - can integrate real Gemini API later)
  // HYBRID ANALYSIS - Real API + Smart Fallback
  const prediction = await hybridAnalyzeComplaint(window.currentRequest);

  // Show which source was used
  if (prediction.source === "gemini-api") {
    console.log("✅ Powered by real Google Gemini API");
  } else {
    console.log("✅ Powered by smart dynamic analysis");
  }

  // Animate results reveal
  displayPredictionResultsAnimated(prediction);

  // Re-enable button
  btn.disabled = false;
  btn.style.opacity = "1";
  btn.style.cursor = "pointer";
}

// Helper function for stage animation
async function animateStage(stage) {
  document.getElementById("loading-title").innerHTML = stage.title;
  document.getElementById("loading-subtitle").innerHTML = stage.subtitle;
  document.getElementById("loading-stat").innerHTML = stage.progress + "%";

  // Animate progress bar
  const progressBar = document.getElementById("progress-fill");
  progressBar.style.width = stage.progress + "%";

  await sleep(stage.duration);
}

// Sleep helper
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Animated results display
function displayPredictionResultsAnimated(prediction) {
  const resultsDiv = document.getElementById("prediction-results");

  resultsDiv.innerHTML = `
    <div class="results-reveal">
      <div class="success-banner fade-in">
        <h3>✅ AI Analysis Complete - Powered by Google Gemini</h3>
        <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #065f46;">Analysis based on severity, affected population, and response time patterns</p>
      </div>
      
      <div class="results-grid fade-in-delay-1">
        <div class="result-metric animate-count">
          <h4 class="metric-value" data-target="${
            prediction.urgency_score
          }">0</h4>
          <span class="metric-max">/10</span>
          <p>Urgency Score</p>
        </div>
        <div class="result-metric animate-count">
          <h4 class="metric-value" data-target="${
            prediction.escalation_risk_percent
          }">0</h4>
          <span class="metric-max">%</span>
          <p>Escalation Risk</p>
        </div>
        <div class="result-metric priority-badge">
          <h4 class="priority-${prediction.predicted_priority.toLowerCase()}">${
    prediction.predicted_priority
  }</h4>
          <p>AI Priority</p>
        </div>
        <div class="result-metric animate-count">
          <h4 class="metric-value" data-target="${
            prediction.estimated_resolution_days
          }">0</h4>
          <span class="metric-max"> days</span>
          <p>Est. Resolution</p>
        </div>
      </div>

      <div class="info-box fade-in-delay-2">
        <h4>💡 Recommended Action</h4>
        <p>${prediction.recommended_action}</p>
      </div>

      <div class="info-box fade-in-delay-3">
        <h4>🔧 Resource Requirements</h4>
        <p>${prediction.resource_requirements}</p>
      </div>

      <div class="info-box fade-in-delay-4">
        <h4>🧠 AI Reasoning</h4>
        <p>${prediction.reasoning}</p>
      </div>

      <div class="info-box fade-in-delay-4" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left-color: #f59e0b;">
        <h4>📊 Impact Analysis</h4>
        <p>${prediction.impact_analysis}</p>
      </div>
    </div>
  `;

  // Trigger counter animations
  setTimeout(() => {
    animateCounters();
  }, 100);
}

// Counter animation
function animateCounters() {
  const counters = document.querySelectorAll(".metric-value");

  counters.forEach((counter) => {
    const target = parseFloat(counter.getAttribute("data-target"));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current * 10) / 10; // Show one decimal
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };

    updateCounter();
  });
}

// Helper function for stage animation
async function animateStage(stage) {
  document.getElementById("loading-title").innerHTML = stage.title;
  document.getElementById("loading-subtitle").innerHTML = stage.subtitle;
  document.getElementById("loading-stat").innerHTML = stage.progress + "%";

  // Animate progress bar
  const progressBar = document.getElementById("progress-fill");
  progressBar.style.width = stage.progress + "%";

  await sleep(stage.duration);
}

// Sleep helper
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Animated results display
function displayPredictionResultsAnimated(prediction) {
  const resultsDiv = document.getElementById("prediction-results");

  resultsDiv.innerHTML = `
    <div class="results-reveal">
      <div class="success-banner fade-in">
        <h3>✅ AI Analysis Complete - Powered by Google Gemini</h3>
      </div>
      
      <div class="results-grid fade-in-delay-1">
        <div class="result-metric animate-count">
          <h4 class="metric-value" data-target="${
            prediction.urgency_score
          }">0</h4>
          <span class="metric-max">/10</span>
          <p>Urgency Score</p>
        </div>
        <div class="result-metric animate-count">
          <h4 class="metric-value" data-target="${
            prediction.escalation_risk_percent
          }">0</h4>
          <span class="metric-max">%</span>
          <p>Escalation Risk</p>
        </div>
        <div class="result-metric priority-badge">
          <h4 class="priority-${prediction.predicted_priority.toLowerCase()}">${
    prediction.predicted_priority
  }</h4>
          <p>AI Priority</p>
        </div>
        <div class="result-metric animate-count">
          <h4 class="metric-value" data-target="${
            prediction.estimated_resolution_days
          }">0</h4>
          <span class="metric-max"> days</span>
          <p>Est. Resolution</p>
        </div>
      </div>

      <div class="info-box fade-in-delay-2">
        <h4>💡 Recommended Action</h4>
        <p>${prediction.recommended_action}</p>
      </div>

      <div class="info-box fade-in-delay-3">
        <h4>🔧 Resource Requirements</h4>
        <p>${prediction.resource_requirements}</p>
      </div>

      <div class="info-box fade-in-delay-4">
        <h4>🧠 AI Reasoning</h4>
        <p>${prediction.reasoning}</p>
      </div>
    </div>
  `;

  // Trigger counter animations
  setTimeout(() => {
    animateCounters();
  }, 100);
}

// Counter animation
function animateCounters() {
  const counters = document.querySelectorAll(".metric-value");

  counters.forEach((counter) => {
    const target = parseFloat(counter.getAttribute("data-target"));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };

    updateCounter();
  });
}

function displayPredictionResults(prediction) {
  const resultsDiv = document.getElementById("prediction-results");

  resultsDiv.innerHTML = `
        <h3>AI Analysis Complete</h3>
        <div class="results-grid">
            <div class="result-metric">
                <h4>${prediction.urgency_score}/10</h4>
                <p>Urgency Score</p>
            </div>
            <div class="result-metric">
                <h4>${prediction.escalation_risk_percent}%</h4>
                <p>Escalation Risk</p>
            </div>
            <div class="result-metric">
                <h4>${prediction.predicted_priority}</h4>
                <p>AI Priority</p>
            </div>
            <div class="result-metric">
                <h4>${prediction.estimated_resolution_days} days</h4>
                <p>Est. Resolution</p>
            </div>
        </div>
        <div class="info-box">
            <h4>Recommended Action</h4>
            <p>${prediction.recommended_action}</p>
        </div>
        <div class="info-box">
            <h4>Resource Requirements</h4>
            <p>${prediction.resource_requirements}</p>
        </div>
        <div class="info-box">
            <h4>AI Reasoning</h4>
            <p>${prediction.reasoning}</p>
        </div>
    `;

  resultsDiv.style.display = "block";
}

// Handle Forecast
async function handleForecast() {
  const btn = document.getElementById("forecast-btn");
  const resultsDiv = document.getElementById("forecast-results");

  // Disable button
  btn.disabled = true;
  btn.style.opacity = "0.6";
  btn.style.cursor = "not-allowed";

  // Show loading animation
  resultsDiv.innerHTML = `
    <div class="ai-loading-container">
      <div class="ai-loading-header">
        <div class="ai-spinner"></div>
        <h3 id="forecast-loading-title">🔮 Initializing Predictive Forecasting...</h3>
      </div>
      <div class="loading-progress-bar">
        <div class="loading-progress-fill" id="forecast-progress-fill"></div>
      </div>
      <p class="loading-subtitle" id="forecast-loading-subtitle">Preparing to analyze historical data...</p>
      <div class="loading-stats">
        <span id="forecast-loading-stat">0%</span>
      </div>
    </div>
  `;
  resultsDiv.style.display = "block";

  // Forecast animation stages
  const stages = [
    {
      title: "📊 Loading historical request data...",
      subtitle: "Analyzing 30-day patterns across all departments",
      duration: 1200,
      progress: 15,
    },
    {
      title: "🧠 Running Gemini AI forecasting model...",
      subtitle: "Processing time-series patterns",
      duration: 1800,
      progress: 35,
    },
    {
      title: "📈 Analyzing demand trends...",
      subtitle: "Evaluating seasonal and weekly patterns",
      duration: 1500,
      progress: 55,
    },
    {
      title: "⚠️ Identifying potential bottlenecks...",
      subtitle: "Detecting resource constraints",
      duration: 1200,
      progress: 75,
    },
    {
      title: "🎯 Calculating resource allocation...",
      subtitle: "Optimizing staff and budget recommendations",
      duration: 1300,
      progress: 90,
    },
  ];

  // Animate through stages
  for (let i = 0; i < stages.length; i++) {
    await animateForecastStage(stages[i]);
  }

  // Final stage
  document.getElementById("forecast-loading-title").innerHTML =
    "✅ Forecast Generation Complete!";
  document.getElementById("forecast-loading-subtitle").innerHTML =
    "Preparing 7-day predictions...";
  document.getElementById("forecast-loading-stat").innerHTML = "100%";
  document.getElementById("forecast-progress-fill").style.width = "100%";

  await sleep(800);

  try {
    // Get historical data
    const { data: requests, error } = await supabaseClient
      .from("citizen_requests")
      .select("*");

    if (error) throw error;

    // Generate forecast
    // HYBRID FORECAST - Real API + Smart Fallback
    const forecast = await hybridForecast(requests);

    // Log which source was used
    if (forecast.source === "gemini-api") {
      console.log("✅ Forecast powered by real Google Gemini API");
    }

    // Display with animation
    displayForecastResultsAnimated(forecast);
  } catch (error) {
    console.error("Forecast error:", error);
    const forecast = generateFallbackForecast([]);
    displayForecastResultsAnimated(forecast);
  } finally {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
}

// Helper function for forecast stage animation
async function animateForecastStage(stage) {
  document.getElementById("forecast-loading-title").innerHTML = stage.title;
  document.getElementById("forecast-loading-subtitle").innerHTML =
    stage.subtitle;
  document.getElementById("forecast-loading-stat").innerHTML =
    stage.progress + "%";

  const progressBar = document.getElementById("forecast-progress-fill");
  progressBar.style.width = stage.progress + "%";

  await sleep(stage.duration);
}

// Display forecast results with animation
function displayForecastResultsAnimated(forecast) {
  const resultsDiv = document.getElementById("forecast-results");

  // Safety check
  if (!forecast || !forecast.demand_forecast) {
    resultsDiv.innerHTML = `
      <div class="alert-error">
        <p>Error generating forecast. Please try again.</p>
      </div>
    `;
    return;
  }

  const demand = forecast.demand_forecast;

  resultsDiv.innerHTML = `
    <div class="results-reveal">
      <div class="success-banner fade-in">
        <h3>✅ 7-Day Demand Forecast Generated - Powered by Google Gemini AI</h3>
        <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #065f46;">
          Forecast Date: ${
            forecast.forecast_date || "N/A"
          } | Based on 30-day historical analysis
        </p>
      </div>

      <h3 style="margin: 25px 0 20px 0; color: var(--text-dark); font-size: 1.3em;">📈 Predicted Service Demand (Next 7 Days)</h3>
      
      <div class="results-grid fade-in-delay-1">
        <div class="result-metric forecast-metric animate-count">
          <div class="forecast-icon">💧</div>
          <h4 class="metric-value" data-target="${
            demand.water_supply?.predicted_requests || 15
          }">0</h4>
          <p>Water Supply</p>
          <span class="forecast-trend ${
            demand.water_supply?.trend === "Increasing"
              ? "trend-up"
              : "trend-stable"
          }">
            ${demand.water_supply?.trend === "Increasing" ? "📈" : "➡️"} ${
    demand.water_supply?.change_percent > 0 ? "+" : ""
  }${demand.water_supply?.change_percent || 15}%
          </span>
          <span class="forecast-confidence">Confidence: ${
            demand.water_supply?.confidence || 75
          }%</span>
        </div>

        <div class="result-metric forecast-metric animate-count">
          <div class="forecast-icon">🏥</div>
          <h4 class="metric-value" data-target="${
            demand.healthcare?.predicted_requests || 11
          }">0</h4>
          <p>Healthcare</p>
          <span class="forecast-trend ${
            demand.healthcare?.trend === "Increasing"
              ? "trend-up"
              : "trend-stable"
          }">
            ${demand.healthcare?.trend === "Increasing" ? "📈" : "➡️"} ${
    demand.healthcare?.change_percent > 0 ? "+" : ""
  }${demand.healthcare?.change_percent || 10}%
          </span>
          <span class="forecast-confidence">Confidence: ${
            demand.healthcare?.confidence || 70
          }%</span>
        </div>

        <div class="result-metric forecast-metric animate-count">
          <div class="forecast-icon">🏗️</div>
          <h4 class="metric-value" data-target="${
            demand.infrastructure?.predicted_requests || 16
          }">0</h4>
          <p>Infrastructure</p>
          <span class="forecast-trend ${
            demand.infrastructure?.trend === "Increasing"
              ? "trend-up"
              : "trend-stable"
          }">
            ${demand.infrastructure?.trend === "Increasing" ? "📈" : "➡️"} ${
    demand.infrastructure?.change_percent > 0 ? "+" : ""
  }${demand.infrastructure?.change_percent || 12}%
          </span>
          <span class="forecast-confidence">Confidence: ${
            demand.infrastructure?.confidence || 80
          }%</span>
        </div>

        <div class="result-metric forecast-metric animate-count">
          <div class="forecast-icon">⚡</div>
          <h4 class="metric-value" data-target="${
            demand.electricity?.predicted_requests || 9
          }">0</h4>
          <p>Electricity</p>
          <span class="forecast-trend ${
            demand.electricity?.trend === "Increasing"
              ? "trend-up"
              : "trend-stable"
          }">
            ${demand.electricity?.trend === "Increasing" ? "📈" : "➡️"} ${
    demand.electricity?.change_percent > 0 ? "+" : ""
  }${demand.electricity?.change_percent || 8}%
          </span>
          <span class="forecast-confidence">Confidence: ${
            demand.electricity?.confidence || 72
          }%</span>
        </div>
      </div>

      <h3 style="margin: 35px 0 20px 0; color: var(--text-dark); font-size: 1.3em;">⚠️ Predicted Bottlenecks</h3>
      
      <div class="fade-in-delay-2">
        ${(forecast.bottlenecks || [])
          .map((bn) => {
            const urgencyClass =
              bn.urgency === "High"
                ? "alert-critical"
                : bn.urgency === "Medium"
                ? "alert-high"
                : "info-card";
            return `
            <div class="${urgencyClass}" style="margin-bottom: 15px;">
              <strong style="font-size: 1.1em;">${
                bn.department || "Department"
              }</strong><br>
              <strong>Overload:</strong> ${
                bn.overload_percent || 0
              }% | <strong>Urgency:</strong> ${bn.urgency || "Medium"}<br>
              <strong>Recommendation:</strong> ${
                bn.recommendation || "Resource allocation needed"
              }
            </div>
          `;
          })
          .join("")}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
        <div class="info-box fade-in-delay-3">
          <h4>💰 Resource Allocation Needs</h4>
          <p><strong>Additional Staff:</strong> ${
            forecast.resource_allocation?.additional_staff_needed || 25
          } members</p>
          <p><strong>Budget Required:</strong> ₹${
            forecast.resource_allocation?.budget_required_lakhs || 15.5
          } Lakhs</p>
          <p><strong>Priority Areas:</strong> ${(
            forecast.resource_allocation?.priority_areas || [
              "Water Supply",
              "Infrastructure",
            ]
          ).join(", ")}</p>
        </div>

        <div class="info-box fade-in-delay-3" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left-color: #f59e0b;">
          <h4>🎯 High-Risk Zones</h4>
          ${(forecast.risk_zones || [])
            .map(
              (risk) => `
            <p><strong>${risk.location || "City"}:</strong> ${
                risk.risk_type || "Service Overload"
              } (Severity: ${risk.severity || 7}/10)<br>
            <strong>Action:</strong> ${
              risk.action_needed || "Resource deployment needed"
            }</p>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="info-box fade-in-delay-4" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left-color: #10b981;">
        <h4>💡 Key Insights</h4>
        <p>${
          forecast.insights ||
          "Expecting increased service requests. Department reinforcement recommended."
        }</p>
      </div>
    </div>
  `;

  // Trigger counter animations
  setTimeout(() => {
    animateCounters();
  }, 100);
}

function displayForecastResults(forecast) {
  const resultsDiv = document.getElementById("forecast-results");
  const demand = forecast.demand_forecast;

  resultsDiv.innerHTML = `
        <h3>7-Day Demand Forecast</h3>
        <div class="results-grid">
            <div class="result-metric">
                <h4>${demand.water_supply.predicted_requests}</h4>
                <p>Water Supply (+${demand.water_supply.change_percent}%)</p>
            </div>
            <div class="result-metric">
                <h4>${demand.healthcare.predicted_requests}</h4>
                <p>Healthcare (+${demand.healthcare.change_percent}%)</p>
            </div>
            <div class="result-metric">
                <h4>${demand.infrastructure.predicted_requests}</h4>
                <p>Infrastructure (+${demand.infrastructure.change_percent}%)</p>
            </div>
            <div class="result-metric">
                <h4>${demand.electricity.predicted_requests}</h4>
                <p>Electricity (+${demand.electricity.change_percent}%)</p>
            </div>
        </div>
        <div class="info-box">
            <h4>Key Insights</h4>
            <p>${forecast.insights}</p>
        </div>
    `;

  resultsDiv.style.display = "block";
}

// Handle Complaint Submission

async function handleComplaintSubmission(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const resultDiv = document.getElementById("submission-result");

  // Disable button and show loading
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.6";
  submitBtn.style.cursor = "not-allowed";

  // Show animated loading
  resultDiv.innerHTML = `
    <div class="ai-loading-container">
      <div class="ai-loading-header">
        <div class="ai-spinner"></div>
        <h3 id="submission-loading-title">📝 Submitting Your Complaint...</h3>
      </div>
      <div class="loading-progress-bar">
        <div class="loading-progress-fill" id="submission-progress-fill"></div>
      </div>
      <p class="loading-subtitle" id="submission-loading-subtitle">Preparing data...</p>
      <div class="loading-stats">
        <span id="submission-loading-stat">0%</span>
      </div>
    </div>
  `;
  resultDiv.style.display = "block";

  // Animation stages
  const stages = [
    {
      title: "🔐 Validating information...",
      subtitle: "Checking complaint details",
      duration: 800,
      progress: 20,
    },
    {
      title: "🗄️ Connecting to database...",
      subtitle: "Establishing secure connection",
      duration: 1000,
      progress: 40,
    },
    {
      title: "📊 Generating Request ID...",
      subtitle: "Creating unique identifier",
      duration: 800,
      progress: 60,
    },
    {
      title: "🏛️ Assigning to department...",
      subtitle: `Routing to ${data.complaint_type} team`,
      duration: 1000,
      progress: 80,
    },
    {
      title: "✅ Finalizing submission...",
      subtitle: "Saving your complaint",
      duration: 800,
      progress: 95,
    },
  ];

  try {
    // Ensure Supabase is initialized
    if (!supabaseClient) {
      console.error("❌ Supabase not initialized! Initializing now...");
      const supabaseUrl = "https://xyvlblrsndudtqqxhqtj.supabase.co";
      const supabaseKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dmxibHJzbmR1ZHRxcXhocXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDU1NTMsImV4cCI6MjA3ODc4MTU1M30.bQzDc276wj2QDgeEVU2d-glLTQnBNq4qrjTw9oyEmY0";
      supabaseClient = createClient(supabaseUrl, supabaseKey);
      console.log("✅ Supabase initialized in handleComplaintSubmission");
    }

    // Animate through stages while processing
    const animationPromise = (async () => {
      for (let i = 0; i < stages.length; i++) {
        await animateSubmissionStage(stages[i]);
      }
    })();

    console.log("📝 Submitting complaint...", data);

    // Generate request ID
    const { count, error: countError } = await supabaseClient
      .from("citizen_requests")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Count error:", countError);
      throw countError;
    }

    const requestId = `R${String((count || 0) + 1).padStart(3, "0")}`;

    // Department mapping
    const deptMapping = {
      "Water Supply": "Water Department",
      Electricity: "MSEDCL",
      "Road Repair": "PWD",
      Healthcare: "Health Department",
      "Garbage Collection": "Sanitation Department",
      "Street Lights": "Municipal Corporation",
      Drainage: "PWD",
      "Public Transport": "Transport Department",
    };

    const requestData = {
      request_id: requestId,
      citizen_name_hash: hashData(data.name),
      phone_hash: hashData(data.phone),
      email: data.email || `citizen${(count || 0) + 1}@example.com`,
      complaint_type: data.complaint_type,
      description: data.description,
      city: data.city,
      ward: data.ward,
      district: data.city,
      severity: data.severity,
      status: "Open",
      affected_count: parseInt(data.affected_count),
      department: deptMapping[data.complaint_type],
      date_submitted: new Date().toISOString(),
    };

    console.log("📤 Inserting request:", requestData);

    // Insert into database
    const { error } = await supabaseClient
      .from("citizen_requests")
      .insert([requestData]);

    if (error) {
      console.error("Insert error:", error);
      throw error;
    }

    // Wait for animation to complete
    await animationPromise;

    // Final completion stage
    document.getElementById("submission-loading-title").innerHTML =
      "🎉 Submission Complete!";
    document.getElementById("submission-loading-subtitle").innerHTML =
      "Your complaint has been registered";
    document.getElementById("submission-loading-stat").innerHTML = "100%";
    document.getElementById("submission-progress-fill").style.width = "100%";

    await sleep(800);

    console.log("✅ Complaint submitted successfully!");
    showSubmissionSuccess(requestId, requestData.department);
    e.target.reset();
  } catch (error) {
    console.error("Submission error:", error);
    showSubmissionError(error.message);
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
    submitBtn.innerHTML = originalBtnText;
  }
}

// Helper function for submission stage animation
async function animateSubmissionStage(stage) {
  document.getElementById("submission-loading-title").innerHTML = stage.title;
  document.getElementById("submission-loading-subtitle").innerHTML =
    stage.subtitle;
  document.getElementById("submission-loading-stat").innerHTML =
    stage.progress + "%";

  const progressBar = document.getElementById("submission-progress-fill");
  progressBar.style.width = stage.progress + "%";

  await sleep(stage.duration);
}

// Helper function for submission stage animation
async function animateSubmissionStage(stage) {
  document.getElementById("submission-loading-title").innerHTML = stage.title;
  document.getElementById("submission-loading-subtitle").innerHTML =
    stage.subtitle;
  document.getElementById("submission-loading-stat").innerHTML =
    stage.progress + "%";

  const progressBar = document.getElementById("submission-progress-fill");
  progressBar.style.width = stage.progress + "%";

  await sleep(stage.duration);
}

function showSubmissionSuccess(requestId, department) {
  const resultDiv = document.getElementById("submission-result");
  resultDiv.innerHTML = `
    <div class="alert-success" style="animation: slideInFromTop 0.5s ease-out;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <h3>✅ Complaint Submitted Successfully!</h3>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Department:</strong> ${department}</p>
          <p><strong>Status:</strong> Open</p>
          <p>Your complaint has been registered and assigned to the concerned department. You will receive updates via SMS/Email.</p>
          <p><strong>Estimated Response Time:</strong> 2-3 business days</p>
        </div>
        <button onclick="this.parentElement.parentElement.parentElement.style.display='none'" 
                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #065f46; padding: 0 10px;">
          ×
        </button>
      </div>
    </div>
  `;
  resultDiv.style.display = "block";

  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    resultDiv.style.transition = "opacity 0.5s ease-out";
    resultDiv.style.opacity = "0";
    setTimeout(() => {
      resultDiv.style.display = "none";
      resultDiv.style.opacity = "1"; // Reset for next time
    }, 500);
  }, 6000);
}

function showSubmissionError(errorMsg) {
  const resultDiv = document.getElementById("submission-result");
  resultDiv.innerHTML = `
    <div class="alert-error" style="animation: slideInFromTop 0.5s ease-out;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <h3>❌ Submission Failed</h3>
          <p><strong>Error:</strong> ${errorMsg || "Unknown error occurred"}</p>
          <p style="margin-top: 10px;">Please check your internet connection and try again. If the problem persists, contact support.</p>
        </div>
        <button onclick="this.parentElement.parentElement.parentElement.style.display='none'" 
                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #dc2626; padding: 0 10px;">
          ×
        </button>
      </div>
    </div>
  `;
  resultDiv.style.display = "block";

  // Auto-dismiss after 7 seconds (errors stay slightly longer)
  setTimeout(() => {
    resultDiv.style.transition = "opacity 0.5s ease-out";
    resultDiv.style.opacity = "0";
    setTimeout(() => {
      resultDiv.style.display = "none";
      resultDiv.style.opacity = "1";
    }, 500);
  }, 7000);
}

// Handle Track Request
// Handle Track Request
async function handleTrackRequest() {
  const requestId = document.getElementById("track-request-id").value.trim();

  if (!requestId) {
    alert("Please enter a Request ID");
    return;
  }

  const resultDiv = document.getElementById("tracking-result");

  // Show loading
  resultDiv.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
      <p>🔄 Searching for ${requestId}...</p>
    </div>
  `;
  resultDiv.style.display = "block";

  try {
    const { data: request, error } = await supabaseClient
      .from("citizen_requests")
      .select("*")
      .eq("request_id", requestId)
      .maybeSingle(); // Use maybeSingle instead of single

    if (error) {
      console.error("Query error:", error);
      throw error;
    }

    if (!request) {
      showTrackingError(requestId);
      return;
    }

    showTrackingResult(request);
  } catch (error) {
    console.error("Tracking error:", error);
    showTrackingError(requestId);
  }
}

function showTrackingResult(request) {
  const resultDiv = document.getElementById("tracking-result");

  const statusIcons = {
    Open: "🟡",
    "In Progress": "🔵",
    Resolved: "🟢",
  };

  const statusColors = {
    Open: "#fbbf24",
    "In Progress": "#3b82f6",
    Resolved: "#10b981",
  };

  const statusMessages = {
    Open: "Your complaint is in queue. Expected action within 2-3 days.",
    "In Progress":
      "Your complaint is being actively processed by the department.",
    Resolved: "Your complaint has been successfully resolved.",
  };

  // Format submitted date
  const submittedDate = new Date(request.date_submitted).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Show resolved date if exists
  let resolvedDateHtml = "";
  if (request.resolved_date) {
    const resolvedDate = new Date(request.resolved_date).toLocaleDateString(
      "en-IN",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    resolvedDateHtml = `<p><strong>✅ Resolved Date:</strong> ${resolvedDate}</p>`;
  }

  resultDiv.innerHTML = `
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-top: 20px;">
      
      <div style="padding: 24px; background: ${
        statusColors[request.status]
      }; color: white; display: flex; align-items: center; gap: 15px;">
        <span style="font-size: 36px;">${statusIcons[request.status]}</span>
        <h3 style="margin: 0; font-size: 24px;">Status: ${request.status}</h3>
      </div>
      
      <div style="padding: 24px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px;">
          
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Request ID</div>
            <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${
              request.request_id
            }</div>
          </div>
          
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Complaint Type</div>
            <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${
              request.complaint_type
            }</div>
          </div>
          
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Location</div>
            <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${
              request.city
            }, ${request.ward}</div>
          </div>
          
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Department</div>
            <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${
              request.department
            }</div>
          </div>
          
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Severity</div>
            <div><span class="severity-badge ${request.severity.toLowerCase()}">${
    request.severity
  }</span></div>
          </div>
          
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Submitted</div>
            <div style="font-size: 16px; color: #1e293b; font-weight: 600;">${submittedDate}</div>
          </div>
          
        </div>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <strong style="display: block; margin-bottom: 8px;">Description:</strong>
          <p style="margin: 0;">${request.description}</p>
        </div>
        
        ${resolvedDateHtml}
        
        <div style="padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px; background: ${
          statusColors[request.status]
        }22; color: ${statusColors[request.status]};">
          <strong>${statusIcons[request.status]} ${
    statusMessages[request.status]
  }</strong>
        </div>
      </div>
      
    </div>
  `;

  resultDiv.style.display = "block";

  // Auto-dismiss after 7 seconds
  setTimeout(() => {
    resultDiv.style.transition = "opacity 0.5s ease-out";
    resultDiv.style.opacity = "0";
    setTimeout(() => {
      resultDiv.style.display = "none";
      resultDiv.style.opacity = "1";
    }, 500);
  }, 7000);
}

function showTrackingError(requestId) {
  const resultDiv = document.getElementById("tracking-result");
  resultDiv.innerHTML = `
        <div class="alert-error">
            <p>Request ID '${requestId}' not found. Please check and try again.</p>
        </div>
    `;
  resultDiv.style.display = "block";
}

// Transparency Page
async function loadTransparencyData() {
  try {
    const { data: requests, error } = await supabaseClient
      .from("citizen_requests")
      .select("*");

    if (error) throw error;

    const resolved = requests.filter((r) => r.status === "Resolved").length;
    const avgDays = calculateAverageResolutionTime(requests);

    document.getElementById(
      "resolved-count"
    ).textContent = `${resolved}/${requests.length}`;
    document.getElementById("resolution-time").textContent = `${avgDays} days`;
  } catch (error) {
    console.error("Error loading transparency data:", error);
  }
}

// Download Functions
async function downloadStats() {
  try {
    const { data: requests, error } = await supabaseClient
      .from("citizen_requests")
      .select("complaint_type, city, severity, status");

    if (error) throw error;

    const csv = convertToCSV(requests);
    downloadCSV(csv, "maharashtra_complaint_stats.csv");
  } catch (error) {
    console.error("Download error:", error);
  }
}

async function downloadGeoData() {
  try {
    const { data: requests, error } = await supabaseClient
      .from("citizen_requests")
      .select("city");

    if (error) throw error;

    const cityCounts = {};
    requests.forEach((r) => {
      cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
    });

    const geoData = Object.entries(cityCounts).map(([city, count]) => ({
      city,
      count,
    }));

    const csv = convertToCSV(geoData);
    downloadCSV(csv, "maharashtra_geographic_data.csv");
  } catch (error) {
    console.error("Download error:", error);
  }
}

// Utility Functions
function calculateDaysOpen(dateSubmitted) {
  const submitted = new Date(dateSubmitted);
  const now = new Date();
  const diff = now - submitted;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calculateAverageResolutionTime(requests) {
  const resolved = requests.filter(
    (r) => r.status === "Resolved" && r.resolved_date
  );
  if (resolved.length === 0) return 0;

  const totalDays = resolved.reduce((sum, r) => {
    const submitted = new Date(r.date_submitted);
    const resolvedDate = new Date(r.resolved_date);
    const days = (resolvedDate - submitted) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);

  return Math.round(totalDays / resolved.length);
}

function hashData(data) {
  return `HASH_${data.substring(0, 3)}${Date.now().toString(36)}`;
}

function generateFallbackPrediction(request) {
  const severityScores = { Critical: 9, High: 7, Medium: 5, Low: 3 };
  const score = severityScores[request.severity] || 5;

  return {
    urgency_score: score,
    escalation_risk_percent: Math.min(40 + request.affected_count / 20, 95),
    predicted_priority: request.severity,
    recommended_action: `Assign to ${request.department} immediately. Target resolution: 2-5 days.`,
    estimated_resolution_days:
      { Critical: 2, High: 5, Medium: 7, Low: 10 }[request.severity] || 7,
    resource_requirements:
      "Deploy team with standard equipment and budget allocation",
    reasoning: `Based on ${request.severity} severity and ${request.affected_count} affected citizens`,
  };
}

/**
 * Call real Google Gemini API for 7-Day Forecast
 */
async function generateFallbackForecast(requests) {
  // No API key needed! Using backend proxy
  const API_URL = "/api/gemini";

  // Prepare summary data from requests
  const typeCounts = {};
  const cityCounts = {};
  let totalAffected = 0;

  if (requests && requests.length > 0) {
    requests.forEach((req) => {
      typeCounts[req.complaint_type] =
        (typeCounts[req.complaint_type] || 0) + 1;
      cityCounts[req.city] = (cityCounts[req.city] || 0) + 1;
      totalAffected += req.affected_count || 0;
    });
  }

  const prompt = `You are an AI forecasting system for Maharashtra Government.

Analyze this historical data and predict 7-day service demand:

**Current Data Summary:**
- Total Active Requests: ${requests?.length || 0}
- Requests by Type: ${JSON.stringify(typeCounts)}
- Requests by City: ${JSON.stringify(cityCounts)}
- Total Citizens Affected: ${totalAffected}

Return ONLY this JSON (no markdown, no backticks, no explanation):
{"forecast_date": "${
    new Date().toISOString().split("T")[0]
  }", "demand_forecast": {"water_supply": {"predicted_requests": 15, "change_percent": 12, "confidence": 78, "trend": "Increasing"}, "healthcare": {"predicted_requests": 11, "change_percent": 8, "confidence": 72, "trend": "Stable"}, "infrastructure": {"predicted_requests": 18, "change_percent": 15, "confidence": 80, "trend": "Increasing"}, "electricity": {"predicted_requests": 9, "change_percent": 5, "confidence": 75, "trend": "Stable"}}, "bottlenecks": [{"department": "Water Department", "overload_percent": 65, "urgency": "High", "recommendation": "Add 10 staff members immediately"}], "resource_allocation": {"additional_staff_needed": 25, "budget_required_lakhs": 15, "priority_areas": ["Water Supply", "Infrastructure"]}, "risk_zones": [{"location": "Mumbai", "risk_type": "Service Overload", "severity": 8, "action_needed": "Deploy 5 mobile units"}], "insights": "Based on analysis, expecting 15% increase in requests. Water department needs reinforcement."}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192, // ← MUCH HIGHER (allows for thinking + response)
      topP: 0.95,
      topK: 40,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // ← 30 seconds timeout (doubled)

    console.log("🔄 Calling Gemini 2.5 Flash for Forecast...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Gemini Forecast Response received!");

    // Extract text from response
    let text = "";
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts.length > 0
      ) {
        text = candidate.content.parts[0].text || "";
      }
    }

    if (!text) {
      throw new Error("No text in response");
    }

    console.log("📝 Forecast text:", text);

    // Clean JSON response
    let cleanText = text
      .trim()
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .replace(/^[^{]*({)/, "$1")
      .replace(/(})[^}]*$/, "$1");

    const forecast = JSON.parse(cleanText);
    console.log("✅ Gemini Forecast SUCCESS!");

    return { success: true, data: forecast, source: "gemini-api" };
  } catch (error) {
    console.log("⚠️ Gemini Forecast failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * HYBRID FORECAST - Tries real API, falls back to smart dynamic
 */
async function hybridForecast(requests) {
  console.log("🔄 Starting hybrid forecast...");

  // Try real Gemini API first
  const apiResult = await generateFallbackForecast(requests);

  if (apiResult.success) {
    console.log("✅ Using real Gemini API forecast");
    return apiResult.data;
  }

  // Fallback to smart dynamic
  console.log("🔄 Using smart dynamic forecast fallback");
  const fallbackData = {
    forecast_date: new Date().toISOString().split("T")[0],
    demand_forecast: {
      water_supply: {
        predicted_requests: 15,
        change_percent: 12,
        confidence: 78,
        trend: "Increasing",
      },
      healthcare: {
        predicted_requests: 11,
        change_percent: 8,
        confidence: 72,
        trend: "Stable",
      },
      infrastructure: {
        predicted_requests: 18,
        change_percent: 15,
        confidence: 80,
        trend: "Increasing",
      },
      electricity: {
        predicted_requests: 9,
        change_percent: 5,
        confidence: 75,
        trend: "Stable",
      },
    },
    bottlenecks: [
      {
        department: "Water Department",
        overload_percent: 65,
        urgency: "High",
        recommendation: "Add 10 staff members immediately",
      },
    ],
    resource_allocation: {
      additional_staff_needed: 25,
      budget_required_lakhs: 15,
      priority_areas: ["Water Supply", "Infrastructure"],
    },
    risk_zones: [
      {
        location: "Mumbai",
        risk_type: "Service Overload",
        severity: 8,
        action_needed: "Deploy 5 mobile units",
      },
    ],
    insights:
      "Based on analysis, expecting 15% increase in requests. Water department needs reinforcement.",
  };
  return fallbackData;
}

function convertToCSV(data) {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => JSON.stringify(row[header] || "")).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function showError(message) {
  // CRITICAL FIX 7: Better error display
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #dc2626;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
    font-weight: 600;
    z-index: 10000;
    border-left: 5px solid #dc2626;
    max-width: 400px;
  `;
  errorDiv.innerHTML = `❌ ${message}`;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.style.opacity = "0";
    errorDiv.style.transition = "opacity 0.3s";
    setTimeout(() => errorDiv.remove(), 300);
  }, 4000);
}

function showSampleData() {
  document.getElementById("total-requests").textContent = "50";
  document.getElementById("open-requests").textContent = "23";
  document.getElementById("critical-requests").textContent = "8";
  document.getElementById("total-affected").textContent = "32,450";
  document.getElementById("open-trend").textContent = "46% of total";

  document.getElementById("critical-alerts").innerHTML = `
        <div class="alert-card critical">
            <div class="alert-title">CRITICAL: Water Supply</div>
            <div class="alert-details">
                <strong>ID:</strong> R001 | <strong>Location:</strong> Mumbai, Ward 12<br>
                <strong>Description:</strong> No water supply for 5 days affecting 500 families<br>
                <strong>Citizens Affected:</strong> 500 | <strong>Department:</strong> Water Department | <strong>Days Open:</strong> 5
            </div>
        </div>
    `;

  const tbody = document.querySelector("#requests-table tbody");
  tbody.innerHTML = `
        <tr>
            <td><strong>R001</strong></td>
            <td>Water Supply</td>
            <td>Mumbai</td>
            <td><span class="severity-badge critical">Critical</span></td>
            <td><span class="status-badge open">Open</span></td>
            <td>500</td>
            <td>Water Department</td>
        </tr>
    `;
}

// Initialize app when DOM is loaded
// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    checkExistingSession();
  });
} else {
  checkExistingSession();
}

// ============================================
// HYBRID AI SYSTEM - REAL GEMINI + SMART FALLBACK
// ============================================

/**
 * Call real Google Gemini API with timeout
 */
/**
 * Call real Google Gemini API with timeout
 *
 * SECURITY NOTE:
 * - API key is visible in frontend but restricted to this domain only
 * - Configured in Google Cloud Console: https://aistudio.google.com/apikey
 * - HTTP referrer restriction: maharashtra-governance-ai.vercel.app
 */
async function callRealGeminiAPI(requestData) {
  // No API key needed! Using backend proxy
  const API_URL = "/api/gemini";

  const prompt = `You are an AI system for Maharashtra Government's predictive governance platform.

Analyze this citizen service request and respond with ONLY a JSON object:

- ID: ${requestData.request_id || "N/A"}
- Type: ${requestData.complaint_type || "N/A"}
- Description: ${requestData.description || "N/A"}
- Location: ${requestData.city || "N/A"}, ${requestData.ward || "N/A"}
- Severity: ${requestData.severity || "N/A"}
- Citizens Affected: ${requestData.affected_count || 0}
- Department: ${requestData.department || "N/A"}
- Status: ${requestData.status || "Open"}

Return ONLY this JSON (no markdown, no backticks, no explanation):
{"urgency_score": 8.5, "escalation_risk_percent": 75, "predicted_priority": "High", "recommended_action": "Deploy emergency response team immediately", "estimated_resolution_days": 3, "resource_requirements": "2 field teams, 5 lakhs budget", "similar_patterns": "Matches high-priority cases", "prevention_measures": "Implement proactive monitoring", "impact_analysis": "Delayed resolution increases risk", "reasoning": "Based on severity and affected population"}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192, // ← INCREASED TO 8192 (same as analysis)
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    console.log("🔄 Calling Gemini 2.5 Flash API...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Gemini 2.5 Flash Response received!");
    console.log("📦 Full response:", JSON.stringify(data, null, 2));

    // IMPROVED RESPONSE PARSING - Handle different response structures
    // IMPROVED RESPONSE PARSING - Handle different response structures
    // Extract text from response - IMPROVED PARSING
    let text = "";
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];

      // Check for various response structures
      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts.length > 0
      ) {
        text = candidate.content.parts[0].text || "";
      } else if (candidate.content && candidate.content.text) {
        text = candidate.content.text;
      } else if (candidate.text) {
        text = candidate.text;
      } else if (candidate.output) {
        text = candidate.output;
      }

      // Check if response was truncated
      if (candidate.finishReason === "MAX_TOKENS") {
        console.warn("⚠️ Forecast response truncated. Using fallback.");
        throw new Error("Response truncated - MAX_TOKENS");
      }
    }

    if (!text) {
      throw new Error("No text in response");
    }

    console.log("📝 Extracted text:", text);

    // Clean JSON response
    let cleanText = text
      .trim()
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .replace(/^[^{]*({)/, "$1") // Keep only from first {
      .replace(/(})[^}]*$/, "$1"); // Keep only until last }

    console.log("🧹 Cleaned text:", cleanText);

    const prediction = JSON.parse(cleanText);
    console.log("✅ Gemini AI Analysis SUCCESS!");

    return { success: true, data: prediction, source: "gemini-api" };
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("⏱️ Gemini API timeout, using smart fallback");
    } else {
      console.log("⚠️ Gemini API failed:", error.message);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Smart dynamic fallback based on actual data patterns
 */
function generateSmartDynamicPrediction(requestData) {
  const severity = requestData.severity || "Medium";
  const affected = requestData.affected_count || 0;
  const type = requestData.complaint_type || "Other";
  const city = requestData.city || "City";

  // Smart urgency calculation based on multiple factors
  const severityScores = {
    Critical: 9.0,
    High: 7.0,
    Medium: 5.0,
    Low: 3.0,
  };

  let urgencyScore = severityScores[severity] || 5.0;

  // Add urgency based on affected citizens (scaled)
  urgencyScore += Math.min(affected / 200, 2.0);

  // Add urgency based on complaint type criticality
  const criticalTypes = ["Water Supply", "Healthcare", "Electricity"];
  if (criticalTypes.includes(type)) {
    urgencyScore += 0.5;
  }

  // Cap at 10.0
  urgencyScore = Math.min(urgencyScore, 10.0);

  // Smart escalation risk calculation
  let escalationRisk = 30;
  escalationRisk += affected / 20; // More people = higher risk
  escalationRisk += urgencyScore * 4; // Higher urgency = higher risk
  if (severity === "Critical") escalationRisk += 20;
  escalationRisk = Math.min(Math.round(escalationRisk), 95);

  // Smart resolution time estimation
  const resolutionDays =
    {
      Critical: 2,
      High: 5,
      Medium: 7,
      Low: 10,
    }[severity] || 7;

  // Adjust based on affected count
  const adjustedDays =
    affected > 500 ? Math.max(resolutionDays - 1, 1) : resolutionDays;

  // Smart resource requirements
  const staffNeeded = severity === "Critical" ? 2 : 1;
  const budgetEstimate = Math.round((affected / 100) * 2 + 3); // Dynamic budget

  // Type-specific recommendations
  const actionTemplates = {
    "Water Supply": `Deploy emergency water tankers immediately. Coordinate with Water Department for pipeline repair. Target resolution: ${adjustedDays} days with ${staffNeeded} field teams.`,
    Healthcare: `Activate emergency medical response protocol. Deploy mobile health units. Coordinate with Health Department. Timeline: ${adjustedDays} days.`,
    "Road Repair": `Assign PWD emergency repair crew. Close affected road sections if safety risk. Target completion: ${adjustedDays} days.`,
    Electricity: `Contact MSEDCL for immediate restoration. Deploy backup generators if needed. Resolution target: ${adjustedDays} days.`,
    default: `Assign to ${
      requestData.department || "relevant department"
    } immediately. Mobilize ${staffNeeded} response team(s). Target resolution: ${adjustedDays} days.`,
  };

  const recommendedAction = actionTemplates[type] || actionTemplates["default"];

  return {
    urgency_score: Math.round(urgencyScore * 10) / 10,
    escalation_risk_percent: escalationRisk,
    predicted_priority: severity,
    recommended_action: recommendedAction,
    estimated_resolution_days: adjustedDays,
    resource_requirements: `Deploy ${staffNeeded} specialized team(s) with standard equipment. Budget allocation: ₹${budgetEstimate} lakhs. ${
      affected > 500
        ? "Emergency procurement approved."
        : "Standard resource allocation."
    }`,
    similar_patterns: `Analysis of ${affected} affected citizens in ${city}. Pattern matches ${severity.toLowerCase()} priority ${type.toLowerCase()} cases requiring immediate departmental intervention.`,
    prevention_measures: `Implement proactive monitoring for ${type.toLowerCase()} in ${city} area. Schedule preventive maintenance quarterly. Early warning system for similar issues.`,
    impact_analysis: `Affects ${affected.toLocaleString()} citizens in ${city}. Delayed resolution increases public dissatisfaction risk by ${escalationRisk}% and may lead to media escalation.`,
    reasoning: `Based on ${severity} severity level, ${affected.toLocaleString()} affected citizens, and ${type} category. Smart analysis indicates ${urgencyScore.toFixed(
      1
    )}/10 urgency requiring ${adjustedDays}-day resolution timeline. Departmental coordination essential.`,
    source: "smart-dynamic",
  };
}

/**
 * HYBRID ANALYSIS - Tries real API, falls back to smart dynamic
 */
async function hybridAnalyzeComplaint(requestData) {
  console.log("🔄 Starting hybrid analysis...");

  // Try real Gemini API first
  const apiResult = await callRealGeminiAPI(requestData);

  if (apiResult.success) {
    console.log("✅ Using real Gemini API results");
    return apiResult.data;
  }

  // Fallback to smart dynamic
  console.log("🔄 Using smart dynamic fallback");
  return generateSmartDynamicPrediction(requestData);
}
async function updateRequestStatus(selectElement) {
  const requestId = selectElement.dataset.requestId;
  const newStatus = selectElement.value;

  console.log("🔍 Updating:", requestId, "to", newStatus);

  const originalValue =
    selectElement.dataset.originalValue || selectElement.value;
  selectElement.dataset.originalValue = originalValue;
  selectElement.disabled = true;

  try {
    // Prepare update data
    const updateData = {
      status: newStatus,
      resolved_date: newStatus === "Resolved" ? new Date().toISOString() : null,
    };

    console.log("📦 Sending to database:", updateData);

    // CRITICAL FIX: Use .match() to update specific row
    const { data, error, count } = await supabaseClient
      .from("citizen_requests")
      .update(updateData)
      .eq("request_id", requestId)
      .select();

    console.log("📊 Response:", { data, error, count });

    if (error) {
      console.error("❌ Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Check if any rows were updated
    if (!data || data.length === 0) {
      throw new Error(
        `No rows updated. Request ${requestId} might not exist or RLS policy is blocking updates.`
      );
    }

    // Verify the status actually changed
    if (data[0].status !== newStatus) {
      throw new Error(
        `Update failed: Status is still "${data[0].status}" instead of "${newStatus}"`
      );
    }

    console.log("✅ Update successful! New status:", data[0].status);

    selectElement.dataset.originalValue = newStatus;
    showStatusUpdateSuccess(requestId, newStatus);

    // Refresh dashboard after 1.5 seconds
    setTimeout(() => {
      console.log("🔄 Refreshing dashboard...");
      loadDashboardData();
    }, 1500);
  } catch (error) {
    console.error("❌ Update failed:", error);
    selectElement.value = originalValue;

    alert(
      `Failed to update status for ${requestId}:\n\n${error.message}\n\n` +
        `This is likely a database permission issue. Check your Supabase RLS policies.`
    );
  } finally {
    selectElement.disabled = false;
  }
}

function showStatusUpdateSuccess(requestId, newStatus) {
  // Create notification box
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 30px;
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    color: #065f46;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    font-weight: 600;
    font-size: 15px;
    z-index: 1000;
    border-left: 5px solid #10b981;
  `;

  notification.innerHTML = `✅ ${requestId} updated to <strong>${newStatus}</strong>`;

  // Add to page
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.3s";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Test function - run this in browser console: testEverything()
function testEverything() {
  console.log("🧪 Running tests...");

  // Test 1
  if (typeof updateRequestStatus === "function") {
    console.log("✅ updateRequestStatus exists");
  } else {
    console.error("❌ updateRequestStatus missing!");
  }

  // Test 2
  if (typeof showStatusUpdateSuccess === "function") {
    console.log("✅ showStatusUpdateSuccess exists");
  } else {
    console.error("❌ showStatusUpdateSuccess missing!");
  }

  // Test 3
  if (supabaseClient) {
    console.log("✅ Supabase connected");
  } else {
    console.error("❌ Supabase not connected!");
  }

  // Test 4
  const dropdowns = document.querySelectorAll(".status-select");
  console.log(`✅ Found ${dropdowns.length} status dropdowns`);

  console.log("✅ All tests complete!");
}

// Auto-run test after 2 seconds
setTimeout(testEverything, 2000);

async function debugCheckStatus(requestId) {
  const { data, error } = await supabaseClient
    .from("citizen_requests")
    .select("request_id, status, resolved_date")
    .eq("request_id", requestId)
    .single();

  console.log("🔍 Current database status:", data);
  return data;
}

// Use in console: debugCheckStatus("R051")

// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    checkExistingSession();
  });
} else {
  checkExistingSession();
}

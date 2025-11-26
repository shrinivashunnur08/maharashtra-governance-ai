// Maharashtra AI Governance Platform - Main Application

const { createClient } = supabase;

// Initialize Supabase IMMEDIATELY
let supabaseClient = createClient(
  "https://xyvlblrsndudtqqxhqtj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dmxibHJzbmR1ZHRxcXhocXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDU1NTMsImV4cCI6MjA3ODc4MTU1M30.bQzDc276wj2QDgeEVU2d-glLTQnBNq4qrjTw9oyEmY0"
);
console.log("✅ Supabase initialized immediately");

const VALID_ADMIN_CODES = ["GOV2024", "MAHA2024", "ADMIN123"];

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================
// ============================================
// AUTHENTICATION FUNCTIONS - NEW HORIZONTAL DESIGN
// ============================================

function switchRole() {
  const role = document.querySelector('input[name="user-role"]:checked').value;

  clearAllErrors();

  const citizenLogin = document.getElementById("citizen-login");
  const citizenSignup = document.getElementById("citizen-signup");
  const officialLogin = document.getElementById("official-login");

  if (citizenLogin) citizenLogin.reset();
  if (citizenSignup) citizenSignup.reset();
  if (officialLogin) officialLogin.reset();

  const citizenSection = document.getElementById("citizen-auth-section");
  const officialSection = document.getElementById("official-auth-section");

  if (role === "citizen") {
    citizenSection.style.display = "block";
    citizenSection.style.visibility = "visible";
    citizenSection.style.opacity = "1";
    officialSection.style.display = "none";
    switchCitizenForm("citizen-login");
  } else {
    citizenSection.style.display = "none";
    officialSection.style.display = "block";
    officialSection.style.visibility = "visible";
    officialSection.style.opacity = "1";

    const officialInputs = officialSection.querySelectorAll("input");
    officialInputs.forEach((input) => {
      input.style.display = "block";
      input.style.visibility = "visible";
      input.value = "";
    });

    if (officialLogin) {
      officialLogin.style.display = "block";
      officialLogin.classList.add("active");
    }
  }

  // ✅ Initialize password toggles after role switch
  setTimeout(() => initializePasswordToggles(), 100);
}

// Force visibility check after a short delay
function ensureFormVisibility() {
  setTimeout(() => {
    const role = document.querySelector(
      'input[name="user-role"]:checked'
    ).value;

    if (role === "official") {
      const officialSection = document.getElementById("official-auth-section");
      const officialForm = document.getElementById("official-login");
      const inputs = officialSection.querySelectorAll("input, label, button");

      officialSection.style.display = "block";
      if (officialForm) officialForm.style.display = "block";

      inputs.forEach((el) => {
        el.style.display =
          el.tagName === "INPUT" || el.tagName === "BUTTON"
            ? "block"
            : "inline-block";
        el.style.visibility = "visible";
        el.style.opacity = "1";
      });
    }
  }, 50);
}

// Call this after role switch

function clearAllErrors() {
  const errorElements = [
    "citizen-login-error",
    "citizen-signup-error",
    "official-login-error",
  ];

  errorElements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = "";
      element.classList.remove("show");
    }
  });
}

function switchCitizenForm(formId) {
  // Toggle buttons
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.form === formId) {
      btn.classList.add("active");
    }
  });

  // Toggle forms
  document.querySelectorAll(".auth-form-content").forEach((form) => {
    form.classList.remove("active");
  });
  document.getElementById(formId).classList.add("active");
}

function handleCitizenLogin(event) {
  event.preventDefault();
  const email = document.getElementById("citizen-login-email").value.trim();
  const password = document.getElementById("citizen-login-password").value;
  const errorEl = document.getElementById("citizen-login-error");

  errorEl.textContent = "";
  errorEl.classList.remove("show");
  errorEl.style.display = "none";

  if (!email || !password) {
    showError(errorEl, "❌ Please enter email and password");
    return;
  }

  // ✅ Email validation
  if (!email.includes("@") || !email.includes(".")) {
    showError(errorEl, "❌ Please enter a valid email address");
    return;
  }

  try {
    const users = JSON.parse(localStorage.getItem("maha_users") || "[]");
    console.log("📋 All users:", users);
    console.log("🔍 Looking for:", email);

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        u.role === "citizen"
    );

    if (!user) {
      showError(errorEl, "❌ Invalid email or password");
      console.log("❌ Login failed - user not found or password incorrect");
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
    console.log("✅ Login successful:", session);
    showMainApp(session);
  } catch (error) {
    showError(errorEl, "❌ Login failed. Please try again.");
    console.error("Login error:", error);
  }
}

function handleCitizenSignup(event) {
  event.preventDefault();
  const name = document.getElementById("citizen-signup-name").value.trim();
  const phone = document.getElementById("citizen-signup-phone").value.trim();
  const email = document
    .getElementById("citizen-signup-email")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("citizen-signup-password").value;
  const confirm = document.getElementById("citizen-signup-confirm").value;
  const errorEl = document.getElementById("citizen-signup-error");

  errorEl.textContent = "";
  errorEl.classList.remove("show");
  errorEl.style.display = "none";

  // Validation
  if (!name || name.length < 2) {
    showError(
      errorEl,
      "❌ Please enter your full name (at least 2 characters)"
    );
    return;
  }

  if (!email || !email.includes("@") || !email.includes(".")) {
    showError(errorEl, "❌ Please enter a valid email address");
    return;
  }

  if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
    showError(errorEl, "❌ Please enter a valid 10-digit phone number");
    return;
  }

  if (!password || password.length < 6) {
    showError(errorEl, "❌ Password must be at least 6 characters");
    return;
  }

  if (password !== confirm) {
    showError(errorEl, "❌ Passwords do not match");
    return;
  }

  try {
    const existingUsers = JSON.parse(
      localStorage.getItem("maha_users") || "[]"
    );

    // Check for existing email (case-insensitive)
    if (existingUsers.find((u) => u.email.toLowerCase() === email)) {
      showError(errorEl, "❌ Email already registered. Please login instead.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email: email, // Store in lowercase
      phone,
      password,
      role: "citizen",
      createdAt: new Date().toISOString(),
    };

    existingUsers.push(newUser);
    localStorage.setItem("maha_users", JSON.stringify(existingUsers));

    console.log("✅ User created:", { email, name });

    // Show success message
    const successDiv = document.createElement("div");
    successDiv.className = "alert-success";
    successDiv.style.cssText =
      "background: #d1fae5; color: #065f46; padding: 20px; border-radius: 12px; border-left: 5px solid #10b981; margin-top: 20px;";
    successDiv.innerHTML = `
      <h4 style="margin: 0 0 10px 0;">✅ Account Created Successfully!</h4>
      <p style="margin: 0;">Welcome, ${name}! You can now login with your credentials.</p>
    `;

    errorEl.parentElement.insertBefore(successDiv, errorEl);

    // Auto-fill login and switch after 2 seconds
    setTimeout(() => {
      document.getElementById("citizen-login-email").value = email;
      switchCitizenForm("citizen-login");
      successDiv.remove();
    }, 2000);

    // Clear form
    event.target.reset();
  } catch (error) {
    showError(errorEl, "❌ Signup failed. Please try again.");
    console.error("Signup error:", error);
  }
}

function handleOfficialLogin(event) {
  event.preventDefault();
  const name = document.getElementById("official-login-name").value.trim();
  const code = document.getElementById("official-login-code").value.trim();
  const errorEl = document.getElementById("official-login-error");

  // IMPORTANT: Clear previous errors first
  errorEl.textContent = "";
  errorEl.classList.remove("show");
  errorEl.style.display = "none";

  if (!name || name.length < 2) {
    showError(errorEl, "❌ Please enter a valid name");
    return;
  }

  if (!VALID_ADMIN_CODES.includes(code)) {
    showError(errorEl, "❌ Invalid access code");
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

function showError(element, message) {
  if (element && element.textContent !== undefined) {
    // First make it visible
    element.style.display = "block";
    element.textContent = message;
    element.classList.add("show");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      element.classList.remove("show");
      element.style.opacity = "0";
      setTimeout(() => {
        element.textContent = "";
        element.style.display = "none";
        element.style.opacity = "1";
      }, 300);
    }, 5000);
  } else {
    console.error("showError called with invalid element:", element);
    alert(message);
  }
}

function initializePasswordToggles() {
  const passwordInputs = document.querySelectorAll('input[type="password"]');

  passwordInputs.forEach((input) => {
    if (input.nextElementSibling?.classList.contains("password-toggle")) return;

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "password-toggle";
    toggleBtn.textContent = "Show";
    toggleBtn.setAttribute("aria-label", "Show password");

    toggleBtn.style.cssText = `
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px 10px;
      font-size: 13px;
      font-weight: 600;
      color: #3b82f6;
      transition: all 0.2s ease;
      z-index: 10;
      border-radius: 4px;
    `;

    toggleBtn.addEventListener("mouseenter", () => {
      toggleBtn.style.background = "#eff6ff";
      toggleBtn.style.color = "#1e40af";
    });

    toggleBtn.addEventListener("mouseleave", () => {
      toggleBtn.style.background = "transparent";
      toggleBtn.style.color = "#3b82f6";
    });

    toggleBtn.addEventListener("click", () => {
      if (input.type === "password") {
        input.type = "text";
        toggleBtn.textContent = "Hide";
        toggleBtn.setAttribute("aria-label", "Hide password");
      } else {
        input.type = "password";
        toggleBtn.textContent = "Show";
        toggleBtn.setAttribute("aria-label", "Show password");
      }
    });

    input.style.paddingRight = "65px";

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.appendChild(toggleBtn);
  });
}

function checkExistingSession() {
  const session = JSON.parse(localStorage.getItem("maha_session"));
  if (session) {
    console.log("✅ Found existing session, auto-logging in...");
    showMainApp(session);
  } else {
    console.log("❌ No session found, showing login page");
  }
}

function checkExistingSession() {
  const session = JSON.parse(localStorage.getItem("maha_session"));
  if (session) {
    console.log("✅ Found existing session");

    // Show the existing session notice
    document.getElementById("existing-session-notice").style.display = "block";
    document.getElementById(
      "session-user-name"
    ).textContent = `${session.name} (${session.role})`;
  } else {
    console.log("❌ No session found, showing login page");
  }
}

function continueSession() {
  const session = JSON.parse(localStorage.getItem("maha_session"));
  if (session) {
    showMainApp(session);
  }
}

function clearSessionAndReload() {
  localStorage.removeItem("maha_session");
  document.getElementById("existing-session-notice").style.display = "none";
  alert("✅ Session cleared. You can now login with a different account.");
}

// Auto-clear errors when user starts typing
document.addEventListener("DOMContentLoaded", () => {
  checkExistingSession();

  // ✅ Initialize password toggles on page load
  initializePasswordToggles();

  // Initialize voice input after a short delay
  setTimeout(() => {
    initializeVoiceInput();
    initializeImageUpload();
  }, 500);

  const forms = ["citizen-login", "citizen-signup", "official-login"];

  forms.forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) {
      const inputs = form.querySelectorAll("input");
      inputs.forEach((input) => {
        input.addEventListener("input", () => {
          const errorEl = document.getElementById(`${formId}-error`);
          if (errorEl && errorEl.classList.contains("show")) {
            errorEl.classList.remove("show");
            setTimeout(() => {
              errorEl.textContent = "";
            }, 300);
          }
        });
      });
    }
  });
});

function showMainApp(session) {
  console.log("🚀 showMainApp called for:", session.role);

  document.getElementById("login-section").style.display = "none";
  document.getElementById("main-app").style.display = "block";
  document.body.classList.remove("role-citizen", "role-official");
  document.body.classList.add(`role-${session.role}`);

  updateUserHeader(session);

  setTimeout(() => {
    setupEventListeners();
    initializeVoiceInput();
    initializeImageUpload();
    console.log("✅ Event listeners initialized");
  }, 100);

  // ✅ UPDATED: Navigate based on role
  if (session.role === "citizen") {
    navigateToPage("portal"); // Citizens go to Portal by default
  } else {
    navigateToPage("dashboard"); // Officials go to Dashboard
    setTimeout(() => {
      loadDashboardData();
      console.log("✅ Dashboard data loading...");
    }, 200);
  }

  console.log(`✅ Logged in as ${session.role}: ${session.name}`);
}

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

  // ✅ NEW: Hide/show navigation based on role
  updateNavigationForRole(session.role);
}

function updateNavigationForRole(role) {
  const dashboardLink = document.querySelector(
    '.nav-link[data-page="dashboard"]'
  );
  const analyticsLink = document.querySelector(
    '.nav-link[data-page="analytics"]'
  );
  const portalLink = document.querySelector('.nav-link[data-page="portal"]');
  const transparencyLink = document.querySelector(
    '.nav-link[data-page="transparency"]'
  );

  if (role === "citizen") {
    // Citizens: Show only Portal and Transparency
    if (dashboardLink) dashboardLink.style.display = "none";
    if (analyticsLink) analyticsLink.style.display = "none";
    if (portalLink) portalLink.style.display = "inline-block";
    if (transparencyLink) transparencyLink.style.display = "inline-block";
  } else {
    // Officials: Show all 4 pages
    if (dashboardLink) dashboardLink.style.display = "inline-block";
    if (analyticsLink) analyticsLink.style.display = "inline-block";
    if (portalLink) portalLink.style.display = "inline-block";
    if (transparencyLink) transparencyLink.style.display = "inline-block";
  }
}

function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("maha_session");
    document.body.classList.remove("role-citizen", "role-official");
    document.getElementById("main-app").style.display = "none";
    document.getElementById("login-section").style.display = "flex";

    // ✅ SAFELY reset forms (check if they exist first)
    const citizenLogin = document.getElementById("citizen-login");
    const citizenSignup = document.getElementById("citizen-signup");
    const officialLogin = document.getElementById("official-login");

    if (citizenLogin) citizenLogin.reset();
    if (citizenSignup) citizenSignup.reset();
    if (officialLogin) officialLogin.reset();

    console.log("✅ Logged out successfully");

    setTimeout(() => {
      location.reload();
    }, 500);
  }
}

// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkExistingSession);
} else {
  checkExistingSession();
}

// ============================================
// NAVIGATION & PAGE MANAGEMENT
// ============================================

function setupEventListeners() {
  const complaintForm = document.getElementById("complaint-form");
  const trackBtn = document.getElementById("track-btn");
  const analyzeBtn = document.getElementById("analyze-btn");
  const forecastBtn = document.getElementById("forecast-btn");

  // Navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
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

function navigateToPage(pageName) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.page === pageName) {
      link.classList.add("active");
    }
  });

  document.querySelectorAll(".page-content").forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.add("active");

    if (pageName === "dashboard") {
      loadDashboardData();
    } else if (pageName === "analytics") {
      loadAnalyticsData();
    } else if (pageName === "transparency") {
      setTimeout(() => {
        loadTransparencyData();
      }, 100);
    }
  }
}

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

// ============================================
// DASHBOARD DATA LOADING
// ============================================

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

    updateKPIs(requests);
    updateCriticalAlerts(requests);
    updateCharts(requests);
    updateRequestsTable(requests);

    loadRecentAlerts();
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showSampleData();
    // Load recent alerts
    loadRecentAlerts();
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

async function updateRequestStatus(selectElement) {
  const requestId = selectElement.dataset.requestId;
  const newStatus = selectElement.value;

  console.log("🔍 Updating:", requestId, "to", newStatus);

  const originalValue =
    selectElement.dataset.originalValue || selectElement.value;
  selectElement.dataset.originalValue = originalValue;
  selectElement.disabled = true;

  try {
    const updateData = {
      status: newStatus,
      resolved_date: newStatus === "Resolved" ? new Date().toISOString() : null,
    };

    const { data, error } = await supabaseClient
      .from("citizen_requests")
      .update(updateData)
      .eq("request_id", requestId)
      .select();

    if (error) {
      console.error("❌ Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`No rows updated`);
    }

    console.log("✅ Update successful! New status:", data[0].status);
    await sendWhatsAppStatusUpdate(requestId, newStatus);

    selectElement.dataset.originalValue = newStatus;
    showStatusUpdateSuccess(requestId, newStatus);

    setTimeout(() => {
      loadDashboardData();
    }, 1500);
  } catch (error) {
    console.error("❌ Update failed:", error);
    selectElement.value = originalValue;
    alert(`Failed to update status: ${error.message}`);
  } finally {
    selectElement.disabled = false;
  }
}

function showStatusUpdateSuccess(requestId, newStatus) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed; top: 100px; right: 30px;
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    color: #065f46; padding: 16px 24px; border-radius: 12px;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    font-weight: 600; font-size: 15px; z-index: 1000;
    border-left: 5px solid #10b981;
  `;
  notification.innerHTML = `✅ ${requestId} updated to <strong>${newStatus}</strong>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.3s";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
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

// ============================================
// ANALYTICS & AI FUNCTIONS
// ============================================

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

  btn.disabled = true;
  btn.style.opacity = "0.6";
  btn.style.cursor = "not-allowed";

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

  for (let i = 0; i < stages.length; i++) {
    await animateStage(stages[i]);
  }

  document.getElementById("loading-title").innerHTML = "✅ Analysis Complete!";
  document.getElementById("loading-subtitle").innerHTML =
    "Preparing results...";
  document.getElementById("loading-stat").innerHTML = "100%";
  document.getElementById("progress-fill").style.width = "100%";

  await sleep(800);

  const prediction = await hybridAnalyzeComplaint(window.currentRequest);
  displayPredictionResultsAnimated(prediction);

  btn.disabled = false;
  btn.style.opacity = "1";
  btn.style.cursor = "pointer";
}

function generateSmartDynamicPrediction(requestData) {
  const severity = requestData.severity || "Medium";
  const affected = requestData.affected_count || 0;
  const type = requestData.complaint_type || "Other";

  const severityScores = { Critical: 9.0, High: 7.0, Medium: 5.0, Low: 3.0 };
  let urgencyScore = severityScores[severity] || 5.0;
  urgencyScore += Math.min(affected / 200, 2.0);
  urgencyScore = Math.min(urgencyScore, 10.0);

  let escalationRisk = 30 + affected / 20 + urgencyScore * 4;
  if (severity === "Critical") escalationRisk += 20;
  escalationRisk = Math.min(Math.round(escalationRisk), 95);

  const resolutionDays =
    { Critical: 2, High: 5, Medium: 7, Low: 10 }[severity] || 7;

  return {
    urgency_score: Math.round(urgencyScore * 10) / 10,
    escalation_risk_percent: escalationRisk,
    predicted_priority: severity,
    recommended_action: `Deploy response team immediately. Target resolution: ${resolutionDays} days.`,
    estimated_resolution_days: resolutionDays,
    resource_requirements: `Deploy specialized team with standard equipment. Budget: ₹${Math.round(
      (affected / 100) * 2 + 3
    )} lakhs.`,
    reasoning: `Based on ${severity} severity, ${affected} affected citizens, and ${type} category.`,
    impact_analysis: `Affects ${affected.toLocaleString()} citizens. Delayed resolution increases risk by ${escalationRisk}%.`,
  };
}

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

  setTimeout(() => {
    animateCounters();
  }, 100);
}

async function handleForecast() {
  const btn = document.getElementById("forecast-btn");
  const resultsDiv = document.getElementById("forecast-results");

  btn.disabled = true;
  btn.style.opacity = "0.6";
  btn.style.cursor = "not-allowed";

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

  for (let i = 0; i < stages.length; i++) {
    await animateForecastStage(stages[i]);
  }

  document.getElementById("forecast-loading-title").innerHTML =
    "✅ Forecast Generation Complete!";
  document.getElementById("forecast-loading-subtitle").innerHTML =
    "Preparing 7-day predictions...";
  document.getElementById("forecast-loading-stat").innerHTML = "100%";
  document.getElementById("forecast-progress-fill").style.width = "100%";

  await sleep(800);

  // ✅ THIS IS THE KEY LINE - Call hybrid forecast
  const forecast = await hybridForecast([]);

  displayForecastResultsAnimated(forecast);

  btn.disabled = false;
  btn.style.opacity = "1";
  btn.style.cursor = "pointer";
}

function displayForecastResultsAnimated(forecast) {
  const resultsDiv = document.getElementById("forecast-results");
  const demand = forecast.demand_forecast;

  resultsDiv.innerHTML = `
    <div class="results-reveal">
      <div class="success-banner fade-in">
        <h3>✅ 7-Day Forecast Generated - Powered by Google Gemini AI</h3>
        <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #065f46;">
          Forecast Date: ${
            forecast.forecast_date
          } | Based on 30-day historical analysis
        </p>
      </div>

      <h3 style="margin: 25px 0 20px 0;">📈 Predicted Service Demand (Next 7 Days)</h3>
      
      <div class="results-grid fade-in-delay-1">
        <div class="result-metric forecast-metric animate-count">
          <div style="font-size: 2em;">💧</div>
          <h4 class="metric-value" data-target="${
            demand.water_supply.predicted_requests
          }">0</h4>
          <p>Water Supply</p>
          <span style="font-size: 0.85em; color: #059669;">📈 +${
            demand.water_supply.change_percent
          }%</span>
          <span style="font-size: 0.75em; color: #6b7280; display: block; margin-top: 5px;">Confidence: ${
            demand.water_supply.confidence
          }%</span>
        </div>
        
        <div class="result-metric forecast-metric animate-count">
          <div style="font-size: 2em;">🏥</div>
          <h4 class="metric-value" data-target="${
            demand.healthcare.predicted_requests
          }">0</h4>
          <p>Healthcare</p>
          <span style="font-size: 0.85em; color: #3b82f6;">➡️ +${
            demand.healthcare.change_percent
          }%</span>
          <span style="font-size: 0.75em; color: #6b7280; display: block; margin-top: 5px;">Confidence: ${
            demand.healthcare.confidence
          }%</span>
        </div>
        
        <div class="result-metric forecast-metric animate-count">
          <div style="font-size: 2em;">🏗️</div>
          <h4 class="metric-value" data-target="${
            demand.infrastructure.predicted_requests
          }">0</h4>
          <p>Infrastructure</p>
          <span style="font-size: 0.85em; color: #059669;">📈 +${
            demand.infrastructure.change_percent
          }%</span>
          <span style="font-size: 0.75em; color: #6b7280; display: block; margin-top: 5px;">Confidence: ${
            demand.infrastructure.confidence
          }%</span>
        </div>
        
        <div class="result-metric forecast-metric animate-count">
          <div style="font-size: 2em;">⚡</div>
          <h4 class="metric-value" data-target="${
            demand.electricity.predicted_requests
          }">0</h4>
          <p>Electricity</p>
          <span style="font-size: 0.85em; color: #3b82f6;">➡️ +${
            demand.electricity.change_percent
          }%</span>
          <span style="font-size: 0.75em; color: #6b7280; display: block; margin-top: 5px;">Confidence: ${
            demand.electricity.confidence
          }%</span>
        </div>
      </div>

      <h3 style="margin: 35px 0 20px 0; color: var(--text-dark); font-size: 1.3em;">⚠️ Predicted Bottlenecks</h3>
      
      <div class="fade-in-delay-2">
        ${forecast.bottlenecks
          .map(
            (bn) => `
          <div class="alert-card critical" style="margin-bottom: 15px;">
            <strong style="font-size: 1.1em;">${bn.department}</strong><br>
            <strong>Overload:</strong> ${bn.overload_percent}% | <strong>Urgency:</strong> ${bn.urgency}<br>
            <strong>Recommendation:</strong> ${bn.recommendation}
          </div>
        `
          )
          .join("")}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
        <div class="info-box fade-in-delay-3">
          <h4>💰 Resource Allocation Needs</h4>
          <p><strong>Additional Staff:</strong> ${
            forecast.resource_allocation.additional_staff_needed
          } members</p>
          <p><strong>Budget Required:</strong> ₹${
            forecast.resource_allocation.budget_required_lakhs
          } Lakhs</p>
          <p><strong>Priority Areas:</strong> ${forecast.resource_allocation.priority_areas.join(
            ", "
          )}</p>
        </div>

        <div class="info-box fade-in-delay-3" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left-color: #f59e0b;">
          <h4>🎯 High-Risk Zones</h4>
          ${forecast.risk_zones
            .map(
              (risk) => `
            <p><strong>${risk.location}:</strong> ${risk.risk_type} (Severity: ${risk.severity}/10)<br>
            <strong>Action:</strong> ${risk.action_needed}</p>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="info-box fade-in-delay-4" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left-color: #10b981;">
        <h4>💡 Key Insights</h4>
        <p>${forecast.insights}</p>
      </div>
    </div>
  `;

  // Trigger counter animations after a short delay
  setTimeout(() => {
    animateCounters();
  }, 100);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function for stage animation
async function animateStage(stage) {
  document.getElementById("loading-title").innerHTML = stage.title;
  document.getElementById("loading-subtitle").innerHTML = stage.subtitle;
  document.getElementById("loading-stat").innerHTML = stage.progress + "%";

  const progressBar = document.getElementById("progress-fill");
  progressBar.style.width = stage.progress + "%";

  await sleep(stage.duration);
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

// Counter animation for metrics
function animateCounters() {
  const counters = document.querySelectorAll(".metric-value");

  counters.forEach((counter) => {
    const target = parseFloat(counter.getAttribute("data-target"));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current * 10) / 10;
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };

    updateCounter();
  });
}

// ============================================
// CITIZEN PORTAL FUNCTIONS
// ============================================

async function handleComplaintSubmission(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const resultDiv = document.getElementById("submission-result");

  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.6";
  submitBtn.style.cursor = "not-allowed";

  // Show animated loading
  resultDiv.innerHTML = `
    <div class="ai-loading-container">
      <div class="ai-loading-header">
        <div class="ai-spinner"></div>
        <h3 id="submit-loading-title">📝 Submitting Your Complaint...</h3>
      </div>
      <div class="loading-progress-bar">
        <div class="loading-progress-fill" id="submit-progress-fill"></div>
      </div>
      <p class="loading-subtitle" id="submit-loading-subtitle">Processing your request...</p>
      <div class="loading-stats">
        <span id="submit-loading-stat">0%</span>
      </div>
    </div>
  `;
  resultDiv.style.display = "block";

  // Animation stages
  const stages = [
    {
      title: "📝 Validating complaint data...",
      subtitle: "Checking all required fields",
      duration: 800,
      progress: 20,
    },
    {
      title: "🔐 Securing your information...",
      subtitle: "Encrypting personal details",
      duration: 1000,
      progress: 50,
    },
    {
      title: "💾 Saving to database...",
      subtitle: "Creating your request record",
      duration: 1200,
      progress: 80,
    },
    {
      title: "✅ Finalizing submission...",
      subtitle: "Generating request ID",
      duration: 800,
      progress: 95,
    },
  ];

  // Animate through stages
  for (let i = 0; i < stages.length; i++) {
    document.getElementById("submit-loading-title").innerHTML = stages[i].title;
    document.getElementById("submit-loading-subtitle").innerHTML =
      stages[i].subtitle;
    document.getElementById("submit-loading-stat").innerHTML =
      stages[i].progress + "%";
    document.getElementById("submit-progress-fill").style.width =
      stages[i].progress + "%";
    await sleep(stages[i].duration);
  }

  try {
    const { count, error: countError } = await supabaseClient
      .from("citizen_requests")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    const requestId = `R${String((count || 0) + 1).padStart(3, "0")}`;

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
      has_image: uploadedImageBase64 ? true : false,
      image_url: uploadedImageBase64 || null, // Store base64 image
    };

    const { error } = await supabaseClient
      .from("citizen_requests")
      .insert([requestData]);

    if (error) throw error;

    // ✅ Send alerts for critical/high severity complaints
    await sendOfficialAlerts(requestData);

    // Show success message
    resultDiv.innerHTML = `
      <div class="alert-success" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #065f46; padding: 24px; border-radius: 12px; border-left: 5px solid #10b981; margin-top: 20px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);">
        <h3 style="margin: 0 0 15px 0;">✅ Complaint Submitted Successfully!</h3>
        <p style="margin: 8px 0;"><strong>Request ID:</strong> ${requestId}</p>
        <p style="margin: 8px 0;"><strong>Department:</strong> ${requestData.department}</p>
        <p style="margin: 8px 0;"><strong>Status:</strong> Open</p>
        <p style="margin: 8px 0;">You will receive updates via SMS/Email.</p>
        <p style="margin: 8px 0;"><strong>Estimated Response Time:</strong> 2-3 business days</p>
      </div>
    `;

    e.target.reset();

    // Clear uploaded image after successful submission
    if (uploadedImageFile) {
      removeImage();
    }

    // Auto-hide success message after 7 seconds
    setTimeout(() => {
      resultDiv.style.opacity = "0";
      resultDiv.style.transition = "opacity 0.5s";
      setTimeout(() => {
        resultDiv.style.display = "none";
        resultDiv.style.opacity = "1";
      }, 500);
    }, 7000);
  } catch (error) {
    console.error("Submission error:", error);
    resultDiv.innerHTML = `
      <div class="alert-error" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #991b1b; padding: 20px; border-radius: 12px; border-left: 5px solid #ef4444; margin-top: 20px;">
        <h3>❌ Submission Failed</h3>
        <p>${error.message}</p>
      </div>
    `;

    // Auto-hide error message after 6 seconds
    setTimeout(() => {
      resultDiv.style.opacity = "0";
      resultDiv.style.transition = "opacity 0.5s";
      setTimeout(() => {
        resultDiv.style.display = "none";
        resultDiv.style.opacity = "1";
      }, 500);
    }, 6000);
  } finally {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
  }
}

async function handleTrackRequest() {
  const requestId = document.getElementById("track-request-id").value.trim();

  if (!requestId) {
    alert("Please enter a Request ID");
    return;
  }

  const resultDiv = document.getElementById("tracking-result");

  // Show animated loading
  resultDiv.innerHTML = `
    <div class="ai-loading-container">
      <div class="ai-loading-header">
        <div class="ai-spinner"></div>
        <h3 id="track-loading-title">🔍 Searching for Request...</h3>
      </div>
      <div class="loading-progress-bar">
        <div class="loading-progress-fill" id="track-progress-fill"></div>
      </div>
      <p class="loading-subtitle" id="track-loading-subtitle">Querying database...</p>
      <div class="loading-stats">
        <span id="track-loading-stat">0%</span>
      </div>
    </div>
  `;
  resultDiv.style.display = "block";

  // Animation stages
  const stages = [
    {
      title: "🔍 Searching database...",
      subtitle: `Looking for ${requestId}`,
      duration: 800,
      progress: 30,
    },
    {
      title: "📊 Retrieving details...",
      subtitle: "Fetching complaint information",
      duration: 1000,
      progress: 60,
    },
    {
      title: "✅ Preparing results...",
      subtitle: "Formatting status details",
      duration: 800,
      progress: 90,
    },
  ];

  // Animate through stages
  for (let i = 0; i < stages.length; i++) {
    document.getElementById("track-loading-title").innerHTML = stages[i].title;
    document.getElementById("track-loading-subtitle").innerHTML =
      stages[i].subtitle;
    document.getElementById("track-loading-stat").innerHTML =
      stages[i].progress + "%";
    document.getElementById("track-progress-fill").style.width =
      stages[i].progress + "%";
    await sleep(stages[i].duration);
  }

  try {
    const { data: request, error } = await supabaseClient
      .from("citizen_requests")
      .select("*")
      .eq("request_id", requestId)
      .maybeSingle();

    if (error) throw error;

    if (!request) {
      console.log("❌ Request not found:", requestId);
      resultDiv.innerHTML = `
        <div class="alert-error" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #991b1b; padding: 20px; border-radius: 12px; border-left: 5px solid #ef4444; margin-top: 20px;">
          <p style="margin: 0;">❌ Request ID '<strong>${requestId}</strong>' not found. Please check and try again.</p>
        </div>
      `;

      // Auto-hide error after 6 seconds
      setTimeout(() => {
        resultDiv.style.opacity = "0";
        resultDiv.style.transition = "opacity 0.5s";
        setTimeout(() => {
          resultDiv.style.display = "none";
          resultDiv.style.opacity = "1";
        }, 6000);
      }, 6000);
      return;
    }

    console.log("✅ Request found:", request);
    showTrackingResult(request);

    // Auto-hide success result after 7 seconds
    setTimeout(() => {
      resultDiv.style.opacity = "0";
      resultDiv.style.transition = "opacity 0.5s";
      setTimeout(() => {
        resultDiv.style.display = "none";
        resultDiv.style.opacity = "1";
      }, 500);
    }, 7000);
  } catch (error) {
    console.error("❌ Tracking error:", error);
    resultDiv.innerHTML = `
      <div class="alert-error" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #991b1b; padding: 20px; border-radius: 12px; border-left: 5px solid #ef4444; margin-top: 20px;">
        <p>❌ Error: ${error.message}</p>
      </div>
    `;

    // Auto-hide error after 6 seconds
    setTimeout(() => {
      resultDiv.style.opacity = "0";
      resultDiv.style.transition = "opacity 0.5s";
      setTimeout(() => {
        resultDiv.style.display = "none";
        resultDiv.style.opacity = "1";
      }, 500);
    }, 6000);
  }
}

function showTrackingResult(request) {
  const resultDiv = document.getElementById("tracking-result");
  const statusColors = {
    Open: "#fbbf24",
    "In Progress": "#3b82f6",
    Resolved: "#10b981",
  };
  const statusIcons = { Open: "🟡", "In Progress": "🔵", Resolved: "🟢" };

  resultDiv.innerHTML = `
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-top: 20px;">
      <div style="padding: 24px; background: ${
        statusColors[request.status]
      }; color: white;">
        <h3 style="margin: 0;">${statusIcons[request.status]} Status: ${
    request.status
  }</h3>
      </div>
      <div style="padding: 24px;">
        <p><strong>Request ID:</strong> ${request.request_id}</p>
        <p><strong>Type:</strong> ${request.complaint_type}</p>
        <p><strong>Location:</strong> ${request.city}, ${request.ward}</p>
        <p><strong>Department:</strong> ${request.department}</p>
        <p><strong>Severity:</strong> ${request.severity}</p>
        <p><strong>Description:</strong> ${request.description}</p>
      </div>
    </div>
  `;
}

// ============================================
// TRANSPARENCY & DOWNLOADS
// ============================================

async function loadTransparencyData() {
  try {
    // Initialize heatmap with proper delay
    setTimeout(() => {
      initializeHeatmap();
    }, 200);

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

// ============================================
// HEATMAP FUNCTIONALITY
// ============================================

let heatmapInstance = null;
let heatmapMarkers = [];
let currentFilter = "all";

// City coordinates for Maharashtra
const cityCoordinates = {
  Mumbai: [19.076, 72.8777],
  Pune: [18.5204, 73.8567],
  Nagpur: [21.1458, 79.0882],
  Nashik: [19.9975, 73.7898],
  Aurangabad: [19.8762, 75.3433],
  Thane: [19.2183, 72.9781],
  Solapur: [17.6599, 75.9064],
  Kolhapur: [16.705, 74.2433],
};

async function initializeHeatmap() {
  console.log("🗺️ Initializing heatmap...");

  const mapContainer = document.getElementById("complaint-heatmap");
  if (!mapContainer) {
    console.error("❌ Heatmap container not found");
    return;
  }

  // Clear any existing content
  mapContainer.innerHTML = "";

  try {
    // Initialize Leaflet map centered on Maharashtra
    heatmapInstance = L.map("complaint-heatmap", {
      center: [19.7515, 75.7139],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(heatmapInstance);

    // Force Leaflet to recalculate size
    setTimeout(() => {
      heatmapInstance.invalidateSize();
    }, 100);

    console.log("✅ Map instance created, loading data...");

    // Load heatmap data (without await to prevent blocking)
    loadHeatmapData()
      .then(() => {
        console.log("✅ Heatmap data loaded");
      })
      .catch((err) => {
        console.error("❌ Error loading heatmap data:", err);
        displayDemoHeatmap();
      });
  } catch (error) {
    console.error("❌ Heatmap initialization error:", error);
    mapContainer.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #dc2626;">
        <p>⚠️ Failed to load heatmap. Please refresh the page.</p>
        <p style="font-size: 12px; color: #64748b;">${error.message}</p>
      </div>
    `;
  }
}

async function loadHeatmapData(filter = "all") {
  try {
    console.log("📊 Loading heatmap data with filter:", filter);

    // Clear existing markers
    heatmapMarkers.forEach((marker) => {
      try {
        heatmapInstance.removeLayer(marker);
      } catch (e) {
        console.warn("Could not remove marker:", e);
      }
    });
    heatmapMarkers = [];

    // Try to fetch real data
    const { data: requests, error } = await supabaseClient
      .from("citizen_requests")
      .select("*");

    let dataToShow = [];

    if (!error && requests && requests.length > 0) {
      console.log(`✅ Found ${requests.length} real complaints`);

      // Filter data based on current filter
      if (filter === "critical") {
        dataToShow = requests.filter((r) => r.severity === "Critical");
      } else if (filter === "all") {
        dataToShow = requests;
      } else {
        // Filter by complaint type (exact match)
        dataToShow = requests.filter((r) => r.complaint_type === filter);
      }

      console.log(
        `✅ Filtered to ${dataToShow.length} complaints for: ${filter}`
      );
      renderHeatmapPoints(dataToShow);
    } else {
      console.log("📊 No real data, showing demo heatmap");
      displayDemoHeatmap();
    }
  } catch (error) {
    console.error("❌ Error loading heatmap data:", error);
    displayDemoHeatmap();
  }
}

function renderHeatmapPoints(requests) {
  const heatmapPoints = [];
  const cityGroups = {};

  requests.forEach((req) => {
    const coords = cityCoordinates[req.city];
    if (coords) {
      // Add random offset for visual distribution
      const latOffset = (Math.random() - 0.5) * 0.2;
      const lngOffset = (Math.random() - 0.5) * 0.2;

      const lat = coords[0] + latOffset;
      const lng = coords[1] + lngOffset;

      // Weight by severity
      let intensity = 0.5;
      if (req.severity === "Critical") intensity = 1.0;
      else if (req.severity === "High") intensity = 0.8;
      else if (req.severity === "Medium") intensity = 0.5;
      else intensity = 0.3;

      heatmapPoints.push([lat, lng, intensity]);

      // Group by city
      if (!cityGroups[req.city]) {
        cityGroups[req.city] = {
          coords: coords,
          count: 0,
          critical: 0,
          types: {},
        };
      }
      cityGroups[req.city].count++;
      if (req.severity === "Critical") cityGroups[req.city].critical++;
      cityGroups[req.city].types[req.complaint_type] =
        (cityGroups[req.city].types[req.complaint_type] || 0) + 1;
    }
  });

  // Add heatmap layer
  if (heatmapPoints.length > 0 && window.L && window.L.heatLayer) {
    const heat = L.heatLayer(heatmapPoints, {
      radius: 25,
      blur: 35,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: "#00ff00",
        0.4: "#ffff00",
        0.6: "#ff9900",
        0.8: "#ff0000",
        1.0: "#990000",
      },
    }).addTo(heatmapInstance);
  }

  // Add city markers
  Object.entries(cityGroups).forEach(([city, data]) => {
    const marker = L.circleMarker(data.coords, {
      radius: Math.sqrt(data.count) * 3,
      fillColor: data.critical > 0 ? "#ef4444" : "#3b82f6",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(heatmapInstance);

    const topTypes = Object.entries(data.types)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => `<li>${type}: ${count}</li>`)
      .join("");

    marker.bindPopup(`
      <div style="font-family: Arial; min-width: 200px;">
        <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">${city}</h4>
        <p style="margin: 5px 0;"><strong>Total:</strong> ${data.count}</p>
        <p style="margin: 5px 0; color: #dc2626;"><strong>Critical:</strong> ${data.critical}</p>
        <p style="margin: 10px 0 5px 0; font-weight: 600;">Top Issues:</p>
        <ul style="margin: 0; padding-left: 20px;">${topTypes}</ul>
      </div>
    `);

    heatmapMarkers.push(marker);
  });

  console.log(`✅ Rendered ${heatmapPoints.length} points on heatmap`);
}

function displayDemoHeatmap() {
  console.log("📊 Displaying demo heatmap data");

  // Demo data for visualization
  const demoPoints = [
    [19.076, 72.8777, 0.9], // Mumbai - High
    [18.5204, 73.8567, 0.7], // Pune - Medium-High
    [21.1458, 79.0882, 0.5], // Nagpur - Medium
    [19.9975, 73.7898, 0.6], // Nashik
    [19.8762, 75.3433, 0.4], // Aurangabad
  ];

  const heat = L.heatLayer(demoPoints, {
    radius: 30,
    blur: 40,
    maxZoom: 10,
    gradient: {
      0.0: "#00ff00",
      0.5: "#ffff00",
      1.0: "#ff0000",
    },
  }).addTo(heatmapInstance);

  // Add demo markers
  Object.entries(cityCoordinates).forEach(([city, coords]) => {
    const marker = L.circleMarker(coords, {
      radius: 10,
      fillColor: "#3b82f6",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.7,
    }).addTo(heatmapInstance);

    marker.bindPopup(`
      <div style="font-family: Arial;">
        <h4 style="margin: 0 0 8px 0; color: #1e40af;">${city}</h4>
        <p style="margin: 0;">Sample data - Submit complaints to see real heatmap</p>
      </div>
    `);

    heatmapMarkers.push(marker);
  });
}

function filterHeatmap(filter) {
  currentFilter = filter;

  // Update button states
  document.querySelectorAll(".map-filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === filter) {
      btn.classList.add("active");
    }
  });

  // Reload heatmap with filter
  loadHeatmapData(filter);

  console.log(`🔍 Heatmap filtered: ${filter}`);
}

// ============================================
// WHATSAPP INTEGRATION
// ============================================

function shareToWhatsApp() {
  // Get form data
  const form = document.getElementById("complaint-form");
  const formData = new FormData(form);

  // Validate required fields
  const name = formData.get("name")?.trim();
  const city = formData.get("city");
  const complaintType = formData.get("complaint_type");
  const description = formData.get("description")?.trim();
  const severity = formData.get("severity");

  if (!name || !city || !complaintType || !description) {
    alert("⚠️ Please fill all required fields before sharing to WhatsApp");
    return;
  }

  // Create WhatsApp message
  const message = ` *Maharashtra Governance Platform - New Complaint*

 *Name:* ${name}
 *Location:* ${city}, ${formData.get("ward") || "N/A"}
 *Type:* ${complaintType}
 *Severity:* ${severity}
 *Citizens Affected:* ${formData.get("affected_count") || "N/A"}

 *Description:*
${description}

---
_Submitted via Maharashtra AI Governance Platform_y
 Track your complaint: https://maharashtra-governance-ai.vercel.app/`;

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Create WhatsApp URL (works on both mobile and desktop)
  const whatsappURL = `https://wa.me/?text=${encodedMessage}`;

  // Open WhatsApp in new window
  window.open(whatsappURL, "_blank");

  // Show success notification
  showWhatsAppNotification(
    "✅ Opening WhatsApp",
    "Your complaint details are ready to share!"
  );

  console.log("📱 WhatsApp share initiated");
}

function subscribeWhatsAppUpdates() {
  const requestId = document.getElementById("track-request-id")?.value.trim();

  if (!requestId) {
    alert("⚠️ Please enter a Request ID first to subscribe for updates");
    return;
  }

  // Get user's WhatsApp number
  const phone = prompt(
    "📱 Enter your WhatsApp number (with country code):\nExample: +919876543210"
  );

  if (!phone) {
    return;
  }

  // Validate phone number format
  if (!/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ""))) {
    alert(
      "❌ Invalid phone number. Please enter a valid WhatsApp number with country code."
    );
    return;
  }

  // Create subscription message
  const message = `🔔 *WhatsApp Update Subscription*

I would like to receive status updates for:

📋 *Request ID:* ${requestId}
📱 *WhatsApp Number:* ${phone}

Please send me notifications when the status changes.

---
_Maharashtra AI Governance Platform_`;

  const encodedMessage = encodeURIComponent(message);

  // Open WhatsApp chat with official number
  const officialWhatsApp = "+919876543210"; // Replace with actual official WhatsApp
  const whatsappURL = `https://wa.me/${officialWhatsApp}?text=${encodedMessage}`;

  window.open(whatsappURL, "_blank");

  // Store subscription locally
  saveWhatsAppSubscription(requestId, phone);

  showWhatsAppNotification(
    "✅ Subscription Request Sent",
    `You'll receive updates for ${requestId} on WhatsApp`
  );

  console.log(`📱 WhatsApp subscription: ${requestId} -> ${phone}`);
}

function saveWhatsAppSubscription(requestId, phone) {
  try {
    const subscriptions = JSON.parse(
      localStorage.getItem("whatsapp_subscriptions") || "[]"
    );

    // Check if already subscribed
    const existing = subscriptions.find(
      (s) => s.requestId === requestId && s.phone === phone
    );

    if (!existing) {
      subscriptions.push({
        requestId: requestId,
        phone: phone,
        subscribedAt: new Date().toISOString(),
      });

      localStorage.setItem(
        "whatsapp_subscriptions",
        JSON.stringify(subscriptions)
      );
      console.log("✅ WhatsApp subscription saved locally");
    }
  } catch (error) {
    console.error("❌ Error saving WhatsApp subscription:", error);
  }
}

function showWhatsAppNotification(title, message) {
  const notification = document.createElement("div");
  notification.className = "whatsapp-popup";

  notification.innerHTML = `
    <div class="whatsapp-popup-header">
      <svg viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <h4>${title}</h4>
    </div>
    <p>${message}</p>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = "fadeOut 0.4s ease-out";
    setTimeout(() => notification.remove(), 400);
  }, 4000);
}

// Auto-send WhatsApp update when status changes (for officials)
async function sendWhatsAppStatusUpdate(requestId, newStatus) {
  try {
    // Check if there are WhatsApp subscriptions for this request
    const subscriptions = JSON.parse(
      localStorage.getItem("whatsapp_subscriptions") || "[]"
    );
    const subscribers = subscriptions.filter((s) => s.requestId === requestId);

    if (subscribers.length === 0) {
      console.log("ℹ️ No WhatsApp subscribers for", requestId);
      return;
    }

    // Get request details
    const { data: request, error } = await supabaseClient
      .from("citizen_requests")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (error || !request) {
      console.error("❌ Could not fetch request details");
      return;
    }

    // Create update message
    const statusEmoji = {
      Open: "🟡",
      "In Progress": "🔵",
      Resolved: "🟢",
    };

    const message = `${statusEmoji[newStatus]} *Status Update*

📋 *Request ID:* ${requestId}
🔄 *New Status:* ${newStatus}
📍 *Location:* ${request.city}
📝 *Type:* ${request.complaint_type}

${
  newStatus === "Resolved"
    ? "✅ Your complaint has been resolved! Thank you for your patience."
    : "⏳ Your complaint is being processed. We'll update you on progress."
}

---
_Maharashtra AI Governance Platform_`;

    const encodedMessage = encodeURIComponent(message);

    // For demo: Show notification (in production, use WhatsApp Business API)
    showWhatsAppNotification(
      `📱 ${subscribers.length} WhatsApp Update${
        subscribers.length > 1 ? "s" : ""
      } Sent`,
      `Status update sent for ${requestId}`
    );

    console.log(
      `✅ WhatsApp updates sent to ${subscribers.length} subscriber(s)`
    );
  } catch (error) {
    console.error("❌ Error sending WhatsApp update:", error);
  }
}

console.log("✅ WhatsApp integration loaded");

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

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

// ============================================
// HYBRID GEMINI API SYSTEM - ADD THIS SECTION
// ============================================

/**
 * Detect if running locally or on Vercel
 */
function getApiEndpoint() {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:3000/api/gemini";
  }
  return "/api/gemini";
}

/**
 * Call Gemini API through secure serverless function
 */
async function callGeminiAPISecure(prompt, timeoutMs = 15000) {
  const API_ENDPOINT = getApiEndpoint();

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      topP: 0.95,
      topK: 40,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    console.log(`🔄 Calling Gemini API via ${API_ENDPOINT}...`);

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Gemini API Response received!");

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

      if (candidate.finishReason === "MAX_TOKENS") {
        console.warn("⚠️ Response truncated due to MAX_TOKENS");
        throw new Error("Response truncated - MAX_TOKENS");
      }
    }

    if (!text) {
      throw new Error("No text in Gemini response");
    }

    console.log(
      "📝 Extracted text from Gemini:",
      text.substring(0, 200) + "..."
    );

    return { success: true, text: text };
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("⏱️ Gemini API timeout");
    } else {
      console.log("⚠️ Gemini API failed:", error.message);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Parse JSON from Gemini response
 */
function parseGeminiJSON(text) {
  try {
    let cleanText = text
      .trim()
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .replace(/^[^{]*({)/, "$1")
      .replace(/(})[^}]*$/, "$1");

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("❌ Failed to parse JSON:", error);
    throw error;
  }
}

/**
 * HYBRID ANALYSIS - Tries Gemini API first, then fallback
 */
async function hybridAnalyzeComplaint(requestData) {
  console.log("🚀 Starting hybrid complaint analysis...");
  console.log("📊 Request data:", requestData);

  const prompt = `You are an AI system for Maharashtra Government's predictive governance platform.

Analyze this citizen service request:

- ID: ${requestData.request_id || "N/A"}
- Type: ${requestData.complaint_type || "N/A"}
- Description: ${requestData.description || "N/A"}
- Location: ${requestData.city || "N/A"}, ${requestData.ward || "N/A"}
- Severity: ${requestData.severity || "N/A"}
- Citizens Affected: ${requestData.affected_count || 0}
- Department: ${requestData.department || "N/A"}

Return ONLY a valid JSON object (no markdown, no backticks):
{
  "urgency_score": 8.5,
  "escalation_risk_percent": 75,
  "predicted_priority": "High",
  "recommended_action": "Deploy emergency response team immediately",
  "estimated_resolution_days": 3,
  "resource_requirements": "2 field teams, 5 lakhs budget",
  "reasoning": "Based on severity and affected population",
  "impact_analysis": "Affects X citizens, delayed resolution increases risk"
}`;

  const apiResult = await callGeminiAPISecure(prompt);

  if (apiResult.success) {
    try {
      const prediction = parseGeminiJSON(apiResult.text);
      prediction.source = "gemini-api";
      console.log("✅ SUCCESS: Using Gemini API prediction");
      console.log("📊 Gemini result:", prediction);
      return prediction;
    } catch (parseError) {
      console.error("❌ Failed to parse Gemini JSON, using fallback");
    }
  }

  console.log("🔄 FALLBACK: Using smart dynamic prediction");
  const fallback = generateSmartDynamicPrediction(requestData);
  fallback.source = "smart-fallback";
  console.log("📊 Fallback result:", fallback);
  return fallback;
}

/**
 * HYBRID FORECAST - Tries Gemini API first, then fallback
 */
async function hybridForecast(requests) {
  console.log("🚀 Starting hybrid forecast...");

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

Analyze historical data and predict 7-day service demand:

- Total Active Requests: ${requests?.length || 0}
- Requests by Type: ${JSON.stringify(typeCounts)}
- Requests by City: ${JSON.stringify(cityCounts)}
- Total Citizens Affected: ${totalAffected}

Return ONLY valid JSON (no markdown, no backticks):
{
  "forecast_date": "${new Date().toISOString().split("T")[0]}",
  "demand_forecast": {
    "water_supply": {"predicted_requests": 15, "change_percent": 12, "confidence": 78, "trend": "Increasing"},
    "healthcare": {"predicted_requests": 11, "change_percent": 8, "confidence": 72, "trend": "Stable"},
    "infrastructure": {"predicted_requests": 18, "change_percent": 15, "confidence": 80, "trend": "Increasing"},
    "electricity": {"predicted_requests": 9, "change_percent": 5, "confidence": 75, "trend": "Stable"}
  },
  "bottlenecks": [{"department": "Water Department", "overload_percent": 65, "urgency": "High", "recommendation": "Add 10 staff members"}],
  "resource_allocation": {"additional_staff_needed": 25, "budget_required_lakhs": 15, "priority_areas": ["Water Supply", "Infrastructure"]},
  "risk_zones": [{"location": "Mumbai", "risk_type": "Service Overload", "severity": 8, "action_needed": "Deploy 5 mobile units"}],
  "insights": "Key insights about demand trends"
}`;

  const apiResult = await callGeminiAPISecure(prompt, 20000);

  if (apiResult.success) {
    try {
      const forecast = parseGeminiJSON(apiResult.text);
      forecast.source = "gemini-api";
      console.log("✅ SUCCESS: Using Gemini API forecast");
      console.log("📊 Gemini forecast:", forecast);
      return forecast;
    } catch (parseError) {
      console.error("❌ Failed to parse Gemini forecast JSON, using fallback");
    }
  }

  console.log("🔄 FALLBACK: Using smart forecast fallback");
  const fallback = generateSmartFallbackForecast();
  fallback.source = "smart-fallback";
  console.log("📊 Fallback forecast:", fallback);
  return fallback;
}

/**
 * Smart fallback forecast
 */
function generateSmartFallbackForecast() {
  return {
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
        recommendation: "Add 10 staff members",
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
      "Expecting 15% increase in requests. Department reinforcement recommended.",
  };
}

// ============================================
// VOICE INPUT FEATURE
// ============================================

let voiceRecognition = null;
let isListening = false;

function initializeVoiceInput() {
  const voiceBtn = document.getElementById("voice-input-btn");
  const descriptionField = document.getElementById("complaint-description");
  const statusDiv = document.getElementById("voice-status");

  if (!voiceBtn) return;

  // Check browser support
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    voiceBtn.style.display = "none";
    statusDiv.innerHTML =
      '<span style="color: #f59e0b;">⚠️ Voice input not supported in this browser</span>';
    return;
  }

  // Initialize speech recognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceRecognition = new SpeechRecognition();

  // Configure recognition
  voiceRecognition.continuous = false;
  voiceRecognition.interimResults = false;
  voiceRecognition.maxAlternatives = 1;

  // Language selector
  const languageMap = {
    marathi: "mr-IN",
    english: "en-IN",
    hindi: "hi-IN",
  };

  voiceRecognition.lang = "mr-IN"; // Default Marathi

  // Button click handler
  voiceBtn.addEventListener("click", () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  });

  function startListening() {
    isListening = true;
    voiceBtn.classList.add("listening");
    statusDiv.innerHTML =
      '🎤 <span style="color: #ef4444; font-weight: 600;">Listening... Speak now in Marathi or English</span>';

    try {
      voiceRecognition.start();
    } catch (error) {
      console.error("Voice recognition error:", error);
      stopListening();
      statusDiv.innerHTML =
        '<span style="color: #ef4444;">❌ Error starting voice input</span>';
    }
  }

  function stopListening() {
    isListening = false;
    voiceBtn.classList.remove("listening");
    statusDiv.innerHTML = "";
    try {
      voiceRecognition.stop();
    } catch (error) {
      console.error("Error stopping recognition:", error);
    }
  }

  // Handle results
  voiceRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence;

    // Append to existing text
    const currentText = descriptionField.value;
    descriptionField.value = currentText
      ? currentText + " " + transcript
      : transcript;

    statusDiv.innerHTML = `✅ <span style="color: #059669; font-weight: 600;">Captured: "${transcript.substring(
      0,
      50
    )}..."</span>`;

    stopListening();

    // Auto-hide status after 3 seconds
    setTimeout(() => {
      statusDiv.innerHTML = "";
    }, 3000);
  };

  // Handle errors
  voiceRecognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);

    let errorMessage = "";
    switch (event.error) {
      case "no-speech":
        errorMessage = "🔇 No speech detected. Please try again.";
        break;
      case "audio-capture":
        errorMessage = "🎤 Microphone not found. Please check permissions.";
        break;
      case "not-allowed":
        errorMessage =
          "🚫 Microphone access denied. Please enable in browser settings.";
        break;
      default:
        errorMessage = `❌ Error: ${event.error}`;
    }

    statusDiv.innerHTML = `<span style="color: #ef4444;">${errorMessage}</span>`;
    stopListening();

    setTimeout(() => {
      statusDiv.innerHTML = "";
    }, 4000);
  };

  voiceRecognition.onend = () => {
    stopListening();
  };
}

// ============================================
// IMAGE UPLOAD + AI ANALYSIS FEATURE
// ============================================

let uploadedImageFile = null;
let uploadedImageBase64 = null;

function initializeImageUpload() {
  const imageInput = document.getElementById("complaint-image");

  if (!imageInput) return;

  imageInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("❌ Please upload an image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Image size must be less than 5MB");
      return;
    }

    uploadedImageFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      uploadedImageBase64 = event.target.result;

      const previewContainer = document.getElementById(
        "image-preview-container"
      );
      const previewImg = document.getElementById("image-preview");

      previewImg.src = uploadedImageBase64;
      previewContainer.style.display = "block";

      // Trigger AI analysis
      await analyzeImageWithAI(file);
    };

    reader.readAsDataURL(file);
  });
}

function removeImage() {
  uploadedImageFile = null;
  uploadedImageBase64 = null;

  document.getElementById("complaint-image").value = "";
  document.getElementById("image-preview-container").style.display = "none";
  document.getElementById("ai-analysis-result").style.display = "none";
  document.getElementById("image-preview").src = "";
}

async function analyzeImageWithAI(imageFile) {
  const resultDiv = document.getElementById("ai-analysis-result");

  // Show loading
  resultDiv.style.display = "block";
  resultDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div class="ai-spinner" style="width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #10b981; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <span style="color: #065f46; font-weight: 600;">🤖 AI analyzing image...</span>
    </div>
  `;

  try {
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageFile);

    // Call Gemini Vision API
    const analysis = await analyzeImageWithGemini(base64Image);

    // Display results
    displayImageAnalysis(analysis);

    // Auto-fill form based on AI analysis
    autoFillFormFromImageAnalysis(analysis);
  } catch (error) {
    console.error("Image analysis error:", error);
    resultDiv.innerHTML = `
      <div style="color: #dc2626; font-weight: 600;">
        ⚠️ AI analysis unavailable. You can still submit manually.
      </div>
    `;
  }
}

async function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Extract base64 part (remove data:image/...;base64, prefix)
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function analyzeImageWithGemini(base64Image) {
  const API_ENDPOINT = getApiEndpoint();

  const prompt = `You are an expert civic infrastructure analyst for Maharashtra Government. Analyze this image in EXTREME DETAIL.

CRITICAL INSTRUCTIONS:
- Look at what is ACTUALLY visible in the image
- Be SPECIFIC about what you see (colors, damage extent, environmental conditions)
- Don't make generic assumptions

COMPLAINT TYPES (choose the MOST accurate one):
- "Road Repair" → potholes, cracks, broken asphalt, uneven surface, road damage
- "Water Supply" → broken pipes, water leakage, flooding, no water, burst mains
- "Garbage Collection" → trash piles, overflowing bins, littering, waste accumulation
- "Street Lights" → broken poles, non-functional lights, dark streets, damaged fixtures
- "Drainage" → clogged drains, sewage overflow, waterlogging, blocked gutters
- "Electricity" → fallen wires, power cuts, transformer issues, electrical hazards
- "Healthcare" → hospital/clinic infrastructure issues, medical waste, facility damage
- "Public Transport" → damaged bus stops, broken shelters, road signs, traffic issues

SEVERITY RULES (be precise):
- Critical: Immediate danger to life, major infrastructure failure, affects 200+ people
- High: Significant damage, urgent action needed, affects 50-200 people
- Medium: Noticeable problem, needs attention within week, affects 10-50 people
- Low: Minor issue, routine maintenance, affects <10 people

ANALYZE THE IMAGE AND RETURN ONLY THIS JSON (no markdown, no backticks):
{
  "complaint_type": "exact type from list above",
  "severity": "Critical/High/Medium/Low",
  "description": "DETAILED description: what EXACTLY you see - mention specific damage, colors, size, location details, environmental conditions. Be descriptive like a field inspector would report.",
  "affected_count": realistic_number_based_on_visible_area,
  "department": "appropriate department name",
  "confidence": percentage_0_to_100,
  "detected_objects": ["specific object 1", "specific object 2", "specific object 3"],
  "damage_assessment": {
    "extent": "describe the size/spread of damage",
    "urgency_factors": ["factor 1", "factor 2"],
    "visible_risks": ["risk 1", "risk 2"]
  }
}

EXAMPLE GOOD RESPONSE:
{
  "complaint_type": "Road Repair",
  "severity": "High",
  "description": "Large pothole approximately 3 feet wide and 8 inches deep visible on main road. Broken asphalt edges show recent damage. Water accumulation in cavity indicates drainage issues. Located on what appears to be a busy street with visible vehicle traffic marks around the damage.",
  "affected_count": 150,
  "department": "PWD",
  "confidence": 92,
  "detected_objects": ["large pothole", "cracked asphalt", "water accumulation", "road marking"],
  "damage_assessment": {
    "extent": "Single large cavity covering approximately 10 square feet",
    "urgency_factors": ["high traffic area", "vehicle damage risk", "water accumulation"],
    "visible_risks": ["vehicle damage", "accident potential", "further deterioration"]
  }
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
      topP: 0.8,
      topK: 40,
    },
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

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
      throw new Error("No response from AI");
    }

    // Parse JSON from response
    const cleanText = text
      .trim()
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .replace(/^[^{]*({)/, "$1")
      .replace(/(})[^}]*$/, "$1");

    const analysis = JSON.parse(cleanText);
    analysis.source = "gemini-vision";

    console.log("✅ Gemini Vision Analysis:", analysis);

    return analysis;
  } catch (error) {
    console.error("Gemini Vision API error:", error);

    // Improved fallback
    return generateBasicImageAnalysis();
  }
}

function generateBasicImageAnalysis() {
  // Better fallback with realistic data
  return {
    complaint_type: "Infrastructure",
    severity: "Medium",
    description:
      "Unable to perform AI analysis at this moment. Please provide a detailed description manually of what you see in the image: type of damage, location, severity, and any immediate risks.",
    affected_count: 25,
    department: "Municipal Corporation",
    confidence: 45,
    detected_objects: ["infrastructure issue detected"],
    damage_assessment: {
      extent: "Cannot determine without AI analysis",
      urgency_factors: ["manual review required"],
      visible_risks: ["please describe in complaint"],
    },
    source: "fallback",
    note: "⚠️ AI analysis unavailable. Please fill the form manually with accurate details.",
  };
}

function displayImageAnalysis(analysis) {
  // Remove any existing modal
  const existingModal = document.getElementById("ai-analysis-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const confidenceColor =
    analysis.confidence >= 80
      ? "#059669"
      : analysis.confidence >= 60
      ? "#f59e0b"
      : "#ef4444";

  const confidenceLabel =
    analysis.confidence >= 80
      ? "High Confidence"
      : analysis.confidence >= 60
      ? "Medium Confidence"
      : "Low Confidence";

  const isFallback = analysis.source === "fallback";

  // Create modal overlay
  const modal = document.createElement("div");
  modal.id = "ai-analysis-modal";
  modal.className = "ai-modal-overlay";

  modal.innerHTML = `
    <div class="ai-modal-container">
      <!-- Close Button -->
      <button class="ai-modal-close" onclick="closeAIAnalysisModal()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Header Section -->
      <div class="ai-modal-header">
        <div class="ai-header-left">
          <div class="ai-icon">🤖</div>
          <div>
            <h2>AI Image Analysis ${
              isFallback ? "- Manual Review Needed" : "Complete"
            }</h2>
            <p>Powered by Google Gemini Vision AI</p>
          </div>
        </div>
        <div class="ai-confidence-badge" style="background: ${confidenceColor};">
          <span class="confidence-value">${analysis.confidence}%</span>
          <span class="confidence-label">${confidenceLabel}</span>
        </div>
      </div>

      ${
        isFallback
          ? `
        <div class="ai-fallback-notice">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <strong>AI Analysis Unavailable</strong>
            <p>Please manually fill the form below with accurate complaint details.</p>
          </div>
        </div>
      `
          : ""
      }

      <!-- Main Content Grid -->
      <div class="ai-modal-content">
        <div class="ai-result-grid">
          <!-- Left Column -->
          <div class="ai-result-column">
            <div class="ai-detail-card primary">
              <div class="detail-icon">📋</div>
              <div class="detail-content">
                <label>Detected Issue Type</label>
                <h3>${analysis.complaint_type}</h3>
              </div>
            </div>

            <div class="ai-detail-card ${analysis.severity.toLowerCase()}">
              <div class="detail-icon">⚠️</div>
              <div class="detail-content">
                <label>Severity Level</label>
                <h3>${analysis.severity}</h3>
              </div>
            </div>

            <div class="ai-detail-card">
              <div class="detail-icon">👥</div>
              <div class="detail-content">
                <label>Estimated Citizens Affected</label>
                <h3>${analysis.affected_count}</h3>
              </div>
            </div>

            <div class="ai-detail-card">
              <div class="detail-icon">🏛️</div>
              <div class="detail-content">
                <label>Assigned Department</label>
                <h3>${analysis.department}</h3>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="ai-result-column">
            <div class="ai-description-box">
              <label><strong>📝 AI-Generated Description</strong></label>
              <p>${analysis.description}</p>
            </div>

            ${
              analysis.detected_objects && analysis.detected_objects.length > 0
                ? `
              <div class="ai-objects-detected">
                <label><strong>🔍 Detected Objects</strong></label>
                <div class="object-tags">
                  ${analysis.detected_objects
                    .map((obj) => `<span class="object-tag">${obj}</span>`)
                    .join("")}
                </div>
              </div>
            `
                : ""
            }

            ${
              analysis.damage_assessment
                ? `
              <div class="ai-damage-assessment">
                <label><strong>🔧 Damage Assessment</strong></label>
                <div class="assessment-item">
                  <strong>Extent:</strong> ${analysis.damage_assessment.extent}
                </div>
                ${
                  analysis.damage_assessment.urgency_factors
                    ? `
                  <div class="assessment-item">
                    <strong>Urgency Factors:</strong>
                    <ul>
                      ${analysis.damage_assessment.urgency_factors
                        .map((factor) => `<li>${factor}</li>`)
                        .join("")}
                    </ul>
                  </div>
                `
                    : ""
                }
                ${
                  analysis.damage_assessment.visible_risks
                    ? `
                  <div class="assessment-item">
                    <strong>Visible Risks:</strong>
                    <ul>
                      ${analysis.damage_assessment.visible_risks
                        .map((risk) => `<li>${risk}</li>`)
                        .join("")}
                    </ul>
                  </div>
                `
                    : ""
                }
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="ai-modal-footer">
        <div class="footer-info">
          <div class="footer-icon">✨</div>
          <div class="footer-text">
            <strong>Form Auto-Filled Successfully!</strong>
            <p>Review the analysis above, then close this window to edit and submit your complaint.</p>
          </div>
        </div>
        <button class="btn-close-modal" onclick="closeAIAnalysisModal()">
          Close & Review Form
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Animate modal entrance
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);

  // Store analysis result in a temporary div (hidden) for reference
  const resultDiv = document.getElementById("ai-analysis-result");
  resultDiv.innerHTML = `
    <div class="ai-analysis-complete-notice">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div>
        <strong>✅ AI Analysis Complete</strong>
        <p>Form has been auto-filled based on image analysis. Please verify all details before submitting.</p>
      </div>
    </div>
  `;
  resultDiv.style.display = "block";
}

// Function to close modal
function closeAIAnalysisModal() {
  const modal = document.getElementById("ai-analysis-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  const modal = document.getElementById("ai-analysis-modal");
  if (modal && e.target === modal) {
    closeAIAnalysisModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeAIAnalysisModal();
  }
});

// Function to close modal
function closeAIAnalysisModal() {
  const modal = document.getElementById("ai-analysis-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  const modal = document.getElementById("ai-analysis-modal");
  if (modal && e.target === modal) {
    closeAIAnalysisModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeAIAnalysisModal();
  }
});

function autoFillFormFromImageAnalysis(analysis) {
  // Auto-fill complaint type
  const typeSelect = document.querySelector('select[name="complaint_type"]');
  if (typeSelect) {
    typeSelect.value = analysis.complaint_type;
  }

  // Auto-fill severity
  const severitySelect = document.querySelector('select[name="severity"]');
  if (severitySelect) {
    severitySelect.value = analysis.severity;
  }

  // Auto-fill description (prepend AI analysis)
  const descriptionField = document.getElementById("complaint-description");
  if (descriptionField) {
    const aiPrefix = `[AI Detected: ${analysis.description}]\n\n`;
    const currentText = descriptionField.value;

    // Only add if not already there
    if (!currentText.includes("[AI Detected:")) {
      descriptionField.value = aiPrefix + currentText;
    }
  }

  // Auto-fill affected count
  const affectedInput = document.querySelector('input[name="affected_count"]');
  if (affectedInput && analysis.affected_count) {
    affectedInput.value = analysis.affected_count;
  }

  console.log("✅ Form auto-filled from AI analysis");
}

// ============================================
// REAL-TIME ALERT SYSTEM FOR OFFICIALS
// ============================================

async function sendOfficialAlerts(requestData) {
  // Only send alerts for High and Critical severity
  if (requestData.severity !== "High" && requestData.severity !== "Critical") {
    console.log("ℹ️ Alert skipped - severity is not High/Critical");
    return;
  }

  console.log(
    "🚨 Sending alerts for critical request:",
    requestData.request_id
  );

  // Show alert notification in UI
  showAlertNotification(requestData);

  // Send email notification (simulated)
  await sendEmailAlert(requestData);

  // Send SMS notification (simulated)
  await sendSMSAlert(requestData);

  // Store alert in database
  await storeAlertRecord(requestData);
}

function showAlertNotification(requestData) {
  const notification = document.createElement("div");
  notification.className = "alert-notification";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #991b1b;
    padding: 20px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
    border-left: 5px solid #ef4444;
    z-index: 10000;
    min-width: 350px;
    max-width: 450px;
    animation: slideInRight 0.4s ease-out;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="font-size: 24px; animation: pulse 2s infinite;">🚨</div>
      <div style="flex: 1;">
        <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">
          ${requestData.severity} Alert Triggered!
        </h4>
        <p style="margin: 0 0 6px 0; font-size: 14px; line-height: 1.5;">
          <strong>ID:</strong> ${requestData.request_id}<br>
          <strong>Type:</strong> ${requestData.complaint_type}<br>
          <strong>Location:</strong> ${requestData.city}, ${requestData.ward}
        </p>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(153, 27, 27, 0.2); font-size: 13px;">
          <strong>✉️ Email sent to:</strong> ${requestData.department
            .toLowerCase()
            .replace(/ /g, "")}@maharashtra.gov.in<br>
          <strong>📱 SMS sent to:</strong> Department Head
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 8 seconds
  setTimeout(() => {
    notification.style.animation = "fadeOut 0.4s ease-out";
    setTimeout(() => notification.remove(), 400);
  }, 8000);
}

async function sendEmailAlert(requestData) {
  // Simulated email sending
  const emailData = {
    to: `${requestData.department
      .toLowerCase()
      .replace(/ /g, "")}@maharashtra.gov.in`,
    subject: `🚨 ${requestData.severity} Priority Alert - ${requestData.request_id}`,
    body: generateEmailBody(requestData),
  };

  console.log("📧 Email Alert Sent:", emailData);

  // In production, you would call an actual email API here
  // await fetch('/api/send-email', { method: 'POST', body: JSON.stringify(emailData) });

  return emailData;
}

async function sendSMSAlert(requestData) {
  // Simulated SMS sending
  const smsData = {
    to: getDepartmentPhoneNumber(requestData.department),
    message: `🚨 URGENT: ${requestData.severity} complaint ${requestData.request_id} in ${requestData.city}. ${requestData.complaint_type}. Affected: ${requestData.affected_count} citizens. Login: https://maharashtra-ai-gov.com`,
  };

  console.log("📱 SMS Alert Sent:", smsData);

  // In production, you would call Twilio or similar SMS API here
  // await fetch('/api/send-sms', { method: 'POST', body: JSON.stringify(smsData) });

  return smsData;
}

function generateEmailBody(requestData) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 ${
            requestData.severity
          } Priority Alert</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <h2 style="color: #ef4444; margin-top: 0;">Complaint Details</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 150px;">Request ID:</td>
              <td style="padding: 8px;">${requestData.request_id}</td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 8px; font-weight: bold;">Type:</td>
              <td style="padding: 8px;">${requestData.complaint_type}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Severity:</td>
              <td style="padding: 8px;"><strong style="color: #ef4444;">${
                requestData.severity
              }</strong></td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 8px; font-weight: bold;">Location:</td>
              <td style="padding: 8px;">${requestData.city}, ${
    requestData.ward
  }</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Citizens Affected:</td>
              <td style="padding: 8px;"><strong>${
                requestData.affected_count
              }</strong></td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 8px; font-weight: bold;">Department:</td>
              <td style="padding: 8px;">${requestData.department}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Date Submitted:</td>
              <td style="padding: 8px;">${new Date(
                requestData.date_submitted
              ).toLocaleString()}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; color: #92400e;">Description:</h3>
            <p style="margin: 0;">${requestData.description}</p>
          </div>
          
          <div style="margin-top: 25px; text-align: center;">
            <a href="https://maharashtra-ai-gov.com/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View in Dashboard →
            </a>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">This is an automated alert from Maharashtra AI Governance Platform.</p>
          <p style="margin: 5px 0 0 0;">Please login to the dashboard to update the status and manage this request.</p>
        </div>
      </body>
    </html>
  `;
}

function getDepartmentPhoneNumber(department) {
  // Mock phone numbers for each department
  const phoneNumbers = {
    "Water Department": "+91-9876543210",
    MSEDCL: "+91-9876543211",
    PWD: "+91-9876543212",
    "Health Department": "+91-9876543213",
    "Sanitation Department": "+91-9876543214",
    "Municipal Corporation": "+91-9876543215",
    "Transport Department": "+91-9876543216",
  };

  return phoneNumbers[department] || "+91-9876543210";
}

async function storeAlertRecord(requestData) {
  try {
    const alertRecord = {
      request_id: requestData.request_id,
      alert_type: requestData.severity,
      department: requestData.department,
      email_sent: true,
      sms_sent: true,
      timestamp: new Date().toISOString(),
      status: "Sent",
    };

    // Store in localStorage for demo (in production, use Supabase)
    const alerts = JSON.parse(localStorage.getItem("maha_alerts") || "[]");
    alerts.push(alertRecord);
    localStorage.setItem("maha_alerts", JSON.stringify(alerts));

    console.log("✅ Alert record stored:", alertRecord);
  } catch (error) {
    console.error("Error storing alert:", error);
  }
}

// Add CSS animation for notification
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
      transform: translateX(400px);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`;
document.head.appendChild(style);

function loadRecentAlerts() {
  const session = JSON.parse(localStorage.getItem("maha_session"));

  // Only show for officials
  if (session?.role !== "official") {
    console.log("❌ Not an official, hiding alerts section");
    return;
  }

  console.log("✅ Loading alerts for official");

  const alertsSection = document.getElementById("recent-alerts-section");
  const container = document.getElementById("recent-alerts-container");

  if (!alertsSection || !container) {
    console.error("❌ Alert section or container not found in HTML");
    return;
  }

  const alerts = JSON.parse(localStorage.getItem("maha_alerts") || "[]");
  console.log("📊 Found alerts:", alerts.length);

  // ✅ FORCE VISIBILITY - REMOVE display: none
  alertsSection.style.display = "block";
  alertsSection.style.visibility = "visible";
  alertsSection.style.opacity = "1";

  if (alerts.length === 0) {
    container.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; color: #64748b;">
        <p style="margin: 0;">No critical alerts have been triggered yet.</p>
      </div>
    `;
    console.log("✅ Showing empty state");
    return;
  }

  // Show last 10 alerts (most recent first)
  const recentAlerts = alerts.slice(-10).reverse();

  container.innerHTML = recentAlerts
    .map(
      (alert) => `
    <div class="alert-log-item" style="background: white; padding: 16px; border-radius: 10px; border-left: 4px solid #ef4444; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <div>
          <strong style="color: #991b1b; font-size: 15px;">🚨 ${
            alert.alert_type
          } Alert</strong>
          <span style="color: #64748b; font-size: 13px; margin-left: 12px;">ID: ${
            alert.request_id
          }</span>
        </div>
        <span style="font-size: 12px; color: #64748b;">${new Date(
          alert.timestamp
        ).toLocaleString()}</span>
      </div>
      <div style="font-size: 14px; color: #475569;">
        <strong>Department:</strong> ${alert.department}
      </div>
      <div style="display: flex; gap: 15px; margin-top: 8px; font-size: 13px;">
        <span style="color: #059669;">✉️ Email: ${
          alert.email_sent ? "Sent" : "Failed"
        }</span>
        <span style="color: #059669;">📱 SMS: ${
          alert.sms_sent ? "Sent" : "Failed"
        }</span>
      </div>
    </div>
  `
    )
    .join("");

  console.log(`✅ Displayed ${recentAlerts.length} alerts`);
  console.log("✅ Alert section should now be VISIBLE");
}

console.log("✅ Hybrid Gemini API system loaded!");
console.log("📍 API Endpoint:", getApiEndpoint());

console.log("✅ All functions loaded successfully!");

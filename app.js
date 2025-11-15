// Maharashtra AI Governance Platform - Main Application

const { createClient } = supabase;

// Initialize Supabase Client
// Note: In production, these should be in environment variables
// For now, they'll be loaded from the deployed environment
let supabaseClient;

// Initialize application
async function initApp() {
  try {
    // Get Supabase credentials from meta tags (set by build process) or use defaults
    const supabaseUrl =
      document.querySelector('meta[name="supabase-url"]')?.content ||
      "https://xyvlblrsndudtqqxhqtj.supabase.co";
    const supabaseKey =
      document.querySelector('meta[name="supabase-key"]')?.content ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dmxibHJzbmR1ZHRxcXhocXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDU1NTMsImV4cCI6MjA3ODc4MTU1M30.bQzDc276wj2QDgeEVU2d-glLTQnBNq4qrjTw9oyEmY0";

    supabaseClient = createClient(supabaseUrl, supabaseKey);

    console.log("Application initialized");

    // Load initial data
    await loadDashboardData();

    // Setup event listeners
    setupEventListeners();
  } catch (error) {
    console.error("Initialization error:", error);
    showError(
      "Failed to initialize application. Please check your connection."
    );
  }
}

// Setup event listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navigateToPage(page);
    });
  });

  // Portal tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  // Complaint form submission
  const complaintForm = document.getElementById("complaint-form");
  if (complaintForm) {
    complaintForm.addEventListener("submit", handleComplaintSubmission);
  }

  // Track request button
  const trackBtn = document.getElementById("track-btn");
  if (trackBtn) {
    trackBtn.addEventListener("click", handleTrackRequest);
  }

  // Analysis button
  const analyzeBtn = document.getElementById("analyze-btn");
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", handleAnalyzeRequest);
  }

  // Forecast button
  const forecastBtn = document.getElementById("forecast-btn");
  if (forecastBtn) {
    forecastBtn.addEventListener("click", handleForecast);
  }

  // Download buttons
  document
    .getElementById("download-stats")
    ?.addEventListener("click", downloadStats);
  document
    .getElementById("download-geo")
    ?.addEventListener("click", downloadGeoData);
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
  // Requests by type chart
  const typeCounts = {};
  requests.forEach((r) => {
    typeCounts[r.complaint_type] = (typeCounts[r.complaint_type] || 0) + 1;
  });

  const typeChart = document.getElementById("typeChart");
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

  const cityChart = document.getElementById("cityChart");
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
            <td><span class="status-badge ${req.status
              .toLowerCase()
              .replace(" ", "-")}">${req.status}</span></td>
            <td>${req.affected_count.toLocaleString()}</td>
            <td>${req.department}</td>
        </tr>
    `
    )
    .join("");
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

  btn.disabled = true;
  btn.innerHTML = "<span>Analyzing with Gemini AI...</span>";

  try {
    // Call Supabase Edge Function for AI analysis
    const response = await fetch(
      `${supabaseClient.supabaseUrl}/functions/v1/analyze-complaint`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseClient.supabaseKey}`,
        },
        body: JSON.stringify(window.currentRequest),
      }
    );

    if (!response.ok) {
      throw new Error("Analysis failed");
    }

    const prediction = await response.json();
    displayPredictionResults(prediction);
  } catch (error) {
    console.error("Analysis error:", error);
    // Show fallback prediction
    const fallbackPrediction = generateFallbackPrediction(
      window.currentRequest
    );
    displayPredictionResults(fallbackPrediction);
  } finally {
    btn.disabled = false;
    btn.innerHTML = "<span>Generate AI Prediction with Gemini</span>";
  }
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

  btn.disabled = true;
  btn.innerHTML = "<span>Generating Forecast with Gemini AI...</span>";

  try {
    const { data: requests, error } = await supabaseClient
      .from("citizen_requests")
      .select("*");

    if (error) throw error;

    const forecast = generateFallbackForecast(requests);
    displayForecastResults(forecast);
  } catch (error) {
    console.error("Forecast error:", error);
    alert("Error generating forecast. Please try again.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "<span>Generate Demand Forecast</span>";
  }
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

  // Generate request ID
  const { count } = await supabaseClient
    .from("citizen_requests")
    .select("*", { count: "exact", head: true });

  const requestId = `R${String(count + 1).padStart(3, "0")}`;

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
    email: data.email || `citizen${count + 1}@example.com`,
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

  try {
    const { error } = await supabaseClient
      .from("citizen_requests")
      .insert([requestData]);

    if (error) throw error;

    showSubmissionSuccess(requestId, requestData.department);
    e.target.reset();
  } catch (error) {
    console.error("Submission error:", error);
    showSubmissionError();
  }
}

function showSubmissionSuccess(requestId, department) {
  const resultDiv = document.getElementById("submission-result");
  resultDiv.innerHTML = `
        <div class="alert-success">
            <h3>Complaint Submitted Successfully!</h3>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Status:</strong> Open</p>
            <p>Your complaint has been registered and assigned to the concerned department. You will receive updates via SMS/Email.</p>
            <p><strong>Estimated Response Time:</strong> 2-3 business days</p>
        </div>
    `;
  resultDiv.style.display = "block";
}

function showSubmissionError() {
  const resultDiv = document.getElementById("submission-result");
  resultDiv.innerHTML = `
        <div class="alert-error">
            <p>Error submitting complaint. Please try again or contact support.</p>
        </div>
    `;
  resultDiv.style.display = "block";
}

// Handle Track Request
async function handleTrackRequest() {
  const requestId = document.getElementById("track-request-id").value.trim();

  if (!requestId) {
    alert("Please enter a Request ID");
    return;
  }

  try {
    const { data: request, error } = await supabaseClient
      .from("citizen_requests")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (error || !request) {
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

  resultDiv.innerHTML = `
        <div class="alert-success">
            <h3>${statusIcons[request.status]} Status: ${request.status}</h3>
            <p><strong>Complaint Type:</strong> ${request.complaint_type}</p>
            <p><strong>Location:</strong> ${request.city}, ${request.ward}</p>
            <p><strong>Department:</strong> ${request.department}</p>
            <p><strong>Submitted:</strong> ${new Date(
              request.date_submitted
            ).toLocaleDateString()}</p>
            <p><strong>Severity:</strong> ${request.severity}</p>
            <p><strong>Description:</strong> ${request.description}</p>
            ${
              request.status === "Resolved"
                ? `<p><strong>Resolved Date:</strong> ${new Date(
                    request.resolved_date
                  ).toLocaleDateString()}</p>`
                : request.status === "In Progress"
                ? "<p>Your complaint is being processed by the department</p>"
                : "<p>Your complaint is in queue. Expected action within 2-3 days.</p>"
            }
        </div>
    `;
  resultDiv.style.display = "block";
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

function generateFallbackForecast(requests) {
  return {
    forecast_date: new Date().toISOString().split("T")[0],
    demand_forecast: {
      water_supply: {
        predicted_requests: 15,
        change_percent: 15,
        confidence: 75,
        trend: "Increasing",
      },
      healthcare: {
        predicted_requests: 11,
        change_percent: 10,
        confidence: 70,
        trend: "Stable",
      },
      infrastructure: {
        predicted_requests: 16,
        change_percent: 12,
        confidence: 80,
        trend: "Increasing",
      },
      electricity: {
        predicted_requests: 9,
        change_percent: 8,
        confidence: 72,
        trend: "Stable",
      },
    },
    insights:
      "Expecting 15-20% increase in service requests. Water and infrastructure departments need immediate resource reinforcement.",
  };
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
  alert(message);
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
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

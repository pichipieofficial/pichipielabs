// Admin Dashboard Controller

const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginErrorMsg = document.getElementById('login-error-msg');
const btnLogout = document.getElementById('btn-logout');

let dailyChartInstance = null;
let deviceChartInstance = null;

// On Load: Check if token exists
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('pichipie_admin_token');
  if (token) {
    fetchDashboardStats(token);
  }
});

// Login Handler
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorMsg.style.display = 'none';

    const password = document.getElementById('admin-password').value;

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('pichipie_admin_token', data.token);
        fetchDashboardStats(data.token);
        document.getElementById('admin-password').value = '';
      } else {
        showLoginError('Invalid administrator credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      showLoginError('Failed to communicate with server.');
    }
  });
}

// Logout Handler
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('pichipie_admin_token');
    showSection('login');
    // Destroy charts
    if (dailyChartInstance) dailyChartInstance.destroy();
    if (deviceChartInstance) deviceChartInstance.destroy();
  });
}

// Display error helper
function showLoginError(msg) {
  if (loginErrorMsg) {
    loginErrorMsg.innerText = msg;
    loginErrorMsg.style.display = 'block';
  }
}

// Toggle page sections
function showSection(section) {
  if (section === 'dashboard') {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
  } else {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
  }
}

// Retrieve stats from API
async function fetchDashboardStats(token) {
  try {
    const response = await fetch('/api/admin/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('pichipie_admin_token');
      showSection('login');
      return;
    }

    const data = await response.json();
    if (data.success) {
      showSection('dashboard');
      populateMetrics(data.metrics);
      renderDailyChart(data.dailyChart);
      renderDeviceChart(data.recentActivity);
      populateActivityFeed(data.recentActivity);
    } else {
      localStorage.removeItem('pichipie_admin_token');
      showSection('login');
    }
  } catch (err) {
    console.error('Stats fetch error:', err);
    localStorage.removeItem('pichipie_admin_token');
    showSection('login');
  }
}

// Populate KPI widgets
function populateMetrics(metrics) {
  document.getElementById('val-total-visits').innerText = metrics.totalVisits.toLocaleString();
  document.getElementById('val-unique-visitors').innerText = metrics.uniqueVisitors.toLocaleString();
  document.getElementById('val-total-downloads').innerText = metrics.totalDownloads.toLocaleString();
  document.getElementById('val-conversion-rate').innerText = metrics.conversionRate;
}

// Populate Activity table log
function populateActivityFeed(activities) {
  const tbody = document.getElementById('table-activity-body');
  if (!tbody) return;

  if (activities.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px 0;">No activities logged yet</td></tr>`;
    return;
  }

  tbody.innerHTML = activities.map(act => {
    const time = new Date(act.timestamp).toLocaleString();
    const eventBadge = act.type === 'visit' 
      ? `<span class="badge-event badge-visit">Visit</span>` 
      : `<span class="badge-event badge-download">Download</span>`;

    const deviceIcon = act.device === 'TV' 
      ? '📺' 
      : act.device === 'Mobile' ? '📱' : '💻';

    return `
      <tr>
        <td style="color: var(--text-muted); font-size: 13px;">${time}</td>
        <td>${eventBadge}</td>
        <td style="font-family: monospace; font-size: 13px; color: var(--color-accent-light);">${act.ip}</td>
        <td>
          <div class="device-info">
            <span>${deviceIcon}</span>
            <span>${act.os}</span>
          </div>
        </td>
        <td style="color: var(--text-secondary); font-size: 13px;">${act.browser}</td>
      </tr>
    `;
  }).join('');
}

// Render Line Chart using Chart.js
function renderDailyChart(dailyData) {
  const ctx = document.getElementById('chart-daily')?.getContext('2d');
  if (!ctx) return;

  if (dailyChartInstance) {
    dailyChartInstance.destroy();
  }

  // Setup defaults for dark theme
  Chart.defaults.color = 'rgba(255, 255, 255, 0.55)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  // Fill default 0 entries if database is empty
  const labels = dailyData.length > 0 ? dailyData.map(d => d.date) : [new Date().toISOString().split('T')[0]];
  const visits = dailyData.length > 0 ? dailyData.map(d => d.visits) : [0];
  const uniques = dailyData.length > 0 ? dailyData.map(d => d.unique) : [0];
  const downloads = dailyData.length > 0 ? dailyData.map(d => d.downloads) : [0];

  // Gradients
  const gradVisits = ctx.createLinearGradient(0, 0, 0, 240);
  gradVisits.addColorStop(0, 'rgba(108, 58, 225, 0.35)');
  gradVisits.addColorStop(1, 'rgba(108, 58, 225, 0.00)');

  const gradDownloads = ctx.createLinearGradient(0, 0, 0, 240);
  gradDownloads.addColorStop(0, 'rgba(255, 107, 157, 0.35)');
  gradDownloads.addColorStop(1, 'rgba(255, 107, 157, 0.00)');

  dailyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Visits',
          data: visits,
          borderColor: '#6c3ae1',
          borderWidth: 2.5,
          pointBackgroundColor: '#6c3ae1',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          fill: true,
          backgroundColor: gradVisits,
          tension: 0.35
        },
        {
          label: 'Unique Visits',
          data: uniques,
          borderColor: '#9b6ef3',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointBackgroundColor: '#9b6ef3',
          pointHoverRadius: 4,
          fill: false,
          tension: 0.35
        },
        {
          label: 'APK Downloads',
          data: downloads,
          borderColor: '#ff6b9d',
          borderWidth: 2.5,
          pointBackgroundColor: '#ff6b9d',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          fill: true,
          backgroundColor: gradDownloads,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 15,
            padding: 15,
            font: { size: 12 }
          }
        },
        tooltip: {
          padding: 12,
          cornerRadius: 8,
          backgroundColor: '#141026',
          titleFont: { family: "'Space Grotesk', sans-serif", weight: 'bold' },
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.03)',
            drawBorder: false
          },
          ticks: {
            font: { size: 10 }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            precision: 0,
            font: { size: 10 }
          }
        }
      }
    }
  });
}

// Render platform pie/doughnut chart based on recent activity analysis
function renderDeviceChart(activities) {
  const ctx = document.getElementById('chart-devices')?.getContext('2d');
  if (!ctx) return;

  if (deviceChartInstance) {
    deviceChartInstance.destroy();
  }

  // Count OS distribution
  const counts = {
    'Windows': 0,
    'macOS/iOS': 0,
    'Android (Mobile)': 0,
    'Android TV': 0,
    'Other': 0
  };

  activities.forEach(act => {
    if (act.os === 'Windows') {
      counts['Windows']++;
    } else if (act.os === 'macOS' || act.os === 'iOS') {
      counts['macOS/iOS']++;
    } else if (act.os === 'Android') {
      counts['Android (Mobile)']++;
    } else if (act.os === 'Android TV') {
      counts['Android TV']++;
    } else {
      counts['Other']++;
    }
  });

  // Calculate percentages/sums. If empty, mock it nicely.
  const hasData = activities.length > 0;
  const labels = Object.keys(counts);
  const dataPoints = hasData 
    ? Object.values(counts) 
    : [1, 0, 0, 0, 0]; // Default mock display if no logs

  deviceChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: dataPoints,
        backgroundColor: [
          '#6c3ae1', // Purple
          '#ff6b9d', // Pink
          '#38ef7d', // Green
          '#00f2fe', // Cyan
          '#2f2d38'  // Muted gray
        ],
        borderWidth: 1.5,
        borderColor: '#06040a',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            font: { size: 11 },
            padding: 10
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (!hasData) return 'No data logged yet';
              const sum = context.dataset.data.reduce((a, b) => a + b, 0);
              const val = context.raw;
              const percentage = ((val / sum) * 100).toFixed(0);
              return `${context.label}: ${val} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

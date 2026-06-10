const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pichipie-admin';

// Check if ADMIN_PASSWORD is secure or default
if (ADMIN_PASSWORD === 'pichipie-admin') {
  console.log('\x1b[33m%s\x1b[0m', 'WARNING: Using default ADMIN_PASSWORD. Change it in .env for production.');
}

// Database location
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure database directory and file exist
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

if (!fs.existsSync(DB_PATH)) {
  const initialSchema = {
    total_visits: 0,
    total_downloads: 0,
    unique_visitor_hashes: [],
    daily: {}, // YYYY-MM-DD -> { visits: 0, unique: 0, downloads: 0, ips: [] }
    monthly: {}, // YYYY-MM -> { visits: 0, unique: 0, downloads: 0 }
    recent_activity: [] // array of { type, timestamp, ip, os, browser, device }
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(initialSchema, null, 2), 'utf8');
}

// Helper to read and write database
function getDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (err) {
    console.error('Error reading database:', err);
    return null;
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

// IP encryption/hashing and anonymizing helpers
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip || '').digest('hex');
}

function anonymizeIP(ip) {
  if (!ip) return '0.0.0.xxx';
  // Check if IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 3).join(':') + ':xxxx:xxxx';
  } else {
    // IPv4
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    return 'xxx.xxx.xxx.xxx';
  }
}

// Simple User-Agent Parser
function parseUA(ua) {
  if (!ua) return { os: 'Unknown OS', browser: 'Unknown Browser', device: 'Desktop' };
  let os = 'Unknown OS';
  let device = 'Desktop';
  let browser = 'Unknown Browser';

  // Detect OS/Device
  if (ua.includes('Android')) {
    if (ua.includes('Android TV') || ua.includes('Leanback') || ua.includes('ExoPlayer') || ua.includes('aftb') || ua.includes('afts') || ua.includes('SmartTV')) {
      os = 'Android TV';
      device = 'TV';
    } else {
      os = 'Android';
      device = 'Mobile';
    }
  } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    os = 'iOS';
    device = 'Mobile';
  } else if (ua.includes('Windows')) {
    os = 'Windows';
    device = 'Desktop';
  } else if (ua.includes('Macintosh') || ua.includes('Mac OS')) {
    os = 'macOS';
    device = 'Desktop';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
    device = 'Desktop';
  }

  // Detect Browser
  if (ua.includes('Chrome') || ua.includes('CriOS')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Edge') || ua.includes('Edg')) {
    browser = 'Edge';
  } else if (ua.includes('ExoPlayer') || ua.includes('Media3')) {
    browser = 'ExoPlayer';
  } else if (ua.includes('PichiPie')) {
    browser = 'PichiPie TV';
  }

  return { os, browser, device };
}

// Middleware to parse json
app.use(express.json());

// Track visit on website load (only for home "/" or index.html)
app.use((req, res, next) => {
  const isHtmlPage = req.path === '/' || req.path === '/index.html';
  if (isHtmlPage) {
    trackEvent('visit', req);
  }
  next();
});

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Function to track events
function trackEvent(type, req) {
  const db = getDB();
  if (!db) return;

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ipHash = hashIP(ip);
  const anonIp = anonymizeIP(ip);
  const ua = req.headers['user-agent'] || '';
  const { os, browser, device } = parseUA(ua);
  
  const now = new Date();
  // Adjust to local time if needed, or stick to UTC date YYYY-MM-DD
  const dateStr = now.toISOString().split('T')[0];
  const monthStr = dateStr.substring(0, 7);

  // Initialize date in stats if not exists
  if (!db.daily[dateStr]) {
    db.daily[dateStr] = { visits: 0, unique: 0, downloads: 0, ips: [] };
  }
  if (!db.monthly[monthStr]) {
    db.monthly[monthStr] = { visits: 0, unique: 0, downloads: 0 };
  }

  if (type === 'visit') {
    db.total_visits += 1;
    db.daily[dateStr].visits += 1;
    db.monthly[monthStr].visits += 1;

    // Check if unique overall
    let isUniqueOverall = false;
    if (!db.unique_visitor_hashes.includes(ipHash)) {
      db.unique_visitor_hashes.push(ipHash);
      isUniqueOverall = true;
    }

    // Check if unique for the day
    let isUniqueDaily = false;
    if (!db.daily[dateStr].ips.includes(ipHash)) {
      db.daily[dateStr].ips.push(ipHash);
      db.daily[dateStr].unique += 1;
      isUniqueDaily = true;
    }

    if (isUniqueOverall) {
      // Add a unique tag or increment monthly unique if needed
      // (Monthly unique is approximated by unique daily or simple aggregation)
    }

  } else if (type === 'download') {
    db.total_downloads += 1;
    db.daily[dateStr].downloads += 1;
    db.monthly[monthStr].downloads += 1;
  }

  // Add to recent activity
  db.recent_activity.unshift({
    type,
    timestamp: now.toISOString(),
    ip: anonIp,
    os,
    browser,
    device
  });

  // Limit recent activity to last 100 items
  if (db.recent_activity.length > 100) {
    db.recent_activity.pop();
  }

  saveDB(db);
}

// Download APK route
app.get('/download', (req, res) => {
  trackEvent('download', req);
  
  // Send the APK file
  const apkPath = path.join(__dirname, 'public', 'assets', 'PichiPie-TV-v1.0.apk');
  
  if (fs.existsSync(apkPath)) {
    res.download(apkPath, 'PichiPie-TV-v1.0.apk', (err) => {
      if (err) {
        console.error('Error sending APK file:', err);
        if (!res.headersSent) {
          res.status(500).send('Error downloading file');
        }
      }
    });
  } else {
    res.status(404).send('APK file not found on server');
  }
});

// Admin Authentication API
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    // Generate a simple token based on the password and current server state
    // In a real environment, use JWT or cryptographically secure random session keys.
    const token = crypto.createHmac('sha256', ADMIN_PASSWORD).update('pichipie-session-token-salt').digest('hex');
    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Admin Authorization Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authorization header required' });
  }
  const token = authHeader.split(' ')[1];
  const expectedToken = crypto.createHmac('sha256', ADMIN_PASSWORD).update('pichipie-session-token-salt').digest('hex');
  
  if (token === expectedToken) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Invalid token.' });
  }
}

// Admin Stats Fetch API
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  const db = getDB();
  if (!db) {
    return res.status(500).json({ success: false, message: 'Database read error' });
  }

  // Calculate stats to return
  const totalUnique = db.unique_visitor_hashes.length;
  
  // Format daily stats for charts (last 30 days)
  const sortedDates = Object.keys(db.daily).sort();
  const last30Dates = sortedDates.slice(-30);
  
  const dailyChartData = last30Dates.map(date => {
    const day = db.daily[date];
    return {
      date,
      visits: day.visits,
      unique: day.unique,
      downloads: day.downloads
    };
  });

  // Format monthly stats for charts
  const sortedMonths = Object.keys(db.monthly).sort();
  const monthlyChartData = sortedMonths.map(month => {
    const m = db.monthly[month];
    return {
      month,
      visits: m.visits,
      downloads: m.downloads
    };
  });

  res.json({
    success: true,
    metrics: {
      totalVisits: db.total_visits,
      uniqueVisitors: totalUnique,
      totalDownloads: db.total_downloads,
      conversionRate: totalUnique > 0 ? ((db.total_downloads / totalUnique) * 100).toFixed(1) : '0.0'
    },
    dailyChart: dailyChartData,
    monthlyChart: monthlyChartData,
    recentActivity: db.recent_activity
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`PichiPie Labs server running at http://localhost:${PORT}`);
});

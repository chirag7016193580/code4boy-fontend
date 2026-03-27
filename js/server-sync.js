/* ============================================
   Code4Boy - Server Sync & Analytics Module
   Syncs user data to server and tracks visitors
   ============================================ */

// Backend API URL - Now dynamically loaded from Admin Panel (localStorage)
// Go to Admin Panel > "API & Backend Configuration" to set your backend URL
// Or set it manually: localStorage.setItem('c4b-api-config', JSON.stringify({apiBaseUrl: 'https://your-api.com'}))
function getApiBaseUrl() {
  // First check if admin panel set a live value this session
  if (typeof window !== 'undefined' && window.__C4B_API_BASE_URL) {
    return window.__C4B_API_BASE_URL;
  }
  // Then check localStorage (set from Admin Panel)
  try {
    var config = JSON.parse(localStorage.getItem('c4b-api-config') || '{}');
    if (config.apiBaseUrl) return config.apiBaseUrl;
  } catch (e) {}
  // Default: deployed backend server
  return 'https://code4boy-backend.vercel.app';
}

// Keep API_BASE_URL as a getter for backward compatibility
var API_BASE_URL = getApiBaseUrl();

// Check if backend is configured
function isBackendConfigured() {
  var url = getApiBaseUrl();
  return url && url !== '' && url !== 'https://BACKEND_URL_HERE' && !url.includes('BACKEND_URL_HERE');
}

// --- User-Agent Parsing Helpers ---
function detectBrowser() {
  var ua = navigator.userAgent || '';
  if (ua.indexOf('Edg/') > -1) return 'Edge';
  if (ua.indexOf('OPR/') > -1 || ua.indexOf('Opera') > -1) return 'Opera';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'Internet Explorer';
  return 'Unknown';
}

function detectOS() {
  var ua = navigator.userAgent || '';
  var platform = navigator.platform || '';
  if (ua.indexOf('Windows') > -1) return 'Windows';
  if (ua.indexOf('Mac OS') > -1 || ua.indexOf('Macintosh') > -1) return 'macOS';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('CrOS') > -1) return 'Chrome OS';
  return platform || 'Unknown';
}

function detectDeviceType() {
  var ua = navigator.userAgent || '';
  if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'Mobile';
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

// --- Visitor Analytics Tracking ---
(function trackVisit() {
  if (!isBackendConfigured()) {
    console.info('[Code4Boy] Backend not configured - running in offline mode. Analytics disabled.');
    return;
  }

  try {
    var connType = '';
    if (navigator.connection) {
      connType = navigator.connection.effectiveType || '';
    }

    var payload = {
      page: window.location.pathname || '/',
      referrer: document.referrer || '',
      screenWidth: window.screen.width || 0,
      screenHeight: window.screen.height || 0,
      language: navigator.language || '',
      platform: navigator.platform || '',
      cookieEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      connectionType: connType,
      deviceMemory: navigator.deviceMemory || 0,
      touchPoints: navigator.maxTouchPoints || 0,
      browser: detectBrowser(),
      os: detectOS(),
      device_type: detectDeviceType(),
      userAgent: navigator.userAgent || ''
    };

    // Try to get IP and location from free geolocation API, then send tracking data
    fetch('https://ipapi.co/json/', { method: 'GET' })
      .then(function(r) { return r.json(); })
      .then(function(geo) {
        payload.ip = geo.ip || '';
        payload.city = geo.city || '';
        payload.country = geo.country_name || '';
        payload.region = geo.region || '';
        payload.timezone = geo.timezone || '';
        payload.isp = geo.org || '';
      })
      .catch(function() {
        // Geolocation API failed - send without IP/location
        payload.ip = '';
        payload.city = '';
        payload.country = '';
      })
      .finally(function() {
        fetch(getApiBaseUrl() + '/api/track/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(function() {});
      });
  } catch (e) {
    // Silent fail - analytics should never break the site
  }
})();

// --- Download Tracking ---
function trackDownload(fileName, category) {
  if (!isBackendConfigured()) return;
  try {
    fetch(getApiBaseUrl() + '/api/track/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: fileName, category: category || '' })
    }).catch(function() {});
  } catch (e) {}
}

// --- User Data Server Sync ---
var ServerSync = {
  // Sync user data to server after login
  syncToServer: function(userData) {
    if (!isBackendConfigured()) return;
    if (!userData || !userData.uid) return;

    var payload = {
      uid: userData.uid,
      name: userData.name || 'User',
      email: userData.email || '',
      photo: userData.photo || '',
      joinedAt: userData.joinedAt || '',
      favorites: userData.favorites || [],
      watched: userData.watched || [],
      addedTutorials: userData.addedTutorials || []
    };

    fetch(getApiBaseUrl() + '/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.status === 'ok') {
        // User data synced to server
      }
    })
    .catch(function(err) {
      console.warn('Server sync failed (offline mode):', err.message);
    });
  },

  // Fetch user data from server (for cross-device login)
  fetchFromServer: function(uid, callback) {
    if (!isBackendConfigured()) { if (callback) callback(null); return; }
    if (!uid) { if (callback) callback(null); return; }

    fetch(getApiBaseUrl() + '/api/user/' + uid)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.status === 'ok' && data.data) {
        // User data fetched from server
        if (callback) callback(data.data);
      } else {
        if (callback) callback(null);
      }
    })
    .catch(function(err) {
      console.warn('Server fetch failed (offline mode):', err.message);
      if (callback) callback(null);
    });
  },

  // Update user data on server (called when favorites/watched/tutorials change)
  updateOnServer: function(userData) {
    if (!isBackendConfigured()) return;
    if (!userData || !userData.uid) return;

    var payload = {
      uid: userData.uid,
      name: userData.name || 'User',
      email: userData.email || '',
      photo: userData.photo || '',
      favorites: userData.favorites || [],
      watched: userData.watched || [],
      addedTutorials: userData.addedTutorials || []
    };

    fetch(getApiBaseUrl() + '/api/user/' + userData.uid + '/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function() {});
  }
};

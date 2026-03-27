/* ============================================
   Code4Boy - Google Identity Services Configuration
   Direct Google Sign-In
   ============================================ */

// Google OAuth Client ID
// IMPORTANT: Replace this with YOUR actual Google OAuth Client ID
// Get it from: https://console.cloud.google.com/apis/credentials
// Create Credentials > OAuth client ID > Web application
const GOOGLE_CLIENT_ID = '428969733324-li1epdsg1gtmse1fdqilhanh7doio7u6.apps.googleusercontent.com';

// Security: Domain validation
const currentDomain = window.location.hostname;
const isDevelopment = currentDomain === 'localhost' || currentDomain === '127.0.0.1';

// Security Check: Verify we're on allowed domain
(function securityCheck() {
  const allowedDomains = [
    'localhost',
    '127.0.0.1',
    'code4boy-web.vercel.app',
    'code4boy-web-git-main-code4boy.vercel.app',
    'code4boy-fontend.vercel.app'
  ];

  const currentDomain = window.location.hostname;

  if (!allowedDomains.includes(currentDomain)) {
    console.error('SECURITY ALERT: Unauthorized domain detected!', currentDomain);
    console.warn('Authentication disabled for security reasons.');
    window.AUTH_DISABLED = true;
  } else {
    // Domain verified
    window.AUTH_DISABLED = false;
  }
})();

// Decode JWT token from Google Sign-In response
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

// Initialize Google Identity Services when the library loads
function initGoogleSignIn() {
  if (typeof google === 'undefined' || !google.accounts) {
    setTimeout(initGoogleSignIn, 200);
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleSignIn,
    auto_select: false,
    cancel_on_tap_outside: true
  });

  window.GIS_INITIALIZED = true;
  // Google Identity Services initialized

  // Notify auth module
  if (typeof Auth !== 'undefined' && Auth.onGISReady) {
    Auth.onGISReady();
  }
}

// Handle Google Sign-In callback
function handleGoogleSignIn(response) {
  if (!response || !response.credential) {
    console.error('Sign-in failed: No credential received');
    if (typeof showNotification === 'function') {
      showNotification('Sign-in failed. Please try again.', 'error');
    }
    return;
  }

  const payload = decodeJwtPayload(response.credential);
  if (!payload) {
    console.error('Sign-in failed: Could not decode token');
    if (typeof showNotification === 'function') {
      showNotification('Sign-in failed. Please try again.', 'error');
    }
    return;
  }

  // Pass user data to Auth module
  if (typeof Auth !== 'undefined') {
    Auth.handleSignInSuccess({
      uid: payload.sub,
      name: payload.name || 'User',
      email: payload.email || '',
      photo: payload.picture || '',
      joinedAt: new Date().toISOString()
    });
  }
}

// Start initialization
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initGoogleSignIn, 300);
});

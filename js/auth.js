/* ============================================
   Code4Boy - Authentication & Profile Module
   Google Identity Services (GIS) Sign-In,
   Profile Management, Watched Tutorials,
   Favorites, Add Tutorials
   
   SECURITY FEATURES:
   - Domain restriction
   - Rate limiting
   - Input sanitization
   - Session validation
   ============================================ */

const Auth = {
  currentUser: null,
  
  // Security: Rate limiting for sign-in attempts
  signInAttempts: 0,
  lastSignInAttempt: 0,
  MAX_ATTEMPTS: 5,
  COOLDOWN_PERIOD: 300000, // 5 minutes

  // Initialize auth state - check localStorage for existing session
  init() {
    // Security check - disable if on unauthorized domain
    if (window.AUTH_DISABLED) {
      console.warn('Authentication disabled due to security restrictions');
      return;
    }
    
    // Check for existing session in localStorage
    const uid = localStorage.getItem('c4b-current-uid');
    if (uid) {
      const userData = JSON.parse(localStorage.getItem('c4b-user-' + uid) || 'null');
      if (userData && Auth.validateStoredSession(userData)) {
        Auth.currentUser = {
          uid: userData.uid,
          name: userData.name || 'User',
          email: userData.email,
          photo: userData.photo || '',
          joinedAt: userData.joinedAt
        };
        Auth.updateNavbar(true);
      } else {
        // Invalid stored session, clean up
        localStorage.removeItem('c4b-current-uid');
        Auth.currentUser = null;
        Auth.updateNavbar(false);
      }
    } else {
      Auth.currentUser = null;
      Auth.updateNavbar(false);
    }
  },

  // Called when GIS library is ready
  onGISReady() {
    // Re-check auth state if needed
    if (!Auth.currentUser) {
      Auth.updateNavbar(false);
    }
  },

  // Handle successful sign-in from GIS callback
  handleSignInSuccess(userData) {
    Auth.currentUser = {
      uid: userData.uid,
      name: userData.name || 'User',
      email: userData.email,
      photo: userData.photo || '',
      joinedAt: userData.joinedAt || new Date().toISOString()
    };
    
    // Check for existing profile to preserve joinedAt date
    const existingKey = 'c4b-user-' + userData.uid;
    const existing = JSON.parse(localStorage.getItem(existingKey) || '{}');
    if (existing.joinedAt) {
      Auth.currentUser.joinedAt = existing.joinedAt;
    }
    
    // Fetch server data first, then merge with local data
    if (typeof ServerSync !== 'undefined') {
      ServerSync.fetchFromServer(userData.uid, function(serverData) {
        if (serverData) {
          // Merge server data with local data (server wins for existing items)
          var localData = JSON.parse(localStorage.getItem(existingKey) || '{}');
          var mergedFavorites = Auth._mergeArrays(serverData.favorites || [], localData.favorites || [], 'id');
          var mergedWatched = Auth._mergeArrays(serverData.watched || [], localData.watched || [], 'id');
          var mergedAdded = Auth._mergeArrays(serverData.addedTutorials || [], localData.addedTutorials || [], 'id');
          
          // Update local storage with merged data
          localData.favorites = mergedFavorites;
          localData.watched = mergedWatched;
          localData.addedTutorials = mergedAdded;
          localData.uid = userData.uid;
          localData.name = userData.name || 'User';
          localData.email = userData.email;
          localData.photo = userData.photo || '';
          localData.joinedAt = serverData.joinedAt || localData.joinedAt || Auth.currentUser.joinedAt;
          localStorage.setItem(existingKey, JSON.stringify(localData));
          
          // Sync merged data back to server
          ServerSync.syncToServer(localData);
        } else {
          // No server data - sync local data to server
          var localProfile = Auth.getUserData();
          if (localProfile) {
            ServerSync.syncToServer(localProfile);
          }
        }
      });
    }
    
    Auth.saveUserProfile(Auth.currentUser);
    Auth.updateNavbar(true);
    
    // Reset sign-in attempts on success
    Auth.signInAttempts = 0;
    
    showNotification('Welcome, ' + Auth.currentUser.name + '!', 'success');
  },

  // Google Sign-In with Rate Limiting (triggers GIS popup)
  signInWithGoogle() {
    // Security check - disable if on unauthorized domain
    if (window.AUTH_DISABLED) {
      showNotification('Authentication not allowed on this domain.', 'error');
      return false;
    }
    
    // Rate limiting check
    const now = Date.now();
    if (this.signInAttempts >= this.MAX_ATTEMPTS) {
      if (now - this.lastSignInAttempt < this.COOLDOWN_PERIOD) {
        const remainingTime = Math.ceil((this.COOLDOWN_PERIOD - (now - this.lastSignInAttempt)) / 60000);
        showNotification('Too many attempts. Please wait ' + remainingTime + ' minute(s).', 'error');
        return false;
      }
      // Reset after cooldown
      this.signInAttempts = 0;
    }
    
    this.signInAttempts++;
    this.lastSignInAttempt = now;
    
    // Check if GIS is initialized
    if (!window.GIS_INITIALIZED) {
      showNotification('Sign-in is loading. Please try again in a moment.', 'error');
      return false;
    }
    
    // Trigger Google Sign-In popup
    google.accounts.id.prompt(function(notification) {
      if (notification.isNotDisplayed()) {
        // Fallback: use renderButton approach or show manual prompt
        // This can happen if cookies are blocked or popup is suppressed
        var reason = notification.getNotDisplayedReason();
        // One Tap not displayed
        
        // Use a temporary container to render Google button and auto-click
        var tempDiv = document.createElement('div');
        tempDiv.id = 'g_id_temp_btn';
        tempDiv.style.position = 'fixed';
        tempDiv.style.top = '50%';
        tempDiv.style.left = '50%';
        tempDiv.style.transform = 'translate(-50%, -50%)';
        tempDiv.style.zIndex = '10000';
        tempDiv.style.background = 'rgba(0,0,0,0.8)';
        tempDiv.style.padding = '40px';
        tempDiv.style.borderRadius = '16px';
        tempDiv.style.boxShadow = '0 0 40px rgba(0,0,0,0.5)';
        document.body.appendChild(tempDiv);
        
        google.accounts.id.renderButton(tempDiv, {
          theme: 'filled_blue',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: 280
        });
        
        // Add close button
        var closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cancel';
        closeBtn.style.cssText = 'display:block;margin:16px auto 0;padding:8px 24px;background:transparent;border:1px solid rgba(255,255,255,0.3);color:#fff;border-radius:8px;cursor:pointer;font-size:0.9rem;';
        closeBtn.onclick = function() { tempDiv.remove(); };
        tempDiv.appendChild(closeBtn);
        
        // Also add backdrop click to close
        var backdrop = document.createElement('div');
        backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;';
        backdrop.onclick = function() { backdrop.remove(); tempDiv.remove(); };
        document.body.insertBefore(backdrop, tempDiv);
      }
      if (notification.isDismissedMoment()) {
        // Sign-in dismissed
      }
    });
    
    return true;
  },

  // Sign Out
  signOut() {
    // Revoke Google session
    if (window.GIS_INITIALIZED && Auth.currentUser) {
      google.accounts.id.disableAutoSelect();
    }
    
    Auth.currentUser = null;
    localStorage.removeItem('c4b-current-uid');
    Auth.updateNavbar(false);
    showNotification('Signed out successfully.', 'success');
    
    // Redirect to home if on profile page
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'profile.html') {
      const isSubPage = window.location.pathname.includes('/pages/');
      window.location.href = isSubPage ? '../index.html' : 'index.html';
    }
  },

  // Save user profile to localStorage
  saveUserProfile(user) {
    const key = 'c4b-user-' + user.uid;
    let existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing.uid = user.uid;
    existing.name = user.name;
    existing.email = user.email;
    existing.photo = user.photo;
    existing.joinedAt = user.joinedAt || existing.joinedAt || new Date().toISOString();
    if (!existing.favorites) existing.favorites = [];
    if (!existing.watched) existing.watched = [];
    if (!existing.addedTutorials) existing.addedTutorials = [];
    localStorage.setItem(key, JSON.stringify(existing));
    localStorage.setItem('c4b-current-uid', user.uid);
  },

  // Get user profile data
  getUserData() {
    const uid = localStorage.getItem('c4b-current-uid');
    if (!uid) return null;
    return JSON.parse(localStorage.getItem('c4b-user-' + uid) || 'null');
  },

  // Toggle favorite tutorial
  toggleFavorite(tutorialId, tutorialTitle, tutorialCategory) {
    const data = Auth.getUserData();
    if (!data) {
      showNotification('Please sign in to add favorites.', 'error');
      return false;
    }
    const idx = data.favorites.findIndex(f => f.id === tutorialId);
    if (idx > -1) {
      data.favorites.splice(idx, 1);
      localStorage.setItem('c4b-user-' + data.uid, JSON.stringify(data));
      if (typeof ServerSync !== 'undefined') ServerSync.updateOnServer(data);
      showNotification('Removed from favorites.', 'success');
      return false;
    } else {
      data.favorites.push({
        id: tutorialId,
        title: tutorialTitle,
        category: tutorialCategory || 'General',
        addedAt: new Date().toISOString()
      });
      localStorage.setItem('c4b-user-' + data.uid, JSON.stringify(data));
      if (typeof ServerSync !== 'undefined') ServerSync.updateOnServer(data);
      showNotification('Added to favorites!', 'success');
      return true;
    }
  },

  // Check if tutorial is favorited
  isFavorited(tutorialId) {
    const data = Auth.getUserData();
    if (!data) return false;
    return data.favorites.some(f => f.id === tutorialId);
  },

  // Mark tutorial as watched
  markWatched(tutorialId, tutorialTitle, tutorialCategory) {
    const data = Auth.getUserData();
    if (!data) return;
    if (!data.watched.some(w => w.id === tutorialId)) {
      data.watched.push({
        id: tutorialId,
        title: tutorialTitle,
        category: tutorialCategory || 'General',
        watchedAt: new Date().toISOString()
      });
      localStorage.setItem('c4b-user-' + data.uid, JSON.stringify(data));
      if (typeof ServerSync !== 'undefined') ServerSync.updateOnServer(data);
    }
  },

  // Add a custom tutorial
  addTutorial(title, category, description, link) {
    const data = Auth.getUserData();
    if (!data) {
      showNotification('Please sign in to add tutorials.', 'error');
      return false;
    }
    const tutorial = {
      id: 'custom-' + Date.now(),
      title: title,
      category: category,
      description: description,
      link: link || '',
      addedAt: new Date().toISOString(),
      addedBy: data.name
    };
    data.addedTutorials.push(tutorial);
    localStorage.setItem('c4b-user-' + data.uid, JSON.stringify(data));
    if (typeof ServerSync !== 'undefined') ServerSync.updateOnServer(data);
    showNotification('Tutorial added successfully!', 'success');
    return true;
  },

  // Remove custom tutorial
  removeTutorial(tutorialId) {
    const data = Auth.getUserData();
    if (!data) return;
    data.addedTutorials = data.addedTutorials.filter(t => t.id !== tutorialId);
    localStorage.setItem('c4b-user-' + data.uid, JSON.stringify(data));
    if (typeof ServerSync !== 'undefined') ServerSync.updateOnServer(data);
  },

  // Remove from favorites
  removeFavorite(tutorialId) {
    const data = Auth.getUserData();
    if (!data) return;
    data.favorites = data.favorites.filter(f => f.id !== tutorialId);
    localStorage.setItem('c4b-user-' + data.uid, JSON.stringify(data));
    if (typeof ServerSync !== 'undefined') ServerSync.updateOnServer(data);
  },

  // Remove from watched
  removeWatched(tutorialId) {
    const data = Auth.getUserData();
    if (!data) return;
    data.watched = data.watched.filter(w => w.id !== tutorialId);
    localStorage.setItem('c4b-user-' + data.uid, JSON.stringify(data));
    if (typeof ServerSync !== 'undefined') ServerSync.updateOnServer(data);
  },

  // Helper: merge two arrays by key
  _mergeArrays(arr1, arr2, key) {
    var ids = {};
    var merged = [];
    (arr1 || []).forEach(function(item) {
      if (item && item[key]) { ids[item[key]] = true; merged.push(item); }
    });
    (arr2 || []).forEach(function(item) {
      if (item && item[key] && !ids[item[key]]) { ids[item[key]] = true; merged.push(item); }
    });
    return merged;
  },

  // Security: Validate stored session data
  validateStoredSession(userData) {
    // Check if user data exists
    if (!userData || !userData.uid) {
      return false;
    }
    
    // Check email format
    if (!userData.email || !userData.email.includes('@')) {
      return false;
    }
    
    // Session is valid
    return true;
  },

  // Security: Validate user session (kept for compatibility)
  validateUserSession(user) {
    return Auth.validateStoredSession(user);
  },

  // Security: Sanitize input to prevent XSS
  sanitizeInput(input) {
    if (!input) return '';
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  // Update navbar to show login/profile button
  updateNavbar(isLoggedIn) {
    const authBtnContainer = document.getElementById('authBtnContainer');
    if (!authBtnContainer) return;

    if (isLoggedIn && Auth.currentUser) {
      const isSubPage = window.location.pathname.includes('/pages/');
      const profileLink = isSubPage ? 'profile.html' : 'pages/profile.html';
      authBtnContainer.innerHTML =
        '<a href="' + profileLink + '" class="auth-profile-btn" title="My Profile">' +
            '<img src="' + (Auth.currentUser.photo || '') + '" alt="' + Auth.sanitizeInput(Auth.currentUser.name) + '" class="auth-avatar" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
            '<span class="auth-avatar-fallback" style="display:none"><i class="fas fa-user"></i></span>' +
            '<span class="auth-name">' + Auth.sanitizeInput(Auth.currentUser.name.split(' ')[0]) + '</span>' +
        '</a>';
    } else {
      authBtnContainer.innerHTML =
        '<button class="auth-login-btn" onclick="Auth.signInWithGoogle()" title="Sign in with Google">' +
          '<i class="fab fa-google"></i> <span>Sign In</span>' +
        '</button>';
    }
  }
};

// Initialize Auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure GIS config is loaded
  setTimeout(() => {
    Auth.init();
  }, 400);
});

// ============================================
// TUTORIAL TRACKING - Auto-track on tutorials page
// ============================================
function initTutorialTracking() {
  // Add favorite buttons to tutorial sections
  const tutorialSections = document.querySelectorAll('.tab-content[data-tab]');
  tutorialSections.forEach((section) => {
    const tab = section.getAttribute('data-tab');
    
    // Find all tutorial content blocks (both built-in and admin)
    const tutorialContents = section.querySelectorAll('.tutorial-content');
    
    tutorialContents.forEach((tutContent) => {
      // Skip if already has tracking buttons
      if (tutContent.querySelector('.tutorial-track-btns')) return;
      
      // Find the first h2 in this tutorial content
      const header = tutContent.querySelector('h2');
      if (!header) return;
      
      // Get tutorial ID - use admin ID if available, otherwise use tab name
      const tutorialId = 'tutorial-' + (tutContent.dataset?.adminTutId || tab);
      const title = header.textContent.trim();
      
      const trackDiv = document.createElement('div');
      trackDiv.className = 'tutorial-track-btns';
      
      const isFav = Auth.isFavorited(tutorialId);
      
      trackDiv.innerHTML =
        '<button class="track-btn fav-btn' + (isFav ? ' active' : '') + '" data-id="' + Auth.sanitizeInput(tutorialId) + '" data-title="' + Auth.sanitizeInput(title) + '" data-cat="' + Auth.sanitizeInput(tab) + '" onclick="handleFavorite(this)" title="' + (isFav ? 'Remove from Favorites' : 'Add to Favorites') + '">' +
          '<i class="' + (isFav ? 'fas' : 'far') + ' fa-heart"></i> <span>' + (isFav ? 'Favorited' : 'Favorite') + '</span>' +
        '</button>' +
        '<button class="track-btn watched-btn" data-id="' + tutorialId + '" data-title="' + title + '" data-cat="' + tab + '" onclick="handleWatched(this)" title="Mark as Watched">' +
          '<i class="fas fa-eye"></i> <span>Mark Watched</span>' +
        '</button>';
      
      // Insert after the first h2 header
      header.after(trackDiv);
    });
  });
}

function handleFavorite(btn) {
  const id = btn.dataset.id;
  const title = btn.dataset.title;
  const cat = btn.dataset.cat;
  const result = Auth.toggleFavorite(id, title, cat);
  if (result) {
    btn.classList.add('active');
    btn.innerHTML = '<i class="fas fa-heart"></i> <span>Favorited</span>';
    btn.title = 'Remove from Favorites';
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<i class="far fa-heart"></i> <span>Favorite</span>';
    btn.title = 'Add to Favorites';
  }
}

function handleWatched(btn) {
  const id = btn.dataset.id;
  const title = btn.dataset.title;
  const cat = btn.dataset.cat;
  Auth.markWatched(id, title, cat);
  btn.classList.add('active');
  btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Watched</span>';
  btn.disabled = true;
  showNotification('Marked as watched!', 'success');
}

// Initialize tracking on tutorials page
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'tutorials.html') {
    setTimeout(initTutorialTracking, 1000);
  }
});

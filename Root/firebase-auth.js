import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFFu39ddkOa4hRwuIiDsX7JvqN5kAYeeA",
  authDomain: "bankify-6bbdf.firebaseapp.com",
  projectId: "bankify-6bbdf",
  storageBucket: "bankify-6bbdf.firebasestorage.app",
  messagingSenderId: "219952925811",
  appId: "1:219952925811:web:55ed20c1075a9b63ab6e06",
  measurementId: "G-ZB9MM0DK77"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get current page name to handle routing
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const isAuthPage = currentPage === 'index.html' || currentPage === '';

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (isAuthPage) {
      window.location.href = 'dashboard.html';
    } else {
      // Update sidebar user info
      const nameEl = document.querySelector('.user-profile .font-semibold');
      const emailEl = document.querySelector('.user-profile .text-secondary');
      const avatarEl = document.querySelector('.user-avatar');
      
      if (nameEl) nameEl.textContent = user.displayName || 'User';
      if (emailEl) emailEl.textContent = user.email;
      if (avatarEl) {
        // Initials for avatar
        const initials = (user.displayName || 'User').substring(0, 2).toUpperCase();
        avatarEl.textContent = initials;
      }
    }
  } else {
    // No user is signed in
    if (!isAuthPage) {
      window.location.href = 'index.html';
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Login Form Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Logging in...";
      submitBtn.disabled = true;

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Handled by onAuthStateChanged
        })
        .catch((error) => {
          alert("Login failed: " + error.message);
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  // Signup Form Submission
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;

      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Creating Account...";
      submitBtn.disabled = true;

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          // Update profile with name
          return updateProfile(user, {
            displayName: name
          });
        })
        .then(() => {
          // Handled by onAuthStateChanged
        })
        .catch((error) => {
          alert("Signup failed: " + error.message);
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  // Logout Logic
  if (!isAuthPage) {
    const logoutBtn = document.querySelector('a.text-red');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).catch((error) => {
          alert("Logout failed: " + error.message);
        });
      });
    }
  }
});

/**
 * =============================================================================
 * Web Technology Lab Concepts:
 * 1. JavaScript Form Validation: Client-side validation before submission
 * 2. HTTP Cookies: Reading, writing, and deleting cookies via document.cookie
 * 3. AJAX Communication: Sending auth data to LoginServlet & RegisterServlet
 * 4. Session Protection: Verifying session state before accessing protected pages
 * =============================================================================
 */

const CookieUtil = {
  /**
   * Set a cookie with name, value, and expiration days.
   * e.g., preferred_category or remember_user
   */
  set: function(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value || "") + expires + "; path=/; SameSite=Lax";
    console.log(`[Cookie Set] ${name}=${value} (expires in ${days || 'session'} days)`);
  },

  /**
   * Retrieve cookie value by name from document.cookie
   */
  get: function(name) {
    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },

  /**
   * Delete a cookie by expiring it in the past
   */
  delete: function(name) {
    document.cookie = encodeURIComponent(name) + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    console.log(`[Cookie Deleted] ${name}`);
  },

  /**
   * Return all currently accessible cookies as an object dictionary
   */
  getAll: function() {
    const cookies = {};
    if (!document.cookie) return cookies;
    const list = document.cookie.split(';');
    for (let i = 0; i < list.length; i++) {
      const parts = list[i].trim().split('=');
      if (parts[0]) {
        cookies[decodeURIComponent(parts[0])] = decodeURIComponent(parts.slice(1).join('='));
      }
    }
    return cookies;
  }
};

window.CookieUtil = CookieUtil;

// =============================================================================
// Validation & Auth Controller
// =============================================================================
const AuthController = {
  initLogin: function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Check if 'remember_user' cookie exists
    const rememberedEmail = CookieUtil.get('remember_user');
    const emailInput = document.getElementById('email');
    const rememberCheckbox = document.getElementById('remember');

    if (rememberedEmail && emailInput) {
      emailInput.value = rememberedEmail;
      if (rememberCheckbox) rememberCheckbox.checked = true;
      console.log(`[Cookie Restored] Remembered email loaded: ${rememberedEmail}`);
    }

    // Check for preferred_category cookie to display return greeting
    const preferredCategory = CookieUtil.get('preferred_category');
    const cookieGreeting = document.getElementById('cookieGreeting');
    if (preferredCategory && cookieGreeting) {
      cookieGreeting.style.display = 'block';
      cookieGreeting.innerHTML = `<strong>Welcome back!</strong> Your saved preferred role category is: <em>${preferredCategory.replace(/_/g, ' ')}</em> (read from browser Cookie).`;
    }

    // Handle Form Submission with AJAX
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = emailInput.value.trim();
      const password = document.getElementById('password').value;
      const remember = rememberCheckbox ? rememberCheckbox.checked : false;

      // Client-Side Validation
      let isValid = true;
      if (!email || !email.includes('@')) {
        AuthController.showFieldError('email', 'Please enter a valid academic email address.');
        isValid = false;
      } else {
        AuthController.clearFieldError('email');
      }

      if (!password || password.length < 4) {
        AuthController.showFieldError('password', 'Password must be at least 4 characters long.');
        isValid = false;
      } else {
        AuthController.clearFieldError('password');
      }

      if (!isValid) return;

      const submitBtn = document.getElementById('loginSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Validating via Servlet...';
      }

      const alertBox = document.getElementById('loginAlert');
      if (alertBox) alertBox.style.display = 'none';

      // Send AJAX request to LoginServlet
      AjaxClient.post('/LoginServlet', {
        email: email,
        password: password,
        remember: remember ? 'true' : 'false'
      }, function(response) {
        // Success
        console.log('[Auth] Login successful. Session established:', response);
        
        // Also save preferred category in cookie client-side as demonstration
        if (response.user && response.user.preferredRole) {
          CookieUtil.set('preferred_category', response.user.preferredRole, 30);
        }
        if (remember) {
          CookieUtil.set('remember_user', email, 7);
        } else {
          CookieUtil.delete('remember_user');
        }

        // Store active session token / flag in sessionStorage
        sessionStorage.setItem('rolematch_user', JSON.stringify(response.user));

        if (alertBox) {
          alertBox.className = 'alert alert-success';
          alertBox.innerHTML = `<strong>Success!</strong> Credentials verified via MySQL. Redirecting to Dashboard...`;
          alertBox.style.display = 'block';
        }

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);

      }, function(error, xhr) {
        // Failure
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Log In';
        }
        if (alertBox) {
          alertBox.className = 'alert alert-danger';
          const msg = (error && error.message) ? error.message : 'Invalid credentials. Please verify your email and password.';
          alertBox.innerHTML = `<strong>Authentication Failed:</strong> ${msg}`;
          alertBox.style.display = 'block';
        }
      });
    });
  },

  initRegister: function() {
    const regForm = document.getElementById('registerForm');
    if (!regForm) return;

    // Load available skills dynamically from SkillServlet via AJAX
    AjaxClient.get('/SkillServlet', null, function(data) {
      if (data && data.skills) {
        const grid = document.getElementById('skillsSelectGrid');
        if (grid) {
          grid.innerHTML = '';
          data.skills.forEach(s => {
            const label = document.createElement('label');
            label.className = 'skill-checkbox-item';
            label.innerHTML = `
              <input type="checkbox" name="skills" value="${s.name}" id="skill_${s.id}">
              <span>${s.name}</span>
            `;
            grid.appendChild(label);
          });
        }
      }
    });

    // Client-side real-time validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const phoneInput = document.getElementById('phone');

    if (phoneInput) {
      phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
      });
    }

    regForm.addEventListener('submit', function(e) {
      e.preventDefault();

      let isValid = true;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const college = document.getElementById('college').value.trim();
      const department = document.getElementById('department').value;
      const year = document.getElementById('year').value;
      const preferredRole = document.getElementById('preferredRole').value;

      // Selected skills
      const selectedSkills = [];
      document.querySelectorAll('input[name="skills"]:checked').forEach(cb => {
        selectedSkills.push(cb.value);
      });

      // Validation Rules
      if (name.length < 2) {
        AuthController.showFieldError('name', 'Full name is required (min 2 characters).');
        isValid = false;
      } else {
        AuthController.clearFieldError('name');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        AuthController.showFieldError('email', 'Please provide a valid email address.');
        isValid = false;
      } else {
        AuthController.clearFieldError('email');
      }

      if (password.length < 6) {
        AuthController.showFieldError('password', 'Password must be at least 6 characters.');
        isValid = false;
      } else {
        AuthController.clearFieldError('password');
      }

      if (phone.length !== 10) {
        AuthController.showFieldError('phone', 'Phone number must be exactly 10 digits.');
        isValid = false;
      } else {
        AuthController.clearFieldError('phone');
      }

      if (selectedSkills.length === 0) {
        const skillsError = document.getElementById('skillsError');
        if (skillsError) {
          skillsError.innerText = 'Please select at least one skill.';
          skillsError.classList.add('active');
        }
        isValid = false;
      } else {
        const skillsError = document.getElementById('skillsError');
        if (skillsError) skillsError.classList.remove('active');
      }

      if (!isValid) return;

      const submitBtn = document.getElementById('registerSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting to RegisterServlet...';
      }

      const alertBox = document.getElementById('registerAlert');
      if (alertBox) alertBox.style.display = 'none';

      // Send AJAX request to RegisterServlet
      AjaxClient.post('/RegisterServlet', {
        name: name,
        email: email,
        password: password,
        phone: phone,
        college: college,
        department: department,
        year: year,
        preferredRole: preferredRole,
        skills: selectedSkills.join(',')
      }, function(response) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Register Profile';
        }
        if (alertBox) {
          alertBox.className = 'alert alert-success';
          alertBox.innerHTML = `<strong>Registration Successful!</strong> Your profile and skills have been stored in MySQL database. Redirecting to Login...`;
          alertBox.style.display = 'block';
        }
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);

      }, function(error) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Register Profile';
        }
        if (alertBox) {
          alertBox.className = 'alert alert-danger';
          const msg = (error && error.message) ? error.message : 'Registration failed. Email might already exist in database.';
          alertBox.innerHTML = `<strong>Error:</strong> ${msg}`;
          alertBox.style.display = 'block';
        }
      });

    });
  },

  showFieldError: function(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + 'Error');
    if (field) field.classList.add('is-invalid');
    if (errorEl) {
      errorEl.innerText = message;
      errorEl.classList.add('active');
    }
  },

  clearFieldError: function(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + 'Error');
    if (field) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    }
    if (errorEl) {
      errorEl.classList.remove('active');
    }
  },

  /**
   * Pre-fill demo credentials on login page for effortless lab evaluation
   */
  fillDemo: function(email, password) {
    const emailEl = document.getElementById('email');
    const passEl = document.getElementById('password');
    if (emailEl) emailEl.value = email;
    if (passEl) passEl.value = password;
  }
};

window.AuthController = AuthController;

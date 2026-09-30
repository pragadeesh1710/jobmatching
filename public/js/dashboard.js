/**
 * =============================================================================
 * RoleMatch - Student Dashboard Controller
 * File: dashboard.js
 * Demonstrates:
 *   1. Protected Session Verification: Redirects if session is absent.
 *   2. AJAX Dynamic Role Matching: Triggered upon skill addition/removal.
 *   3. Matching Algorithm visualization: Match %, Matched Skills, Missing Skills.
 *   4. XML + XPath Laboratory: Live XPath queries sent to XPathServlet.
 *   5. Session & Cookie Inspection: Real-time visual feedback on HTTP state.
 * =============================================================================
 */

const DashboardController = {
  currentUser: null,
  allSkillsList: [],
  studentSkills: [],

  init: function() {
    console.log('[Dashboard] Initializing student dashboard session...');

    // 1. Verify Session existence
    const cachedUser = sessionStorage.getItem('rolematch_user');
    if (!cachedUser) {
      console.warn('[Session] No active session found. Redirecting to login.html');
      window.location.href = 'login.html?session_expired=true';
      return;
    }

    try {
      this.currentUser = JSON.parse(cachedUser);
    } catch (e) {
      window.location.href = 'login.html';
      return;
    }

    // 2. Fetch full student profile from ProfileServlet via AJAX
    this.loadProfile();

    // 3. Load all available master skills from SkillServlet
    this.loadMasterSkills();

    // 4. Load all roles catalog
    this.loadAllRoles();

    // 5. Setup tab navigation
    this.setupTabs();

    // 6. Setup XPath interactive lab
    this.setupXPathLab();

    // 7. Setup Cookie & Session Inspector
    this.setupCookieInspector();

    // 8. Setup Lab Code Viewer & Viva Assistant
    this.setupCodeModal();

    // 9. Listen for AJAX network traces to update live debug strip
    window.addEventListener('rolematch:ajax-trace', function(e) {
      DashboardController.logAjaxTrace(e.detail);
    });
  },

  /**
   * Fetches fresh student details and skill profile from ProfileServlet
   */
  loadProfile: function() {
    AjaxClient.get('/ProfileServlet', null, function(data) {
      if (data && data.success && data.user) {
        DashboardController.currentUser = data.user;
        DashboardController.studentSkills = data.user.skills || [];
        DashboardController.renderProfileHeader(data.user);
        DashboardController.renderProfileSkills();
        // Immediately run role matching algorithm
        DashboardController.runMatchingAlgorithm();
      }
    }, function(err) {
      console.warn('[ProfileServlet] Fallback to cached profile:', err);
      if (DashboardController.currentUser) {
        DashboardController.studentSkills = DashboardController.currentUser.skills || ['Java', 'HTML', 'CSS', 'MySQL', 'JavaScript'];
        DashboardController.renderProfileHeader(DashboardController.currentUser);
        DashboardController.renderProfileSkills();
        DashboardController.runMatchingAlgorithm();
      }
    });
  },

  renderProfileHeader: function(user) {
    const nameEl = document.getElementById('studentName');
    const deptEl = document.getElementById('studentDepartment');
    const collegeEl = document.getElementById('studentCollege');
    const prefEl = document.getElementById('studentPreferredRole');
    const sessEl = document.getElementById('activeSessionId');
    const cookieEl = document.getElementById('activeCookiePref');

    if (nameEl) nameEl.innerText = user.name || 'Student';
    if (deptEl) deptEl.innerText = `${user.department || 'Computer Science'} (Year ${user.year || 3})`;
    if (collegeEl) collegeEl.innerText = user.college || 'Engineering College';
    if (prefEl) prefEl.innerText = user.preferredRole || 'Software Developer';
    
    // Display Session ID (matches HttpSession.getId())
    if (sessEl) sessEl.innerText = `JSESSIONID: ${user.sessionId || 'RM_SESS_' + Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Read cookie
    const cookiePref = CookieUtil.get('preferred_category') || user.preferredRole || 'Not Set';
    if (cookieEl) cookieEl.innerText = `Cookie: preferred_category=${cookiePref.replace(/_/g, ' ')}`;
  },

  loadMasterSkills: function() {
    AjaxClient.get('/SkillServlet', null, function(data) {
      if (data && data.skills) {
        DashboardController.allSkillsList = data.skills;
        DashboardController.populateSkillAddDropdown();
      }
    });
  },

  populateSkillAddDropdown: function() {
    const select = document.getElementById('addSkillSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- Choose skill to add --</option>';

    DashboardController.allSkillsList.forEach(s => {
      if (!DashboardController.studentSkills.includes(s.name)) {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        select.appendChild(opt);
      }
    });
  },

  renderProfileSkills: function() {
    const container = document.getElementById('currentSkillsWrap');
    if (!container) return;

    container.innerHTML = '';
    if (this.studentSkills.length === 0) {
      container.innerHTML = '<span class="text-muted" style="font-size:0.85rem;">No skills selected yet. Add skills below to find matches!</span>';
      return;
    }

    this.studentSkills.forEach(skill => {
      const chip = document.createElement('span');
      chip.className = 'skill-tag matched';
      chip.style.display = 'inline-flex';
      chip.style.alignItems = 'center';
      chip.style.gap = '0.35rem';
      chip.innerHTML = `
        <span>${skill}</span>
        <button type="button" onclick="DashboardController.removeSkill('${skill}')" style="background:none;border:none;color:#dc2626;cursor:pointer;font-weight:bold;line-height:1;" title="Remove skill">&times;</button>
      `;
      container.appendChild(chip);
    });

    const countEl = document.getElementById('studentSkillsCount');
    if (countEl) countEl.innerText = this.studentSkills.length;

    this.populateSkillAddDropdown();
  },

  addSkill: function(skillName) {
    if (!skillName || this.studentSkills.includes(skillName)) return;
    this.studentSkills.push(skillName);
    this.saveSkillsAndReMatch();
  },

  removeSkill: function(skillName) {
    this.studentSkills = this.studentSkills.filter(s => s !== skillName);
    this.saveSkillsAndReMatch();
  },

  saveSkillsAndReMatch: function() {
    this.renderProfileSkills();

    // 1. Send AJAX update to ProfileServlet (updates MySQL database)
    AjaxClient.post('/ProfileServlet', {
      skills: this.studentSkills.join(',')
    }, function(res) {
      console.log('[ProfileServlet] Student skills updated in MySQL:', res);
    });

    // 2. Trigger AJAX Role Matching Algorithm
    this.runMatchingAlgorithm();
  },

  /**
   * =========================================================================
   * CONCEPT 7: Role Matching Algorithm (AJAX MatchServlet)
   * Formula: Match % = (matched_skills / total_required_skills) * 100
   * =========================================================================
   */
  runMatchingAlgorithm: function() {
    const container = document.getElementById('recommendedRolesGrid');
    const loadingEl = document.getElementById('matchLoading');
    if (loadingEl) loadingEl.style.display = 'block';

    AjaxClient.post('/MatchServlet', {
      skills: this.studentSkills.join(',')
    }, function(response) {
      if (loadingEl) loadingEl.style.display = 'none';

      if (response && response.roles) {
        DashboardController.renderRecommendedRoles(response.roles);
        
        // Update stats
        const highMatch = response.roles.filter(r => r.matchPercentage >= 70).length;
        const totalMatches = response.roles.filter(r => r.matchPercentage > 0).length;
        
        const countEl = document.getElementById('matchingRolesCount');
        const highMatchEl = document.getElementById('highMatchCount');
        if (countEl) countEl.innerText = totalMatches;
        if (highMatchEl) highMatchEl.innerText = highMatch;
      }
    }, function(err) {
      if (loadingEl) loadingEl.style.display = 'none';
      console.error('[MatchServlet] Error:', err);
    });
  },

  renderRecommendedRoles: function(roles) {
    const grid = document.getElementById('recommendedRolesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (roles.length === 0) {
      grid.innerHTML = '<div class="alert alert-info">No roles found. Try adding more skills.</div>';
      return;
    }

    roles.forEach(role => {
      const matchPct = Math.round(role.matchPercentage);
      let fillClass = 'fill-none';
      let badgeColor = '#64748b';

      if (matchPct >= 75) {
        fillClass = 'fill-high';
        badgeColor = 'var(--success)';
      } else if (matchPct >= 40) {
        fillClass = 'fill-medium';
        badgeColor = '#0284c7';
      } else if (matchPct > 0) {
        fillClass = 'fill-low';
        badgeColor = 'var(--warning)';
      }

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header">
          <div>
            <h3 class="card-title">${role.roleName}</h3>
            <div class="card-meta">
              <span>${role.category}</span>
              <span class="separator">·</span>
              <span>Exp: ${role.minExperience}</span>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.35rem;font-weight:800;color:${badgeColor};font-variant-numeric:tabular-nums;">
              ${matchPct}%
            </div>
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Match</div>
          </div>
        </div>

        <div class="match-bar-container">
          <div class="match-bar-track">
            <div class="match-bar-fill ${fillClass}" style="width: ${matchPct}%;"></div>
          </div>
        </div>

        <p class="card-description">${role.description}</p>

        <!-- Matched Skills -->
        <div class="skills-group">
          <div class="skills-label">Matched Skills (${role.matchedSkills.length}/${role.requiredSkills.length}):</div>
          <div class="skills-wrap">
            ${role.matchedSkills.length > 0
              ? role.matchedSkills.map(s => `<span class="skill-tag matched">✓ ${s}</span>`).join('')
              : '<span style="font-size:0.75rem;color:var(--text-muted);">None matched yet</span>'
            }
          </div>
        </div>

        <!-- Missing Skills to Learn -->
        ${role.missingSkills.length > 0 ? `
          <div class="skills-group" style="margin-top:0.75rem;">
            <div class="skills-label" style="color:var(--warning);">Missing Skills to Acquire:</div>
            <div class="skills-wrap">
              ${role.missingSkills.map(s => `<span class="skill-tag missing">+ ${s}</span>`).join('')}
            </div>
          </div>
        ` : `
          <div style="margin-top:0.75rem;font-size:0.78rem;font-weight:600;color:var(--success);">
            🎉 Perfect Match! You meet 100% of required skills for this role.
          </div>
        `}
      `;
      grid.appendChild(card);
    });
  },

  /**
   * Load full roles table
   */
  loadAllRoles: function() {
    AjaxClient.get('/RoleServlet', null, function(data) {
      if (data && data.roles) {
        DashboardController.renderAllRolesTable(data.roles);
      }
    });
  },

  renderAllRolesTable: function(roles) {
    const tbody = document.getElementById('allRolesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    roles.forEach(role => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;">${role.roleName}</td>
        <td><span style="font-size:0.8rem;color:var(--text-secondary);">${role.category}</span></td>
        <td>${role.minExperience}</td>
        <td>
          <div class="skills-wrap">
            ${role.requiredSkills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </td>
        <td style="font-size:0.8rem;color:var(--text-muted);max-width:280px;">${role.description}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  /**
   * =========================================================================
   * CONCEPT 8: XML + XPath Laboratory
   * Demonstrates evaluating XPath queries on roles.xml via XPathServlet
   * =========================================================================
   */
  setupXPathLab: function() {
    const queryInput = document.getElementById('xpathQueryInput');
    const executeBtn = document.getElementById('xpathExecuteBtn');
    if (!executeBtn || !queryInput) return;

    executeBtn.addEventListener('click', function() {
      DashboardController.runXPathQuery(queryInput.value.trim());
    });

    queryInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        DashboardController.runXPathQuery(queryInput.value.trim());
      }
    });
  },

  runXPathQuery: function(xpathExpr) {
    if (!xpathExpr) xpathExpr = '//role';
    const resultsBox = document.getElementById('xpathResultsBox');
    const countEl = document.getElementById('xpathResultCount');
    const javaCodeSnippet = document.getElementById('xpathJavaCodeSnippet');

    if (resultsBox) resultsBox.innerHTML = '<span style="color:#94a3b8;">Evaluating XPath query on roles.xml via XPathServlet...</span>';

    AjaxClient.get('/XPathServlet', { xpath: xpathExpr }, function(data) {
      if (data && data.success) {
        if (countEl) countEl.innerText = `${data.matchCount} roles matched`;
        if (resultsBox) {
          if (data.roles.length === 0) {
            resultsBox.innerHTML = `<span style="color:#f87171;">No nodes matched query: ${xpathExpr}</span>`;
          } else {
            let output = `// Evaluated XPath: ${xpathExpr}\n`;
            output += `// Matched Nodes: ${data.matchCount}\n\n`;
            data.roles.forEach((r, idx) => {
              output += `[Node #${idx + 1}] <role>\n`;
              output += `  <name>${r.name}</name>\n`;
              output += `  <category>${r.category}</category>\n`;
              output += `  <experience>${r.experience}</experience>\n`;
              output += `  <skills>\n    ${r.skills.map(s => `<skill>${s}</skill>`).join('\n    ')}\n  </skills>\n`;
              output += `</role>\n\n`;
            });
            resultsBox.textContent = output;
          }
        }

        // Show equivalent Java code
        if (javaCodeSnippet) {
          javaCodeSnippet.textContent = 
`// Java Servlet XPath Execution:
XPathFactory factory = XPathFactory.newInstance();
XPath xpath = factory.newXPath();
XPathExpression expr = xpath.compile("${xpathExpr}");
NodeList nodes = (NodeList) expr.evaluate(document, XPathConstants.NODESET);
// Matched ${data.matchCount} node(s) in roles.xml`;
        }

      }
    }, function(err) {
      if (resultsBox) {
        resultsBox.innerHTML = `<span style="color:#f87171;">XPath Evaluation Error: ${JSON.stringify(err)}</span>`;
      }
    });
  },

  setXPathPreset: function(expr) {
    const input = document.getElementById('xpathQueryInput');
    if (input) {
      input.value = expr;
      this.runXPathQuery(expr);
    }
  },

  /**
   * =========================================================================
   * CONCEPT 6: Cookies & Session Live Inspector
   * =========================================================================
   */
  setupCookieInspector: function() {
    this.refreshCookieDisplay();
  },

  refreshCookieDisplay: function() {
    const cookieDisplay = document.getElementById('cookieListDisplay');
    if (!cookieDisplay) return;

    const cookies = CookieUtil.getAll();
    const keys = Object.keys(cookies);

    if (keys.length === 0) {
      cookieDisplay.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;">No active cookies found in document.cookie.</div>';
      return;
    }

    let html = '<div style="display:flex;flex-direction:column;gap:0.5rem;">';
    keys.forEach(key => {
      html += `
        <div style="display:flex;align-items:center;justify-content:space-between;background:#f8fafc;padding:0.5rem 0.75rem;border-radius:var(--radius-sm);border:1px solid #e2e8f0;font-size:0.82rem;">
          <div>
            <strong style="color:var(--brand-primary);">${key}</strong>: 
            <span style="font-family:var(--font-mono);">${cookies[key]}</span>
          </div>
          <button type="button" class="btn btn-outline btn-sm" onclick="DashboardController.deleteCookieHandler('${key}')">Delete</button>
        </div>
      `;
    });
    html += '</div>';
    cookieDisplay.innerHTML = html;
  },

  setCustomCookie: function() {
    const keyInput = document.getElementById('customCookieKey');
    const valInput = document.getElementById('customCookieVal');
    if (!keyInput || !valInput) return;

    const key = keyInput.value.trim();
    const val = valInput.value.trim();

    if (key && val) {
      CookieUtil.set(key, val, 7);
      keyInput.value = '';
      valInput.value = '';
      this.refreshCookieDisplay();
      this.renderProfileHeader(this.currentUser);
    }
  },

  deleteCookieHandler: function(key) {
    CookieUtil.delete(key);
    this.refreshCookieDisplay();
  },

  /**
   * =========================================================================
   * Live AJAX Network Trace Console
   * =========================================================================
   */
  logAjaxTrace: function(detail) {
    const traceLog = document.getElementById('liveAjaxTraceLog');
    if (!traceLog) return;

    const item = document.createElement('div');
    item.style.padding = '0.35rem 0';
    item.style.borderBottom = '1px solid #334155';
    item.style.fontSize = '0.78rem';
    item.style.fontFamily = 'var(--font-mono)';

    const statusColor = detail.status >= 200 && detail.status < 300 ? '#4ade80' : '#f87171';
    item.innerHTML = `
      <span style="color:#60a5fa;">[${new Date().toLocaleTimeString()}]</span>
      <span style="color:#facc15;font-weight:bold;">${detail.method}</span>
      <span style="color:#ffffff;">${detail.url}</span>
      <span style="color:${statusColor};font-weight:bold;">${detail.status}</span>
      <span style="color:#94a3b8;">(${detail.duration}ms)</span>
    `;

    traceLog.prepend(item);
    // Keep max 15 traces
    while (traceLog.children.length > 15) {
      traceLog.removeChild(traceLog.lastChild);
    }
  },

  /**
   * Tabs Switching
   */
  setupTabs: function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const tabTarget = this.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        document.querySelectorAll('.tab-panel').forEach(panel => {
          panel.classList.remove('active');
        });

        const activePanel = document.getElementById(tabTarget);
        if (activePanel) activePanel.classList.add('active');
      });
    });
  },

  /**
   * Logout Handler
   */
  logout: function() {
    console.log('[Logout] Invalidating session via LogoutServlet...');
    AjaxClient.get('/LogoutServlet', null, function() {
      sessionStorage.removeItem('rolematch_user');
      window.location.href = 'login.html?logout=true';
    }, function() {
      sessionStorage.removeItem('rolematch_user');
      window.location.href = 'login.html?logout=true';
    });
  },

  /**
   * Lab Review & Project Code Modal
   */
  setupCodeModal: function() {
    const openBtn = document.getElementById('openCodeViewerBtn');
    const closeBtn = document.getElementById('closeCodeModalBtn');
    const modal = document.getElementById('codeViewerModal');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('open');
        DashboardController.loadSourceCode('LoginServlet.java');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }
  },

  loadSourceCode: function(filename) {
    const codePre = document.getElementById('codeViewerPre');
    const currentFileLabel = document.getElementById('codeViewerCurrentFile');
    if (!codePre) return;

    if (currentFileLabel) currentFileLabel.innerText = filename;
    codePre.textContent = 'Loading source code for ' + filename + '...';

    // Highlight active tab
    document.querySelectorAll('.code-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-file') === filename) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    AjaxClient.get('/api/source-code', { file: filename }, function(data) {
      if (data && data.code) {
        codePre.textContent = data.code;
      }
    }, function() {
      codePre.textContent = `// Source file for ${filename} can be viewed directly in the project repository or downloaded below.`;
    });
  },

  downloadProjectZip: function() {
    window.location.href = '/api/download-project';
  }
};

window.DashboardController = DashboardController;

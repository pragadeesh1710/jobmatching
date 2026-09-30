/**
 * RoleMatch - Main Application Script
 * Web Technology Lab Project
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('[RoleMatch System] Web Technology Lab App Loaded');
  
  // Highlight current nav link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Check login state for navbar buttons
  const cachedUser = sessionStorage.getItem('rolematch_user');
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navRegisterBtn = document.getElementById('navRegisterBtn');
  const navDashboardBtn = document.getElementById('navDashboardBtn');
  const navLogoutBtn = document.getElementById('navLogoutBtn');

  if (cachedUser) {
    if (navLoginBtn) navLoginBtn.style.display = 'none';
    if (navRegisterBtn) navRegisterBtn.style.display = 'none';
    if (navDashboardBtn) navDashboardBtn.style.display = 'inline-flex';
    if (navLogoutBtn) navLogoutBtn.style.display = 'inline-flex';
  } else {
    if (navLoginBtn) navLoginBtn.style.display = 'inline-flex';
    if (navRegisterBtn) navRegisterBtn.style.display = 'inline-flex';
    if (navDashboardBtn) navDashboardBtn.style.display = 'none';
    if (navLogoutBtn) navLogoutBtn.style.display = 'none';
  }
});

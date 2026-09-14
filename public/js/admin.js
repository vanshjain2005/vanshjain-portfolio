(() => {
  'use strict';

  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];

  const state = {
    token: localStorage.getItem('vansh_admin_token') || null,
    user: null,
    projects: [],
    inquiries: [],
    analytics: null,
    settings: {}
  };

  // API Helper
  async function api(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }

    const res = await fetch(endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401 && state.token) {
        logout();
      }
      throw new Error(data.error || 'Request failed');
    }
    return data;
  }

  function showAlert(msg, isError = false) {
    const alertBox = q('#dash-alert');
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `alert ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
    setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
  }

  // Auth Handling
  async function checkAuth() {
    if (!state.token) {
      showLogin();
      return;
    }
    try {
      const data = await api('/api/auth/me');
      state.user = data.user;
      showDashboard();
      loadAllData();
    } catch (e) {
      logout();
    }
  }

  function showLogin() {
    q('#login-view').style.display = 'grid';
    q('#dashboard-view').style.display = 'none';
  }

  function showDashboard() {
    q('#login-view').style.display = 'none';
    q('#dashboard-view').style.display = 'flex';
  }

  function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('vansh_admin_token');
    showLogin();
  }

  q('#logout-btn')?.addEventListener('click', logout);

  // Login Form
  q('#login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const alertBox = q('#login-alert');
    alertBox.style.display = 'none';
    const email = q('#login-email').value.trim();
    const password = q('#login-password').value;

    try {
      const data = await api('/api/auth/login', 'POST', { email, password });
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('vansh_admin_token', data.token);
      showDashboard();
      loadAllData();
    } catch (err) {
      alertBox.textContent = err.message;
      alertBox.style.display = 'block';
    }
  });

  // Tab Switching
  qa('.nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      qa('.nav-btn[data-tab]').forEach(b => b.classList.remove('active'));
      qa('.tab-pane').forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      const target = q(`#tab-${btn.dataset.tab}`);
      if (target) target.style.display = 'block';
    });
  });

  // Load All Data
  async function loadAllData() {
    loadProjects();
    loadInquiries();
    loadAnalytics();
    loadSettings();
  }

  // Projects Management
  async function loadProjects() {
    try {
      const res = await api('/api/projects');
      state.projects = res.data;
      q('#badge-projects').textContent = state.projects.length;

      const tbody = q('#projects-table-body');
      tbody.innerHTML = state.projects.map(p => `
        <tr>
          <td><strong style="font-family:var(--mono);">${String(p.order_index).padStart(2,'0')}</strong></td>
          <td>
            <div style="font-weight:700;font-family:var(--display);">${p.title.replace(/\n/g, ' ')}</div>
            <div style="font-size:11px;color:var(--muted);">${p.slug}</div>
          </td>
          <td><span style="font-family:var(--mono);font-size:10px;color:var(--accent);">${p.category}</span></td>
          <td><a href="${p.live_url}" target="_blank" style="font-family:var(--mono);font-size:11px;text-decoration:underline;">${p.live_url.replace('https://','')} ↗</a></td>
          <td><span class="status-tag ${p.is_published ? 'replied' : 'read'}">${p.is_published ? 'LIVE' : 'DRAFT'}</span></td>
          <td>
            <div style="display:flex;gap:8px;">
              <button class="btn-secondary btn-edit-proj" data-id="${p.id}" style="padding:4px 10px;font-size:9px;">EDIT</button>
              <button class="btn-danger btn-del-proj" data-id="${p.id}">DEL</button>
            </div>
          </td>
        </tr>
      `).join('');

      // Wire Action Buttons
      qa('.btn-edit-proj').forEach(btn => btn.addEventListener('click', () => editProject(Number(btn.dataset.id))));
      qa('.btn-del-proj').forEach(btn => btn.addEventListener('click', () => deleteProject(Number(btn.dataset.id))));
    } catch (err) {
      showAlert(err.message, true);
    }
  }

  function editProject(id) {
    const proj = state.projects.find(p => p.id === id);
    if (!proj) return;
    q('#modal-project-title').textContent = 'EDIT PROJECT';
    q('#proj-id').value = proj.id;
    q('#proj-title').value = proj.title;
    q('#proj-slug').value = proj.slug;
    q('#proj-index').value = proj.index_label;
    q('#proj-desc').value = proj.description;
    q('#proj-cat').value = proj.category;
    q('#proj-meta').value = proj.meta_tags;
    q('#proj-url').value = proj.live_url;
    q('#proj-order').value = proj.order_index;
    q('#proj-pub').value = proj.is_published;
    q('#project-modal').style.display = 'grid';
  }

  q('#btn-add-project')?.addEventListener('click', () => {
    q('#modal-project-title').textContent = 'ADD NEW PROJECT';
    q('#project-form').reset();
    q('#proj-id').value = '';
    q('#project-modal').style.display = 'grid';
  });

  q('#modal-project-close')?.addEventListener('click', () => {
    q('#project-modal').style.display = 'none';
  });

  q('#project-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const id = q('#proj-id').value;
    const payload = {
      title: q('#proj-title').value.trim(),
      slug: q('#proj-slug').value.trim(),
      index_label: q('#proj-index').value.trim(),
      description: q('#proj-desc').value.trim(),
      category: q('#proj-cat').value.trim(),
      meta_tags: q('#proj-meta').value.trim(),
      live_url: q('#proj-url').value.trim(),
      order_index: Number(q('#proj-order').value),
      is_published: Number(q('#proj-pub').value)
    };

    try {
      if (id) {
        await api(`/api/projects/${id}`, 'PUT', payload);
        showAlert('Project updated successfully');
      } else {
        await api('/api/projects', 'POST', payload);
        showAlert('Project created successfully');
      }
      q('#project-modal').style.display = 'none';
      loadProjects();
    } catch (err) {
      alert(err.message);
    }
  });

  async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api(`/api/projects/${id}`, 'DELETE');
      showAlert('Project removed');
      loadProjects();
    } catch (err) {
      showAlert(err.message, true);
    }
  }

  // Inquiries Management
  async function loadInquiries() {
    const filter = q('#inquiry-filter').value;
    const url = filter ? `/api/inquiries?status=${filter}` : '/api/inquiries';
    try {
      const res = await api(url);
      state.inquiries = res.data;
      const newCount = res.stats?.new || 0;
      q('#badge-inquiries').textContent = newCount;

      const tbody = q('#inquiries-table-body');
      if (state.inquiries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px;">No inquiries found.</td></tr>';
        return;
      }

      tbody.innerHTML = state.inquiries.map(inq => `
        <tr>
          <td style="font-family:var(--mono);font-size:10px;white-space:nowrap;">${new Date(inq.created_at).toLocaleDateString()}</td>
          <td><strong>${inq.name}</strong></td>
          <td><a href="mailto:${inq.email}" style="color:var(--accent);">${inq.email}</a></td>
          <td>${inq.phone || '<span style="color:var(--dim)">—</span>'}</td>
          <td style="max-width:320px;font-size:12px;line-height:1.4;">${inq.idea}</td>
          <td><span class="status-tag ${inq.status}">${inq.status}</span></td>
          <td>
            <div style="display:flex;gap:6px;">
              ${inq.status !== 'replied' ? `<button class="btn-secondary btn-status-inq" data-id="${inq.id}" data-status="replied" style="padding:4px 8px;font-size:9px;">REPLIED</button>` : ''}
              <button class="btn-danger btn-del-inq" data-id="${inq.id}">DEL</button>
            </div>
          </td>
        </tr>
      `).join('');

      qa('.btn-status-inq').forEach(btn => btn.addEventListener('click', async () => {
        await api(`/api/inquiries/${btn.dataset.id}`, 'PATCH', { status: btn.dataset.status });
        loadInquiries();
      }));

      qa('.btn-del-inq').forEach(btn => btn.addEventListener('click', async () => {
        if (confirm('Delete inquiry?')) {
          await api(`/api/inquiries/${btn.dataset.id}`, 'DELETE');
          loadInquiries();
        }
      }));
    } catch (err) {
      showAlert(err.message, true);
    }
  }

  q('#inquiry-filter')?.addEventListener('change', loadInquiries);

  // Analytics
  async function loadAnalytics() {
    try {
      const res = await api('/api/analytics/summary');
      const data = res.data;
      q('#stat-views').textContent = data.totalViews;
      q('#stat-clicks').textContent = data.totalClicks;
      q('#stat-inquiries').textContent = data.totalInquiries;
      q('#stat-conv').textContent = data.conversionRate;

      const tbody = q('#analytics-table-body');
      tbody.innerHTML = (data.recentEvents || []).map(e => `
        <tr>
          <td style="font-family:var(--mono);font-size:10px;">${new Date(e.created_at).toLocaleTimeString()}</td>
          <td><span style="font-family:var(--mono);color:var(--accent);">${e.event_type}</span></td>
          <td>${e.target || '—'}</td>
          <td style="font-family:var(--mono);font-size:11px;color:var(--dim);">${e.ip_address || '—'}</td>
        </tr>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  // Settings
  async function loadSettings() {
    try {
      const res = await api('/api/settings');
      const s = res.data;
      state.settings = s;
      if (q('#set-hero-role')) q('#set-hero-role').value = s.hero_role || '';
      if (q('#set-hero-about')) q('#set-hero-about').value = s.hero_about || '';
      if (q('#set-contact-email')) q('#set-contact-email').value = s.contact_email || '';
      if (q('#set-social-github')) q('#set-social-github').value = s.social_github || '';
      if (q('#set-social-linkedin')) q('#set-social-linkedin').value = s.social_linkedin || '';
    } catch (err) {
      console.error(err);
    }
  }

  q('#settings-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      hero_role: q('#set-hero-role').value.trim(),
      hero_about: q('#set-hero-about').value.trim(),
      contact_email: q('#set-contact-email').value.trim(),
      social_github: q('#set-social-github').value.trim(),
      social_linkedin: q('#set-social-linkedin').value.trim()
    };
    try {
      await api('/api/settings', 'PUT', payload);
      showAlert('Profile settings saved successfully');
    } catch (err) {
      showAlert(err.message, true);
    }
  });

  q('#password-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const oldPassword = q('#old-pass').value;
    const newPassword = q('#new-pass').value;
    try {
      await api('/api/auth/change-password', 'POST', { oldPassword, newPassword });
      showAlert('Password updated successfully');
      q('#password-form').reset();
    } catch (err) {
      showAlert(err.message, true);
    }
  });

  // Init
  checkAuth();
})();




// Counseling page logic: announcements, request form, sessions, FAQs

let allStudentSessions = [];
let allAnnouncements = [];

function getReadAnnouncements() {
    const read = localStorage.getItem('counselingAnnouncements');
    return read ? JSON.parse(read) : [];
}

function saveReadAnnouncements(idArray) {
    localStorage.setItem('counselingAnnouncements', JSON.stringify(idArray));
}

function markAnnouncementAsRead(itemId) {
    let readIds = getReadAnnouncements();
    if (!readIds.includes(itemId)) { readIds.push(itemId); saveReadAnnouncements(readIds); }
    const itemEl = document.querySelector(`.announcement-item[data-id="${itemId}"]`);
    if (itemEl) itemEl.setAttribute('data-read', 'true');
    updateUnreadCount();
}

function markAllAsRead(event) {
    event.preventDefault(); let readIds = allAnnouncements.map(item => item._id); saveReadAnnouncements(readIds); document.querySelectorAll('.announcement-item').forEach(el => el.setAttribute('data-read','true')); updateUnreadCount(); filterAnnouncements('all');
}

async function fetchAndRenderAnnouncements() {
    const listEl = document.getElementById('announcementsList'); if (!listEl) return; const noAnnouncementsMessageEl = document.getElementById('noAnnouncementsMessage'); const readIds = getReadAnnouncements();
    try {
        const response = await fetch('http://localhost:3001/api/announcements'); allAnnouncements = await response.json(); listEl.innerHTML = ''; noAnnouncementsMessageEl.style.display = 'none';
        if (allAnnouncements.length === 0) { noAnnouncementsMessageEl.textContent = 'No announcements at this time.'; noAnnouncementsMessageEl.style.display = 'block'; return; }
        allAnnouncements.forEach(item => {
            const isRead = readIds.includes(item._id);
            const announcementItem = document.createElement('div'); announcementItem.className = 'announcement-item'; announcementItem.setAttribute('data-id', item._id); announcementItem.setAttribute('data-read', isRead);
            announcementItem.innerHTML = `
                <h3 class="announcement-title">${item.title}</h3>
                <div class="announcement-meta"><span class="meta-item">Posted on: ${new Date(item.createdAt).toLocaleDateString()}</span></div>
                <p class="announcement-description">${item.content}</p>`;
            announcementItem.addEventListener('click', () => openAnnouncementDetailModal(item._id));
            listEl.appendChild(announcementItem);
        });
        updateUnreadCount(); filterAnnouncements('unread');
    } catch (error) { console.error('Error fetching announcements:', error); noAnnouncementsMessageEl.textContent = 'Could not load announcements.'; noAnnouncementsMessageEl.style.display = 'block'; }
}

function filterAnnouncements(filterType) {
    document.getElementById('filterUnread').classList.toggle('active', filterType === 'unread');
    document.getElementById('filterAll').classList.toggle('active', filterType === 'all');
    const items = document.querySelectorAll('.announcement-item'); const noAnnouncementsMessageEl = document.getElementById('noAnnouncementsMessage'); let hasUnread = false;
    items.forEach(item => {
        const isRead = item.getAttribute('data-read') === 'true';
        if (filterType === 'unread') { if (isRead) item.style.display = 'none'; else { item.style.display = 'block'; hasUnread = true; } } else { item.style.display = 'block'; }
    });
    noAnnouncementsMessageEl.style.display = 'none';
    if (filterType === 'unread' && !hasUnread) { noAnnouncementsMessageEl.textContent = 'No unread announcements!'; noAnnouncementsMessageEl.style.display = 'block'; }
    else if (filterType === 'all' && items.length === 0) { noAnnouncementsMessageEl.textContent = 'No announcements at this time.'; noAnnouncementsMessageEl.style.display = 'block'; }
}

function updateUnreadCount() {
    const readIds = getReadAnnouncements(); const unreadCount = allAnnouncements.filter(item => !readIds.includes(item._id)).length; const badge = document.getElementById('unreadCount'); if (badge) { badge.textContent = unreadCount; badge.style.display = unreadCount > 0 ? 'flex' : 'none'; }
}

async function handleRequestFormSubmit(e) {
    if (e && e.preventDefault) e.preventDefault(); const form = document.getElementById('requestForm'); if (!form.checkValidity()) { form.reportValidity(); return; }
    const formData = new FormData(form); const payload = { studentId: formData.get('studentId'), studentFullName: formData.get('fullName'), studentPhone: formData.get('phone'), studentEmail: formData.get('email'), preferredMode: formData.get('preferredMode'), referenceContact: { name: formData.get('refName'), relationship: formData.get('relationship'), phone: formData.get('refPhone'), email: formData.get('refEmail') } };
    try {
        const response = await fetch('http://localhost:3001/api/admin/counseling/appointments', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        const savedData = await response.json(); if (!response.ok) throw new Error(savedData.message || `Server error: ${response.status}`);
        localStorage.setItem('currentStudentId', payload.studentId); form.reset(); if (typeof closeRequestFormModal === 'function') closeRequestFormModal(); if (typeof showSuccessModal === 'function') showSuccessModal(savedData._id); else alert('Request Submitted! ID: ' + savedData._id);
        try { if (typeof fetchAndRenderSessions === 'function') await fetchAndRenderSessions(); } catch (uiError) { console.warn('List refresh failed (minor UI issue):', uiError); }
    } catch (error) { console.error('Submission Error:', error); alert('There was a problem submitting your request: ' + error.message); }
}

function showSuccessModal(caseId) {
    const modal = document.getElementById('successModal'); const caseIdSpan = document.getElementById('successCaseId'); if (modal && caseIdSpan) { const displayId = caseId ? caseId.slice(-6).toUpperCase() : 'PENDING'; caseIdSpan.textContent = `CASE #${displayId}`; modal.setAttribute('aria-hidden','false'); modal.classList.add('open'); } else console.error('Success Modal HTML is missing from counseling.html');
}

function closeSuccessModal() { const modal = document.getElementById('successModal'); if (modal) { modal.setAttribute('aria-hidden','true'); modal.classList.remove('open'); } }

function trackRequestStatus() { closeSuccessModal(); openSessionsModal(); if (typeof switchSessionTab === 'function') switchSessionTab('pending'); }

async function fetchAndRenderSessions() {
    const listEl = document.getElementById('sessionsList'); if (!listEl) return; listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Loading sessions...</p>';
    try {
        const studentId = localStorage.getItem('currentStudentId'); if (!studentId) { listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Submit a request form to see your sessions.</p>'; allStudentSessions = []; if (typeof updateTabCounts === 'function') updateTabCounts(); return; }
        const response = await fetch(`http://localhost:3001/api/counseling/my-appointments/${studentId}`); allStudentSessions = await response.json(); if (typeof updateTabCounts === 'function') updateTabCounts(); const activeTabBtn = document.querySelector('#sessionsModal .tab-btn.active'); const activeTabName = activeTabBtn ? activeTabBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'pending'; renderSessionsList(activeTabName);
    } catch (error) { console.error('Error fetching sessions:', error); listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Could not load sessions.</p>'; }
}

function renderSessionsList(filterTab = 'pending') {
    const listEl = document.getElementById('sessionsList'); if (!listEl) return; const filtered = allStudentSessions.filter(s => s.status.toLowerCase() === filterTab.toLowerCase()); listEl.innerHTML = ''; if (filtered.length === 0) { listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666; font-size: 13px;">No sessions found in this category.</p>'; return; }
    filtered.forEach(session => {
        const card = document.createElement('div'); const statusClass = `status-${session.status.toLowerCase()}`; const badgeClass = `badge-${session.status.toLowerCase()}`; card.className = `session-card ${statusClass}`;
        const submittedDate = new Date(session.createdAt).toLocaleDateString(); const counselorName = session.assignedCounselor ? session.assignedCounselor.name : 'Waiting for assignment...'; let scheduleDisplay = 'Not Scheduled'; if (session.scheduledDateTime) { const dateObj = new Date(session.scheduledDateTime); scheduleDisplay = `${dateObj.toLocaleDateString()} • ${dateObj.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`; }
        let modeBadge = ''; if (session.preferredMode === 'Virtual') modeBadge = `<span style="font-size:10px; background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:4px; border:1px solid #bae6fd;">📹 Virtual</span>`; else modeBadge = `<span style="font-size:10px; background:#f1f5f9; color:#475569; padding:2px 6px; border-radius:4px; border:1px solid #cbd5e1;">🏫 In-Person</span>`;
        card.innerHTML = `
            <div class="session-header"><span class="session-id">Case #${session._id.slice(-6).toUpperCase()}</span><span class="status-badge ${badgeClass}">${session.status}</span></div>
            <div class="session-date">Requested on: ${submittedDate}</div>
            <div class="session-details-grid">
                <div class="detail-item"><span class="detail-label">Student Name</span><span class="detail-value">${session.studentFullName}</span></div>
                <div class="detail-item"><span class="detail-label">Counselor</span><span class="detail-value">${counselorName}</span></div>
                <div class="detail-item" style="grid-column: 1 / -1; margin-top: 6px;"><span class="detail-label">Schedule</span><span class="detail-value" style="color: #2c3e7f;">${scheduleDisplay}</span></div>
            </div>
            ${session.status === 'Pending' ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0; text-align: right;"><button class="btn-cancel-request" onclick="cancelSession(event, '${session._id}')">Cancel Request</button></div>` : ''}
        `;
        card.addEventListener('click', (e)=>{ if (e.target.tagName === 'BUTTON') return; console.log('Clicked session:', session._id); }); listEl.appendChild(card);
    });
}

async function cancelSession(event, sessionId) {
    event.stopPropagation(); if (!confirm('Are you sure you want to cancel this request?')) return; try { const response = await fetch(`http://localhost:3001/api/counseling/cancel/${sessionId}`, { method:'PATCH' }); if (response.ok) { alert('Request cancelled successfully.'); fetchAndRenderSessions(); } else alert('Failed to cancel request.'); } catch (error) { console.error('Error cancelling:', error); alert('An error occurred.'); }
}

async function fetchAndRenderFAQs() {
    const listEl = document.getElementById('faqsList'); if (!listEl) return; listEl.innerHTML = '<p style="color:#999; padding:10px;">Loading questions...</p>';
    try { const response = await fetch('http://localhost:3001/api/faqs'); const faqs = await response.json(); listEl.innerHTML = ''; if (faqs.length === 0) { listEl.innerHTML = '<p style="color:#666; padding:10px;">No FAQs available at the moment.</p>'; return; } faqs.forEach(item=>{ const wrapper = document.createElement('div'); wrapper.style.cssText = 'background:#fff; border:1px solid #e8e8e8; border-radius:8px; padding:12px; margin-bottom:10px; transition:all 0.2s;'; const qBtn = document.createElement('button'); qBtn.style.cssText = 'display:flex; justify-content:space-between; align-items:center; width:100%; border:0; background:transparent; cursor:pointer; text-align:left; padding:0; font-size:14px; font-weight:600; color:#2c3e7f;'; const qText = document.createElement('span'); qText.textContent = item.question; const icon = document.createElement('span'); icon.style.cssText = 'font-size:18px; color:#666; font-weight:bold; margin-left:10px;'; icon.textContent = '+'; qBtn.appendChild(qText); qBtn.appendChild(icon); const answer = document.createElement('div'); answer.style.cssText = 'display:none; margin-top:10px; color:#444; line-height:1.5; font-size:13px; padding-top:10px; border-top:1px solid #f1f1f1;'; answer.textContent = item.answer; qBtn.addEventListener('click', function(e){ e.preventDefault(); const expanded = answer.style.display === 'block'; if (!expanded) { answer.style.display = 'block'; icon.textContent = '-'; wrapper.style.backgroundColor = '#f8fafc'; } else { answer.style.display = 'none'; icon.textContent = '+'; wrapper.style.backgroundColor = '#fff'; } }); wrapper.appendChild(qBtn); wrapper.appendChild(answer); listEl.appendChild(wrapper); }); } catch (error) { console.error('Error fetching FAQs:', error); listEl.innerHTML = '<p style="color:red; padding:10px;">Could not load FAQs. Is the server running?</p>'; }
}

function openAnnouncementDetailModal(itemId) {
    const item = allAnnouncements.find(a => a._id === itemId); if (!item) return; const modal = document.getElementById('announcementDetailModal'); if (modal) { document.getElementById('announcementDetailTitle').textContent = item.title; document.getElementById('announcementDetailMeta').innerHTML = `<span class="meta-item">Posted on: ${new Date(item.createdAt).toLocaleDateString()}</span>`; document.getElementById('announcementDetailContent').textContent = item.content; modal.setAttribute('aria-hidden','false'); modal.classList.add('open'); document.addEventListener('keydown', handleModalKeydown); markAnnouncementAsRead(item._id); filterAnnouncements('all'); }
}

function closeAnnouncementDetailModal() { const modal = document.getElementById('announcementDetailModal'); if (modal) { modal.setAttribute('aria-hidden','true'); modal.classList.remove('open'); document.removeEventListener('keydown', handleModalKeydown); } }

function openLearnMoreModal() { const modal = document.getElementById('learnMoreModal'); if (modal) { modal.setAttribute('aria-hidden','false'); modal.classList.add('open'); document.addEventListener('keydown', handleModalKeydown); } }
function closeLearnMoreModal() { const modal = document.getElementById('learnMoreModal'); if (modal) { modal.setAttribute('aria-hidden','true'); modal.classList.remove('open'); document.removeEventListener('keydown', handleModalKeydown); } }

function openRequestFormModal() { const modal = document.getElementById('requestFormModal'); if (modal) { modal.setAttribute('aria-hidden','false'); modal.classList.add('open'); document.addEventListener('keydown', handleModalKeydown); } }
function closeRequestFormModal() { const modal = document.getElementById('requestFormModal'); if (modal) { modal.setAttribute('aria-hidden','true'); modal.classList.remove('open'); document.removeEventListener('keydown', handleModalKeydown); } }

function openSessionsModal() { const modal = document.getElementById('sessionsModal'); if (modal) { modal.setAttribute('aria-hidden','false'); modal.classList.add('open'); document.addEventListener('keydown', handleModalKeydown); fetchAndRenderSessions(); } }
function closeSessionsModal() { const modal = document.getElementById('sessionsModal'); if (modal) { modal.setAttribute('aria-hidden','true'); modal.classList.remove('open'); document.removeEventListener('keydown', handleModalKeydown); } }

function openFAQsModal() { const modal = document.getElementById('faqsModal'); if (modal) { modal.setAttribute('aria-hidden','false'); modal.classList.add('open'); document.addEventListener('keydown', handleModalKeydown); fetchAndRenderFAQs(); } }
function closeFAQsModal() { const modal = document.getElementById('faqsModal'); if (modal) { modal.setAttribute('aria-hidden','true'); modal.classList.remove('open'); document.removeEventListener('keydown', handleModalKeydown); } }
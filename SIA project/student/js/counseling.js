


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

        if (!readIds.includes(itemId)) { 
            readIds.push(itemId); 
            saveReadAnnouncements(readIds); 
        }
        
    const itemEl = document.querySelector(
        `.announcement-item[data-id="${itemId}"]`
    );

    if (itemEl) 
        itemEl.setAttribute('data-read', 'true');
        updateUnreadCount();
}

function markAllAsRead(event) {
    event.preventDefault(); 
    let readIds = allAnnouncements.map(item => item._id); 
    saveReadAnnouncements(readIds); 
    document.querySelectorAll('.announcement-item').forEach(el => el.setAttribute('data-read','true')); 
    updateUnreadCount(); 
    filterAnnouncements('all');
}

async function fetchAndRenderAnnouncements() {
    const listEl = document.getElementById('announcementsList'); 
    if (!listEl) 
        return;

        const noAnnouncementsMessageEl = document.getElementById('noAnnouncementsMessage'); 
        const readIds = getReadAnnouncements();

    try {
        const response = await fetch('http://localhost:3001/api/counseling-announcements'); 
        allAnnouncements = await response.json(); 
        listEl.innerHTML = ''; 
        noAnnouncementsMessageEl.style.display = 'none';

        if (allAnnouncements.length === 0) { 
            noAnnouncementsMessageEl.textContent = 'No announcements at this time.'; 
            noAnnouncementsMessageEl.style.display = 'block'; return; 
        }

        allAnnouncements.forEach(item => {
            const isRead = readIds.includes(item._id);
            const announcementItem = document.createElement('div'); 
            announcementItem.className = 'announcement-item'; 
            announcementItem.setAttribute('data-id', item._id); 
            announcementItem.setAttribute('data-read', isRead);
            announcementItem.innerHTML = `

                <h3 class="announcement-title">${item.title}</h3>
                <div class="announcement-meta"><span class="meta-item">Posted on: ${new Date(item.createdAt).toLocaleDateString()}</span></div>
                <p class="announcement-description">${item.content}</p>`;
            announcementItem.addEventListener('click', () => openAnnouncementDetailModal(item._id));

            listEl.appendChild(announcementItem);
        });

        updateUnreadCount(); filterAnnouncements('unread');

    } catch (error) { 
        console.error('Error fetching announcements:', error); 
        noAnnouncementsMessageEl.textContent = 'Could not load announcements.'; 
        noAnnouncementsMessageEl.style.display = 'block'; 
    }
}

function filterAnnouncements(filterType) {
    document.getElementById('filterUnread').classList.toggle('active', filterType === 'unread');
    document.getElementById('filterAll').classList.toggle('active', filterType === 'all');

    const items = document.querySelectorAll('.announcement-item'); 
    const noAnnouncementsMessageEl = document.getElementById('noAnnouncementsMessage'); 
    let hasUnread = false;

    items.forEach(item => {
        const isRead = item.getAttribute('data-read') === 'true';

        if (filterType === 'unread') {
             if (isRead) {
                item.style.display = 'none'; 
            } else { 
                item.style.display = 'block'; hasUnread = true; 
            } 
        } else {
            item.style.display = 'block'; 
        }
    });

    noAnnouncementsMessageEl.style.display = 'none';
    if (filterType === 'unread' && !hasUnread) {
         noAnnouncementsMessageEl.textContent = 'No unread announcements!'; 
         noAnnouncementsMessageEl.style.display = 'block'; 
        } else if (filterType === 'all' && items.length === 0) { 
            noAnnouncementsMessageEl.textContent = 'No announcements at this time.'; 
            noAnnouncementsMessageEl.style.display = 'block'; 
        }
}

function updateUnreadCount() {
    const readIds = getReadAnnouncements();
    const unreadCount = allAnnouncements.filter(item => !readIds.includes(item._id)).length; 
    const badge = document.getElementById('unreadCount'); if (badge) { badge.textContent = unreadCount; 
        badge.style.display = unreadCount > 0 ? 'flex' : 'none'; 
    }
}

async function handleRequestFormSubmit(e) {
    if (e && e.preventDefault) e.preventDefault(); 

    const form = document.getElementById('requestForm'); 
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const formData = new FormData(form); 

    // --- FIX: DEFINE THE VARIABLE HERE ---
    // 1. Get the values from the form inputs
    const dateStr = formData.get('preferredDate');
    const timeStr = formData.get('preferredTime');
    
    // 2. Combine them into a Date object (ISO format)
    // If date/time are missing, this might be Invalid Date, but let's assume required=true works
    let scheduledDateTime = null;
    if (dateStr && timeStr) {
        scheduledDateTime = new Date(`${dateStr}T${timeStr}`);
    }
    // -------------------------------------

    const payload = { 
        studentId: formData.get('studentId'), 
        studentFullName: formData.get('fullName'), 
        studentPhone: formData.get('phone'), 
        studentEmail: formData.get('email'), 
        preferredMode: formData.get('preferredMode'), 
        
        // --- NOW IT IS DEFINED ---
        scheduledDateTime: scheduledDateTime, 
        // -------------------------
        
        referenceContact: { 
            name: formData.get('refName'), 
            relationship: formData.get('relationship'), 
            phone: formData.get('refPhone'), 
            email: formData.get('refEmail') 
        } 
    };

    try {
        const response = await fetch('http://localhost:3001/api/admin/counseling/appointments', { 
            method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) 
        });
        
        const savedData = await response.json(); 

        if (!response.ok) throw new Error(savedData.message || `Server error: ${response.status}`);

        localStorage.setItem('currentStudentId', payload.studentId); 
        form.reset(); 

        if (typeof closeRequestFormModal === 'function') closeRequestFormModal(); 
        
        if (typeof showSuccessModal === 'function') {
            showSuccessModal(savedData._id); 
        } else {
            alert('Request Submitted! ID: ' + savedData._id);
        }
        
        // Refresh the list immediately
        if (typeof fetchAndRenderSessions === 'function') await fetchAndRenderSessions(); 
            
    } catch (error) { 
        console.error('Submission Error:', error); 
        alert('There was a problem submitting your request: ' + error.message); 
    }
}

function showSuccessModal(caseId) {
    const modal = document.getElementById('successModal'); 
     caseIdSpan = document.getElementById('successCaseId'); 
     if (modal && caseIdSpan) {
         const displayId = caseId ? caseId.slice(-6).toUpperCase() : 'PENDING'; 
         caseIdSpan.textContent = `CASE #${displayId}`; 
         modal.setAttribute('aria-hidden','false'); 
         modal.classList.add('open'); 
        } else {
            console.error('Success Modal HTML is missing from counseling.html');
        }
}

function closeSuccessModal() { 
    const modal = document.getElementById('successModal'); 

    if (modal) { 
        modal.setAttribute('aria-hidden','true'); 
        modal.classList.remove('open'); 
    } 
}

function trackRequestStatus() { 
    closeSuccessModal();
     openSessionsModal(); 
     if (typeof switchSessionTab === 'function') 
        switchSessionTab('pending'); 
    }

async function fetchAndRenderSessions() {
    const listEl = document.getElementById('sessionsList'); 
    if (!listEl) {
        return; 
    }

    listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Loading sessions...</p>';

    try {
        const studentId = localStorage.getItem('currentStudentId'); 
        if (!studentId) { 
            listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Submit a request form to see your sessions.</p>'; 
            allStudentSessions = []; 
            if (typeof updateTabCounts === 'function') 
                updateTabCounts(); 
            return; 
        }

        const response = await fetch(`http://localhost:3001/api/counseling/my-appointments/${studentId}`); 
        allStudentSessions = await response.json(); 

        if (typeof updateTabCounts === 'function') updateTabCounts(); 
        updateDashboardBadge();
        const activeTabBtn = document.querySelector('#sessionsModal .tab-btn.active'); 
        const activeTabName = activeTabBtn ? activeTabBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'pending'; 
        renderSessionsList(activeTabName);
    } catch (error) { 
        console.error('Error fetching sessions:', error); 
        listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Could not load sessions.</p>'; 
    }
}

function updateDashboardBadge() {
    const badge = document.getElementById('session-badge');
    if (!badge) return;

    // Count sessions with status 'Scheduled'
    // You can also add 'Pending' if you want to notify about everything
    const scheduledCount = allStudentSessions.filter(s => s.status === 'Scheduled').length;

    if (scheduledCount > 0) {
        badge.textContent = scheduledCount;
        badge.style.display = 'block'; // Show badge
    } else {
        badge.style.display = 'none'; // Hide if 0
    }
}

function renderSessionsList(filterTab = 'pending') {
    const listEl = document.getElementById('sessionsList'); 
    if (!listEl) return; 

    // Clear list first
    listEl.innerHTML = '';

    // Filter Data
    const filtered = allStudentSessions.filter(s => s.status.toLowerCase() === filterTab.toLowerCase()); 
    
    // Empty State
    if (filtered.length === 0) {
         listEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666; font-size: 13px;">No sessions found in this category.</p>'; 
         return; 
    }

    filtered.forEach(session => {
        const card = document.createElement('div'); 
        const statusClass = `status-${session.status.toLowerCase()}`; 
        const badgeClass = `badge-${session.status.toLowerCase()}`; 
        card.className = `session-card ${statusClass}`;

        // 1. Format Date
        const submittedDate = new Date(session.createdAt).toLocaleDateString(); 

        // 2. Format Counselor
        const counselorName = (session.counselor && session.counselor !== 'N/A') 
            ? session.counselor 
            : 'Waiting for assignment...';

        // 3. Format Schedule
        let scheduleDisplay = 'Not Scheduled'; 
        if (session.scheduledDateTime) { 
            const dateObj = new Date(session.scheduledDateTime); 
            scheduleDisplay = `${dateObj.toLocaleDateString()} • ${dateObj.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}`; 
        }

        // 4. Format Mode Badge
        let modeBadge = ''; 
        if (session.preferredMode === 'Virtual') {
            modeBadge = `<span style="font-size:10px; background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:4px; border:1px solid #bae6fd;">📹 Virtual</span>`; 
        } else {
            modeBadge = `<span style="font-size:10px; background:#f1f5f9; color:#475569; padding:2px 6px; border-radius:4px; border:1px solid #cbd5e1;">🏫 In-Person</span>`;
        }

        // 5. (NEW) Meeting Link Logic
        // Only show if Scheduled + Virtual + Link exists
        let meetingAction = '';
        if (session.status === 'Scheduled' && session.preferredMode === 'Virtual' && session.meetingLink) {
            meetingAction = `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e2e8f0;">
                    <a href="${session.meetingLink}" target="_blank" class="btn-join-meet" 
                       style="display: block; text-align: center; background: #2c3e7f; color: white; text-decoration: none; padding: 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                       📹 Join Google Meet
                    </a>
                </div>
            `;
        }

        // 6. Cancel Button Logic
        let cancelButton = '';
        if (session.status === 'Pending') {
            cancelButton = `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0; text-align: right;">
                <button class="btn-cancel-request" onclick="cancelSession(event, '${session._id}')">Cancel Request</button>
            </div>`;
        }

        // Construct HTML
        card.innerHTML = `
            <div class="session-header">
                <span class="session-id">Case #${session._id.slice(-6).toUpperCase()}</span>
                <span class="status-badge ${badgeClass}">${session.status}</span>
            </div>
            <div class="session-date">Requested on: ${submittedDate}</div>
            <div style="margin-bottom: 5px;">${modeBadge}</div>
            
            <div class="session-details-grid">
                <div class="detail-item"><span class="detail-label">Student Name</span><span class="detail-value">${session.studentFullName}</span></div>
                <div class="detail-item"><span class="detail-label">Counselor</span><span class="detail-value">${counselorName}</span></div>
                <div class="detail-item" style="grid-column: 1 / -1; margin-top: 6px;">
                    <span class="detail-label">Schedule</span>
                    <span class="detail-value" style="color: #2c3e7f;">${scheduleDisplay}</span>
                </div>
            </div>
            
            ${meetingAction}
            ${cancelButton}
        `;

        card.addEventListener('click', (e) => { 
            // Don't trigger if clicking a button or link
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return; 
            // console.log('Clicked session:', session._id); 
            // Call your detail modal function here if needed
        }); 
        
        listEl.appendChild(card);
    });
}

async function cancelSession(event, sessionId) {
    event.stopPropagation(); 
    if (!confirm('Are you sure you want to cancel this request?')) 
        return; 
    try { 
        const response = await fetch(`http://localhost:3001/api/counseling/cancel/${sessionId}`, 
            { method:'PATCH' });
             if (response.ok) { alert('Request cancelled successfully.'); 
                fetchAndRenderSessions(); 
            } else alert('Failed to cancel request.');
         } catch (error) {
             console.error('Error cancelling:', error);
              alert('An error occurred.'); 
            }
}

async function fetchAndRenderFAQs() {
    const listEl = document.getElementById('faqsList'); 
    if (!listEl) return; listEl.innerHTML = '<p style="color:#999; padding:10px;">Loading questions...</p>';

    try { 
        const response = await fetch('http://localhost:3001/api/faqs'); 
        const faqs = await response.json(); listEl.innerHTML = ''; 
        if (faqs.length === 0) { 
            listEl.innerHTML = '<p style="color:#666; padding:10px;">No FAQs available at the moment.</p>'; 
            return; 
        } 
        faqs.forEach(item=>{ 
            const wrapper = document.createElement('div'); 
            wrapper.style.cssText = 'background:#fff; border:1px solid #e8e8e8; border-radius:8px; padding:12px; margin-bottom:10px; transition:all 0.2s;'; 
            const qBtn = document.createElement('button');
            qBtn.style.cssText = 'display:flex; justify-content:space-between; align-items:center; width:100%; border:0; background:transparent; cursor:pointer; text-align:left; padding:0; font-size:14px; font-weight:600; color:#2c3e7f;'; 
            const qText = document.createElement('span');
             qText.textContent = item.question; const icon = document.createElement('span');
              icon.style.cssText = 'font-size:18px; color:#666; font-weight:bold; margin-left:10px;'; 
              icon.textContent = '+'; qBtn.appendChild(qText); 
              qBtn.appendChild(icon); const answer = document.createElement('div'); 
              answer.style.cssText = 'display:none; margin-top:10px; color:#444; line-height:1.5; font-size:13px; padding-top:10px; border-top:1px solid #f1f1f1;'; 
              answer.textContent = item.answer; qBtn.addEventListener('click', function(e){ e.preventDefault(); 
                const expanded = answer.style.display === 'block'; if (!expanded) { answer.style.display = 'block'; 
                    icon.textContent = '-'; wrapper.style.backgroundColor = '#f8fafc'; 
                } else { 
                    answer.style.display = 'none'; 
                    icon.textContent = '+'; wrapper.style.backgroundColor = '#fff'; 
                } 
            }); 
            
            wrapper.appendChild(qBtn); wrapper.appendChild(answer); 
            listEl.appendChild(wrapper);
         }); 
        } catch (error) {
             console.error('Error fetching FAQs:', error); 
             listEl.innerHTML = '<p style="color:red; padding:10px;">Could not load FAQs. Is the server running?</p>';
            }
}

function openAnnouncementDetailModal(itemId) {
    const item = allAnnouncements.find(a => a._id === itemId); 
    if (!item) return; 
    const modal = document.getElementById('announcementDetailModal'); 

    if (modal) { 
        document.getElementById('announcementDetailTitle').textContent = item.title; 
        document.getElementById('announcementDetailMeta').innerHTML = `<span class="meta-item">Posted on: 
        ${new Date(item.createdAt).toLocaleDateString()}</span>`; 
        document.getElementById('announcementDetailContent').textContent = item.content; modal.setAttribute('aria-hidden','false'); 
        modal.classList.add('open'); document.addEventListener('keydown', handleModalKeydown); 
        markAnnouncementAsRead(item._id); 
        filterAnnouncements('all'); 
    }
}

function closeAnnouncementDetailModal() {
     const modal = document.getElementById('announcementDetailModal'); 
     if (modal) { 
        modal.setAttribute('aria-hidden','true'); 
        modal.classList.remove('open'); 
        document.removeEventListener('keydown', handleModalKeydown);
     } 
}

function openLearnMoreModal() {
     const modal = document.getElementById('learnMoreModal'); 
     if (modal) { 
        modal.setAttribute('aria-hidden','false'); 
        modal.classList.add('open'); 
        document.addEventListener('keydown', handleModalKeydown); 
    } 
}

function closeLearnMoreModal() { 
    const modal = document.getElementById('learnMoreModal'); 
    if (modal) { 
        modal.setAttribute('aria-hidden','true'); 
        modal.classList.remove('open'); 
        document.removeEventListener('keydown', handleModalKeydown);
     }
    }

function openRequestFormModal() { 
    const modal = document.getElementById('requestFormModal'); 
    if (modal) { 
        modal.setAttribute('aria-hidden','false'); 
        modal.classList.add('open'); 
        document.addEventListener('keydown', handleModalKeydown); 
    } 
}
function closeRequestFormModal() { 
    const modal = document.getElementById('requestFormModal'); 
    if (modal) { 
        modal.setAttribute('aria-hidden','true');
         modal.classList.remove('open');
          document.removeEventListener('keydown', handleModalKeydown);
    } 
}

function openSessionsModal() { 
    const modal = document.getElementById('sessionsModal'); 
    if (modal) { modal.setAttribute('aria-hidden','false'); 
        modal.classList.add('open'); 
        document.addEventListener('keydown', handleModalKeydown); 
        fetchAndRenderSessions(); 
    } 
}
function closeSessionsModal() { 
    const modal = document.getElementById('sessionsModal'); 
    if (modal) { 
        modal.setAttribute('aria-hidden','true'); 
        modal.classList.remove('open'); 
        document.removeEventListener('keydown', handleModalKeydown); 
    } 
}

function openFAQsModal() { 
    const modal = document.getElementById('faqsModal'); 
    if (modal) { 
        modal.setAttribute('aria-hidden','false'); 
        modal.classList.add('open'); 
        document.addEventListener('keydown', handleModalKeydown); 
        fetchAndRenderFAQs(); 
    } 
}
function closeFAQsModal() { 
    const modal = document.getElementById('faqsModal'); 
    if (modal) { 
        modal.setAttribute('aria-hidden','true'); 
        modal.classList.remove('open'); 
        document.removeEventListener('keydown', handleModalKeydown); 
    } 
}

// ... (Keep all your existing code above) ...

// ==========================================
//  MISSING FUNCTIONS FIX
// ==========================================

// 1. SWITCH TABS LOGIC
function switchSessionTab(tabName) {
    // Update Buttons
    document.querySelectorAll('.sessions-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Highlight clicked button
    const tabId = 'tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
    const activeBtn = document.getElementById(`tab${capitalize(tabName)}`);
    if(activeBtn) activeBtn.classList.add('active');

// --- 2. MARK AS SEEN LOGIC (FIXED) ---
    if (tabName === 'scheduled') {
        // Find all scheduled IDs currently in memory
        const scheduledIds = allStudentSessions
            .filter(s => s.status === 'Scheduled')
            .map(s => s._id);
        
        if (scheduledIds.length > 0) {
            markScheduledAsSeen(scheduledIds);
            
            // FORCE VISUAL UPDATE: Hide the badge immediately
            const badge = document.getElementById('session-badge');
            if(badge) {
                badge.style.display = 'none'; 
                badge.textContent = '0';
            }
        }
    }

    // Render the list for this specific tab
    renderSessionsList(tabName);
}

// Helper to capitalize first letter
function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
}

// 2. UPDATE TAB COUNTS (Call this after fetching data)
function updateTabCounts() {
    if (!allStudentSessions) return;

    const pending = allStudentSessions.filter(s => s.status === 'Pending').length;
    const scheduled = allStudentSessions.filter(s => s.status === 'Scheduled').length;
    const completed = allStudentSessions.filter(s => s.status === 'Completed').length;

    const elPending = document.getElementById('countPending');
    const elScheduled = document.getElementById('countScheduled');
    const elCompleted = document.getElementById('countCompleted');

    if(elPending) elPending.textContent = pending;
    if(elScheduled) elScheduled.textContent = scheduled;
    if(elCompleted) elCompleted.textContent = completed;
}

// 3. HANDLE ESCAPE KEY (Missing helper)
function handleModalKeydown(e) {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.open');
        openModals.forEach(modal => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        });
    }
}

// 4. BACK BUTTON LOGIC (For details view)
function backToSessionsList() {
    document.getElementById('sessionDetailsContainer').style.display = 'none';
    document.getElementById('sessionsListContainer').style.display = 'block';
    document.querySelector('.sessions-toolbar').style.display = 'flex';
    document.querySelector('.sessions-tabs').style.display = 'flex';
}

// 5. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderAnnouncements();
    
    // Check if we have a student ID
    const studentId = localStorage.getItem('currentStudentId');
    if(studentId) {
        // If we have an ID, try to load sessions immediately in background
        // so they are ready when modal opens
        fetchAndRenderSessions(); 
    }
    
    // Setup Request Form Listener
    const requestForm = document.getElementById('requestForm');
    if(requestForm) {
        requestForm.addEventListener('submit', handleRequestFormSubmit);
    }
});

// --- SEEN NOTIFICATION LOGIC ---
function getSeenScheduledIds() {
    const seen = localStorage.getItem('seenScheduledSessions');
    return seen ? JSON.parse(seen) : [];
}

function markScheduledAsSeen(ids) {
    const current = getSeenScheduledIds();
    // Add new IDs to the list
    const updated = [...new Set([...current, ...ids])];
    localStorage.setItem('seenScheduledSessions', JSON.stringify(updated));
    
    // Trigger the badge update function to verify
    updateDashboardBadge();
}

function updateDashboardBadge() {
    const badge = document.getElementById('session-badge');
    if (!badge) return;

    const seenIds = getSeenScheduledIds();

    // Count sessions that are 'Scheduled' AND NOT in the 'seenIds' list
    const unreadCount = allStudentSessions.filter(s => 
        s.status === 'Scheduled' && !seenIds.includes(s._id)
    ).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// ==========================================
//   COUNSELING SESSIONS MANAGEMENT
// ==========================================

const API_URL = 'http://localhost:3001/api/admin/counseling';
const REFERRALS_API = 'http://localhost:3001/api/counseling-referrals/admin/all'; // <--- This is the missing line!

let sessionsData = {}; 
let referralData = []; 
let currentFilter = 'all';
let currentSessionId = null; 
let allCounselors = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchSessions();
    setupEventListeners();
});

// --- 1. FETCH DAT
// A FROM BACKEND ---
async function fetchSessions() {
    const listContainer = document.getElementById('sessions-list');
    if (!listContainer) return;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch sessions');
        
        const data = await response.json();
        
        // Convert Array to Object Map for easy lookup by ID
        sessionsData = {};
        data.forEach(session => {
            const displayId = session._id.substring(0, 8).toUpperCase(); 
            
            sessionsData[session._id] = {
                id: session._id,
                displayId: displayId,
                studentName: session.studentName || 'Unknown',
                studentId: session.studentId,
                studentEmail: session.studentEmail,
                studentPhone: session.studentPhone,
                preferredMode: session.preferredMode || 'In-Person',
                counselor: session.counselor || 'N/A',
                totalSessions: session.totalSessions || 0,
                status: session.status || 'Pending',
                initialSession: session.initialSessionDate || 'N/A',
                lastSession: session.lastSessionDate || 'N/A',
                nextScheduled: session.scheduledDateTime 
                    ? new Date(session.scheduledDateTime).toLocaleString() 
                    : 'N/A'
            };
        });

        renderSessions();

    } catch (error) {
        console.error('Error:', error);
        listContainer.innerHTML = '<p style="padding:20px; color:#d32f2f; text-align:center;">Error loading sessions. Is the server running?</p>';
    }


    try {
        const resp = await fetch('http://localhost:3001/api/counselors'); // Adjust if route is different
        allCounselors = await resp.json();
        populateCounselorDropdown();
    } catch (e) { console.error(e); }
}

// --- 2. RENDER LIST ---
function renderSessions() {
    const listContainer = document.getElementById('sessions-list');
    const searchBox = document.getElementById('search-box');
    const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : '';

    if (!listContainer) return;
    listContainer.innerHTML = '';

    const items = Object.values(sessionsData);
    
    // Filter Logic
    const filtered = items.filter(item => {
        // A. Tab Filtering
        let matchesTab = false;
        const status = (item.status || '').toLowerCase();
        const filter = currentFilter.toLowerCase();

        if (filter === 'all') {
            matchesTab = true;
        } else if (filter === 'rejected') {
            // Map 'Rejected' tab to 'Cancelled' database status
            matchesTab = (status === 'cancelled');
        } else {
            matchesTab = (status === filter);
        }
        
        // B. Search Filtering
        const matchesSearch = !searchTerm || 
            item.studentName.toLowerCase().includes(searchTerm) || 
            item.studentId.toLowerCase().includes(searchTerm) ||
            item.displayId.toLowerCase().includes(searchTerm);

        return matchesTab && matchesSearch;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; padding:30px; color:#999;">No sessions found.</p>';
        return;
    }

    filtered.forEach(data => {
        const card = document.createElement('div');
        card.className = 'session-card';
        card.setAttribute('data-id', data.id);

        const statusClass = (data.status || 'pending').toLowerCase();

        // Determine Badge Color for Mode
        const modeBadge = data.preferredMode === 'Virtual' 
            ? '<span style="font-size:10px; background:#e0f2fe; color:#0284c7; padding:2px 4px; border-radius:4px;">📹 Virtual</span>'
            : '<span style="font-size:10px; background:#f1f5f9; color:#475569; padding:2px 4px; border-radius:4px;">🏫 F2F</span>';

        card.innerHTML = `
            <div class="session-header">
                <h4>${data.displayId}</h4>
                <span class="status-badge ${statusClass}">${data.status}</span>
            </div>
            <p class="session-name">${data.studentName}</p>
            <div style="margin-bottom:8px;">${modeBadge}</div>
            <div class="session-info">
                <div class="info-item"><span class="info-label">◆ ID:</span> <span>${data.studentId}</span></div>
                <div class="info-item"><span class="info-label">◆ Counselor:</span> <span>${data.counselor}</span></div>
                <div class="info-item"><span class="info-label">◆ Next:</span> <span>${data.nextScheduled === 'N/A' ? '-' : data.nextScheduled}</span></div>
            </div>
        `;

        // Click Listener
        card.addEventListener('click', () => {
            document.querySelectorAll('.session-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            showSessionDetails(data.id);
        });
        
        listContainer.appendChild(card);
    });
}

// --- 3. SHOW DETAILS PANEL ---
function showSessionDetails(id) {
    // --- 1. RESET LAYOUT (New Fix) ---
    // This ensures standard sections are visible and referral details are hidden
    const allSections = document.querySelectorAll('#session-details .detail-section');
    
    // Unhide "Counselling Details" and "Timeline"
    if(allSections[1]) allSections[1].style.display = 'block'; 
    if(allSections[2]) allSections[2].style.display = 'block'; 

    // Hide "Referral Details" if it was previously created
    const referralSection = document.getElementById('custom-referral-details');
    if(referralSection) referralSection.style.display = 'none';
    // ---------------------------------

    currentSessionId = id; 
    const data = sessionsData[id];
    if (!data) return;

    // --- 2. FILL TEXT DATA ---
    setText('detail-session-id', data.displayId);
    setText('detail-student-name', data.studentName);
    setText('detail-student-id', data.studentId);
    setText('detail-student-email', data.studentEmail);
    setText('detail-student-phone', data.studentPhone);
    
    setText('detail-counselor', data.counselor);
    setText('detail-total-sessions', data.totalSessions);

    // Mode Display
    const modeEl = document.getElementById('detail-mode');
    if (modeEl) {
        if(data.preferredMode === 'Virtual') {
            modeEl.innerHTML = `📹 Virtual`;
            modeEl.style.color = '#0284c7';
        } else {
            modeEl.innerHTML = `🏫 Face-to-Face`;
            modeEl.style.color = '#475569';
        }
    }
    
    // Status Badge
    const statusEl = document.getElementById('detail-detail-status');
    const statusBadge = document.getElementById('detail-status');
    
    if (statusEl) statusEl.textContent = data.status;
    if (statusBadge) {
        statusBadge.textContent = data.status;
        statusBadge.className = `status-badge ${data.status.toLowerCase()}`;
    }

    // Timeline
    setText('detail-initial-session', data.initialSession);
    setText('detail-last-session', data.lastSession);
    setText('detail-next-scheduled', data.nextScheduled);

    // Show Panel
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('session-details').style.display = 'block';

    // Completion Checkbox
    const completionSection = document.getElementById('completion-section');
    const markCheckbox = document.getElementById('mark-completed');
    if(completionSection) {
        if(data.status === 'Scheduled') {
            completionSection.style.display = 'block';
            if(markCheckbox) markCheckbox.checked = false;
        } else {
            completionSection.style.display = 'none';
        }
    }

    // --- 3. BUTTON LOGIC ---
    const scheduleBtn = document.getElementById('btn-schedule-or-edit');
    const rejectBtn = document.getElementById('btn-reject-session'); 
    const rescheduleBtn = document.getElementById('btn-reschedule'); 

    // A. RESET: Hide ALL buttons first
    if (scheduleBtn) scheduleBtn.style.display = 'none';
    if (rejectBtn) rejectBtn.style.display = 'none';
    if (rescheduleBtn) rescheduleBtn.style.display = 'none';

    // B. Show based on Status
    if (data.status === 'Pending') {
        // Pending: Show Schedule & Reject
        if (scheduleBtn) {
            scheduleBtn.textContent = 'Schedule Session';
            scheduleBtn.style.display = 'inline-block';
            
            // RESET BUTTON STYLES (In case Referral changed them)
            scheduleBtn.style.backgroundColor = ''; // Reset color
            scheduleBtn.style.flex = ''; // Reset size
            scheduleBtn.style.marginLeft = ''; 
            
            // Re-clone to clear old listeners (like the referral "Accept" listener)
            scheduleBtn.replaceWith(scheduleBtn.cloneNode(true));
            const newScheduleBtn = document.getElementById('btn-schedule-or-edit');
            newScheduleBtn.onclick = openScheduleModal;
        }
        if (rejectBtn) {
            rejectBtn.style.display = 'inline-block'; 
            
            // RESET BUTTON STYLES
            rejectBtn.style.flex = ''; 
            
            // Re-clone to clear old listeners
            rejectBtn.replaceWith(rejectBtn.cloneNode(true));
            const newRejectBtn = document.getElementById('btn-reject-session');
            newRejectBtn.onclick = (typeof openRejectModal === 'function') ? openRejectModal : null; 
        }
    } 
    else if (data.status === 'Scheduled') {
        // Scheduled: Show Mark Completed & Reschedule
        if (scheduleBtn) {
            scheduleBtn.textContent = 'Mark as Completed';
            scheduleBtn.style.display = 'inline-block';
            
            // RESET STYLES
            scheduleBtn.style.backgroundColor = ''; 
            scheduleBtn.style.flex = '';
            scheduleBtn.style.marginLeft = '';

            scheduleBtn.replaceWith(scheduleBtn.cloneNode(true));
            const newCompleteBtn = document.getElementById('btn-schedule-or-edit');

            newCompleteBtn.onclick = function() {
                 if(typeof openCompletionModal === 'function') openCompletionModal();
                 else completeSession();
            };
        }
        
        // SHOW RESCHEDULE BUTTON
        if (rescheduleBtn) {
            rescheduleBtn.style.display = 'inline-block';
            rescheduleBtn.onclick = openScheduleModal; 
        }
    } 
}

// --- 4. MODAL LOGIC ---

// Schedule Modal
function openScheduleModal() {
    if (!currentSessionId) return;
    
    const modal = document.getElementById('schedule-modal');
    const session = sessionsData[currentSessionId];

    // --- 1. DOM ELEMENTS ---
    const dateInput = document.getElementById('schedule-date');
    const timeInput = document.getElementById('schedule-time');
    const counselorSelect = document.getElementById('schedule-counselor');
    const linkGroup = document.getElementById('meet-link-group');
    const linkInput = document.getElementById('schedule-meet-link');

    // --- 2. PRE-FILL DATE & TIME ---
    // Check if status is 'Scheduled' OR 'Pending' (Student Preferred Time)
    const shouldPreFill = (session.status === 'Scheduled' || session.status.toLowerCase() === 'pending') 
                          && session.nextScheduled !== 'N/A';

    if (shouldPreFill) {
        const dateObj = new Date(session.nextScheduled);
        
        if (!isNaN(dateObj)) {
            // Format Date: YYYY-MM-DD
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;

            // Format Time: HH:mm (24-hour format needed for input)
            const hh = String(dateObj.getHours()).padStart(2, '0');
            const min = String(dateObj.getMinutes()).padStart(2, '0');
            timeInput.value = `${hh}:${min}`;
        }
    } else {
        // Clear inputs if no data available
        dateInput.value = '';
        timeInput.value = '';
    }

    // --- 3. PRE-FILL COUNSELOR ---
    // Only select if a counselor is actually assigned (not 'N/A')
    counselorSelect.value = (session.counselor !== 'N/A') ? session.counselor : '';

    // --- 4. HANDLE VIRTUAL LINK ---
    if (linkGroup && linkInput) {
        linkInput.value = ''; // Always clear previous link for safety
        // Show input only if Student requested Virtual
        linkGroup.style.display = (session.preferredMode === 'Virtual') ? 'block' : 'none';
    }
    
    // --- 5. SHOW MODAL ---
    modal.style.display = 'flex';
}

function closeScheduleModal() {
    document.getElementById('schedule-modal').style.display = 'none';
}

// Reject Modal
function openRejectModal() {
    if (!currentSessionId) return;
    const modal = document.getElementById('reject-modal');
    if(document.getElementById('reject-reason')) {
        document.getElementById('reject-reason').value = ''; 
    }
    modal.style.display = 'flex';
}

function closeRejectModal() {
    document.getElementById('reject-modal').style.display = 'none';
}


// --- 5. API ACTIONS ---

// Handle Schedule Submit
// Handle Schedule Submit (Smart Version)
document.getElementById('btn-save-schedule')?.addEventListener('click', async () => {
    // 1. Get Form Data
    const dateStr = document.getElementById('schedule-date').value;
    const timeStr = document.getElementById('schedule-time').value;
    const counselorName = document.getElementById('schedule-counselor').value;
    const meetLinkVal = document.getElementById('schedule-meet-link') ? document.getElementById('schedule-meet-link').value : '';

    if (!dateStr || !timeStr || !counselorName) {
        alert("Please fill in all fields.");
        return;
    }

    // 2. Prepare Data
    const scheduledDateTime = new Date(`${dateStr}T${timeStr}`);
    const session = sessionsData[currentSessionId];
    
    // Check if this is a Referral (ID starts with 'R')
    const isReferral = currentSessionId.toString().startsWith('R');

    try {
        let response;
        
        if (isReferral) {
            // === CASE A: IT IS A REFERRAL ===
            // We need to CREATE a new appointment (POST)
            response = await fetch(API_URL, {  // POST to the main URL to create
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: session.studentId, // Ensure this maps correctly
                    studentName: session.studentName,
                    studentEmail: session.studentEmail, // Pass email if you have it
                    counselor: counselorName,
                    scheduledDateTime: scheduledDateTime,
                    meetingLink: meetLinkVal,
                    preferredMode: session.preferredMode || 'Face-to-Face',
                    status: 'Scheduled',
                    referralId: currentSessionId // Optional: Save the referral ID for reference
                })
            });

            // If creation worked, ALSO update the Referral Status to "Session Scheduled"
            if (response.ok) {
                await updateReferralStatus(currentSessionId, 'Session Scheduled');
            }

        } else {
            // === CASE B: EXISTING APPOINTMENT ===
            // We need to UPDATE the existing one (PATCH)
            response = await fetch(`${API_URL}/${currentSessionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'Scheduled',
                    counselor: counselorName,
                    scheduledDateTime: scheduledDateTime,
                    meetingLink: meetLinkVal
                })
            });
        }

        // 3. Handle Success/Error
        if (response.ok) {
            closeScheduleModal();
            showStatusModal('Session Scheduled', 'The session has been successfully added to the calendar!', 'success');
            
            // Refresh UI
            document.getElementById('session-details').style.display = 'none';
            document.getElementById('empty-state').style.display = 'flex';
            
            // Reload the list (Switch back to 'Scheduled' tab if you want, or just refresh current view)
            if(isReferral) fetchReferrals(); 
            else fetchSessions();

        } else {
            const err = await response.json();
            alert('Error: ' + (err.message || 'Operation failed'));
        }

    } catch (error) {
        console.error(error);
        alert('Network Error: Check console for details');
    }
});

// Handle "Mark as Completed" Confirm Button
document.getElementById('btn-confirm-complete')?.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/${currentSessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Completed' })
        });

        if (response.ok) {
            closeCompletionModal(); // Close the confirmation box
            
            // Refresh UI
            document.getElementById('session-details').style.display = 'none';
            document.getElementById('empty-state').style.display = 'flex';
            fetchSessions();
            
            // Show your nice Animated Success Modal instead of alert!
            showStatusModal('Session Completed', 'The session has been archived successfully.', 'success');
        } else {
            showStatusModal('Error', 'Failed to update session.', 'error');
        }
    } catch (error) {
        console.error(error);
        showStatusModal('Network Error', 'Could not connect to server.', 'error');
    }
});


// Handle Reject Confirm
document.getElementById('btn-confirm-reject')?.addEventListener('click', async () => {
    const reason = document.getElementById('reject-reason')?.value.trim() || 'No reason provided';

    try {
        const response = await fetch(`${API_URL}/${currentSessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'Cancelled',
                notes: `Rejection Reason: ${reason}`
            })
        });

        if (response.ok) {
            closeRejectModal();
            showStatusModal('Request Rejected', 'The request has been cancelled.', 'success');
            
            document.getElementById('session-details').style.display = 'none';
            document.getElementById('empty-state').style.display = 'flex';
            fetchSessions();
        } else {
            alert('Error rejecting request');
        }
    } catch (error) {
        console.error(error);
        alert('Network Error');
    }
});

// Handle Mark as Completed
async function completeSession() {

function openCompletionModal() {
    if (!currentSessionId) return;
    document.getElementById('completion-modal').style.display = 'flex';
}

function closeCompletionModal() {
    document.getElementById('completion-modal').style.display = 'none';
}

    if (!currentSessionId) return;


    try {
        const response = await fetch(`${API_URL}/${currentSessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Completed' })
        });

        if (response.ok) {
            showStatusModal('Session Completed', 'The session has been archived successfully.', 'success');
            document.getElementById('session-details').style.display = 'none';
            document.getElementById('empty-state').style.display = 'flex';
            fetchSessions();
        } else {
            alert('Error updating session');
        }
    } catch (error) {
        console.error(error);
        alert('Network Error');
    }
}


// ==========================================
//   NEW: REFERRAL HANDLING
// ==========================================

// 1. Fetch Referrals from Backend
async function fetchReferrals() {
    const listContainer = document.getElementById('sessions-list');
    listContainer.innerHTML = '<p style="text-align:center; padding:20px;">Loading Referrals...</p>';

    try {
        const response = await fetch(REFERRALS_API);
        if (!response.ok) throw new Error('Failed to fetch referrals');

        referralData = await response.json();
        renderReferrals(referralData); // Call the renderer

    } catch (error) {
        console.error('Error:', error);
        listContainer.innerHTML = '<p style="color:red; text-align:center;">Error loading referrals.</p>';
    }
}

// 2. Render Referral Cards (Filtered)
function renderReferrals(data) {
    const listContainer = document.getElementById('sessions-list');
    listContainer.innerHTML = '';

    // --- FILTER LOGIC ---
    // Only show items that are strictly 'Pending' or 'Acknowledged'.
    // Hide 'Session Scheduled', 'Rejected', 'Closed', etc.
    const pendingReferrals = data.filter(item => {
        const status = (item.status || 'Pending');
        return status === 'Pending' || status === 'Acknowledged';
    });

    // --- EMPTY STATE ---
    if (pendingReferrals.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align:center; padding:40px; color:#999;">
                <p style="font-size: 20px;">✓</p>
                <p>No pending referrals.</p>
            </div>`;
        return;
    }

    // --- RENDER LOOP ---
    pendingReferrals.forEach(item => {
        const card = document.createElement('div');
        card.className = 'session-card';
        card.style.borderLeft = "4px solid #ff9800"; 

        // Extract Instructor Name safely
        let profName = "Unknown Instructor";
        if (item.referredBy && item.referredBy.name) {
            profName = item.referredBy.name;
        } else if (item.instructorName) {
            profName = item.instructorName;
        }

        const reasonShort = item.reason 
            ? (item.reason.length > 30 ? item.reason.substring(0, 30) + '...' : item.reason)
            : 'No reason provided';

        card.innerHTML = `
            <div class="session-header">
                <h4>${item.referralId}</h4>
                <span class="status-badge pending">Referral</span>
            </div>
            <p class="session-name">${item.studentName}</p>
            <div style="margin-bottom:8px;">
                <span style="font-size:10px; background:#fff3e0; color:#e65100; padding:2px 4px; border-radius:4px;">
                    👨‍🏫 Referred by Teacher
                </span>
            </div>
            <div class="session-info">
                <div class="info-item"><span class="info-label">◆ From:</span> <span>${profName}</span></div>
                <div class="info-item"><span class="info-label">◆ Reason:</span> <span>${reasonShort}</span></div>
                <div class="info-item"><span class="info-label">◆ Date:</span> <span>${new Date(item.createdAt).toLocaleDateString()}</span></div>
            </div>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.session-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            showReferralDetails(item);
        });

        listContainer.appendChild(card);
    });
}

// 3. Show Referral Details (Reusing the existing panel)
// admin/counseling/counseling-script.js

// admin/counseling/counseling-script.js

function showReferralDetails(item) {
    // 1. Fill Basic Info
    setText('detail-session-id', item.referralId);
    setText('detail-student-name', item.studentName);
    setText('detail-student-id', item.studentIdNumber);
    setText('detail-student-email', item.studentEmail);
    
    // Use the Phone field to show Course/Year/Section instead (since Phone is often N/A for referrals)
    const courseInfo = `${item.course || ''} ${item.yearLevel || ''}-${item.section || ''}`;
    setText('detail-student-phone', courseInfo.trim() || 'N/A');
    // Optional: Change the label "Phone Number" to "Course/Section" via JS if you want
    // document.querySelector('#detail-student-phone').previousElementSibling.textContent = "Course / Section";

    setText('detail-counselor', item.instructorName || 'N/A');
    setText('detail-detail-status', item.status || 'Pending');

    // 2. Hide "Standard" Sections that don't apply to Referrals
    // (We hide the standard "Counselling Details" and "Timeline" sections)
    const allSections = document.querySelectorAll('#session-details .detail-section');
    if(allSections.length >= 2) {
        // Usually: [0]=Student Info, [1]=Counselling Details, [2]=Timeline
        // We keep [0] (Student Info) and hide the others temporarily
        if(allSections[1]) allSections[1].style.display = 'none'; 
        if(allSections[2]) allSections[2].style.display = 'none';
    }

    // 3. Inject "Referral Specifics" Section
    // Check if we already created our custom section
    let referralSection = document.getElementById('custom-referral-details');
    
    if (!referralSection) {
        // If not, create it!
        referralSection = document.createElement('div');
        referralSection.id = 'custom-referral-details';
        referralSection.className = 'detail-section'; // Re-use existing class for styling
        
        // Insert it after the Student Info section (which is the first .detail-section)
        const studentInfoSection = document.querySelector('#session-details .detail-section');
        studentInfoSection.parentNode.insertBefore(referralSection, studentInfoSection.nextSibling);
    }

    // 4. Populate the Custom Section
    referralSection.style.display = 'block'; // Make sure it's visible
    referralSection.innerHTML = `
        <div class="section-header">
            <span class="section-icon">📝</span>
            <h4>Referral Details</h4>
        </div>
        <div class="detail-grid">
            <div class="detail-item" style="grid-column: span 2;">
                <label>Reason for Referral</label>
                <p style="background: #f8f9fa; padding: 10px; border-radius: 4px; border-left: 3px solid #ff9800;">
                    ${item.reason || 'No reason provided.'}
                </p>
            </div>
            <div class="detail-item">
                <label>Date of Observation</label>
                <p>${item.observationDate ? new Date(item.observationDate).toLocaleDateString() : 'N/A'}</p>
            </div>
             <div class="detail-item">
                <label>Referred By</label>
                <p>${item.instructorName}</p>
            </div>
            <div class="detail-item" style="grid-column: span 2;">
                <label>Additional Notes</label>
                <p>${item.additionalNotes || 'No notes.'}</p>
            </div>
        </div>
    `;

    // --- BUTTON LOGIC (Keep your existing button logic below) ---
    
    // 1. Force Hide the "Edit" Button
    const editBtn = document.getElementById('btn-reschedule');
    if(editBtn) editBtn.style.display = 'none';

    const scheduleBtn = document.getElementById('btn-schedule-or-edit');
    const rejectBtn = document.getElementById('btn-reject-session');

    // 2. Setup "Accept" Button
    if(scheduleBtn) {
        scheduleBtn.style.display = 'inline-block';
        scheduleBtn.textContent = 'Accept & Schedule'; 
        scheduleBtn.style.backgroundColor = '#4caf50'; 
        scheduleBtn.style.flex = '1'; 
        scheduleBtn.style.marginLeft = '10px'; 

        scheduleBtn.replaceWith(scheduleBtn.cloneNode(true));
        const newAcceptBtn = document.getElementById('btn-schedule-or-edit');
        newAcceptBtn.style.flex = '1'; 
        newAcceptBtn.style.marginLeft = '10px';

        newAcceptBtn.addEventListener('click', () => {
             // Prepare data for the modal
             sessionsData[item.referralId] = {
                 id: item.referralId,
                 displayId: item.referralId,
                 studentName: item.studentName,
                 studentId: item.studentIdNumber,
                 studentEmail: item.studentEmail,
                 counselor: 'N/A',
                 status: 'Pending', 
                 preferredMode: 'Face-to-Face',
                 nextScheduled: 'N/A'
             };
             currentSessionId = item.referralId;
             openScheduleModal(); 
        });
    }

    // 3. Setup "Reject" Button
    if(rejectBtn) {
        rejectBtn.style.display = 'inline-block';
        rejectBtn.textContent = 'Reject Referral';
        rejectBtn.style.flex = '1'; 

        rejectBtn.replaceWith(rejectBtn.cloneNode(true));
        const newRejectBtn = document.getElementById('btn-reject-session');
        newRejectBtn.style.flex = '1';

        newRejectBtn.addEventListener('click', () => {
             if(confirm('Are you sure you want to reject this referral?')) {
                 updateReferralStatus(item.referralId, 'Rejected');
             }
        });
    }

    // Show Panel
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('session-details').style.display = 'block';
}

// --- 6. GLOBAL LISTENERS ---
function setupEventListeners() {
    // Tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderSessions();

                if (currentFilter === 'referrals') {
                    // If they clicked "Teacher Referrals", run the NEW function
                    fetchReferrals();
                } else {
                    // Otherwise, run the OLD function (fetchSessions)
                    // But only if we aren't already viewing sessions
                    fetchSessions(); 
                }
            
            // Reset view
            const emptyState = document.getElementById('empty-state');
            const detailsPanel = document.getElementById('session-details');
            if(emptyState) emptyState.style.display = 'flex';
            if(detailsPanel) detailsPanel.style.display = 'none';
        });
    });

    // Search
    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.addEventListener('keyup', renderSessions);
    }
    
    // Modal Close Buttons
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        });
    });

    // Sidebar Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page === 'index') window.location.href = 'index.html';
            else if (page === 'counselors') window.location.href = 'counselors.html';
            else if (page === 'announcements') window.location.href = 'announcements.html';
        });
    });
}

// Helper
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || 'N/A';
}

// --- STATUS MODAL HELPER ---
function showStatusModal(title, message, type = 'success') {
    const modal = document.getElementById('status-modal');
    const content = modal.querySelector('.modal-content');
    const titleEl = document.getElementById('status-title');
    const msgEl = document.getElementById('status-message');
    const icon = document.getElementById('status-icon');

    titleEl.textContent = title;
    msgEl.textContent = message;

    // Reset classes
    content.classList.remove('status-success', 'status-error');

    if (type === 'success') {
        content.classList.add('status-success');
        icon.textContent = '✓';
    } else {
        content.classList.add('status-error');
        icon.textContent = '!';
    }

    modal.style.display = 'flex';
}

function closeStatusModal() {
    document.getElementById('status-modal').style.display = 'none';
}


function populateCounselorDropdown() {
    const select = document.getElementById('schedule-counselor');
    if(!select) return;
    
    select.innerHTML = '<option value="">Choose a counselor</option>';
    allCounselors.forEach(c => {
        const option = document.createElement('option');
        option.value = c.name; // or c._id if you prefer
        option.textContent = c.name;
        // Store the link in a data attribute for easy access
        option.dataset.link = c.googleMeetLink || ''; 
        select.appendChild(option);
    });
}


// --- HELPER FUNCTION: Update Referral Status ---
// This was missing! It tells the database to change the referral from "Pending" to "Session Scheduled"
async function updateReferralStatus(referralId, newStatus) {
    // Ensure the ID is valid
    if (!referralId) return;

    // Use the route we made earlier: PATCH /api/counseling-referrals/:id/status
    const url = `http://localhost:3001/api/counseling-referrals/${referralId}/status`;

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            console.error('Failed to update referral status in background.');
        } else {
            console.log(`Referral ${referralId} updated to ${newStatus}`);
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}
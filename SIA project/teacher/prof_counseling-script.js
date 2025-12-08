// ============================================
// Configuration & State
// ============================================
// --- AUTH CHECK ---
const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user'));

if (!token || !currentUser) {
    // If no login found, kick them back to login page
    window.location.href = "login.html";
}

const API_BASE_URL = 'http://localhost:3001/api/counseling-referrals';
// We store the history here after fetching from DB
let referrals = []; 

// Helper to get the JWT Token (Assuming you save it on Login)
function getAuthToken() {
    return localStorage.getItem('token'); 
}

// ============================================
// Date Formatting Helper Function
// ============================================
function formatDateFromISO(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

let allNotificationData = []; // Store data globally for filtering
let currentNotifFilter = 'unread'; // Default filter

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupFieldValidation();
    loadNotifications();
    setupNotificationListeners();
    });

    // ==========================================
//   DYNAMIC NOTIFICATIONS LOGIC (Upgraded)
// ==========================================




// 1. Fetch and Load Data
async function loadNotifications() {
    const listContainer = document.getElementById('notifications-list');
    
    if(listContainer) listContainer.innerHTML = '<p style="padding:15px; color:#666;">Loading notifications...</p>';

    try {
        const response = await fetch('http://localhost:3001/api/counseling-referrals');
        if (!response.ok) throw new Error('Failed to load notifications');
        
        const referrals = await response.json();

        // --- NEW: Get "Read" IDs from Browser Storage ---
        const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');

        // Process data: Sort and add 'isRead' property
        allNotificationData = referrals
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(item => ({
                ...item,
                // It is considered "Read" if it's in LocalStorage 
                // OR if the status implies it's an old closed case (optional logic)
                isRead: readIds.includes(item.referralId)
            }));

        // Render the view
        filterAndRenderNotifications();

    } catch (error) {
        console.error('Error loading notifications:', error);
        if(listContainer) listContainer.innerHTML = '<p style="padding:15px; color:red;">Unable to load notifications.</p>';
    }
}

// 2. Setup Buttons (Tabs & Mark Read)
function setupNotificationListeners() {
    // Filter Tabs (Unread / All)
    const tabs = document.querySelectorAll('.filter-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // UI Update: Switch active class
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Logic Update: Change filter and re-render
            currentNotifFilter = tab.getAttribute('data-filter'); // 'unread' or 'all'
            filterAndRenderNotifications();
        });
    });

    // Mark All As Read Button
    const markReadBtn = document.querySelector('.mark-all-read');
    if (markReadBtn) {
        markReadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Update Global Data State
            const newReadIds = [];
            allNotificationData.forEach(item => {
                item.isRead = true; // Mark object as read
                newReadIds.push(item.referralId); // Collect ID
            });

            // 2. Save to LocalStorage (Persist the change)
            // We verify existing storage to avoid overwriting unrelated data if needed, 
            // but for "Mark All", we usually just update the list.
            const existingIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
            const uniqueIds = [...new Set([...existingIds, ...newReadIds])];
            localStorage.setItem('readNotifications', JSON.stringify(uniqueIds));

            // 3. Re-render (This moves them out of 'Unread' tab instantly)
            filterAndRenderNotifications();
        });
    }
}

// 3. Filter and Render Logic
function filterAndRenderNotifications() {
    const listContainer = document.getElementById('notifications-list');
    const badgeCount = document.getElementById('unread-count');
    
    if (!listContainer) return;
    listContainer.innerHTML = ''; 

    // A. Filter Data
    const unreadItems = allNotificationData.filter(item => !item.isRead);
    const allItems = allNotificationData;

    // B. Update Badge (Always shows count of unread)
    if(badgeCount) {
        badgeCount.textContent = unreadItems.length;
        // Optional: Hide badge if 0
        badgeCount.style.display = unreadItems.length > 0 ? 'inline-flex' : 'none';
    }

    // C. Determine what to show based on current tab
    let dataToShow = currentNotifFilter === 'unread' ? unreadItems : allItems;

    // D. Empty State
    if (dataToShow.length === 0) {
        const msg = currentNotifFilter === 'unread' ? "You're all caught up!" : "No notifications found.";
        listContainer.innerHTML = `
            <div style="padding:40px; text-align:center; color:#999;">
                <p style="font-size:24px; margin-bottom:10px;">📭</p>
                <p>${msg}</p>
            </div>`;
        return;
    }

    // E. Render Items
    dataToShow.forEach(item => {
        listContainer.appendChild(createNotificationItem(item));
    });
}

// 4. Create HTML Element Helper (Updated for Rejections)
function createNotificationItem(item) {
    // Default Content (Pending)
    let title = `Referral Delivered: ${item.referralId}`;
    let message = `Your referral for <strong>${item.studentName}</strong> was successfully sent.`;
    let icon = ''; // No icon for default, or use a blue dot in CSS

    // --- DYNAMIC CONTENT BASED ON STATUS ---
    
    if (item.status === 'Session Scheduled') {
        // CASE: ACCEPTED
        title = `✅ Session Scheduled: ${item.referralId}`;
        message = `Great news! A counseling session has been scheduled for <strong>${item.studentName}</strong>.`;
        
    } else if (item.status === 'Rejected') {
        // CASE: REJECTED (New!)
        title = `⛔ Referral Rejected: ${item.referralId}`;
        // If you saved the reason in 'additionalNotes', we can show it here
        const reason = item.additionalNotes ? ` Reason: ${item.additionalNotes}` : '';
        message = `The referral for <strong>${item.studentName}</strong> was declined.${reason}`;
        
    } else if (item.status === 'Cancelled') {
        // CASE: CANCELLED (Similar to Reject but softer)
        title = `❌ Referral Cancelled: ${item.referralId}`;
        message = `The referral for <strong>${item.studentName}</strong> has been cancelled.`;

    } else if (item.status === 'Completed') {
        // CASE: COMPLETED
        title = `🎉 Case Completed: ${item.referralId}`;
        message = `The counseling process for <strong>${item.studentName}</strong> is complete.`;
    }

    // --- STYLE LOGIC ---
    // If it's in the "Read" list, make it gray. Otherwise, bold/blue.
    const statusClass = item.isRead ? 'read' : 'unread';
    const timeAgo = getTimeAgo(new Date(item.createdAt));

    const itemDiv = document.createElement('div');
    itemDiv.className = `notification-item ${statusClass}`;
    itemDiv.setAttribute('data-id', item.referralId);

    // Optional: Add specific class for rejection to style it red in CSS if you want
    if (item.status === 'Rejected') {
        itemDiv.style.borderLeftColor = '#dc3545'; // Force Red Border for Rejections
    }

    itemDiv.innerHTML = `
        <div class="notification-header">
            <h4>${title}</h4>
        </div>
        <p class="notification-text">${message}</p>
        <div class="notification-meta">
            <span class="time">${timeAgo}</span>
        </div>
    `;
    
    return itemDiv;
}

// Helper: Time Ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
}
    
    // Check if user is logged in
    if (!getAuthToken()) {
        // Optional: Redirect to login if no token found
        // window.location.href = '../login/index.html';
        console.warn("No Auth Token found. API calls will fail.");
    }

    // ==========================================
//   AUTO-FILL STUDENT DATA (Enrollment DB)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the Input Fields (Make sure these IDs match your HTML!)
    const idInput = document.getElementById('student-id-input'); // The ID box
    const nameInput = document.getElementById('student-name-input'); // The Name box
    const emailInput = document.getElementById('student-email-input'); // The Email box
    // const courseInput = document.getElementById('student-course-input'); // (Optional)

    // 2. Add the "Blur" Listener (Triggers when user clicks outside the box)
    if (idInput) {
        idInput.addEventListener('blur', async () => {
            const studentId = idInput.value.trim();

            // Stop if empty
            if (!studentId) return;

            // Visual feedback so they know it's working
            if(nameInput) nameInput.value = "Searching...";
            if(emailInput) emailInput.value = "...";

            try {
                // Call your NEW Backend Route
                const response = await fetch(`http://localhost:3001/api/lookup/${studentId}`);

                if (response.ok) {
                    const data = await response.json();
                    
                    // Success! Fill the boxes
                    if(nameInput) nameInput.value = data.fullName;
                    if(emailInput) emailInput.value = data.email;
                    
                    // Optional: Fill Course/Section if you have that box
                    // if(courseInput) courseInput.value = data.fullSection;

                    console.log("✅ Student found:", data);
                } else {
                    // Not Found
                    alert("Student ID not found in the Enrollment Database.");
                    if(nameInput) nameInput.value = "";
                    if(emailInput) emailInput.value = "";
                }
            } catch (error) {
                console.error("❌ Error fetching student:", error);
                alert("Server Error: Could not search for student.");
                if(nameInput) nameInput.value = "";
            }
        });
    }
});


// ============================================
// Event Listeners
// ============================================
function initializeEventListeners() {
    // --- Modals ---
    const btnReferralForm = document.getElementById('btn-referral-form');
    if (btnReferralForm) btnReferralForm.addEventListener('click', openReferralModal);

    const btnReferralHistory = document.getElementById('btn-referral-history');
    if (btnReferralHistory) {
        btnReferralHistory.addEventListener('click', () => {
            openHistoryModal();
            fetchReferralHistory(); // FETCH FROM DB WHEN OPENING
        });
    }

    // --- Closing Modals ---
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.classList.remove('active');
        });
    });

    // --- Form Submission ---
    const referralForm = document.getElementById('referral-form');
    if (referralForm) {
        referralForm.addEventListener('submit', handleReferralSubmit); // Now Async
    }

    // --- Confirmation Modal Actions ---
    const confirmSubmissionBtn = document.getElementById('confirm-submission');
    if (confirmSubmissionBtn) {
        confirmSubmissionBtn.addEventListener('click', submitToBackend); // Actual API Call
    }

    const cancelSubmissionBtn = document.getElementById('cancel-submission');
    if (cancelSubmissionBtn) {
        cancelSubmissionBtn.addEventListener('click', () => {
            closeConfirmationModal();
            openReferralModal();
        });
    }

    // --- Success Modal Actions ---
    const doneBtn = document.getElementById('done-button');
    if (doneBtn) doneBtn.addEventListener('click', closeSuccessModal);

    const trackStatusBtn = document.getElementById('track-status-button');
    if (trackStatusBtn) {
        trackStatusBtn.addEventListener('click', () => {
            closeSuccessModal();
            openHistoryModal();
            fetchReferralHistory();
        });
    }

    // --- Search & Sort ---
    const historySortDropdown = document.getElementById('history-sort');
    if (historySortDropdown) {
        historySortDropdown.addEventListener('change', (e) => displayHistoryCards(e.target.value));
    }

    const historySearch = document.getElementById('history-search');
    if (historySearch) {
        historySearch.addEventListener('input', (e) => searchHistoryCards(e.target.value));
    }

    // --- Duplicate Modal Actions ---
    const duplicateReturnBtn = document.getElementById('duplicate-return');
    if (duplicateReturnBtn) {
        duplicateReturnBtn.addEventListener('click', () => {
            document.getElementById('duplicate-modal').classList.remove('active');
            openReferralModal();
        });
    }
    
    // --- Learn More ---
    const learnMoreBtn = document.querySelector('.btn-learn-more');
    if (learnMoreBtn) learnMoreBtn.addEventListener('click', () => document.getElementById('learn-more-modal').classList.add('active'));

    // --- Logout ---
    const logoutBtn = document.getElementById('logout-option');
    if(logoutBtn) logoutBtn.addEventListener('click', () => document.getElementById('logout-modal').classList.add('active'));
    
    const confirmLogout = document.getElementById('confirm-logout');
    if(confirmLogout) confirmLogout.addEventListener('click', handleLogout);
}

// ============================================
// API INTEGRATION: Fetch History
// ============================================
async function fetchReferralHistory() {
    const historyContainer = document.getElementById('history-items');
    historyContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Loading records...</p>';

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`, // Auth Header
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch history');

        // Update the global referrals array with DB data
        referrals = await response.json(); 
        
        displayHistoryCards('newest');

    } catch (error) {
        console.error('Error:', error);
        historyContainer.innerHTML = '<p style="text-align:center; color:red;">Error loading history. Check connection.</p>';
    }
}
async function submitReferral(formData) {
    // 1. Get the token from storage (Make sure the key name 'token' matches what you use in your login script)
    const token = localStorage.getItem('token'); 

    // Safety Check: If no token exists, the user isn't logged in.
    if (!token) {
        alert("You are not logged in. Please log in first.");
        window.location.href = "/login.html"; // Redirect to login
        return;
    }

    const currentUser = JSON.parse(userString);
// 2. ATTACH THE REAL USER DATA TO THE FORM
    // We manually add these fields to the data we are sending to the server
    formData.referredBy = currentUser.id;       // <--- The User ID
    formData.instructorName = currentUser.name; // <--- The User Name
    formData.instructorEmail = currentUser.email; // <--- The User Email

    try {
        const response = await fetch('http://localhost:3001/api/counseling-referrals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 2. Add this line! This attaches the "Key" to your request
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Referral submitted successfully!");
            // clear form or close modal here
        } else {
            // This handles the "Unauthorized" alert you saw
            alert(data.message || "Error submitting referral");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Server connection failed.");
    }
}


// ============================================
// API INTEGRATION: Form Submission Logic
// ============================================

// Global variable to store data temporarily between "Submit" and "Confirm"
let pendingReferralData = null;

function handleReferralSubmit(e) {
    e.preventDefault();
    
    if (!validateAllFields()) {
        showToast('Please fix errors before submitting', false, 'error');
        return;
    }
    
    const confidentialityCheckbox = document.getElementById('confidentiality-checkbox');
    if (confidentialityCheckbox && !confidentialityCheckbox.checked) {
        showToast('Please agree to confidentiality', false, 'error');
        return;
    }

    
    // 1. Gather Data from DOM
    pendingReferralData = {
        studentId: document.getElementById('student-id').value.trim(),
        studentName: document.getElementById('student-name').value.trim(),
        studentEmail: document.getElementById('student-email').value.trim(),
        course: document.getElementById('course').value.trim(),
        yearLevel: document.getElementById('year-level').value.trim(),
        section: document.getElementById('section').value.trim(),
        reason: document.getElementById('reason').value.trim(),
        observationDate: document.getElementById('observation-date').value,
        additionalNotes: document.getElementById('additional-notes').value.trim()
    };

    // 2. Close Form, Open Confirmation
    closeReferralFormModal();
    document.getElementById('submit-confirmation-modal').classList.add('active');
}

// The ACTUAL Send to Database Function
async function submitToBackend() {
    if (!pendingReferralData) return;

    const confirmModal = document.getElementById('submit-confirmation-modal');
    const confirmBtn = document.getElementById('confirm-submission');
    
    // UI: Loading State
    const originalBtnText = confirmBtn.textContent;
    confirmBtn.textContent = 'Sending...';
    confirmBtn.disabled = true;

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}` // Important!
            },
            body: JSON.stringify(pendingReferralData)
        });

        const data = await response.json();

        if (response.ok) {
            // SUCCESS (201)
            confirmModal.classList.remove('active');
            
            // Show Success Modal with real ID
            document.getElementById('case-id-display').textContent = data.referral.referralId;
            document.getElementById('success-modal').classList.add('active');
            
            // Reset Form
            document.getElementById('referral-form').reset();
            pendingReferralData = null;

        } else if (response.status === 409) {
            // DUPLICATE (409)
            confirmModal.classList.remove('active');
            
            // Show duplicate modal with the ID returned by backend
            document.getElementById('duplicate-case-id').textContent = data.caseId; 
            document.getElementById('duplicate-modal').classList.add('active');

        } else {
            // OTHER ERRORS
            alert(data.message || 'Error submitting form');
        }

    } catch (error) {
        console.error('Submission Error:', error);
        alert('Server connection failed. Is the backend running?');
    } finally {
        // Reset Button
        confirmBtn.textContent = originalBtnText;
        confirmBtn.disabled = false;
    }
}


// ============================================
// UI Rendering Functions (Display)
// ============================================

function displayHistoryCards(sortOrder = 'newest') {
    const historyItems = document.getElementById('history-items');
    if (!historyItems) return;
    
    historyItems.innerHTML = '';
    
    if (referrals.length === 0) {
        historyItems.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No referrals found.</p>';
        return;
    }

    // Sort Logic
    const sortedReferrals = [...referrals].sort((a, b) => {
        // Sort by CreatedAt Date from DB
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    sortedReferrals.forEach(referral => {
        const card = createHistoryCard(referral);
        historyItems.appendChild(card);
    });
}

function createHistoryCard(referral) {
    const card = document.createElement('div');
    card.className = 'history-card-entry';
    
    // Calculate Time Ago based on createdAt
    const dateSent = new Date(referral.createdAt);
    const formattedDate = dateSent.toLocaleDateString();
    
    // Status Badge Logic
    let statusClass = 'pending';
    if(referral.status === 'Closed') statusClass = 'completed';
    else if(referral.status === 'Acknowledged') statusClass = 'accepted';

    card.innerHTML = `
        <div class="history-card-header">
            <div class="referral-icon">${referral.studentName.charAt(0).toUpperCase()}</div>
            <div class="referral-code-date">
                <p class="referral-code">${referral.referralId}</p>
                <p class="referral-date">Submitted: ${formattedDate}</p>
            </div>
            <span class="status-badge ${statusClass}" style="margin-left:auto">${referral.status}</span>
        </div>
        <div class="history-details">
            <div class="history-detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${referral.studentName}</span>
            </div>
            <div class="history-detail-row">
                <span class="detail-label">Reason:</span>
                <span class="detail-value">${referral.reason}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        document.getElementById('history-modal').classList.remove('active');
        showReferralDetail(referral);
    });
    
    return card;
}

function showReferralDetail(referral) {
    // Fill in the detail modal fields using DB data
    document.getElementById('detail-referral-id').textContent = referral.referralId;
    document.getElementById('detail-student-id').textContent = `Student ID: ${referral.studentIdNumber || referral.studentId}`;
    document.getElementById('detail-student-name').textContent = referral.studentName;
    document.getElementById('detail-student-email').textContent = referral.studentEmail;
    document.getElementById('detail-course').textContent = `${referral.course} - ${referral.yearLevel}${referral.section}`;
    
    document.getElementById('detail-reason').textContent = referral.reason;
    document.getElementById('detail-date').textContent = formatDateFromISO(referral.observationDate);
    document.getElementById('detail-notes').textContent = referral.additionalNotes || 'No notes.';

    // Show Modal
    document.getElementById('referral-detail-modal').classList.add('active');
}

function searchHistoryCards(searchTerm) {
    const term = searchTerm.toLowerCase();
    const historyItems = document.getElementById('history-items');
    historyItems.innerHTML = '';

    const filtered = referrals.filter(r => 
        r.referralId.toLowerCase().includes(term) || 
        r.studentName.toLowerCase().includes(term) ||
        r.studentIdNumber?.includes(term)
    );

    if (filtered.length === 0) {
        historyItems.innerHTML = '<p style="text-align:center">No matches found</p>';
        return;
    }

    filtered.forEach(r => historyItems.appendChild(createHistoryCard(r)));
}

// ============================================
// Utilities (Toast, Logout, Modals)
// ============================================

function openReferralModal() {
    document.getElementById('referral-modal').classList.add('active');
}
function openHistoryModal() {
    document.getElementById('history-modal').classList.add('active');
}
function closeReferralFormModal() {
    document.getElementById('referral-modal').classList.remove('active');
}
function closeConfirmationModal() {
    document.getElementById('submit-confirmation-modal').classList.remove('active');
}
function closeSuccessModal() {
    document.getElementById('success-modal').classList.remove('active');
}

function handleLogout() {
    localStorage.removeItem('token'); // Clear token
    showToast('Logging out...');
    setTimeout(() => {
        window.location.href = '../login/index.html'; // Adjust path
    }, 1000);
}

function showToast(message, showIcon = true, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const msg = document.getElementById('toast-message');
    if(toast && msg) {
        msg.textContent = message;
        toast.className = `toast-notification show toast-${type}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// ============================================
// Validation Logic (Kept from your original)
// ============================================
const requiredFields = {
    'student-id': {
        errorElement: 'student-id-error',
        isEmpty: (val) => val.trim().length === 0,
        isInvalid: (val) => val.trim().length > 0 && !/^[\d-]+$/.test(val),
        emptyMessage: 'Required.',
        invalidMessage: 'Numbers and dashes only.'
    },
    'student-name': {
        errorElement: 'student-name-error',
        isEmpty: (val) => val.trim().length === 0,
        isInvalid: (val) => val.trim().length > 0 && !/^[A-Za-z ]+$/.test(val),
        emptyMessage: 'Required.',
        invalidMessage: 'Letters only.'
    },
    'course': { errorElement: 'course-error', isEmpty: (v) => v.trim() === '', isInvalid: () => false },
    'year-level': { errorElement: 'year-level-error', isEmpty: (v) => v.trim() === '', isInvalid: () => false },
    'section': { errorElement: 'section-error', isEmpty: (v) => v.trim() === '', isInvalid: () => false },
    'student-email': {
        errorElement: 'student-email-error',
        isEmpty: (v) => v.trim() === '',
        isInvalid: (v) => v.trim().length > 0 && !v.includes('@'), // Simple check
        emptyMessage: 'Required.',
        invalidMessage: 'Invalid email.'
    },
    'reason': { errorElement: 'reason-error', isEmpty: (v) => v.trim() === '', isInvalid: () => false },
    'observation-date': { errorElement: 'observation-date-error', isEmpty: (v) => v.trim() === '', isInvalid: () => false }
};

function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return true;
    const rules = requiredFields[fieldId];
    const errorEl = document.getElementById(rules.errorElement);
    
    let isValid = true;
    if (rules.isEmpty(field.value)) {
        errorEl.textContent = rules.emptyMessage || 'Required';
        isValid = false;
    } else if (rules.isInvalid(field.value)) {
        errorEl.textContent = rules.invalidMessage || 'Invalid format';
        isValid = false;
    }

    if (!isValid) {
        errorEl.style.display = 'block';
        field.classList.add('input-error');
    } else {
        errorEl.style.display = 'none';
        field.classList.remove('input-error');
    }
    return isValid;
}

function validateAllFields() {
    let allValid = true;
    for (const id in requiredFields) {
        if (!validateField(id)) allValid = false;
    }
    return allValid;
}

function setupFieldValidation() {
    for (const id in requiredFields) {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('input', () => validateField(id));
            field.addEventListener('blur', () => validateField(id));
        }
    }
}
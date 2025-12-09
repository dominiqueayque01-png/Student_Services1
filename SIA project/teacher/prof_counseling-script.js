// ============================================
// Configuration & State
// ============================================

// --- AUTH CHECK ---
const token = localStorage.getItem('token');
const userString = localStorage.getItem('user');
const currentUser = userString ? JSON.parse(userString) : null;

if (!token || !currentUser) {
    // If no login found, kick them back to login page
    window.location.href = "index.html"; // Ensure this points to your actual login page
}

const API_BASE_URL = 'http://localhost:3001/api/counseling-referrals';

// Global State
let referrals = []; 
let allNotificationData = []; 
let currentNotifFilter = 'unread'; 
let pendingReferralData = null; // Stores form data between "Submit" and "Confirm"

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupFieldValidation();
    setupAutoFill(); // Initialize the student ID lookup
    
    // Load Data
    loadNotifications();
    fetchReferralHistory();
    setupNotificationListeners();
});

// ============================================
// 1. DYNAMIC NOTIFICATIONS LOGIC
// ============================================

async function loadNotifications() {
    const listContainer = document.getElementById('notifications-list');
    
    // Only show loading if empty to avoid flashing
    if(listContainer && listContainer.innerHTML.trim() === '') {
        listContainer.innerHTML = '<p style="padding:15px; color:#666;">Loading notifications...</p>';
    }

    try {
        // --- STEP 1: GET USER ID (Crucial for the Backend!) ---
        const userString = localStorage.getItem('user');
        if (!userString) return; 
        
        const currentUser = JSON.parse(userString);
        const userId = currentUser.id || currentUser._id;

        // --- STEP 2: FETCH WITH ID ---
        // We MUST send ?instructorId=... or the backend will reject us
        const response = await fetch(`${API_BASE_URL}?instructorId=${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load notifications');
        
        const data = await response.json();

        // --- STEP 3: SMART READ LOGIC ---
        // We store "Signatures" (ID + Status). 
        // If the status changes (Pending -> Scheduled), the signature changes, so it becomes UNREAD again!
        const readSignatures = JSON.parse(localStorage.getItem('readNotificationStates') || '[]');

        allNotificationData = data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(item => {
                // Create a Unique Signature
                // Example: "R2025-001-Pending" vs "R2025-001-Session Scheduled"
                const uniqueSignature = `${item.referralId}-${item.status}`;

                return {
                    ...item,
                    uniqueSignature: uniqueSignature,
                    // It is read ONLY if we have seen this specific status before
                    isRead: readSignatures.includes(uniqueSignature)
                };
            });

        filterAndRenderNotifications();

    } catch (error) {
        console.error('Error loading notifications:', error);
        if(listContainer) listContainer.innerHTML = '<p style="padding:15px; color:red;">Unable to load notifications.</p>';
    }
}

function setupNotificationListeners() {
    // Filter Tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentNotifFilter = tab.getAttribute('data-filter');
            filterAndRenderNotifications();
        });
    });

    // Mark All As Read
    const markReadBtn = document.querySelector('.mark-all-read');
    if (markReadBtn) {
        markReadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Collect all current signatures
            const newSignatures = allNotificationData.map(item => item.uniqueSignature);
            
            // 2. Save to LocalStorage
            const existing = JSON.parse(localStorage.getItem('readNotificationStates') || '[]');
            const uniqueSet = [...new Set([...existing, ...newSignatures])];
            localStorage.setItem('readNotificationStates', JSON.stringify(uniqueSet));

            // 3. Update UI instantly
            allNotificationData.forEach(item => item.isRead = true);
            filterAndRenderNotifications();
        });
    }
}

function filterAndRenderNotifications() {
    const listContainer = document.getElementById('notifications-list');
    const badgeCount = document.getElementById('unread-count');
    
    if (!listContainer) return;
    listContainer.innerHTML = ''; 

    // Filter
    const unreadItems = allNotificationData.filter(item => !item.isRead);
    
    // Update Badge
    if(badgeCount) {
        badgeCount.textContent = unreadItems.length;
        badgeCount.style.display = unreadItems.length > 0 ? 'inline-flex' : 'none';
    }

    // Determine what to show
    let dataToShow = currentNotifFilter === 'unread' ? unreadItems : allNotificationData;

    if (dataToShow.length === 0) {
        listContainer.innerHTML = `<div style="padding:40px; text-align:center; color:#999;"><p>${currentNotifFilter === 'unread' ? "You're all caught up!" : "No notifications found."}</p></div>`;
        return;
    }

    dataToShow.forEach(item => {
        listContainer.appendChild(createNotificationItem(item));
    });
}

// 4. Create HTML Element Helper (Updated for Scheduled Status)
function createNotificationItem(item) {
    // Default Content (Pending)
    let title = `Referral Delivered: ${item.referralId}`;
    let message = `Your referral for <strong>${item.studentName}</strong> was successfully sent.`;
    
    // --- STATUS LOGIC ---
    
    // 1. SESSION SCHEDULED (The New Feature!)
    if (item.status === 'Session Scheduled' || item.status === 'Scheduled') {
        title = `✅ Session Scheduled: ${item.referralId}`;
        message = `Great news! A counseling session has been successfully scheduled for <strong>${item.studentName}</strong>.`;
    } 
    // 2. REJECTED
    else if (item.status === 'Rejected') {
        title = `⛔ Referral Rejected: ${item.referralId}`;
        const reason = item.additionalNotes ? ` Reason: ${item.additionalNotes}` : '';
        message = `The referral for <strong>${item.studentName}</strong> was declined.${reason}`;
    } 
    // 3. CANCELLED
    else if (item.status === 'Cancelled') {
        title = `❌ Referral Cancelled: ${item.referralId}`;
        message = `The referral for <strong>${item.studentName}</strong> has been cancelled.`;
    } 
    // 4. COMPLETED
    else if (item.status === 'Completed') {
        title = `🎉 Case Completed: ${item.referralId}`;
        message = `The counseling process for <strong>${item.studentName}</strong> is now complete.`;
    }

    // --- STYLE LOGIC ---
    const statusClass = item.isRead ? 'read' : 'unread';
    const timeAgo = getTimeAgo(new Date(item.createdAt));

    const itemDiv = document.createElement('div');
    itemDiv.className = `notification-item ${statusClass}`;
    itemDiv.setAttribute('data-id', item.referralId);

    // Add visual color markers based on status
    if (item.status === 'Session Scheduled' || item.status === 'Scheduled') {
        itemDiv.style.borderLeftColor = '#28a745'; // Green border for Success
        itemDiv.style.backgroundColor = item.isRead ? '#fff' : '#f0fff4'; // Light green tint if unread
    } else if (item.status === 'Rejected' || item.status === 'Cancelled') {
        itemDiv.style.borderLeftColor = '#dc3545'; // Red border for Rejection
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

// ============================================
// 2. STUDENT LOOKUP (Auto-Fill)
// ============================================
function setupAutoFill() {
    const idInput = document.getElementById('student-id'); // Ensure this matches HTML ID
    const nameInput = document.getElementById('student-name');
    const emailInput = document.getElementById('student-email');
    const courseInput = document.getElementById('course'); 
    const yearInput = document.getElementById('year-level');
    const sectionInput = document.getElementById('section');

    if (idInput) {
        idInput.addEventListener('blur', async () => {
            const studentId = idInput.value.trim();
            if (!studentId) return;

            if(nameInput) nameInput.value = "Searching...";

            try {
                const response = await fetch(`http://localhost:3001/api/lookup/${studentId}`);
                if (response.ok) {
                    const data = await response.json();
                    if(nameInput) nameInput.value = data.fullName || '';
                    if(emailInput) emailInput.value = data.email || '';
                    if(courseInput) courseInput.value = data.course || '';
                    if(yearInput) yearInput.value = data.yearLevel || '';
                    if(sectionInput) sectionInput.value = data.section || '';
                } else {
                    alert("Student ID not found in Enrollment Database.");
                    if(nameInput) nameInput.value = "";
                }
            } catch (error) {
                console.error("Error fetching student:", error);
                if(nameInput) nameInput.value = "";
            }
        });
    }
}

// ============================================
// 3. FORM SUBMISSION LOGIC (The Critical Part)
// ============================================

// Step A: Handle "Submit" click -> Validation -> Open Confirm Modal
function handleReferralSubmit(e) {
    e.preventDefault();
    
    if (!validateAllFields()) {
        showToast('Please fix errors before submitting', false, 'error');
        return;
    }
    
    // 1. Gather Data (Store in Global Variable)
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

// Step B: Handle "Confirm" click -> Send to Backend
async function confirmAndSendToBackend() {
    const submitBtn = document.getElementById('confirm-submission');
    const originalText = submitBtn ? submitBtn.textContent : "Confirm";

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
    }

    try {
        // 1. Validate Auth
        const userId = currentUser.id || currentUser._id;
        if (!userId) throw new Error("User ID missing. Please login again.");

        // 2. Add Auth Info to Payload
        const finalPayload = {
            ...pendingReferralData,
            referredBy: userId,
            instructorName: currentUser.name,
            instructorEmail: currentUser.email
        };

        // 3. Send Request
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(finalPayload)
        });

        const result = await response.json();

        if (response.ok) {
            closeConfirmationModal();
            document.getElementById('success-modal').classList.add('active');
            
            // Refresh data
            fetchReferralHistory();
            loadNotifications();
            
            // Clear form
            document.getElementById('referral-form').reset();
        } else {
            alert(result.message || "Error submitting referral");
        }

    } catch (error) {
        console.error("Submission Error:", error);
        alert(error.message || "Network error occurred.");
        if (error.message.includes("User ID")) window.location.href = "index.html";
    } finally {
        // 4. Always Unlock Button
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

// ============================================
// 4. REFERRAL HISTORY (Fetch & Display)
// ============================================
// ============================================
// API INTEGRATION: Fetch History
// ============================================
// ============================================
// API INTEGRATION: Fetch History
// ============================================
async function fetchReferralHistory() {
    const historyContainer = document.getElementById('history-items');
    if (!historyContainer) return;

    historyContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Loading records...</p>';

    try {
        // 1. Get the Logged-in User
        const userString = localStorage.getItem('user');
        if (!userString) return; 
        
        const currentUser = JSON.parse(userString);
        // Get the ID (Handle both formats)
        const userId = currentUser.id || currentUser._id;

        // 2. Call API with the ID in the URL
        const response = await fetch(`${API_BASE_URL}?instructorId=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch history');

        // 3. Update the List
        referrals = await response.json(); 
        displayHistoryCards('newest');

    } catch (error) {
        console.error('Error:', error);
        historyContainer.innerHTML = '<p style="text-align:center; color:red;">Error loading history.</p>';
    }
}

function displayHistoryCards(sortOrder = 'newest') {
    const historyItems = document.getElementById('history-items');
    historyItems.innerHTML = '';
    
    if (referrals.length === 0) {
        historyItems.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No referrals found.</p>';
        return;
    }

    const sortedReferrals = [...referrals].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    sortedReferrals.forEach(referral => {
        historyItems.appendChild(createHistoryCard(referral));
    });
}

function createHistoryCard(referral) {
    const card = document.createElement('div');
    card.className = 'history-card-entry';
    
    const formattedDate = new Date(referral.createdAt).toLocaleDateString();
    let statusClass = 'pending';
    if(referral.status === 'Session Scheduled') statusClass = 'accepted';
    else if(referral.status === 'Rejected') statusClass = 'rejected';
    else if(referral.status === 'Completed') statusClass = 'completed';

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
    document.getElementById('detail-referral-id').textContent = referral.referralId;
    document.getElementById('detail-student-id').textContent = `Student ID: ${referral.studentIdNumber || referral.studentId}`;
    document.getElementById('detail-student-name').textContent = referral.studentName;
    document.getElementById('detail-student-email').textContent = referral.studentEmail;
    document.getElementById('detail-course').textContent = `${referral.course} - ${referral.yearLevel}${referral.section}`;
    document.getElementById('detail-reason').textContent = referral.reason;
    document.getElementById('detail-date').textContent = new Date(referral.observationDate).toLocaleDateString();
    document.getElementById('detail-notes').textContent = referral.additionalNotes || 'No notes.';
    
    document.getElementById('referral-detail-modal').classList.add('active');
}

// ============================================
// 5. EVENT LISTENERS
// ============================================
function initializeEventListeners() {
    // Modal Openers
    const btnReferralForm = document.getElementById('btn-referral-form');
    if (btnReferralForm) btnReferralForm.addEventListener('click', () => document.getElementById('referral-modal').classList.add('active'));

    const btnReferralHistory = document.getElementById('btn-referral-history');
    if (btnReferralHistory) {
        btnReferralHistory.addEventListener('click', () => {
            document.getElementById('history-modal').classList.add('active');
            fetchReferralHistory();
        });
    }

    const trackStatusBtn = document.getElementById('track-status-button');
    if (trackStatusBtn) {
        trackStatusBtn.addEventListener('click', () => {
            // 1. Close Success Modal
            document.getElementById('success-modal').classList.remove('active');
            
            // 2. Open History Modal
            document.getElementById('history-modal').classList.add('active');
            
            // 3. Load the Data
            fetchReferralHistory();
        });
    }

    // Close Buttons
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.classList.remove('active');
        });
    });

    // 1. FORM SUBMIT (Triggers Validation & Opens Confirm Modal)
    const referralForm = document.getElementById('referral-form');
    if (referralForm) {
        referralForm.addEventListener('submit', handleReferralSubmit);
    }

    // 2. CONFIRM SUBMIT (Triggers Actual API Call)
    const confirmSubmissionBtn = document.getElementById('confirm-submission');
    if (confirmSubmissionBtn) {
        confirmSubmissionBtn.addEventListener('click', confirmAndSendToBackend);
    }

    // Cancel Confirmation
    const cancelSubmissionBtn = document.getElementById('cancel-submission');
    if (cancelSubmissionBtn) {
        cancelSubmissionBtn.addEventListener('click', () => {
            closeConfirmationModal();
            document.getElementById('referral-modal').classList.add('active'); // Re-open form
        });
    }

    // Success Actions
    const doneBtn = document.getElementById('done-button');
    if (doneBtn) doneBtn.addEventListener('click', closeSuccessModal);

    // Logout
    const logoutBtn = document.getElementById('logout-option');
    if(logoutBtn) logoutBtn.addEventListener('click', () => document.getElementById('logout-modal').classList.add('active'));
    
    const confirmLogout = document.getElementById('confirm-logout');
    if(confirmLogout) {
        confirmLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
}

// ============================================
// Utilities
// ============================================
function closeReferralFormModal() { document.getElementById('referral-modal').classList.remove('active'); }
function closeConfirmationModal() { document.getElementById('submit-confirmation-modal').classList.remove('active'); }
function closeSuccessModal() { document.getElementById('success-modal').classList.remove('active'); }

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

function showToast(message, showIcon, type) {
    // Implementation of toast if you have the HTML for it
    alert(message); // Fallback
}

// ============================================
// Field Validation
// ============================================
const requiredFields = {
    'student-id': { errorElement: 'student-id-error', isEmpty: (v) => v.trim() === '', isInvalid: () => false },
    'student-name': { errorElement: 'student-name-error', isEmpty: (v) => v.trim() === '', isInvalid: () => false },
    'student-email': { errorElement: 'student-email-error', isEmpty: (v) => v.trim() === '', isInvalid: (v) => !v.includes('@') },
    'reason': { errorElement: 'reason-error', isEmpty: (v) => v.trim() === '', isInvalid: () => false },
    'observation-date': { errorElement: 'observation-date-error', isEmpty: (v) => v.trim() === '', isInvalid: () => false }
};

function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return true;
    const rules = requiredFields[fieldId];
    const errorEl = document.getElementById(rules.errorElement);
    
    let isValid = true;
    if (rules.isEmpty(field.value)) isValid = false;
    else if (rules.isInvalid(field.value)) isValid = false;

    if (!isValid && errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Required or Invalid';
        field.classList.add('input-error');
    } else if (errorEl) {
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
        if (field) field.addEventListener('blur', () => validateField(id));
    }
}
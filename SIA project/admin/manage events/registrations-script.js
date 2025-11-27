// Registration data
let registrationsData = [
    {
        id: 1,
        studentName: 'Juan Dela Cruz',
        studentId: '23-9995',
        email: 'juan.delacruz@qcu.edu.ph',
        phone: '0912 345 6789',
        event: 'Tech Talk: IT Summit',
        registrationDate: '15/10/2025',
        status: 'Confirmed'
    },
    {
        id: 2,
        studentName: 'Maria Santos',
        studentId: '23-9996',
        email: 'maria.santos@qcu.edu.ph',
        phone: '0912 345 6790',
        event: 'QCU Bayanihan Week',
        registrationDate: '15/10/2025',
        status: 'Confirmed'
    },
    {
        id: 3,
        studentName: 'Pedro Reyes',
        studentId: '23-9997',
        email: 'pedro.reyes@qcu.edu.ph',
        phone: '0912 345 6791',
        event: 'Tech Talk: IT Summit',
        registrationDate: '15/10/2025',
        status: 'Confirmed'
    },
    {
        id: 4,
        studentName: 'Ana Garcia',
        studentId: '23-9998',
        email: 'ana.garcia@qcu.edu.ph',
        phone: '0912 345 6792',
        event: 'Schedule Adjustment',
        registrationDate: '15/10/2025',
        status: 'Confirmed'
    },
    {
        id: 5,
        studentName: 'Carlos Mendoza',
        studentId: '23-9999',
        email: 'carlos.mendoza@qcu.edu.ph',
        phone: '0912 345 6793',
        event: 'Tech Talk: IT Summit',
        registrationDate: '15/10/2025',
        status: 'Confirmed'
    }
];

let currentEditingRegistrationId = null;

// Handle sidebar navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const page = this.getAttribute('data-page');
        console.log('Navigating to:', page);
        if (page === 'events') {
            setTimeout(() => {
                window.location.href = './events.html';
            }, 100);
        } else if (page === 'registrations') {
            setTimeout(() => {
                window.location.href = './registrations.html';
            }, 100);
        } else if (page === 'announcements') {
            setTimeout(() => {
                window.location.href = './announcements.html';
            }, 100);
        }
    });
});

// View registration button handler
document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const studentName = row.cells[0].textContent;
        const studentId = row.cells[1].textContent;
        const event = row.cells[2].textContent.trim();
        const registrationDate = row.cells[3].textContent;
        
        // Find registration data
        const registration = registrationsData.find(r => 
            r.studentName === studentName && r.studentId === studentId
        );
        
        if (registration) {
            // Populate view modal
            document.getElementById('view-student-name').textContent = registration.studentName;
            document.getElementById('view-student-id').textContent = registration.studentId;
            document.getElementById('view-student-email').textContent = registration.email;
            document.getElementById('view-student-phone').textContent = registration.phone;
            document.getElementById('view-registration-event').textContent = registration.event;
            document.getElementById('view-registration-date').textContent = registration.registrationDate;
            
            const statusBadge = document.getElementById('view-registration-status');
            statusBadge.innerHTML = `<span class="status-badge ${registration.status.toLowerCase()}">${registration.status}</span>`;
            
            currentEditingRegistrationId = registration.id;
            
            // Show view modal
            document.getElementById('view-registration-modal').style.display = 'flex';
        }
    });
});

// Edit registration button in view modal
document.getElementById('btn-edit-registration').addEventListener('click', function() {
    const registration = registrationsData.find(r => r.id === currentEditingRegistrationId);
    
    if (registration) {
        // Populate edit modal
        document.getElementById('edit-student-name').value = registration.studentName;
        document.getElementById('edit-student-id').value = registration.studentId;
        document.getElementById('edit-student-email').value = registration.email;
        document.getElementById('edit-student-phone').value = registration.phone;
        document.getElementById('edit-registration-event').value = registration.event;
        document.getElementById('edit-registration-status').value = registration.status;
        
        // Close view modal and open edit modal
        document.getElementById('view-registration-modal').style.display = 'none';
        document.getElementById('edit-registration-modal').style.display = 'flex';
    }
});

// Save registration changes
document.getElementById('btn-save-registration').addEventListener('click', function() {
    const studentName = document.getElementById('edit-student-name').value.trim();
    const studentId = document.getElementById('edit-student-id').value.trim();
    const email = document.getElementById('edit-student-email').value.trim();
    const phone = document.getElementById('edit-student-phone').value.trim();
    const event = document.getElementById('edit-registration-event').value;
    const status = document.getElementById('edit-registration-status').value;
    
    // Validation
    if (!studentName || !studentId || !email || !phone || !event || !status) {
        alert('Please fill in all fields');
        return;
    }
    
    // Find and update registration
    const registration = registrationsData.find(r => r.id === currentEditingRegistrationId);
    if (registration) {
        registration.studentName = studentName;
        registration.studentId = studentId;
        registration.email = email;
        registration.phone = phone;
        registration.event = event;
        registration.status = status;
        
        // Update table
        updateRegistrationsTable();
        
        // Close modal and show success message
        document.getElementById('edit-registration-modal').style.display = 'none';
        showSuccessNotification('Registration updated successfully');
        
        currentEditingRegistrationId = null;
    }
});

// Update registrations table
function updateRegistrationsTable() {
    const tbody = document.getElementById('registrations-tbody');
    tbody.innerHTML = '';
    
    registrationsData.forEach(registration => {
        const row = document.createElement('tr');
        
        const eventCategoryClass = getEventCategoryClass(registration.event);
        const eventBadgeClass = getEventBadgeClass(registration.event);
        
        row.innerHTML = `
            <td>${registration.studentName}</td>
            <td>${registration.studentId}</td>
            <td><span class="event-badge ${eventBadgeClass}">${registration.event}</span></td>
            <td>${registration.registrationDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view">View</button>
                    <button class="btn-cancel-reg">Cancel</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Re-attach event listeners
    attachViewHandlers();
    attachCancelHandlers();
}

function getEventBadgeClass(eventName) {
    if (eventName.includes('Tech Talk') || eventName.includes('Career Fair')) {
        return 'academic';
    } else if (eventName.includes('Bayanihan')) {
        return 'community';
    } else if (eventName.includes('Schedule')) {
        return 'institutional';
    }
    return 'academic';
}

function getEventCategoryClass(eventName) {
    if (eventName.includes('Tech Talk') || eventName.includes('Career Fair')) {
        return 'Academic';
    } else if (eventName.includes('Bayanihan')) {
        return 'Community';
    } else if (eventName.includes('Schedule')) {
        return 'Institutional';
    }
    return 'Academic';
}

// Attach view handlers
function attachViewHandlers() {
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const studentName = row.cells[0].textContent;
            const studentId = row.cells[1].textContent;
            
            const registration = registrationsData.find(r => 
                r.studentName === studentName && r.studentId === studentId
            );
            
            if (registration) {
                document.getElementById('view-student-name').textContent = registration.studentName;
                document.getElementById('view-student-id').textContent = registration.studentId;
                document.getElementById('view-student-email').textContent = registration.email;
                document.getElementById('view-student-phone').textContent = registration.phone;
                document.getElementById('view-registration-event').textContent = registration.event;
                document.getElementById('view-registration-date').textContent = registration.registrationDate;
                
                const statusBadge = document.getElementById('view-registration-status');
                statusBadge.innerHTML = `<span class="status-badge ${registration.status.toLowerCase()}">${registration.status}</span>`;
                
                currentEditingRegistrationId = registration.id;
                document.getElementById('view-registration-modal').style.display = 'flex';
            }
        });
    });
}

// Attach cancel handlers
function attachCancelHandlers() {
    document.querySelectorAll('.btn-cancel-reg').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel this registration?')) {
                const row = this.closest('tr');
                const studentName = row.cells[0].textContent;
                const studentId = row.cells[1].textContent;
                
                registrationsData = registrationsData.filter(r => 
                    !(r.studentName === studentName && r.studentId === studentId)
                );
                
                updateRegistrationsTable();
                updateTableInfo(registrationsData.length);
                showSuccessNotification('Registration cancelled successfully');
            }
        });
    });
}

// Search functionality
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#registrations-tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const studentName = row.cells[0].textContent.toLowerCase();
            const studentId = row.cells[1].textContent.toLowerCase();
            const eventName = row.cells[2].textContent.toLowerCase();

            if (studentName.includes(searchTerm) || studentId.includes(searchTerm) || eventName.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        updateTableInfo(visibleCount);
    });
}

// Filter by event
const filterEvent = document.getElementById('filter-event');
if (filterEvent) {
    filterEvent.addEventListener('change', function() {
        const filterValue = this.value.toLowerCase();
        const rows = document.querySelectorAll('#registrations-tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const eventName = row.cells[2].textContent.toLowerCase();

            if (filterValue === '' || eventName.includes(filterValue)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        updateTableInfo(visibleCount);
    });
}

// Initial view handlers attachment
attachViewHandlers();
attachCancelHandlers();

function updateTableInfo(count) {
    const tableInfo = document.getElementById('table-info');
    if (tableInfo) {
        tableInfo.textContent = `Showing ${count} registration${count !== 1 ? 's' : ''}`;
    }
}

// Modal close handlers
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
        document.getElementById('view-registration-modal').style.display = 'none';
        document.getElementById('edit-registration-modal').style.display = 'none';
        currentEditingRegistrationId = null;
    });
});

// Cancel buttons in modals
document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', function() {
        document.getElementById('view-registration-modal').style.display = 'none';
        document.getElementById('edit-registration-modal').style.display = 'none';
        currentEditingRegistrationId = null;
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const viewModal = document.getElementById('view-registration-modal');
    const editModal = document.getElementById('edit-registration-modal');
    
    if (event.target === viewModal) {
        viewModal.style.display = 'none';
        currentEditingRegistrationId = null;
    }
    if (event.target === editModal) {
        editModal.style.display = 'none';
        currentEditingRegistrationId = null;
    }
});

// Success notification
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 16px 24px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-in;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 3000);
}

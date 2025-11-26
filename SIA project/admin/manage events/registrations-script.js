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

// Search functionality
document.getElementById('search-input').addEventListener('keyup', function() {
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

// Filter by event
document.getElementById('filter-event').addEventListener('change', function() {
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

// Cancel registration handler
document.querySelectorAll('.btn-cancel-reg').forEach(btn => {
    btn.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel this registration?')) {
            this.closest('tr').remove();
            const remainingRows = document.querySelectorAll('#registrations-tbody tr').length;
            updateTableInfo(remainingRows);
        }
    });
});

function updateTableInfo(count) {
    document.getElementById('table-info').textContent = `Showing ${count} registration${count !== 1 ? 's' : ''}`;
}

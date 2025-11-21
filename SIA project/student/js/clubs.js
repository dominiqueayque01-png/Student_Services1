
// Clubs page logic

let allClubsData = [];
let filteredClubs = [];
let myClubApplications = [];
let currentClubId = null;
let currentSortBy = 'newest';
let currentCategory = 'All';

function getClubById(id) { return allClubsData.find(c => c._id === id); }

function renderClubs() {
    const clubsGrid = document.getElementById('clubsGrid'); if (!clubsGrid) return; clubsGrid.innerHTML = '';
    if (filteredClubs.length === 0) { clubsGrid.innerHTML = '<p>No clubs found matching your criteria.</p>'; document.getElementById('clubsCount').textContent = '0 clubs found'; return; }
    filteredClubs.forEach(club => {
        const card = document.createElement('div'); card.className = 'club-card'; card.setAttribute('data-club-id', club._id); card.setAttribute('data-club-category', club.category);
        card.innerHTML = `
            <div class="club-header">
                <h2 class="club-name">${club.name}</h2>
                <span class="club-category-badge">${club.category}</span>
            </div>
            <p class="club-description">${club.description}</p>
            <div class="club-info">
                <div class="club-info-item"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2c3e7f" stroke-width="1.5"><rect x="2" y="2" width="16" height="16" rx="2"/><path d="M2 7h16"/></svg><span>${club.location || 'N/A'}</span></div>
                <div class="club-info-item"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2c3e7f" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/></svg><span>${club.meetingTime || 'TBD'}</span></div>
            </div>
            <div class="club-stats">
                <div class="club-stat"><svg width="20" height="20" viewBox="0 0 20 20" fill="#ff6b9d" stroke="#ff6b9d" stroke-width="1.5"><circle cx="7" cy="5" r="2.5"/></svg><span>${club.members} members</span></div>
                <div class="club-stat"><span>${club.applicants} applicants</span></div>
            </div>
            <button class="view-club-btn">View Club Info</button>
        `;
        card.querySelector('.view-club-btn').addEventListener('click', () => openClubInfoModal(club._id));
        clubsGrid.appendChild(card);
    });
    document.getElementById('clubsCount').textContent = filteredClubs.length + ' clubs found';
}

function openClubInfoModal(clubId) {
    currentClubId = clubId; const club = getClubById(clubId); if (!club) return;
    const isApplied = myClubApplications.includes(clubId);
    let actionButton = '';
    if (isApplied) actionButton = `<button type="button" disabled style="background:#ecfdf5; color:#047857; border:1px solid #10b981; padding:10px 18px; border-radius:6px; cursor:default; font-weight:600;">✓ Application Submitted</button>`;
    else actionButton = `<button type="button" class="learn-more-btn" style="background:#2c3e7f;color:#fff;padding:10px 18px;border-radius:6px;border:0;cursor:pointer;" onclick="openClubApplicationModal('${clubId}')">Application</button>`;
    const container = document.getElementById('clubInfoContent'); if (!container) return;
    container.innerHTML = `
        <h2 style="color:#2c3e7f;margin-bottom:8px;">${club.name}</h2>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;color:#666;font-size:14px;"><span>${club.category}</span><span>•</span><span>${club.members} members</span></div>
        <h3 style="color:#2c3e7f;margin-top:20px;margin-bottom:12px;font-size:16px;">About the Club</h3>
        <p style="color:#666;line-height:1.6;margin-bottom:20px;">${club.aboutClub}</p>
        <h3 style="color:#2c3e7f;margin-top:20px;margin-bottom:12px;font-size:16px;">Club Information</h3>
        <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:20px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"><div><div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">Location</div><div style="color:#666;">${club.location}</div></div><div><div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">Meeting Time</div><div style="color:#666;">${club.meetingTime}</div></div></div></div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;"><button type="button" class="learn-more-btn" style="background:#fff;color:#333;border:1px solid #e8e8e8;padding:10px 18px;border-radius:6px;" onclick="closeClubInfoModal()">Cancel</button>${actionButton}</div>
    `;
    const modal = document.getElementById('clubInfoModal'); if (modal) { modal.setAttribute('aria-hidden','false'); modal.classList.add('open'); }
}

function closeClubInfoModal() { const modal = document.getElementById('clubInfoModal'); if (modal) { modal.setAttribute('aria-hidden','true'); modal.classList.remove('open'); } }

function openClubApplicationModal(clubId) { currentClubId = clubId; const club = getClubById(clubId); if (!club) return; document.getElementById('applicationClubName').textContent = club.name; const modal = document.getElementById('clubApplicationModal'); if (modal) { modal.setAttribute('aria-hidden','false'); modal.classList.add('open'); } }
function closeClubApplicationModal() { const modal = document.getElementById('clubApplicationModal'); if (modal) { modal.setAttribute('aria-hidden','true'); modal.classList.remove('open'); document.getElementById('clubApplicationForm').reset(); } }

function toggleCategoryDropdown() { const dropdown = document.getElementById('categoryDropdown'); if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'; }
function toggleSortMenu() { const sortMenu = document.getElementById('sortContainer'); const sortBtn = document.getElementById('sortDisplay'); const isHidden = sortMenu.style.display === 'none'; sortMenu.style.display = isHidden ? 'block' : 'none'; if (isHidden) { sortMenu.style.left = 'auto'; sortMenu.style.right = '0px'; sortMenu.style.top = (sortBtn.offsetTop + sortBtn.offsetHeight + 8) + 'px'; } }

async function handleApplicationSubmit(e) {
    e.preventDefault(); const currentStudentId = localStorage.getItem('currentStudentId'); if (!currentStudentId) { alert('Please submit a counseling form first to set your Student ID (Simulation Mode).'); return; }
    const formData = { clubId: currentClubId, studentId: currentStudentId, fullName: document.getElementById('appFullName').value, year: document.getElementById('appYear').value, motive: document.getElementById('appMotive').value, program: document.getElementById('appProgram').value, email: document.getElementById('appEmail').value, experience: document.getElementById('appExperience').value };
    try {
        const response = await fetch('http://localhost:3001/api/applications', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(formData) });
        const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Server error');
        if (!myClubApplications.includes(currentClubId)) myClubApplications.push(currentClubId);
        alert('Application submitted successfully!'); closeClubApplicationModal(); openClubInfoModal(currentClubId); fetchAndInitializeClubs();
    } catch (error) { console.error('Error submitting application:', error); alert(error.message); }
}

function searchAndFilterClubs() {
    const searchQuery = (document.getElementById('clubsSearchInput') || {}).value || '';
    let clubsToFilter = allClubsData;
    if (currentCategory !== 'All') clubsToFilter = allClubsData.filter(club => club.category === currentCategory);
    if (searchQuery) { const lower = searchQuery.toLowerCase(); clubsToFilter = clubsToFilter.filter(club => club.name.toLowerCase().includes(lower) || club.description.toLowerCase().includes(lower) || club.category.toLowerCase().includes(lower)); }
    if (currentSortBy === 'newest') clubsToFilter.sort((a,b)=> new Date(b.createdDate)-new Date(a.createdDate)); else if (currentSortBy === 'oldest') clubsToFilter.sort((a,b)=> new Date(a.createdDate)-new Date(b.createdDate)); else if (currentSortBy === 'alphabetical') clubsToFilter.sort((a,b)=> a.name.localeCompare(b.name)); else if (currentSortBy === 'most-members') clubsToFilter.sort((a,b)=> b.members - a.members); else if (currentSortBy === 'fewest-members') clubsToFilter.sort((a,b)=> a.members - b.members);
    filteredClubs = clubsToFilter; renderClubs();
}

function filterByCategory(category) { currentCategory = category; const filterBtn = document.getElementById('categoryFilterBtn'); if (filterBtn) filterBtn.innerHTML = `${category} <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 6l-5 5-5-5"/></svg>`; const dd = document.getElementById('categoryDropdown'); if (dd) dd.style.display = 'none'; searchAndFilterClubs(); }

function sortClubs(sortBy) { currentSortBy = sortBy; const sortDisplay = document.getElementById('sortDisplay'); const sortLabels = { 'newest':'Newest', 'oldest':'Oldest', 'alphabetical':'Alphabetical' }; if (sortDisplay) sortDisplay.textContent = sortLabels[sortBy]; const sc = document.getElementById('sortContainer'); if (sc) sc.style.display = 'none'; searchAndFilterClubs(); }

async function fetchAndInitializeClubs() {
    try {
        const response = await fetch('http://localhost:3001/api/clubs'); if (!response.ok) throw new Error('Network response was not ok'); allClubsData = await response.json();
        const studentId = localStorage.getItem('currentStudentId');
        if (studentId) {
            try { const appResponse = await fetch(`http://localhost:3001/api/applications/my-applications/${studentId}`); const appData = await appResponse.json(); myClubApplications = appData.map(app => app.clubId); } catch (err) { console.warn('Could not fetch applications', err); }
        }
        searchAndFilterClubs();
    } catch (error) { console.error('Failed to fetch clubs:', error); const grid = document.getElementById('clubsGrid'); if (grid) grid.innerHTML = '<p>Error loading clubs. Please try refreshing.</p>'; }
}
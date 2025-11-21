/* ============================================
   OJT LISTING MODULE (FINAL COMPLETE VERSION)
   ============================================ */

let allOjtData = [];
let myOjtApplications = [];
let currentOJTCategory = 'All';
let currentOJTSortBy = 'newest';

// --- 1. RECOMMENDATION ENGINE CONFIG ---
const jobRelationships = {
    'Web Development': ['Design', 'Marketing', 'IT Operations'],
    'Software Engineering': ['Data Science', 'Project Management', 'Web Development'],
    'IT Operations': ['Telecommunications', 'Cyber Security', 'Web Development'],
    'Cyber Security': ['IT Operations', 'Telecommunications'],
    'Marketing': ['Design', 'Business Development', 'Web Development'],
    'Business Development': ['Marketing', 'Finance'],
    'Telecommunications': ['IT Operations', 'Electronics'],
    'Financial Analysis': ['Audit & Tax', 'Data Science'],
    'Audit & Tax': ['Financial Analysis'],
    'Education': ['Psychology', 'Training']
};

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Only run if we are on the OJT page
    if (document.getElementById('ojtGrid')) {
        fetchAndInitializeOJT();
        
        const searchInput = document.getElementById('ojtSearchInput');
        if (searchInput) searchInput.addEventListener('keyup', searchAndFilterOJT);
    }
});

async function fetchAndInitializeOJT() {
    try {
        // A. Fetch Listings
        const response = await fetch('http://localhost:3001/api/ojt');
        if (!response.ok) throw new Error("Failed to fetch listings");
        allOjtData = await response.json();

        // B. Fetch My Applications (If logged in)
        const studentId = localStorage.getItem('currentStudentId');
        if (studentId) {
            try {
                const appRes = await fetch(`http://localhost:3001/api/ojt/my-applications/${studentId}`);
                const appIds = await appRes.json();
                myOjtApplications = appIds;
            } catch (err) {
                console.warn("Could not fetch OJT applications", err);
            }
        }

        // C. Render
        searchAndFilterOJT();

    } catch (error) {
        console.error("Error loading OJT data:", error);
        const grid = document.getElementById('ojtGrid');
        if(grid) grid.innerHTML = '<p style="padding:20px; text-align:center;">Error loading listings. Is the server running?</p>';
    }
}

function getOJTById(id) {
    return allOjtData.find(o => o._id === id);
}

// --- 3. SMART RENDERER (ALGORITHM INSIDE) ---
function searchAndFilterOJT() {
    const searchInput = document.getElementById('ojtSearchInput');
    if (!searchInput) return;

    const searchQuery = searchInput.value.toLowerCase().trim();
    const ojtGrid = document.getElementById('ojtGrid');
    ojtGrid.innerHTML = ''; 

    // --- A. CALCULATE USER INTERESTS ---
    // Find jobs I applied to
    const appliedJobs = allOjtData.filter(job => myOjtApplications.includes(job._id));
    // Get their subcategories
    let myInterests = appliedJobs.map(j => j.subCategory);
    // Add related categories from the map
    myInterests.forEach(interest => {
        if (jobRelationships[interest]) {
            myInterests.push(...jobRelationships[interest]);
        }
    });

    // --- B. FILTER LIST ---
    let visibleOJT = allOjtData.filter(ojt => {
        const matchesCategory = currentOJTCategory === 'All' || ojt.category === currentOJTCategory;
        const matchesSearch = !searchQuery || 
            ojt.position.toLowerCase().includes(searchQuery) || 
            ojt.company.toLowerCase().includes(searchQuery) ||
            (ojt.subCategory && ojt.subCategory.toLowerCase().includes(searchQuery));
        
        // ALGORITHM: Mark if recommended
        // Logic: Matches my interests AND I haven't applied yet
        ojt.isRecommended = myInterests.includes(ojt.subCategory) && !myOjtApplications.includes(ojt._id);

        return matchesCategory && matchesSearch;
    });

    // --- C. SORT LIST ---
    visibleOJT.sort((a, b) => {
        // Rule 1: Recommended on TOP
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;

        // Rule 2: User selected sort
        if (currentOJTSortBy === 'pay-high') return b.payPerHour - a.payPerHour;
        if (currentOJTSortBy === 'pay-low') return a.payPerHour - b.payPerHour;
        if (currentOJTSortBy === 'hours') return a.hoursPerWeek - b.hoursPerWeek;
        
        // Default: Newest
        return new Date(b.postedAt) - new Date(a.postedAt);
    });

    // --- D. RENDER HTML ---
    if (visibleOJT.length === 0) {
        ojtGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#666; margin-top:20px;">No training opportunities found.</p>';
        document.getElementById('ojtCount').textContent = '0 jobs found';
        return;
    }

    visibleOJT.forEach(ojt => {
        const daysAgo = Math.floor((new Date() - new Date(ojt.postedAt)) / (1000 * 60 * 60 * 24));
        const postedText = daysAgo === 0 ? "Today" : `${daysAgo} days ago`;

        // Generate Badges
        const subCatHTML = ojt.subCategory ? `<span class="club-subcategory-badge">${ojt.subCategory}</span>` : '';
        const recommendedHTML = ojt.isRecommended ? `<div class="recommended-badge">Recommended</div>` : '';
        const highlightStyle = ojt.isRecommended ? 'border: 1px solid #8b5cf6; background-color: #fbfaff;' : '';

        const card = document.createElement('div');
        card.className = 'club-card';
        card.style.cssText = highlightStyle; // Apply highlight if recommended
        
        card.innerHTML = `
            ${recommendedHTML}
            <div class="club-header">
                <h2 class="club-name">${ojt.position}</h2>
                <div class="club-badges">
                    ${subCatHTML}
                    <span class="club-category-badge">${ojt.category}</span>
                </div>
            </div>
            <p class="club-description">${ojt.description}</p>

            <div class="club-info">
                <div class="club-info-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2c3e7f" stroke-width="1.5"><path d="M3 8h14v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8z"/></svg>
                    <span>${ojt.company}</span>
                </div>
                <div class="club-info-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#2c3e7f" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/></svg>
                    <span>Posted ${postedText}</span>
                </div>
            </div>

            <div class="club-stats">
                <div class="club-stat"><strong>₱</strong> ${ojt.payPerHour}/hour</div>
                <div class="club-stat">${ojt.workArrangement}</div>
                <div class="club-stat">${ojt.duration} weeks</div>
                <div class="club-stat">${ojt.hoursPerWeek} hrs/week</div>
            </div>

            <button class="view-club-btn">View Company Info</button>
        `;

        card.querySelector('.view-club-btn').addEventListener('click', () => openOJTCompanyModal(ojt._id));
        ojtGrid.appendChild(card);
    });

    const countLabel = document.getElementById('ojtCount');
    if(countLabel) countLabel.textContent = `${visibleOJT.length} training opportunities found`;
}

// --- 4. MODAL LOGIC (With Related Jobs) ---
function openOJTCompanyModal(ojtId) {
    const ojt = getOJTById(ojtId);
    if (!ojt) return;

    const container = document.getElementById('ojtCompanyContent');
    const isApplied = myOjtApplications.includes(ojt._id);

    let applyButton = '';
    if (isApplied) {
        applyButton = `<button disabled style="background:#ecfdf5; color:#047857; border:1px solid #10b981; padding:10px 18px; border-radius:6px; font-weight:600; cursor:default;">✓ Applied</button>`;
    } else {
        applyButton = `<button class="learn-more-btn" style="background:#2c3e7f;color:#fff;padding:10px 18px;border-radius:6px;border:0;cursor:pointer;" onclick="applyToOJT('${ojt._id}')">Apply Now</button>`;
    }

    const skillsHTML = (ojt.skills && ojt.skills.length > 0) 
        ? ojt.skills.map(s => `<span style="background:#e8f0ff;color:#2c3e7f;padding:6px 12px;border-radius:20px;font-size:12px;">${s}</span>`).join('')
        : '<span>No specific skills listed</span>';

    // === RELATED JOBS LOGIC (Inside Modal) ===
    // Show jobs with SAME SubCategory, excluding current one
    const relatedJobs = allOjtData.filter(item => 
        item.subCategory === ojt.subCategory && item._id !== ojt._id
    ).slice(0, 3);

    let relatedJobsHTML = '';
    if (relatedJobs.length > 0) {
        relatedJobsHTML = `
            <div class="related-jobs-container">
                <h3 style="color:#2c3e7f;font-size:14px;margin-bottom:10px;">More in ${ojt.subCategory}</h3>
                ${relatedJobs.map(job => `
                    <div class="related-job-card" onclick="openOJTCompanyModal('${job._id}')">
                        <div>
                            <div class="related-job-title">${job.position}</div>
                            <div class="related-job-company">${job.company}</div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2c3e7f" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                `).join('')}
            </div>
        `;
    }

    container.innerHTML = `
        <h2 id="ojtCompanyTitle" style="color:#2c3e7f;margin-bottom:8px;">${ojt.position}</h2>
        <div style="margin-bottom:12px;"><span class="club-subcategory-badge">${ojt.subCategory || ojt.category}</span></div>
        
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;color:#666;font-size:14px;">
            <span>${ojt.company}</span> <span>•</span> <span>${ojt.location}</span>
        </div>

        <h3 style="color:#2c3e7f;font-size:16px;margin-bottom:10px;">Overview</h3>
        <p style="color:#666;margin-bottom:20px;">${ojt.overview}</p>

        <h3 style="color:#2c3e7f;font-size:16px;margin-bottom:10px;">Details</h3>
        <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:20px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div><div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">💰 Pay</div><div style="color:#666;">₱${ojt.payPerHour}/hour</div></div>
                <div><div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">📍 Mode</div><div style="color:#666;">${ojt.workArrangement}</div></div>
                <div><div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">⏱️ Duration</div><div style="color:#666;">${ojt.duration} weeks</div></div>
                <div><div style="font-weight:600;color:#2c3e7f;margin-bottom:4px;">🕐 Schedule</div><div style="color:#666;">${ojt.hoursPerWeek} hrs/week</div></div>
            </div>
        </div>

        <h3 style="color:#2c3e7f;font-size:16px;margin-bottom:10px;">Skills</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
            ${skillsHTML}
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
            <button type="button" class="learn-more-btn" style="background:#fff;color:#333;border:1px solid #e8e8e8;padding:10px 18px;border-radius:6px;" onclick="closeOJTCompanyModal()">Close</button>
            ${applyButton}
        </div>

        ${relatedJobsHTML}
    `;

    const modal = document.getElementById('ojtCompanyModal');
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
}

function closeOJTCompanyModal() {
    const modal = document.getElementById('ojtCompanyModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
    }
}

// --- 5. ACTIONS ---
async function applyToOJT(ojtId) {
    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) {
        alert("Please submit a counseling form first to set your Student ID.");
        return;
    }

    try {
        const res = await fetch('http://localhost:3001/api/ojt/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ojtId, studentId })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }

        alert("Application submitted successfully!");
        myOjtApplications.push(ojtId);
        openOJTCompanyModal(ojtId); 
        
        // Re-render the main list to update Badges!
        searchAndFilterOJT();

    } catch (error) {
        alert(error.message);
    }
}

// --- 6. HELPERS (Dropdown/Sort) ---
function toggleOJTCategoryDropdown() {
    const d = document.getElementById('ojtCategoryDropdown');
    d.style.display = d.style.display === 'none' ? 'block' : 'none';
}

function toggleOJTSortMenu() {
    const d = document.getElementById('ojtSortContainer');
    const btn = document.getElementById('ojtSortDisplay');
    if (btn) {
        d.style.left = 'auto'; d.style.right = '0px';
        d.style.top = (btn.offsetTop + btn.offsetHeight + 8) + 'px';
    }
    d.style.display = d.style.display === 'none' ? 'block' : 'none';
}

function filterOJTByCategory(category) {
    currentOJTCategory = category;
    document.getElementById('ojtCategoryFilterBtn').innerText = category + ' ';
    document.getElementById('ojtCategoryDropdown').style.display = 'none';
    searchAndFilterOJT();
}

function sortOJT(sortBy) {
    currentOJTSortBy = sortBy;
    const labels = { 'newest':'Newest','pay-high':'Pay: High to Low','pay-low':'Pay: Low to High','hours':'Hours per Week' };
    document.getElementById('ojtSortDisplay').textContent = labels[sortBy];
    document.getElementById('ojtSortContainer').style.display = 'none';
    searchAndFilterOJT();
}
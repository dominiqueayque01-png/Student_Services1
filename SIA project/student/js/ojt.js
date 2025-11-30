/* ============================================
   OJT LISTING MODULE (STUDENT VIEW - CLEANED)
   ============================================ */

let allOjtData = [];
let myOjtApplications = [];
let currentOJTCategory = 'All';
let currentOJTSortBy = 'newest';

// --- RECOMMENDATION ENGINE CONFIG ---
const jobRelationships = {
    'Digital Marketing': ['Design', 'Business', 'Web Development'],
    'Web Development': ['Design', 'Digital Marketing', 'Data Analytics'],
    'Data Analytics': ['Business', 'Finance', 'Web Development'],
    'Business': ['Finance', 'Digital Marketing', 'Data Analytics'],
    'Design': ['Digital Marketing', 'Web Development'],
    'Finance': ['Business', 'Data Analytics'],
    'Engineering': ['Web Development', 'Data Analytics'],
    'Education': ['Business', 'Design']
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ojtGrid')) {
        fetchAndInitializeOJT();
        
        const searchInput = document.getElementById('ojtSearchInput');
        if (searchInput) searchInput.addEventListener('keyup', searchAndFilterOJT);
    }
});

async function fetchAndInitializeOJT() {
    try {
        // 1. Fetch Listings - ONLY ACTIVE JOBS
        const response = await fetch('http://localhost:3001/api/ojt');
        if (!response.ok) throw new Error("Failed to fetch listings");
        const allData = await response.json();
        
        // FILTER: Only show active jobs to students
        allOjtData = allData.filter(job => job.status === 'active').map(job => ({
            ...job,
            id: job._id,
            title: job.position,
            company: job.company,
            category: job.category || 'Uncategorized',
            rate: job.payPerHour,
            workType: job.workArrangement,
            location: job.location,
            duration: job.duration,
            hoursPerWeek: job.hoursPerWeek,
            status: job.status,
            overview: job.overview,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt
        }));

        console.log('Active jobs loaded:', allOjtData.length);

        // 2. Fetch My Applications (If logged in)
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

        // 3. Render
        searchAndFilterOJT();

    } catch (error) {
        console.error("Error loading OJT data:", error);
        const grid = document.getElementById('ojtGrid');
        if(grid) grid.innerHTML = '<p style="padding:20px; text-align:center;">Error loading listings.</p>';
    }
}

function getOJTById(id) {
    return allOjtData.find(o => o._id === id);
}

// --- SMART RENDERER (ALGORITHM) ---
function searchAndFilterOJT() {
    const searchInput = document.getElementById('ojtSearchInput');
    if (!searchInput) return;

    const searchQuery = searchInput.value.toLowerCase().trim();
    const ojtGrid = document.getElementById('ojtGrid');
    ojtGrid.innerHTML = ''; 

    // 1. Calculate User Interests
    const appliedJobs = allOjtData.filter(job => myOjtApplications.includes(job._id));
    let myInterests = appliedJobs.map(j => j.subCategory);
    myInterests.forEach(interest => {
        if (jobRelationships[interest]) {
            myInterests.push(...jobRelationships[interest]);
        }
    });

    // 2. Filter List - ONLY ACTIVE JOBS (already filtered in fetch, but double-check)
    let visibleOJT = allOjtData.filter(ojt => {
        const matchesCategory = currentOJTCategory === 'All' || ojt.category === currentOJTCategory;
        const matchesSearch = !searchQuery || 
            ojt.position.toLowerCase().includes(searchQuery) || 
            ojt.company.toLowerCase().includes(searchQuery) ||
            (ojt.subCategory && ojt.subCategory.toLowerCase().includes(searchQuery));
        
        // Mark if recommended
        ojt.isRecommended = myInterests.includes(ojt.subCategory) && !myOjtApplications.includes(ojt._id);

        return matchesCategory && matchesSearch && ojt.status === 'active';
    });

    // 3. Sort List
    visibleOJT.sort((a, b) => {
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        if (currentOJTSortBy === 'pay-high') return b.payPerHour - a.payPerHour;
        if (currentOJTSortBy === 'pay-low') return a.payPerHour - b.payPerHour;
        if (currentOJTSortBy === 'hours') return a.hoursPerWeek - b.hoursPerWeek;
        return new Date(b.postedAt) - new Date(a.postedAt);
    });

    // 4. Render
    if (visibleOJT.length === 0) {
        ojtGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#666; margin-top:20px;">No training opportunities found.</p>';
        document.getElementById('ojtCount').textContent = '0 found';
        return;
    }

    visibleOJT.forEach(ojt => {
        const daysAgo = Math.floor((new Date() - new Date(ojt.postedAt)) / (1000 * 60 * 60 * 24));
        const postedText = daysAgo === 0 ? "Today" : `${daysAgo} days ago`;

        // REMOVED: subCatHTML and subcategory badge
        const recommendedHTML = ojt.isRecommended ? `<div class="recommended-badge">Recommended</div>` : '';
        const highlightStyle = ojt.isRecommended ? 'border: 1px solid #8b5cf6; background-color: #fbfaff;' : '';

        const card = document.createElement('div');
        card.className = 'club-card';
        card.style.cssText = highlightStyle;
        
        card.innerHTML = `
            ${recommendedHTML}
            <div class="club-header">
                <h2 class="club-name">${ojt.position}</h2>
                <div class="club-badges">
                    <!-- REMOVED: Subcategory badge -->
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

    document.getElementById('ojtCount').textContent = `${visibleOJT.length} training opportunities found`;
}

// --- MODAL WITH COMPANY CONTACT INFO (NO APPLY BUTTON) ---
function openOJTCompanyModal(ojtId) {
    const ojt = getOJTById(ojtId);
    if (!ojt) return;

    const container = document.getElementById('ojtCompanyContent');

    // Format website to be clickable
    let websiteHTML = '';
    if (ojt.website) {
        const websiteUrl = ojt.website.startsWith('http') ? ojt.website : `https://${ojt.website}`;
        websiteHTML = `
            <div style="margin-bottom: 12px;">
                <div style="font-weight: 600; color: #2c3e7f; margin-bottom: 4px;">🌐 Company Website</div>
                <a href="${websiteUrl}" target="_blank" style="color: #2c3e7f; text-decoration: none; font-size: 14px;">
                    ${ojt.website}
                </a>
            </div>
        `;
    }

    // Format email to be clickable
    let emailHTML = '';
    if (ojt.email) {
        emailHTML = `
            <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; color: #2c3e7f; margin-bottom: 4px;">📧 Contact Email</div>
                <a href="mailto:${ojt.email}" style="color: #2c3e7f; text-decoration: none; font-size: 14px;">
                    ${ojt.email}
                </a>
            </div>
        `;
    }

    container.innerHTML = `
        <h2 id="ojtCompanyTitle" style="color:#2c3e7f;margin-bottom:8px;">${ojt.position}</h2>
        <!-- REMOVED: Subcategory badge -->
        
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

        <!-- COMPANY CONTACT INFORMATION -->
        <h3 style="color:#2c3e7f;font-size:16px;margin-bottom:10px;">Company Contact Information</h3>
        <div style="background:#f0f9ff;padding:16px;border-radius:8px;margin-bottom:20px;border:1px solid #bae6fd;">
            ${websiteHTML}
            ${emailHTML}
            <div style="font-size:13px;color:#666;margin-top:8px;">
                <strong>Note:</strong> Please contact the company directly using the information above for application inquiries.
            </div>
        </div>

        <!-- Only keep the modal close button (top right) and back link -->
        <div style="display:flex;justify-content:flex-end;margin-top:20px;">
            <button type="button" class="learn-more-btn" style="background:#fff;color:#333;border:1px solid #e8e8e8;padding:10px 18px;border-radius:6px;" onclick="closeOJTCompanyModal()">Close Details</button>
        </div>
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
// ============================================
// Dynamic Overview Data (MongoDB Version)
// ============================================

class OverviewData {
    constructor() {
        this.API_URL = 'http://localhost:3001/api/ojt';
        this.init();
    }

    async init() {
        await this.updateStats();
        await this.updateRecentActivities();
        this.setupAutoRefresh();
    }

    async updateStats() {
        try {
            const jobListings = await this.getJobListings();
            const totalListings = jobListings.length;
            const activeListings = jobListings.filter(job => job.status === 'active').length;
            
            // Calculate average hourly rate
            const totalRates = jobListings.reduce((sum, job) => {
                const rate = parseFloat(job.rate || job.payPerHour || 0);
                return sum + rate;
            }, 0);
            const avgRate = totalListings > 0 ? totalRates / totalListings : 0;
            
            // Count unique categories
            const uniqueCategories = [...new Set(jobListings.map(job => job.category).filter(Boolean))];
            const totalCategories = uniqueCategories.length;

            // Count unique programs (based on duration/category combinations)
            const uniquePrograms = [...new Set(jobListings.map(job => `${job.category || 'General'} - ${job.duration || 0} weeks`))];
            const totalPrograms = uniquePrograms.length;

            console.log('Stats calculated:', { totalListings, activeListings, avgRate, totalCategories, totalPrograms }); // Debug log

            // Update DOM elements
            const totalElement = document.getElementById('total-listings');
            const activeElement = document.getElementById('active-listings');
            const rateElement = document.getElementById('avg-hourly-rate');
            const categoriesElement = document.getElementById('job-categories');
            const programsElement = document.getElementById('active-programs');

            if (totalElement) totalElement.textContent = totalListings;
            if (activeElement) activeElement.textContent = `${activeListings} active`;
            if (rateElement) rateElement.textContent = `₱ ${Math.round(avgRate)}`;
            if (categoriesElement) categoriesElement.textContent = totalCategories;
            if (programsElement) programsElement.textContent = totalPrograms;

        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    async getJobListings() {
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) throw new Error('Failed to fetch job listings');
            const data = await response.json();
            
            // Map MongoDB data to frontend format
            return data.map(job => ({
                id: job._id,
                title: job.position,
                company: job.company,
                category: job.category,
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
        } catch (error) {
            console.error('Error fetching job listings:', error);
            return JSON.parse(localStorage.getItem('ojtJobListings')) || [];
        }
    }

    async updateRecentActivities() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        try {
            const jobListings = await this.getJobListings();
            const recentActivities = this.getRecentActivities(jobListings).slice(0, 5);
            
            if (recentActivities.length === 0) {
                activityList.innerHTML = `
                    <div class="empty-state">
                        <p>No recent activities.</p>
                        <p>Activities will appear here when you create or update job listings.</p>
                    </div>
                `;
                return;
            }

            activityList.innerHTML = recentActivities.map(activity => `
                <div class="activity-item ${activity.type}">
                    <div class="activity-badge">${activity.badge}</div>
                    <div class="activity-content">
                        <p class="activity-title">${activity.title}</p>
                        <p class="activity-time">${activity.time}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error updating recent activities:', error);
            activityList.innerHTML = `
                <div class="empty-state">
                    <p>Error loading activities</p>
                    <p>Please try refreshing the page</p>
                </div>
            `;
        }
    }

    getRecentActivities(jobListings) {
        const activities = [];
        
        // Add job creation and update activities
        jobListings.forEach(job => {
            activities.push({
                type: 'new',
                badge: '+',
                title: `New job listing posted for <strong>${job.title}</strong> at ${job.company}`,
                time: this.formatTimeAgo(job.createdAt),
                timestamp: new Date(job.createdAt)
            });

            if (job.updatedAt && job.updatedAt !== job.createdAt) {
                activities.push({
                    type: 'updated',
                    badge: '◐',
                    title: `Updated job details for <strong>${job.title}</strong>`,
                    time: this.formatTimeAgo(job.updatedAt),
                    timestamp: new Date(job.updatedAt)
                });
            }
        });

        // Sort by timestamp (newest first)
        return activities.sort((a, b) => b.timestamp - a.timestamp);
    }

    formatTimeAgo(dateString) {
        if (!dateString) return 'Recently';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }

    setupAutoRefresh() {
        // Refresh data every 30 seconds to catch updates from other tabs
        setInterval(async () => {
            await this.refreshData();
        }, 30000);
    }

    // Method to be called when job listings are updated
    async refreshData() {
        await this.updateStats();
        await this.updateRecentActivities();
    }

    // Public method to refresh from other pages
    async refreshOverview() {
        await this.refreshData();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.overviewData = new OverviewData();
});
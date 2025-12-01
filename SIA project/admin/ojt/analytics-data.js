// ============================================
// Dynamic Analytics Data (Monthly Analytics)
// ============================================

class AnalyticsData {
    constructor() {
        this.API_URL = 'http://localhost:3001/api/ojt';
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth(); // 0-11
        this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        this.monthlyData = {};
        this.init();
    }

    async init() {
        this.displayCurrentYear();
        this.createMonthSelector();
        await this.loadAllData();
        await this.updateAllCharts();
        this.setupAutoRefresh();
    }

    displayCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = this.currentYear;
        }
    }

    createMonthSelector() {
        const monthSection = document.querySelector('.section-title');
        if (!monthSection) return;

        // Create month selector
        const monthSelector = document.createElement('div');
        monthSelector.className = 'month-selector';
        monthSelector.innerHTML = `
            <div class="month-nav">
                <button class="month-nav-btn" id="prev-month">←</button>
                <select class="month-select" id="month-select">
                    ${this.monthNames.map((month, index) => 
                        `<option value="${index}" ${index === this.currentMonth ? 'selected' : ''}>${month}</option>`
                    ).join('')}
                </select>
                <select class="year-select" id="year-select">
                    ${Array.from({length: 3}, (_, i) => {
                        const year = this.currentYear - 1 + i;
                        return `<option value="${year}" ${year === this.currentYear ? 'selected' : ''}>${year}</option>`;
                    }).join('')}
                </select>
                <button class="month-nav-btn" id="next-month">→</button>
            </div>
            <div class="month-stats" id="month-stats">
                <!-- Month stats will be populated here -->
            </div>
        `;

        // Insert after section title
        monthSection.insertAdjacentElement('afterend', monthSelector);

        // Add event listeners
        document.getElementById('month-select').addEventListener('change', (e) => {
            this.currentMonth = parseInt(e.target.value);
            this.updateAllCharts();
        });

        document.getElementById('year-select').addEventListener('change', (e) => {
            this.currentYear = parseInt(e.target.value);
            this.updateAllCharts();
        });

        document.getElementById('prev-month').addEventListener('click', () => {
            this.navigateMonth(-1);
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.navigateMonth(1);
        });
    }

    navigateMonth(direction) {
        this.currentMonth += direction;
        
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
            this.updateYearSelector();
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
            this.updateYearSelector();
        }
        
        document.getElementById('month-select').value = this.currentMonth;
        this.updateAllCharts();
    }

    updateYearSelector() {
        const yearSelect = document.getElementById('year-select');
        // Update options for current year range
        yearSelect.innerHTML = Array.from({length: 3}, (_, i) => {
            const year = this.currentYear - 1 + i;
            return `<option value="${year}" ${year === this.currentYear ? 'selected' : ''}>${year}</option>`;
        }).join('');
    }

    async loadAllData() {
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) throw new Error('Failed to fetch job listings');
            const data = await response.json();
            
            // Process data by month
            this.processMonthlyData(data);
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    processMonthlyData(jobListings) {
        this.monthlyData = {};
        
        jobListings.forEach(job => {
            const jobDate = new Date(job.createdAt || job.postedAt);
            const year = jobDate.getFullYear();
            const month = jobDate.getMonth();
            const key = `${year}-${month}`;
            
            if (!this.monthlyData[key]) {
                this.monthlyData[key] = [];
            }
            
            this.monthlyData[key].push({
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
                status: job.status
            });
        });
    }

    getCurrentMonthData() {
        const key = `${this.currentYear}-${this.currentMonth}`;
        return this.monthlyData[key] || [];
    }

    async updateAllCharts() {
        await this.updateMonthStats();
        await this.updateCategoryChart();
        await this.updateRateChart();
        await this.updateLocationChart();
        await this.updateTrendChart();
    }

    async updateMonthStats() {
        const monthStats = document.getElementById('month-stats');
        if (!monthStats) return;

        const currentData = this.getCurrentMonthData();
        const totalJobs = currentData.length;
        const activeJobs = currentData.filter(job => job.status === 'active').length;
        
        // Calculate average rate
        const totalRates = currentData.reduce((sum, job) => sum + parseFloat(job.rate || job.payPerHour || 0), 0);
        const avgRate = totalJobs > 0 ? totalRates / totalJobs : 0;

        monthStats.innerHTML = `
            <div class="month-stat-item">
                <div class="month-stat-value">${totalJobs}</div>
                <div class="month-stat-label">Total Jobs</div>
            </div>
            <div class="month-stat-item">
                <div class="month-stat-value">${activeJobs}</div>
                <div class="month-stat-label">Active</div>
            </div>
            <div class="month-stat-item">
                <div class="month-stat-value">₱${Math.round(avgRate)}</div>
                <div class="month-stat-label">Avg. Rate</div>
            </div>
            <div class="month-stat-item">
                <div class="month-stat-value">${this.getUniqueCategories(currentData).length}</div>
                <div class="month-stat-label">Categories</div>
            </div>
        `;
    }

    getUniqueCategories(jobListings) {
        return [...new Set(jobListings.map(job => job.category).filter(Boolean))];
    }

    async updateCategoryChart() {
        const categoryChart = document.getElementById('category-chart');
        if (!categoryChart) return;

        const currentData = this.getCurrentMonthData();
        const categoryData = this.aggregateDataByCategory(currentData);
        categoryChart.innerHTML = this.generateChartHTML(categoryData, 'category');
    }

    async updateRateChart() {
        const rateChart = document.getElementById('rate-chart');
        if (!rateChart) return;

        const currentData = this.getCurrentMonthData();
        const rateData = this.aggregateDataByRate(currentData);
        rateChart.innerHTML = this.generateChartHTML(rateData, 'rate');
    }

    async updateLocationChart() {
        const locationChart = document.getElementById('location-chart');
        if (!locationChart) return;

        const currentData = this.getCurrentMonthData();
        const locationData = this.aggregateDataByLocation(currentData);
        locationChart.innerHTML = this.generateChartHTML(locationData, 'location');
    }

    async updateTrendChart() {
        const trendChart = document.getElementById('trend-chart');
        if (!trendChart) return;

        // Get last 6 months of data
        const trendData = this.getTrendData(6);
        trendChart.innerHTML = this.generateTrendHTML(trendData);
    }

    getTrendData(monthsCount) {
        const trend = [];
        
        for (let i = monthsCount - 1; i >= 0; i--) {
            const date = new Date(this.currentYear, this.currentMonth - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            const key = `${year}-${month}`;
            const monthData = this.monthlyData[key] || [];
            
            trend.push({
                month: this.monthNames[month],
                year: year,
                count: monthData.length,
                active: monthData.filter(job => job.status === 'active').length
            });
        }
        
        return trend;
    }

    aggregateDataByCategory(jobListings) {
        const categories = {};
        jobListings.forEach(job => {
            const category = job.category || 'Uncategorized';
            categories[category] = (categories[category] || 0) + 1;
        });
        return categories;
    }

    aggregateDataByRate(jobListings) {
        const rateRanges = {
            '₱30-35': { min: 30, max: 35, count: 0 },
            '₱40-45': { min: 40, max: 45, count: 0 },
            '₱50-60': { min: 50, max: 60, count: 0 },
            '₱65+': { min: 65, max: Infinity, count: 0 }
        };

        jobListings.forEach(job => {
            const rate = parseFloat(job.rate || job.payPerHour || 0);
            for (const [range, config] of Object.entries(rateRanges)) {
                if (rate >= config.min && rate <= config.max) {
                    rateRanges[range].count++;
                    break;
                }
            }
        });

        const result = {};
        Object.entries(rateRanges).forEach(([range, data]) => {
            result[range] = data.count;
        });
        return result;
    }

    aggregateDataByLocation(jobListings) {
        const locations = {};
        jobListings.forEach(job => {
            const location = job.workType || job.workArrangement || 'Not Specified';
            locations[location] = (locations[location] || 0) + 1;
        });
        return locations;
    }

    generateChartHTML(data, type) {
        const total = Object.values(data).reduce((sum, count) => sum + count, 0);
        const maxCount = Math.max(...Object.values(data), 1);

        if (total === 0) {
            return `
                <div class="empty-state">
                    <p>No data available for ${this.monthNames[this.currentMonth]} ${this.currentYear}</p>
                    <p>Create job listings to see analytics</p>
                </div>
            `;
        }

        return Object.entries(data).map(([label, count], index) => {
            const percentage = (count / maxCount) * 100;
            const percentageDisplay = Math.round((count / total) * 100);
            
            return `
                <div class="chart-item">
                    <div class="chart-label">${label}</div>
                    <div class="chart-bar-wrapper">
                        <div class="chart-bar ${type}-${index + 1}" style="width: ${percentage}%">
                            <span class="chart-value">${count}</span>
                        </div>
                    </div>
                    <div class="chart-percentage">${percentageDisplay}%</div>
                </div>
            `;
        }).join('');
    }

    generateTrendHTML(trendData) {
        if (trendData.length === 0 || trendData.every(item => item.count === 0)) {
            return `
                <div class="empty-state">
                    <p>No trend data available</p>
                    <p>Data will appear as you create job listings over time</p>
                </div>
            `;
        }

        const maxCount = Math.max(...trendData.map(item => item.count));
        
        return `
            <div class="trend-container">
                ${trendData.map(item => {
                    const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return `
                        <div class="trend-item">
                            <div class="trend-bar" style="height: ${height}%">
                                <span class="trend-value">${item.count}</span>
                            </div>
                            <div class="trend-label">${item.month.substring(0, 3)} '${item.year.toString().slice(-2)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    setupAutoRefresh() {
        // Refresh data every minute
        setInterval(async () => {
            await this.refreshData();
        }, 60000);
    }

    async refreshData() {
        await this.loadAllData();
        await this.updateAllCharts();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.analyticsData = new AnalyticsData();
});
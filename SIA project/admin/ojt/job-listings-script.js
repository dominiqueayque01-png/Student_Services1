/* ============================================
   OJT ADMIN - DATABASE VERSION
   Using your existing /api/ojt routes
   ============================================ */

const API_URL = 'http://localhost:3001/api/ojt';

class JobListingsManager {
    constructor() {
        this.jobListings = [];
        this.currentEditingId = null;
        this.currentDeletingId = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadJobListings();
    }

    setupEventListeners() {
        // Create Job Button
        document.getElementById('btn-create-job').addEventListener('click', () => {
            this.openJobModal();
        });

        // Job Modal
        document.getElementById('job-modal-close').addEventListener('click', () => {
            this.closeJobModal();
        });

        document.getElementById('job-modal-cancel').addEventListener('click', () => {
            this.closeJobModal();
        });

        document.getElementById('job-modal-submit').addEventListener('click', () => {
            this.handleJobSubmit();
        });

        // Delete Modal
        document.getElementById('delete-modal-close').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('delete-modal-cancel').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('delete-modal-confirm').addEventListener('click', () => {
            this.confirmDelete();
        });

        // Close modals when clicking outside
        document.getElementById('job-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeJobModal();
            }
        });

        document.getElementById('delete-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeDeleteModal();
            }
        });

        // Allow form submission with Enter key
        document.getElementById('job-form').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleJobSubmit();
            }
        });
    }

    // --- DATABASE OPERATIONS ---

    async loadJobListings() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch job listings');

            const rawData = await response.json();

            // Map MongoDB data to match our frontend structure
            this.jobListings = rawData.map(job => ({
                ...job,
                id: job._id // Map _id to id for frontend compatibility
            }));

            console.log('Loaded job listings:', this.jobListings); // Debug log

            this.renderJobListings();
            this.updateOtherPages();
        } catch (error) {
            console.error('Error loading job listings:', error);
            this.showToast('Error loading job listings from database', 'error');
            
            // Fallback to localStorage if DB is unavailable
            this.loadFromLocalStorage();
        }
    }

    async saveJobListing(jobData) {
        try {
            const method = this.currentEditingId ? 'PUT' : 'POST';
            const url = this.currentEditingId ? `${API_URL}/${this.currentEditingId}` : API_URL;

            console.log('Saving job data:', jobData); // Debug log

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save job listing');
            }

            const savedJob = await response.json();
            
            // Update local data
            await this.loadJobListings();
            
            return savedJob;
        } catch (error) {
            console.error('Error saving job listing:', error);
            throw error;
        }
    }

    async deleteJobListing(jobId) {
        try {
            const response = await fetch(`${API_URL}/${jobId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete job listing');
            }

            // Update local data
            await this.loadJobListings();
        } catch (error) {
            console.error('Error deleting job:', error);
            throw error;
        }
    }

    async toggleJobStatus(jobId) {
        try {
            const job = this.jobListings.find(j => j.id === jobId);
            if (!job) throw new Error('Job not found');

            const newStatus = job.status === 'active' ? 'paused' : 'active';
            
            const response = await fetch(`${API_URL}/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...job,
                    status: newStatus
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update job status');
            }

            // Update local data
            await this.loadJobListings();
        } catch (error) {
            console.error('Error updating job status:', error);
            throw error;
        }
    }

    // --- LOCALSTORAGE FALLBACK ---
    
    loadFromLocalStorage() {
        const stored = localStorage.getItem('ojtJobListings');
        if (stored) {
            this.jobListings = JSON.parse(stored);
            this.renderJobListings();
            this.showToast('Loaded from local storage (database unavailable)', 'error');
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('ojtJobListings', JSON.stringify(this.jobListings));
    }

    // --- UI MANAGEMENT ---

    openJobModal(jobId = null) {
        const modal = document.getElementById('job-modal-overlay');
        const title = document.getElementById('job-modal-title');
        const submitBtn = document.getElementById('job-modal-submit');

        this.currentEditingId = jobId;

        if (jobId) {
            // Edit mode
            title.textContent = 'Edit Job Listing';
            submitBtn.textContent = 'Update Job Listing';
            this.populateForm(jobId);
        } else {
            // Create mode
            title.textContent = 'Create Job Listing';
            submitBtn.textContent = 'Create Job Listing';
            this.clearForm();
        }

        modal.classList.add('active');
        document.getElementById('validation-message').style.display = 'none';
    }

    closeJobModal() {
        document.getElementById('job-modal-overlay').classList.remove('active');
        this.currentEditingId = null;
        this.clearForm();
    }

    clearForm() {
        document.getElementById('job-form').reset();
    }

    populateForm(jobId) {
        const job = this.jobListings.find(j => j.id === jobId);
        if (!job) return;

        console.log('Populating form with job:', job); // Debug log

        // Map your model fields to admin form fields
        document.getElementById('job-title').value = job.position || '';
        document.getElementById('job-company').value = job.company || '';
        document.getElementById('job-overview').value = job.overview || '';
        document.getElementById('job-rate').value = job.payPerHour || '';
        document.getElementById('job-location').value = job.location || '';
        
        // Handle duration - remove "weeks" if present
        const durationValue = job.duration ? job.duration.toString().replace(' weeks', '') : '';
        document.getElementById('job-duration').value = durationValue;
        
        document.getElementById('job-hours').value = job.hoursPerWeek || '';
        document.getElementById('job-category').value = job.category || '';
        document.getElementById('job-worktype').value = job.workArrangement || '';
        document.getElementById('job-website').value = job.website || '';
        document.getElementById('job-email').value = job.email || '';
    }

    validateForm() {
        const requiredFields = [
            'job-title', 'job-company', 'job-overview', 'job-rate',
            'job-location', 'job-duration', 'job-hours', 'job-category',
            'job-worktype', 'job-website', 'job-email'
        ];

        let isValid = true;
        const validationMessage = document.getElementById('validation-message');

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#f44336';
            } else {
                field.style.borderColor = '#ddd';
            }
        });

        validationMessage.style.display = isValid ? 'none' : 'block';
        return isValid;
    }

    async handleJobSubmit() {
        if (!this.validateForm()) {
            return;
        }

        // Map admin form fields to your model fields
        const jobData = {
            position: document.getElementById('job-title').value,
            company: document.getElementById('job-company').value,
            overview: document.getElementById('job-overview').value,
            payPerHour: parseFloat(document.getElementById('job-rate').value),
            location: document.getElementById('job-location').value,
            duration: parseInt(document.getElementById('job-duration').value) || 0,
            hoursPerWeek: parseInt(document.getElementById('job-hours').value),
            category: document.getElementById('job-category').value,
            workArrangement: document.getElementById('job-worktype').value,
            website: document.getElementById('job-website').value,
            email: document.getElementById('job-email').value,
            description: document.getElementById('job-overview').value, // Use overview for description too
            status: 'active',
            subCategory: document.getElementById('job-category').value
        };

        console.log('Submitting job data:', jobData); // Debug log

        try {
            await this.saveJobListing(jobData);
            this.closeJobModal();
            this.showToast(`Job listing ${this.currentEditingId ? 'updated' : 'created'} successfully!`, 'success');

        } catch (error) {
            console.error('Failed to save job listing:', error);
            this.showToast('Failed to save job listing: ' + error.message, 'error');
        }
    }

    renderJobListings() {
        const container = document.getElementById('job-listings-container');
        if (!container) return;

        if (this.jobListings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No job listings found.</p>
                    <p>Click the "Create Job" button to add a new listing.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.jobListings.map(job => `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-card-header">
                    <div class="job-card-title-section">
                        <h3 class="job-card-title">${job.position}</h3>
                        <p class="job-card-company">${job.company}</p>
                    </div>
                    <span class="job-card-status ${job.status}">${job.status}</span>
                </div>
                <p class="job-card-description">${job.overview}</p>
                <div class="job-card-meta">
                    <div class="job-meta-item rate">
                        <span>₱${job.payPerHour}/hour</span>
                    </div>
                    <div class="job-meta-item location">
                        <span>${job.location}</span>
                    </div>
                    <div class="job-meta-item duration">
                        <span>${job.duration} weeks</span>
                    </div>
                    <div class="job-meta-item hours">
                        <span>${job.hoursPerWeek} hrs/week</span>
                    </div>
                </div>
                <div class="job-card-actions">
                    <button class="btn-pause ${job.status === 'paused' ? 'paused' : ''}" 
                            onclick="jobManager.handleToggleStatus('${job.id}')">
                        ${job.status === 'paused' ? 'Resume' : 'Pause'}
                    </button>
                    <button class="btn-edit" 
                            onclick="jobManager.openJobModal('${job.id}')">
                        Edit
                    </button>
                    <button class="btn-delete" 
                            onclick="jobManager.showDeleteModal('${job.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // FIXED: This method handles the button click without recursion
    async handleToggleStatus(jobId) {
        try {
            await this.toggleJobStatus(jobId);
            this.showToast('Job status updated successfully!', 'success');
        } catch (error) {
            console.error('Failed to update job status:', error);
            this.showToast('Failed to update job status: ' + error.message, 'error');
        }
    }

    showDeleteModal(jobId) {
        this.currentDeletingId = jobId;
        document.getElementById('delete-modal-overlay').classList.add('active');
    }

    closeDeleteModal() {
        document.getElementById('delete-modal-overlay').classList.remove('active');
        this.currentDeletingId = null;
    }

    async confirmDelete() {
        if (this.currentDeletingId) {
            try {
                await this.deleteJobListing(this.currentDeletingId);
                this.closeDeleteModal();
                this.showToast('Job listing deleted successfully!', 'success');
            } catch (error) {
                console.error('Failed to delete job:', error);
                this.showToast('Failed to delete job listing: ' + error.message, 'error');
            }
        }
    }

    showToast(message, type) {
        // Remove existing toasts to prevent spam
        const existingToasts = document.querySelectorAll('.job-toast');
        existingToasts.forEach(toast => toast.remove());

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `job-toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${type === 'success' ? '✓' : '!'}</div>
            <div class="toast-message">${message}</div>
        `;

        // Add to page
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide and remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Method to expose job listings to other components
    getJobListings() {
        return this.jobListings;
    }

    // Update other pages when data changes
    updateOtherPages() {
        // Save to localStorage for cross-page communication
        this.saveToLocalStorage();
        
        // Refresh analytics if available
        if (window.analyticsData && typeof window.analyticsData.refreshAnalytics === 'function') {
            window.analyticsData.refreshAnalytics();
        }
        
        // Refresh overview if available
        if (window.overviewData && typeof window.overviewData.refreshOverview === 'function') {
            window.overviewData.refreshOverview();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.jobManager = new JobListingsManager();
});
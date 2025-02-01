// Google Form field IDs - These need to be replaced with actual IDs from your Google Form
const FORM_IDS = {
    fullName: 'entry.1234567890',  // Replace with actual field ID from your Google Form
    phoneNumber: 'entry.0987654321' // Replace with actual field ID from your Google Form
};

class WaitlistForm {
    constructor() {
        this.form = document.querySelector('.custom-form');
        if (!this.form) return; // Exit if form doesn't exist
        
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.statusDiv = document.createElement('div');
        this.statusDiv.className = 'form-status';
        this.form.appendChild(this.statusDiv);
        
        this.initializeForm();
    }

    initializeForm() {
        if (!this.form) return; // Safety check
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validatePhoneNumber(phone) {
        // Basic phone number validation
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    }

    validateName(name) {
        // Basic name validation
        return name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name.trim());
    }

    showMessage(message, type = 'info') {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `form-status ${type}`;
        this.statusDiv.style.display = 'block';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const name = formData.get('name');
        const email = formData.get('email');
        const background = formData.get('background');

        // Validate inputs
        if (!name || name.trim().length < 2) {
            this.showMessage('Please enter a valid name', 'error');
            return;
        }

        if (!email || !email.includes('@')) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (!background) {
            this.showMessage('Please select your background', 'error');
            return;
        }

        try {
            this.submitButton.disabled = true;
            this.showMessage('Submitting...', 'info');

            const response = await fetch('https://formsubmit.co/ajax/vashisht@therastudio.in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    background
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showMessage('Successfully joined the waitlist!', 'success');
                this.form.reset();
            } else {
                throw new Error('Submission failed');
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showMessage('Error submitting form. Please try again.', 'error');
        } finally {
            this.submitButton.disabled = false;
        }
    }
}

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WaitlistForm();
}); 
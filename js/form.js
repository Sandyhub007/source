document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.custom-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            // Create the form data
            const formData = new FormData(form);
            formData.append('_subject', 'New Early Access Request - Soul Connect');
            formData.append('_captcha', 'false');
            formData.append('_template', 'table');
            
            // Send to FormSubmit
            const response = await fetch('https://formsubmit.co/ajax/vashisht@therastudio.in', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success === 'true' || result.success === true) {
                // Show success message
                submitButton.textContent = 'Submitted Successfully!';
                submitButton.style.backgroundColor = '#38A169';
                form.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.style.backgroundColor = '';
                }, 3000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            // Show error message
            submitButton.textContent = 'Error! Please try again';
            submitButton.style.backgroundColor = '#E53E3E';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.backgroundColor = '';
            }, 3000);
        }
    });
}); 
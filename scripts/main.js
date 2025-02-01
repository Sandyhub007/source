// Main JavaScript for Soul Connect
import { createTherapistCards, createModeratorCards } from './cards.js';
import { trackUTMParameters, trackEvent, trackFormSubmission } from './analytics.js';

// Therapist data
export const therapists = [
    {
        name: "G Sharath Chandra",
        photo: "https://i.ibb.co/59vKF3G/aryan-2.jpg",
        specialization: "Mental Health & Cultural Integration",
        expertise: ["Cultural Integration", "Men's Mental Health", "Career Stress Management"]
    },
    {
        name: "Apurva Upadhyay",
        photo: "https://i.ibb.co/2qnQ1DJ/apurva.jpg",
        specialization: "Mental Health & Family Support",
        expertise: ["Depression & Anxiety", "Family Counseling", "Support Group Facilitation"]
    },
    {
        name: "Catherine Mary Joy",
        photo: "https://i.ibb.co/4N7mxX6/CMJ.jpg",
        specialization: "Family Dynamics & Relationships",
        expertise: ["Family Counseling", "Relationship Therapy", "Cross-Cultural Adaptation"]
    },
    {
        name: "Malavika R",
        photo: "https://i.ibb.co/KV5R5Hb/MR.jpg",
        specialization: "Anxiety & Women's Wellness",
        expertise: ["Women's Mental Health", "Anxiety Management", "Work-Life Balance"]
    },
    {
        name: "Shashank Shukla",
        photo: "https://i.ibb.co/CsQyqTp/shashank.jpg",
        specialization: "Emotion Focused Therapy",
        expertise: ["Romantic Relationships", "Connection", "Heartbreak"]
    }
];

// Peer Moderator data
export const moderators = [
    {
        name: "Chaitanya Kanoria",
        photo: "https://i.ibb.co/gDwDXXM/chaitanya.jpg",
        specialization: "Peer Specialist",
        expertise: ["Communication Skills", "Philosophy & Spirituality", "Human Values"]
    },
    {
        name: "Abhuday Singh",
        photo: "https://i.ibb.co/LNCb19V/abhuday.jpg",
        specialization: "Men's Mental Health & Wellness",
        expertise: ["Men's Mental Health", "Personal Growth", "Stress Management"]
    },
    {
        name: "Sharon Suresh",
        photo: "https://i.ibb.co/Y8Ghbdx/sharon-new.jpg",
        specialization: "Early Career Growth",
        expertise: ["Career Development", "Professional Growth", "Workplace Navigation"]
    },
    {
        name: "Sandilya Ch",
        photo: "https://i.ibb.co/VD8v53v/sand-new1.jpg",
        specialization: "Online de-addiction for youth",
        expertise: ["Digital Wellness", "Youth Counseling", "Addiction Recovery"]
    },
    {
        name: "Avinash Reddy",
        photo: "https://i.ibb.co/8NgrNR0/avi-new.jpg",
        specialization: "Cultural Adjustment",
        expertise: ["Cross-Cultural Integration", "Social Adaptation", "International Student Support"]
    }
];

// Initialize the application
function initializeApp() {
    // Initialize cards
    createTherapistCards(therapists);
    createModeratorCards(moderators);

    // Track UTM parameters on page load
    trackUTMParameters();

    // Track CTA button clicks
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', (e) => {
            trackEvent('CTA Click', {
                button_text: e.target.textContent,
                button_location: e.target.closest('section')?.id || 'unknown'
            });
        });
    });

    // Track form submissions
    const waitlistForm = document.querySelector('#waitlist iframe');
    if (waitlistForm) {
        waitlistForm.addEventListener('load', () => {
            trackEvent('Waitlist Form Loaded');
        });
    }

    // Track navigation clicks
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            trackEvent('Navigation Click', {
                link_text: e.target.textContent,
                link_href: e.target.getAttribute('href')
            });
        });
    });

    // Track card interactions for both therapists and moderators
    ['therapists', 'moderators'].forEach(section => {
        document.querySelector(`#${section} .therapist-grid`)?.addEventListener('click', (e) => {
            const card = e.target.closest('.therapist-card');
            if (card) {
                const name = card.querySelector('h3')?.textContent;
                const specialization = card.querySelector('.specialization')?.textContent;
                trackEvent(`${section.slice(0, -1).charAt(0).toUpperCase() + section.slice(1, -1)} Card Click`, {
                    name,
                    specialization,
                    section
                });
            }
        });
    });
}

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);
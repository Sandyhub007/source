// Constants
const MOBILE_BREAKPOINT = 768;

// Utility functions
function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

function createCarouselCard(person, buttonText) {
    const card = document.createElement('div');
    card.className = 'carousel-card';
    
    const expertiseTags = person.expertise
        .map(exp => `<span>${exp}</span>`)
        .join('');
    
    card.innerHTML = `
        <img src="${person.photo}" alt="${person.name}" crossorigin="anonymous" onerror="this.src='data:image/svg+xml,${encodeURIComponent(`<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="180" height="180" fill="#E6F0FF"/><circle cx="90" cy="70" r="35" fill="#004D7A"/><path d="M50 140C50 117.909 67.909 100 90 100C112.091 100 130 117.909 130 140" stroke="#004D7A" stroke-width="12" stroke-linecap="round"/></svg>`)}'">
            <h3>${person.name}</h3>
        <p>${person.specialization}</p>
        <div class="tags">
                ${expertiseTags}
        </div>
        <a href="#waitlist" class="cta-btn">${buttonText}</a>
    `;
    
    return card;
}

function initializeCarousel(carouselContainer) {
    const carousel = carouselContainer.querySelector('.carousel');
    const leftBtn = carouselContainer.querySelector('.left-btn');
    const rightBtn = carouselContainer.querySelector('.right-btn');
    let currentIndex = 0;

    const updateCarousel = () => {
        const cardWidth = carousel.querySelector('.carousel-card').offsetWidth;
        const gap = 32; // 2rem gap
        const translateX = currentIndex * (cardWidth + gap);
        carousel.style.transform = `translateX(-${translateX}px)`;
    };

    leftBtn.addEventListener('click', () => {
        currentIndex = Math.max(currentIndex - 1, 0);
        updateCarousel();
    });

    rightBtn.addEventListener('click', () => {
        const maxIndex = carousel.children.length - (isMobile() ? 1 : 3);
        currentIndex = Math.min(currentIndex + 1, maxIndex);
        updateCarousel();
    });

    window.addEventListener('resize', updateCarousel);

    // Auto-scroll
    const autoScrollInterval = setInterval(() => {
        const maxIndex = carousel.children.length - (isMobile() ? 1 : 3);
        currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
        updateCarousel();
    }, 5000);

    // Stop auto-scroll on hover
    carouselContainer.addEventListener('mouseenter', () => {
        clearInterval(autoScrollInterval);
    });

    // Initialize first position
    setTimeout(updateCarousel, 100);
}

// Main card creation function
function createCards(data, containerId, buttonText) {
    const container = document.querySelector(`#${containerId}`);
    if (!container) return;

    const carouselContainer = container.querySelector('.carousel-container');
    const carousel = carouselContainer.querySelector('.carousel');

    // Clear and create cards
    carousel.innerHTML = '';
    data.forEach(person => carousel.appendChild(createCarouselCard(person, buttonText)));

    // Initialize carousel
    initializeCarousel(carouselContainer);
}

// Export functions
export function createTherapistCards(therapists) {
    createCards(therapists, 'therapists', 'Book a Session');
}

export function createModeratorCards(moderators) {
    createCards(moderators, 'moderators', 'Book a Session');
} 
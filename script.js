 // Enhanced slideshow with smooth animations and mobile support

let slideIndex = 0; // zero-based index of currently visible slide
let slideshowTimer = null;
let isTransitioning = false;
let touchStartX = 0;
let touchEndX = 0;
const slides = document.getElementsByClassName("slide");
const dots = document.getElementsByClassName("dot");
const heroContent = document.querySelector(".hero-content");
const slideContent = document.querySelectorAll(".slide-content");

// Parallax effect on mousemove
if (document.querySelector('.hero-section')) {
    document.querySelector('.hero-section').addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        if (heroContent) {
            heroContent.style.transform = `translate(-50%, -50%) translate(${x * 5}px, ${y * 5}px)`;
        }
        
        slideContent.forEach(content => {
            content.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
        });
    });
}

// Reset transform on mouse leave
if (document.querySelector('.hero-section')) {
    document.querySelector('.hero-section').addEventListener('mouseleave', () => {
        if (heroContent) {
            heroContent.style.transform = 'translate(-50%, -50%)';
        }
        slideContent.forEach(content => {
            content.style.transform = 'translate(0, 0)';
        });
    });
}

// Helper: show a specific slide index (zero-based)
function showSlides(index = null) {
    if (!slides.length) return;

    // if an explicit index provided, clamp to valid range
    if (typeof index === "number") {
        slideIndex = ((index % slides.length) + slides.length) % slides.length;
    }

    // clear active states with animation
    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const dot = dots[i];
        
        // Add fade out class for smooth transition
        if (slide.classList.contains('active')) {
            slide.style.opacity = '0';
            setTimeout(() => {
                slide.classList.remove("active");
                slide.style.opacity = '';
            }, 300);
        } else {
            slide.classList.remove("active");
        }
        
        if (dot) dot.classList.remove("active");
    }
    
    if (heroContent) {
        heroContent.style.opacity = '0';
        setTimeout(() => {
            heroContent.classList.remove("active");
            heroContent.style.opacity = '';
        }, 300);
    }

    // apply active state to current slide with animation
    setTimeout(() => {
        slides[slideIndex].classList.add("active");
        slides[slideIndex].style.opacity = '1';
        
        if (dots[slideIndex]) {
            dots[slideIndex].classList.add("active");
        }
        
        if (heroContent) {
            heroContent.classList.add("active");
            setTimeout(() => {
                heroContent.style.opacity = '1';
            }, 50);
        }
        
        setTimeout(() => { 
            isTransitioning = false; 
        }, 600);
    }, 350);

    // restart auto-advance timer
    if (slideshowTimer) clearTimeout(slideshowTimer);
    slideshowTimer = setTimeout(() => advanceSlide(1), 7000);
}

// Advance current slide by n (can be negative)
function advanceSlide(n) {
    if (!slides.length) return;
    if (isTransitioning) return;
    isTransitioning = true;
    slideIndex = (slideIndex + n + slides.length) % slides.length;
    showSlides();
}

// Jump to specific slide from dots
function currentSlide(n) {
    if (!slides.length) return;
    if (n < 0 || n >= slides.length) return;
    if (isTransitioning) return;
    isTransitioning = true;
    showSlides(n);
}

// Arrow controls
function plusSlides(n) {
    if (isTransitioning) return;
    isTransitioning = true;
    advanceSlide(n);
}

// Theme toggle + persistence
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-bs-theme') === 'dark';
    html.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
    const themeIcon = document.querySelector('.theme-toggle-btn i');
    if (themeIcon) {
        themeIcon.className = isDark ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
    }
    try {
        localStorage.setItem("theme", isDark ? "light" : "dark");
    } catch (e) {
        console.warn("localStorage unavailable:", e);
    }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", function () {
    // restore theme
    const themeIcon = document.querySelector('.theme-toggle-btn i');
    try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            document.documentElement.setAttribute('data-bs-theme', savedTheme);
            if (themeIcon) {
                themeIcon.className = savedTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
            }
        }
    } catch (e) {
        if (themeIcon) themeIcon.className = 'bi bi-moon-stars-fill';
    }
    
    // Add touch event listeners for mobile swipe
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        heroSection.addEventListener('touchend', (e) => {
            if (isTransitioning) return;
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
    }

    // Handle swipe gestures
    function handleSwipe() {
        if (touchEndX < touchStartX && touchStartX - touchEndX > 50) {
            plusSlides(1);
        }
        
        if (touchEndX > touchStartX && touchEndX - touchStartX > 50) {
            plusSlides(-1);
        }
    }

    // Pause slideshow on hover
    if (document.querySelector('.slideshow-container')) {
        document.querySelector('.slideshow-container').addEventListener('mouseenter', () => {
            if (slideshowTimer) clearTimeout(slideshowTimer);
        });
        
        document.querySelector('.slideshow-container').addEventListener('mouseleave', () => {
            if (slideshowTimer) clearTimeout(slideshowTimer);
            slideshowTimer = setTimeout(() => advanceSlide(1), 5000);
        });
    }

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        
        if (e.key === 'ArrowLeft') {
            plusSlides(-1);
        } else if (e.key === 'ArrowRight') {
            plusSlides(1);
        }
    });

    // sanity: if no slides/dots present, don't run
    if (!slides.length) {
        if (heroContent) {
            setTimeout(() => {
                heroContent.classList.add("active");
                heroContent.style.opacity = '1';
            }, 100);
        }
        return;
    }

    // ensure first slide selected then start slideshow
    slideIndex = 0;
    showSlides(0);
    
    // Preload images for smoother transitions
    function preloadImages() {
        const images = [];
        for (let i = 0; i < slides.length; i++) {
            const img = new Image();
            img.src = slides[i].style.backgroundImage.slice(4, -1).replace(/"/g, "");
            images.push(img);
        }
    }
    
    window.addEventListener('load', preloadImages);
});
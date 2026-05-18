// ================================
// SLIDESHOW FUNCTIONALITY
// ================================
let slideIndex = 1;
let slideTimer;

// Initialize slideshow on page load
document.addEventListener('DOMContentLoaded', function() {
    showSlide(slideIndex);
    autoSlide();
    setupFAQToggle();
    setupHamburger();
});

function changeSlide(n) {
    clearTimeout(slideTimer);
    showSlide(slideIndex += n);
    autoSlide();
}

function currentSlide(n) {
    clearTimeout(slideTimer);
    showSlide(slideIndex = n);
    autoSlide();
}

function showSlide(n) {
    let slides = document.querySelectorAll('.slide');
    let dots = document.querySelectorAll('.dot');

    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }

    slides.forEach(slide => {
        slide.classList.remove('fade');
    });

    dots.forEach(dot => {
        dot.classList.remove('active');
    });

    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].classList.add('fade');
    }
    if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].classList.add('active');
    }
}

function autoSlide() {
    slideTimer = setTimeout(function() {
        slideIndex++;
        showSlide(slideIndex);
        autoSlide();
    }, 5000); // Change slide every 5 seconds
}

// ================================
// FAQ TOGGLE FUNCTIONALITY
// ================================
function setupFAQToggle() {
    const faqToggles = document.querySelectorAll('.faq-toggle');

    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');

            // Close other open items
            const otherItems = document.querySelectorAll('.faq-item');
            otherItems.forEach(item => {
                if (item !== faqItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                }
            });
        });
    });
}

// ================================
// HAMBURGER MENU FUNCTIONALITY
// ================================
function setupHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

// ================================
// CONTACT FORM SUBMISSION
// ================================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            const service = document.getElementById('service').value;

            // Validate form
            if (!name || !email || !subject || !message) {
                alert('Please fill in all required fields');
                return;
            }

            // Create mailto link
            let mailtoLink = `mailto:mwikimodern@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService Interested: ${service}\n\nMessage:\n${message}`
            )}`;

            // Open mailto
            window.location.href = mailtoLink;

            // Show success message
            setTimeout(() => {
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            }, 500);
        });
    }
});

// ================================
// SMOOTH SCROLLING
// ================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#appointments') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ================================
// SCROLL TO TOP ON PAGE LOAD
// ================================
window.addEventListener('load', function() {
    window.scrollTo(0, 0);
});

// ================================
// ACTIVE NAV LINK ON SCROLL
// ================================
window.addEventListener('scroll', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Get the clean URL path (e.g., "/" or "/departments/")
const currentPage = window.location.pathname;

navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Check if the current path matches the link destination exactly
    if (currentPage === href || (currentPage === '/' && href === '/')) {
        link.classList.add('active');
    }
});
});

// ================================
// HELPER FUNCTION
// ================================
function scrollToContact() {
    const contactSection = document.getElementById('contactForm');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        // Fallback to the clean contact folder path
        window.location.href = '/contact/';
    }
}

// ================================
// ANIMATION ON SCROLL
// ================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease-in forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe service cards and other elements
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card, .team-member, .contact-card, .review-item');
    serviceCards.forEach(card => {
        observer.observe(card);
    });
});

// Add fadeIn animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.addEventListener("DOMContentLoaded", () => {
    // Create a container for our background effects
    const bgContainer = document.createElement("div");
    bgContainer.style.position = "fixed";
    bgContainer.style.top = "0";
    bgContainer.style.left = "0";
    bgContainer.style.width = "100vw";
    bgContainer.style.height = "100vh";
    bgContainer.style.zIndex = "-1"; /* Sit securely behind text/buttons */
    bgContainer.style.pointerEvents = "none"; /* Don't block clicks */
    bgContainer.style.overflow = "hidden";
    document.body.appendChild(bgContainer);

    // Generate 10 subtle floating azure spheres
    for (let i = 0; i < 10; i++) {
        const floatingSphere = document.createElement("div");
        
        // Randomize sizes and placements
        const size = Math.random() * 150 + 50; 
        floatingSphere.style.width = `${size}px`;
        floatingSphere.style.height = `${size}px`;
        floatingSphere.style.background = "rgba(0, 123, 255, 0.04)"; /* Very soft blue */
        floatingSphere.style.borderRadius = "50%";
        floatingSphere.style.position = "absolute";
        floatingSphere.style.top = `${Math.random() * 100}vh`;
        floatingSphere.style.left = `${Math.random() * 100}vw`;
        floatingSphere.style.filter = "blur(20px)";
        
        // Apply smooth CSS floating movement
        floatingSphere.style.animation = `floatAround ${Math.random() * 20 + 20}s infinite alternate ease-in-out`;
        
        bgContainer.appendChild(floatingSphere);
    }
});

// Inject the floating animation rules directly into the document
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes floatAround {
    0% { transform: translateY(0px) translateX(0px); }
    50% { transform: translateY(-40px) translateX(20px); }
    100% { transform: translateY(20px) translateX(-20px); }
}`;
document.head.appendChild(styleSheet);

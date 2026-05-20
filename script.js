// ================================================
// 1. GLOBAL INITIALIZATION & CONFIGURATION
// ================================================
let slideIndex = 1;
let slideTimer;

// Core animation style declarations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes floatAround {
    0% { transform: translateY(0px) translateX(0px); }
    50% { transform: translateY(-40px) translateX(20px); }
    100% { transform: translateY(20px) translateX(-20px); }
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}`;
document.head.appendChild(styleSheet);

// Master layout trigger loop on complete DOM generation
document.addEventListener('DOMContentLoaded', function() {
    // UI Functional Modules
    showSlide(slideIndex);
    autoSlide();
    setupFAQToggle();
    setupHamburger();
    setupActiveLinkTracker();
    setupCookieBanner();
    setupAmbientBackground();
    setupScrollAnimations();
});

// Reset viewport position instantly on full layout load
window.addEventListener('load', function() {
    window.scrollTo(0, 0);
    
    // Hide the bouncing preloader layer safely
    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.classList.add("preloader-hidden");
    }
});

// ================================================
// 2. ACTIVE NAVIGATION LINK TRACKER
// ================================================
function setupActiveLinkTracker() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .nav-item');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        // Exact matching logic for root and directory folder paths
        if (currentPage === href || (currentPage === '/' && href === '/')) {
            link.classList.add('active');
        }
    });
}

// ================================================
// 3. BOOKING ACTIONS & SMOOTH SCROLL MECHANICS
// ================================================
function scrollToContact() {
    const contactSection = document.getElementById('contactForm');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        // Safe directional redirect fallback for folder structure layout migration
        window.location.href = '/contact/';
    }
}

// Universal internal layout link smoothly handling behavior overrides
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

// ================================================
// 4. COOKIE PRIVACY CONSENT BANNER MANAGEMENT
// ================================================
function setupCookieBanner() {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("accept-cookies");

    if (!cookieBanner || !acceptBtn) return;

    // Display banner strictly if local memory evaluation returns empty
    if (!localStorage.getItem("cookieConsent")) {
        setTimeout(() => {
            cookieBanner.classList.add("show");
        }, 1500);
    }

    acceptBtn.addEventListener("click", () => {
        localStorage.setItem("cookieConsent", "true");
        cookieBanner.classList.remove("show");
    });
}

// ================================================
// 5. AMBIENT BACKGROUND AZURE BLUR VISUALS
// ================================================
function setupAmbientBackground() {
    const bgContainer = document.createElement("div");
    bgContainer.style.position = "fixed";
    bgContainer.style.top = "0";
    bgContainer.style.left = "0";
    bgContainer.style.width = "100vw";
    bgContainer.style.height = "100vh";
    bgContainer.style.zIndex = "-1";
    bgContainer.style.pointerEvents = "none";
    bgContainer.style.overflow = "hidden";
    document.body.appendChild(bgContainer);

    for (let i = 0; i < 10; i++) {
        const floatingSphere = document.createElement("div");
        const size = Math.random() * 150 + 50; 
        
        floatingSphere.style.width = `${size}px`;
        floatingSphere.style.height = `${size}px`;
        floatingSphere.style.background = "rgba(0, 123, 255, 0.04)";
        floatingSphere.style.borderRadius = "50%";
        floatingSphere.style.position = "absolute";
        floatingSphere.style.top = `${Math.random() * 100}vh`;
        floatingSphere.style.left = `${Math.random() * 100}vw`;
        floatingSphere.style.filter = "blur(20px)";
        floatingSphere.style.animation = `floatAround ${Math.random() * 20 + 20}s infinite alternate ease-in-out`;
        
        bgContainer.appendChild(floatingSphere);
    }
}

// ================================================
// 6. SLIDESHOW COMPONENT CORE LOGIC
// ================================================
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

    if (slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    slides.forEach(slide => slide.classList.remove('fade'));
    dots.forEach(dot => dot.classList.remove('active'));

    if (slides[slideIndex - 1]) { slides[slideIndex - 1].classList.add('fade'); }
    if (dots[slideIndex - 1]) { dots[slideIndex - 1].classList.add('active'); }
}

function autoSlide() {
    let slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    slideTimer = setTimeout(function() {
        slideIndex++;
        showSlide(slideIndex);
        autoSlide();
    }, 5000);
}

// ================================================
// 7. USER INTERACTION INTERFACES (FAQ & MOBILE NAV)
// ================================================
function setupFAQToggle() {
    const faqToggles = document.querySelectorAll('.faq-toggle');

    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');

            const otherItems = document.querySelectorAll('.faq-item');
            otherItems.forEach(item => {
                if (item !== faqItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                }
            });
        });
    });
}

function setupHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

// ================================================
// 8. INTERSECTION OBSERVATION ANIMATIONS
// ================================================
function setupScrollAnimations() {
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

    const serviceCards = document.querySelectorAll('.service-card, .team-member, .contact-card, .review-item');
    serviceCards.forEach(card => observer.observe(card));
}

// ================================================
// 9. CLIENT OUTBOUND INQUIRY CONTACT FORM MAILTO
// ================================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        const service = document.getElementById('service').value;

        if (!name || !email || !subject || !message) {
            alert('Please fill in all required fields');
            return;
        }

        let mailtoLink = `mailto:mwikimodern@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService Interested: ${service}\n\nMessage:\n${message}`
        )}`;

        window.location.href = mailtoLink;

        setTimeout(() => {
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        }, 500);
    });
}

// ================================================
// 10. SCROLL-TO-TOP & SCROLL-TO-BOTTOM MECHANICS
// ================================================

// Instantly scrolls the browser viewport back to the top pixel boundary cleanly
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Instantly scrolls the browser viewport to the absolute bottom of the document
function scrollToBottom() {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
    });
}

// Listen for scroll shifts to dynamically show/hide the 'Scroll Up' button
window.addEventListener('scroll', function() {
    const scrollUpBtn = document.getElementById('scrollUpBtn');
    if (!scrollUpBtn) return;

    // If the user scrolls down more than 300px from the absolute top, reveal the up arrow
    if (window.scrollY > 300) {
        scrollUpBtn.classList.add('visible');
    } else {
        scrollUpBtn.classList.remove('visible');
    }
});
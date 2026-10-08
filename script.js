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
    loadManagedContent().catch(error => {
        console.error('Unable to load editable site content:', error);
    });
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
        window.location.href = 'contact/';
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
// 6. SLIDESHOW COMPONENT CORE LOGIC (FIXED & MERGED)
// ================================================
function changeSlide(n) {
    clearTimeout(slideTimer);
    showSlide(slideIndex += n);
}

function currentSlide(n) {
    clearTimeout(slideTimer);
    showSlide(slideIndex = n);
}

function showSlide(n) {
    let slides = document.querySelectorAll('.slide');
    let dots = document.querySelectorAll('.dot');

    if (slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    slides.forEach(slide => {
        slide.style.display = "none";
        slide.classList.remove('fade');
    });
    
    dots.forEach(dot => dot.classList.remove('active'));

    if (slides[slideIndex - 1]) { 
        slides[slideIndex - 1].style.display = "block";
        slides[slideIndex - 1].classList.add('fade'); 
    }
    if (dots[slideIndex - 1]) { 
        dots[slideIndex - 1].classList.add('active'); 
    }

    clearTimeout(slideTimer);
    autoSlide();
}

function autoSlide() {
    let slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    slideTimer = setTimeout(function() {
        slideIndex++;
        showSlide(slideIndex);
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

async function loadManagedContent() {
    const [site, home, services, departments, about] = await Promise.all([
        fetchManagedContent('/content/site.json'),
        fetchManagedContent('/content/home.json'),
        fetchManagedContent('/content/services.json'),
        fetchManagedContent('/content/departments.json'),
        fetchManagedContent('/content/about.json')
    ]);

    renderSiteSettings(site);
    renderHomeContent(home);
    renderServicesContent(services);
    renderDepartmentsContent(departments);
    renderAboutContent(about);
}

async function fetchManagedContent(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Request for ${path} failed with HTTP ${response.status}`);
    }
    return response.json();
}

function setText(element, value) {
    if (element && typeof value === 'string') {
        element.textContent = value;
    }
}

function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text === 'string') element.textContent = text;
    return element;
}

function renderSiteSettings(site) {
    document.querySelectorAll('.logo-text, .footer-brand-inner h4').forEach(element => {
        setText(element, site.name);
    });
    document.querySelectorAll('.site-logo-float').forEach(image => {
        image.alt = site.name;
    });

    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.href = `tel:${site.phone_link}`;
        setText(link, site.phone);
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.href = `mailto:${site.email}`;
        setText(link, site.email);
    });
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
        const existingUrl = new URL(link.href);
        link.href = `https://wa.me/${site.whatsapp_number}${existingUrl.search}`;
    });

    const topBarItems = document.querySelectorAll('.top-bar-left .top-bar-item');
    if (topBarItems[0]) {
        topBarItems[0].childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) node.remove();
        });
        topBarItems[0].append(document.createTextNode(` ${site.address}`));
    }
    if (topBarItems[3]) {
        topBarItems[3].childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) node.remove();
        });
        topBarItems[3].append(document.createTextNode(` ${site.opening_hours}`));
    }

    const homeInfoCards = document.querySelectorAll('.quick-info .info-card');
    setText(homeInfoCards[2]?.querySelector('p'), site.address);
    const hoursCard = homeInfoCards[3]?.querySelector('p');
    if (hoursCard) hoursCard.textContent = site.opening_hours;

    document.querySelectorAll('.contact-card').forEach(card => {
        const heading = card.querySelector('h3')?.textContent.trim();
        if (heading === 'Address') {
            const address = card.querySelector('p:not(.contact-desc)');
            setText(address, site.address);
        }
    });
    document.querySelectorAll('.footer-section p').forEach(paragraph => {
        if (paragraph.textContent.includes('Red Soil St')) setText(paragraph, `Address: ${site.address}`);
    });
    document.querySelectorAll('.footer-brand > p').forEach(paragraph => {
        setText(paragraph, site.footer_blurb);
    });

    document.querySelectorAll('.top-social-icon[title="Facebook"], .social-links a').forEach(link => {
        if (link.textContent.includes('Facebook') || link.title === 'Facebook') {
            link.href = site.facebook_url;
        }
        if (link.textContent.includes('Instagram') || link.title === 'Instagram') {
            link.href = site.instagram_url;
        }
    });
}

function renderHomeContent(home) {
    setText(document.querySelector('.hero-video-content .glass-heading'), home.hero_title);
    setText(document.querySelector('.hero-subtitle'), home.hero_subtitle);
    const appointmentButton = document.querySelector('.schedule-cta-btn');
    setText(appointmentButton, home.cta_text);
    if (appointmentButton && typeof home.cta_link === 'string') {
        appointmentButton.onclick = function() {
            if (home.cta_link.startsWith('#')) {
                document.querySelector(home.cta_link)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.location.href = home.cta_link;
            }
        };
    }
    setText(document.querySelector('#faq h2'), home.faq_title);
    setText(document.querySelector('#reviews h2'), home.reviews_title);

    const slideContainer = document.querySelector('.slideshow-container');
    const dotContainer = document.querySelector('.slide-dots');
    if (slideContainer && Array.isArray(home.slides)) {
        slideContainer.querySelectorAll('.slide').forEach(slide => slide.remove());
        home.slides.forEach(slide => {
            const card = makeElement('div', 'slide');
            const image = makeElement('img');
            image.src = slide.image;
            image.alt = slide.alt;
            const caption = makeElement('div', 'slide-text');
            caption.append(makeElement('h1', '', slide.title));
            card.append(image, caption);
            slideContainer.insertBefore(card, slideContainer.querySelector('.prev'));
        });
        if (dotContainer && Array.isArray(home.slides)) {
            dotContainer.replaceChildren(...home.slides.map((slide, index) => {
                const dot = makeElement('span', 'dot');
                dot.addEventListener('click', () => currentSlide(index + 1));
                return dot;
            }));
        }
        showSlide(1);
    }

    const faqContainer = document.querySelector('.faq-content');
    if (faqContainer && Array.isArray(home.faqs)) {
        faqContainer.replaceChildren(...home.faqs.map(item => {
            const faq = makeElement('div', 'faq-item');
            const button = makeElement('button', 'faq-toggle', item.question);
            button.append(makeElement('span', 'toggle-icon', '+'));
            const answer = makeElement('div', 'faq-answer');
            answer.append(makeElement('p', '', item.answer));
            faq.append(button, answer);
            return faq;
        }));
        setupFAQToggle();
    }

    const reviewContainer = document.querySelector('.reviews-content');
    if (reviewContainer && Array.isArray(home.testimonials)) {
        reviewContainer.replaceChildren(...home.testimonials.map(review => {
            const item = makeElement('div', 'review-item');
            const header = makeElement('div', 'review-header');
            const stars = makeElement('div', 'review-stars');
            const rating = Math.max(1, Math.min(5, Number(review.rating) || 1));
            for (let index = 0; index < rating; index++) {
                stars.append(makeElement('i', 'fas fa-star'));
            }
            header.append(stars, makeElement('span', 'review-author', review.name));
            item.append(header, makeElement('p', 'review-text', `"${review.quote}"`));
            return item;
        }));
    }
}

function renderServicesContent(content) {
    const grid = document.querySelector('body > main .services-grid');
    if (grid && document.querySelector('.page-header') && Array.isArray(content.items)) {
        setText(document.querySelector('.page-header h1'), content.page_title);
        setText(document.querySelector('.page-header p'), content.page_subtitle);
        grid.replaceChildren(...content.items.map(service => {
            const card = makeElement('div', 'service-card');
            card.append(makeElement('i', service.icon));
            const heading = makeElement('h2', 'glass-heading-h2', service.title);
            const description = makeElement('p', '', service.description);
            const link = makeElement('a', 'book-btn', 'Learn More');
            link.href = `/contact/?service=${encodeURIComponent(service.slug)}`;
            link.target = '_self';
            link.rel = 'noopener noreferrer';
            card.append(heading, description, link);
            return card;
        }));
        const cta = document.querySelector('.cta-section');
        setText(cta?.querySelector('h2'), content.cta_title);
        setText(cta?.querySelector('p'), content.cta_text);
    }

    const serviceSelect = document.querySelector('#service');
    if (serviceSelect && Array.isArray(content.items)) {
        const firstOption = serviceSelect.options[0];
        serviceSelect.replaceChildren(firstOption);
        content.items.forEach(service => {
            const option = makeElement('option', '', service.title);
            option.value = service.slug;
            serviceSelect.append(option);
        });
    }
}

function renderDepartmentsContent(content) {
    const main = document.querySelector('main.departments-section');
    const grid = main?.querySelector('.services-grid');
    if (!grid || !Array.isArray(content.items)) return;

    setText(main.querySelector('.page-header h1'), content.page_title);
    setText(main.querySelector('.page-header p'), content.page_subtitle);
    grid.replaceChildren(...content.items.map(department => {
        const card = makeElement('div', 'service-card');
        card.append(
            makeElement('i', department.icon),
            makeElement('h3', '', department.title),
            makeElement('p', '', department.description)
        );
        return card;
    }));
}

function renderAboutContent(content) {
    const pageHeader = document.querySelector('main .page-header');
    if (!pageHeader || !document.querySelector('.elementor-about')) return;

    setText(pageHeader.querySelector('h1'), content.page_title);
    setText(pageHeader.querySelector('p'), content.page_subtitle);
    setText(document.querySelector('.elementor-about .elementor-heading-secondary'), content.intro_heading);
    const intro = document.querySelector('.elementor-about .elementor-row .elementor-column');
    const introParagraphs = intro?.querySelectorAll('p');
    if (intro && Array.isArray(content.intro_paragraphs)) {
        introParagraphs.forEach(paragraph => paragraph.remove());
        content.intro_paragraphs.forEach(text => {
            intro.append(makeElement('p', '', text));
        });
    }

    const mvvCards = document.querySelectorAll('.elementor-mvv .elementor-card');
    setText(mvvCards[0]?.querySelector('p'), content.mission);
    setText(mvvCards[1]?.querySelector('p'), content.vision);
    const values = mvvCards[2]?.querySelector('p');
    if (values) {
        const valueLines = content.values.split('\n');
        values.replaceChildren(...valueLines.flatMap((line, index) => {
            const nodes = [document.createTextNode(line)];
            if (index < valueLines.length - 1) nodes.push(document.createElement('br'));
            return nodes;
        }));
    }

    setText(document.querySelector('.elementor-features .elementor-heading-secondary'), content.features_title);
    const featureRow = document.querySelector('.elementor-features .elementor-row');
    if (featureRow && Array.isArray(content.features)) {
        featureRow.replaceChildren(...content.features.map(feature => {
            const card = makeElement('div', 'elementor-feature');
            card.append(makeElement('i', feature.icon), makeElement('h4', '', feature.title), makeElement('p', '', feature.description));
            return card;
        }));
    }

    setText(document.querySelector('.elementor-team .elementor-heading-secondary'), content.team_title);
    setText(document.querySelector('.elementor-team .elementor-subtitle'), content.team_subtitle);
    const teamRow = document.querySelector('.elementor-team .elementor-row');
    if (teamRow && Array.isArray(content.team)) {
        teamRow.replaceChildren(...content.team.map(member => {
            const card = makeElement('div', 'elementor-team-member');
            const avatar = makeElement('div', 'member-avatar');
            avatar.append(makeElement('i', member.icon));
            card.append(
                avatar,
                makeElement('h4', '', member.name),
                makeElement('p', 'member-title', member.title),
                makeElement('p', 'member-bio', member.bio)
            );
            return card;
        }));
    }
    const cta = document.querySelector('.elementor-cta');
    setText(cta?.querySelector('h2'), content.cta_title);
    setText(cta?.querySelector('p'), content.cta_text);
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

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollToBottom() {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', function() {
    const scrollUpBtn = document.getElementById('scrollUpBtn');
    if (!scrollUpBtn) return;

    if (window.scrollY > 300) {
        scrollUpBtn.classList.add('visible');
    } else {
        scrollUpBtn.classList.remove('visible');
    }
});
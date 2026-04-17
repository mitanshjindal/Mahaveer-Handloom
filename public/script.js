// Preloader Logic
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 500); // 0.5s artificial delay to show off the loader
    }
});

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Custom Cursor
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    if (cursor && cursorFollower) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Instantly move the small dot
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
        });

        // Smoothly follow with the larger ring
        function renderCursor() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;
            
            requestAnimationFrame(renderCursor);
        }
        requestAnimationFrame(renderCursor);

        // Hover Effect on interactive elements
        const iteractives = document.querySelectorAll('a, button, .btn, .product-card, .feature-card, .gallery-img');
        iteractives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                cursorFollower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursorFollower.classList.remove('hover');
            });
        });
    }

    // 2. Initialize Typed.js on Hero Section
    if (document.getElementById('typed-text')) {
        new Typed('#typed-text', {
            strings: ['Your Home.', 'Your Bedroom.', 'Your Comfort.', 'Extraordinary Living.'],
            typeSpeed: 60,
            backSpeed: 40,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }

    // 3. Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
        });
    }

    // Initialize Vanilla-Tilt on static feature cards
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".feature-card"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Fetch and render products
    const productGrid = document.getElementById('productGrid');
    
    if (productGrid) {
        fetch('/api/products?limit=6')
            .then(response => response.json())
            .then(products => {
                renderProducts(products);
                
                // Refresh AOS after dynamic content load
                if (typeof AOS !== 'undefined') {
                    setTimeout(() => AOS.refresh(), 100);
                }

                // Initialize Tilt on dynamic products
                if (typeof VanillaTilt !== 'undefined') {
                    VanillaTilt.init(document.querySelectorAll(".product-card"), {
                        max: 8,
                        speed: 400,
                        glare: true,
                        "max-glare": 0.15,
                    });
                }
                
                // Attach custom cursor listeners to dynamically added elements
                if (cursor && cursorFollower) {
                    const newInteractives = document.querySelectorAll('.product-card, .btn-whatsapp');
                    newInteractives.forEach(el => {
                        el.addEventListener('mouseenter', () => {
                            cursor.classList.add('hover');
                            cursorFollower.classList.add('hover');
                        });
                        el.addEventListener('mouseleave', () => {
                            cursor.classList.remove('hover');
                            cursorFollower.classList.remove('hover');
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                productGrid.innerHTML = '<p style="text-align:center; width:100%;">Failed to load products. Please check back later.</p>';
            });
    }

    function renderProducts(products) {
        if (products.length === 0) {
            productGrid.innerHTML = '<p style="text-align:center; width:100%;">No products available currently.</p>';
            return;
        }

        const productsHTML = products.map((product, index) => {
            // Encode the product name for WhatsApp message
            const waMessage = encodeURIComponent(`Hi Mahaveer Handloom, I would like to order "${product.name}" (${product.price}). Please let me know the total amount and payment options.`);
            const waLink = `https://wa.me/919813014949?text=${waMessage}`;
            
            // Stagger animation delay based on index
            const delay = (index % 4) * 100;

            return `
                <div class="product-card" data-aos="fade-up" data-aos-delay="${delay}">
                    <div class="product-image-container">
                        <span class="product-category">${product.category}</span>
                        <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                    </div>
                    <div class="product-details">
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-price">${product.price}</div>
                        <p class="product-desc">${product.description}</p>
                        <a href="${waLink}" target="_blank" class="btn btn-whatsapp" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            Order via WhatsApp
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        productGrid.innerHTML = productsHTML;
    }
});

// Preloader Logic
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 500); 
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
            
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
        });

        function renderCursor() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;
            
            requestAnimationFrame(renderCursor);
        }
        requestAnimationFrame(renderCursor);

        // Hover Effect on static interactives
        const iteractives = document.querySelectorAll('a, button, select');
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

        // Magnetic Buttons (Static)
        const magneticBtns = document.querySelectorAll('.btn');
        magneticBtns.forEach(btn => attachMagneticEffect(btn));
    }
    
    function attachMagneticEffect(btn) {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px)`;
        });
    }

    // 2. Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
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

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // 3. Collection API & Filtering Logic
    const productGrid = document.getElementById('productGrid');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchInput');

    function fetchProducts() {
        productGrid.innerHTML = '<p style="text-align:center; width:100%;">Loading products...</p>';
        
        let cat = categoryFilter.value;
        let sort = sortFilter.value;
        let search = searchInput.value.toLowerCase().trim();
        
        // Let backend handle category and basic sorting
        let url = `/api/products?category=${cat}`;
        if (sort === 'newest' || sort === 'oldest' || sort === 'relevance') {
             url += `&sort=${sort}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(products => {
                
                // Frontend Price Sorting Logic
                if (sort === 'price_asc' || sort === 'price_desc') {
                    products.sort((a, b) => {
                        // Extact numeric value from string "₹1200"
                        let priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
                        let priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
                        if (sort === 'price_asc') return priceA - priceB;
                        if (sort === 'price_desc') return priceB - priceA;
                    });
                }
                
                // Frontend Search Filtering
                if (search) {
                    products = products.filter(p => 
                        p.name.toLowerCase().includes(search) || 
                        p.description.toLowerCase().includes(search) ||
                        p.category.toLowerCase().includes(search)
                    );
                }

                renderProducts(products);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                productGrid.innerHTML = '<p style="text-align:center; width:100%; color:red;">Failed to load products. Server error.</p>';
            });
    }

    function renderProducts(products) {
        if (products.length === 0) {
            productGrid.innerHTML = '<div style="text-align:center; width:100%; padding: 4rem 0;"><h3 style="font-family:Outfit; color:var(--text-muted);">No products found matching your criteria.</h3></div>';
            return;
        }

        const productsHTML = products.map((product, index) => {
            const waMessage = encodeURIComponent(`Hi Mahaveer Handloom, I would like to order "${product.name}" (${product.price}). Please let me know the total amount and payment options.`);
            const waLink = `https://wa.me/919813014949?text=${waMessage}`;
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

        // Re-init dynamic interactions
        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 100);
        }
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll(".product-card"), {
                max: 8, speed: 400, glare: true, "max-glare": 0.15
            });
        }
        
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
            
            const dynamicBtns = document.querySelectorAll('.btn-whatsapp');
            dynamicBtns.forEach(btn => attachMagneticEffect(btn));
        }
    }

    // Listeners for filters
    categoryFilter.addEventListener('change', fetchProducts);
    sortFilter.addEventListener('change', fetchProducts);
    searchInput.addEventListener('input', () => {
        // Debounce search slightly
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(fetchProducts, 300);
    });

    // Initial Fetch
    fetchProducts();
});

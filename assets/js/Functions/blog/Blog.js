// Easter Egg Blog + transitions

document.addEventListener('DOMContentLoaded', function () {
    const avatarImgEl = document.querySelector('#avatar-frame img');
    if (!avatarImgEl) return;

    avatarImgEl.addEventListener('click', function () {
        startSwirlAnimation();
    });
});

/**
 * A higher-fidelity vortex transition (canvas-based).
 */
function runVortexTransition(options) {
    const {
        centerX,
        centerY,
        zIndex = 1000,
        durationMs = 1350,
        reverse = false,
        onDone
    } = options || {};

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        if (typeof onDone === 'function') onDone();
        return;
    }

    // Create container + canvas
    const container = document.createElement('div');
    container.id = 'swirl-container';
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.zIndex = String(zIndex);
    container.style.pointerEvents = 'none';
    container.style.background = 'transparent';
    container.style.mixBlendMode = 'normal';
    document.body.appendChild(container);

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.filter = 'blur(0.2px) saturate(1.15) contrast(1.05)';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });

    // Resize handler
    const onResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Particles
    const N = 260;
    const particles = new Array(N);
    const baseR = 12;
    const maxR = Math.min(canvas.width, canvas.height) * 0.55;

    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp01 = (x) => Math.max(0, Math.min(1, x));

    const spawn = (i, t0) => {
        const a = rand(0, Math.PI * 2);
        const r = reverse ? rand(maxR * 0.55, maxR) : rand(baseR, maxR * 0.45);
        const spin = rand(4.0, 9.2) * (Math.random() < 0.5 ? -1 : 1);
        const drift = rand(260, 520);
        const weight = rand(0.6, 1.6);
        const life = rand(0.55, 1.15);

        const x = centerX + r * Math.cos(a);
        const y = centerY + r * Math.sin(a);

        particles[i] = {
            a,
            r,
            spin,
            drift,
            w: weight,
            life,
            born: t0,
            x,
            y,
            px: x,
            py: y
        };
    };

    const tStart = performance.now();
    for (let i = 0; i < N; i++) spawn(i, tStart - rand(0, 250));

    // Draw helpers
    const drawGlow = (p) => {
        const g = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxR * 0.95);
        g.addColorStop(0, `rgba(255,255,255,${0.04 * p})`);
        g.addColorStop(0.12, `rgba(90,150,255,${0.06 * p})`);
        g.addColorStop(0.35, `rgba(30,70,160,${0.06 * p})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const ring = (radius, alpha, width, wobble, hueShift) => {
        const steps = 70;
        const baseHue = 210 + hueShift;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = width;

        for (let k = 0; k < 3; k++) {
            const off = (k - 1) * 0.9;
            ctx.strokeStyle = `hsla(${baseHue + off * 8}, 85%, 70%, ${alpha * (0.55 - k * 0.12)})`;
            ctx.beginPath();
            for (let i = 0; i <= steps; i++) {
                const u = i / steps;
                const ang = u * Math.PI * 2;
                const rr = radius * (1 + wobble * Math.sin(ang * 3 + performance.now() * 0.004));
                const x = rr * Math.cos(ang);
                const y = rr * Math.sin(ang);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
    };

    const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
    const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

    let last = tStart;
    let rafId = 0;

    const tick = (now) => {
        const dt = Math.min(0.033, (now - last) / 1000);
        last = now;

        const t = clamp01((now - tStart) / durationMs);
        const p = reverse ? (1 - t) : t;
        const prog = easeInOutCubic(t);
        const swirlGain = reverse ? easeOutExpo(1 - t) : easeOutExpo(t);

        // Fading trails (keeps motion rich)
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(0,0,0,${0.12 + 0.18 * prog})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ambient glow
        drawGlow(0.9 + 0.5 * swirlGain);

        // Vortex lens vignette
        const vignette = ctx.createRadialGradient(centerX, centerY, maxR * 0.05, centerX, centerY, maxR * 1.05);
        vignette.addColorStop(0, `rgba(0,0,0,${0.05 + 0.10 * prog})`);
        vignette.addColorStop(0.55, `rgba(0,0,0,${0.00})`);
        vignette.addColorStop(1, `rgba(0,0,0,${0.35 + 0.25 * prog})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ring highlights
        ring(
            maxR * (0.12 + 0.55 * swirlGain),
            0.55 * (1 - Math.abs(0.5 - t) * 1.6),
            1.6 + 2.4 * swirlGain,
            0.015 + 0.02 * swirlGain,
            (reverse ? -16 : 16) * (1 - t)
        );

        // Particles
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';

        for (let i = 0; i < N; i++) {
            const s = particles[i];
            const age = (now - s.born) / 1000;
            const life01 = clamp01(age / s.life);

            // respawn particles after life
            if (life01 >= 1) {
                spawn(i, now);
                continue;
            }

            s.px = s.x;
            s.py = s.y;

            // turbulence
            const turb = Math.sin((s.a + now * 0.0013) * 2.2) * 0.25 + Math.cos((s.a - now * 0.0011) * 3.4) * 0.18;

            // update angle + radius
            const dir = reverse ? -1 : 1;
            s.a += (s.spin * (0.55 + 1.4 * swirlGain) + turb) * dt * dir;
            s.r += (s.drift * (0.20 + 0.95 * swirlGain)) * dt * dir;

            // wrap radius
            if (!reverse && s.r > maxR) s.r = baseR;
            if (reverse && s.r < baseR) s.r = maxR;

            // slight "pull" toward center near the end
            const pull = reverse ? (1 - prog) : prog;
            const rr = s.r * (1 - 0.08 * pull);

            s.x = centerX + rr * Math.cos(s.a);
            s.y = centerY + rr * Math.sin(s.a);

            const alpha = (1 - life01) * (0.28 + 0.55 * swirlGain);
            ctx.strokeStyle = `rgba(120,180,255,${alpha})`;
            ctx.lineWidth = s.w * (0.7 + 1.1 * swirlGain);

            ctx.beginPath();
            ctx.moveTo(s.px, s.py);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();
        }

        ctx.restore();

        // A final "flash" hint (very subtle, premium feel)
        if (!reverse) {
            const flash = Math.max(0, (t - 0.86) / 0.14);
            if (flash > 0) {
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = `rgba(255,255,255,${0.10 * flash})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        if (t >= 1) {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(rafId);
            container.remove();
            if (typeof onDone === 'function') onDone();
            return;
        }

        rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
}

/**
 * Initiates the vortex animation sequence preceding the narrative transition
 */
function startSwirlAnimation() {
    const avatar = document.querySelector('#avatar-frame');
    if (!avatar) {
        showEpicScrollPage();
        return;
    }
    const rect = avatar.getBoundingClientRect();
    const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };

    runVortexTransition({
        centerX: center.x,
        centerY: center.y,
        zIndex: 1000,
        durationMs: 1400,
        reverse: false,
        onDone: showEpicScrollPage
    });
}

// Global audio context references
let narrationAudio = null;
let fireAudio = null;

/**
 * Constructs the narrative scroll interface following vortex animation
 * Implements parchment-style visual presentation with audio accompaniment
 */
function showEpicScrollPage() {
    // Cleanup previous animation container
    const swirlContainer = document.getElementById('swirl-container');
    if (swirlContainer) swirlContainer.remove();

    // Create primary container for narrative experience
    const epicPage = document.createElement('div');
    epicPage.id = 'epic-scroll-page';
    epicPage.style.position = 'fixed';
    epicPage.style.top = '0';
    epicPage.style.left = '0';
    epicPage.style.width = '100%';
    epicPage.style.height = '100%';
    epicPage.style.zIndex = '1001';
    epicPage.style.background = 'url("./assets/images/blog/background.jpg") center/cover no-repeat';
    epicPage.style.display = 'flex';
    epicPage.style.flexDirection = 'column';
    epicPage.style.justifyContent = 'center';
    epicPage.style.alignItems = 'center';
    epicPage.style.opacity = '0';
    epicPage.style.transition = 'opacity 1s ease-in-out';
    document.body.appendChild(epicPage);

    // Temporarily suppress clock interface elements
    const clockToggle = document.querySelector('.clock-toggle');
    if (clockToggle) clockToggle.style.display = 'none';

    // Construct parchment-style scroll element
    const scroll = document.createElement('div');
    scroll.id = 'epic-scroll';
    scroll.style.position = 'relative';
    scroll.style.width = '70%';
    scroll.style.minHeight = '60%';
    scroll.style.maxWidth = '800px';
    scroll.style.backgroundImage = 'url("./assets/images/blog/old-paper-texture.jpg")';
    scroll.style.backgroundSize = 'cover';
    scroll.style.borderRadius = '5px';
    scroll.style.boxShadow = `
        0 0 30px rgba(200, 160, 100, 0.5),
        inset 0 0 50px rgba(0,0,0,0.3),
        0 0 0 10px rgba(139, 69, 19, 0.3),
        0 0 0 15px rgba(160, 82, 45, 0.2),
        0 0 0 20px rgba(139, 69, 19, 0.1)
    `;
    scroll.style.padding = '40px';
    scroll.style.opacity = '0';
    scroll.style.transform = 'scale(0.9)';
    scroll.style.transition = 'all 1s ease-in-out';
    scroll.style.overflow = 'hidden';
    epicPage.appendChild(scroll);

    // Implement left scroll edge decoration
    const scrollEdgeLeft = document.createElement('div');
    scrollEdgeLeft.style.position = 'absolute';
    scrollEdgeLeft.style.left = '0';
    scrollEdgeLeft.style.top = '0';
    scrollEdgeLeft.style.bottom = '0';
    scrollEdgeLeft.style.width = '40px';
    scrollEdgeLeft.style.backgroundImage = 'url("./assets/images/blog/scroll-texture.png")';
    scrollEdgeLeft.style.backgroundSize = 'contain';
    scrollEdgeLeft.style.backgroundRepeat = 'repeat-y';
    scrollEdgeLeft.style.filter = 'sepia(100%) brightness(0.8)';
    scrollEdgeLeft.style.boxShadow = 'inset 5px 0 10px rgba(0,0,0,0.2)';
    scroll.appendChild(scrollEdgeLeft);

    // Implement right scroll edge decoration
    const scrollEdgeRight = document.createElement('div');
    scrollEdgeRight.style.position = 'absolute';
    scrollEdgeRight.style.right = '0';
    scrollEdgeRight.style.top = '0';
    scrollEdgeRight.style.bottom = '0';
    scrollEdgeRight.style.width = '40px';
    scrollEdgeRight.style.backgroundImage = 'url("./assets/images/blog/scroll-texture.png")';
    scrollEdgeRight.style.backgroundSize = 'contain';
    scrollEdgeRight.style.backgroundRepeat = 'repeat-y';
    scrollEdgeRight.style.filter = 'sepia(100%) brightness(0.8)';
    scrollEdgeRight.style.boxShadow = 'inset -5px 0 10px rgba(0,0,0,0.2)';
    scroll.appendChild(scrollEdgeRight);

    // Create content container for narrative text
    const scrollContent = document.createElement('div');
    scrollContent.style.position = 'relative';
    scrollContent.style.zIndex = '2';
    scrollContent.style.height = '100%';
    scrollContent.style.display = 'flex';
    scrollContent.style.flexDirection = 'column';
    scrollContent.style.justifyContent = 'center';
    scrollContent.style.alignItems = 'center';
    scrollContent.style.textAlign = 'center';
    scroll.appendChild(scrollContent);

    // Construct primary narrative text element
    const epicText = document.createElement('div');
    epicText.id = 'epic-text';
    epicText.innerHTML = `Traveler of silent paths, by your insight and unwavering will, the ancient seal lies broken. What once dwelt beyond mortal ken now unfolds before thine eyes: a hidden realm, long shrouded in shadow.`;
    epicText.className = 'epic-scroll-text';
    epicText.style.fontSize = '1.8rem';
    epicText.style.lineHeight = '1.6';
    epicText.style.color = '#3a2c1a';
    epicText.style.textShadow = '1px 1px 2px rgba(0,0,0,0.3)';
    epicText.style.marginBottom = '40px';
    epicText.style.opacity = '0';
    epicText.style.transform = 'translateY(20px)';
    epicText.style.transition = 'all 1s ease-in-out 0.5s';
    scrollContent.appendChild(epicText);

    // Create interactive flame ignition element
    const flameButton = document.createElement('div');
    flameButton.id = 'flame-button';
    flameButton.style.position = 'absolute';
    flameButton.style.bottom = '30px';
    flameButton.style.right = '30px';
    flameButton.style.width = '40px';
    flameButton.style.height = '60px';
    flameButton.style.cursor = 'pointer';
    flameButton.style.zIndex = '3';
    flameButton.innerHTML = `
        <div id="flame" style="
            width: 20px; 
            height: 30px; 
            margin: 0 auto; 
            position: relative;
            animation: flicker 0.5s infinite alternate;
        ">
            <div style="
                position: absolute; 
                width: 100%; 
                height: 100%; 
                background: linear-gradient(to top, 
                    rgba(255,100,0,0.9) 0%, 
                    rgba(255,200,0,0.8) 50%,
                    rgba(255,255,200,0.5) 100%
                ); 
                border-radius: 50% 50% 20% 20%; 
                filter: blur(3px); 
                box-shadow: 
                    0 0 10px rgba(255,100,0,0.8),
                    0 0 20px rgba(255,200,0,0.6);
            "></div>
        </div>
        <div class="epic-flame-label">Ignite</div>
    `;
    scrollContent.appendChild(flameButton);

    // Define flame animation properties
    const style = document.createElement('style');
    style.textContent = `
        @keyframes flicker {
            0%, 100% {
                transform: scale(1) translateY(0);
                opacity: 0.9;
            }
            50% {
                transform: scale(1.05) translateY(-2px);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Execute sequential entrance animations
    setTimeout(() => {
        epicPage.style.opacity = '1';
        
        setTimeout(() => {
            scroll.style.opacity = '1';
            scroll.style.transform = 'scale(1)';
            
            setTimeout(() => {
                epicText.style.opacity = '1';
                epicText.style.transform = 'translateY(0)';
                
                // Activate audio components
                playNarration();
                playFireSound();
            }, 500);
        }, 500);
    }, 100);

    // Register interaction handler for flame element
    flameButton.addEventListener('click', function() {
        startFlameAnimation();
    });
}

/**
 * Manages narrative audio playback
 * Ensures single instance operation and error handling
 */
function playNarration() {
    // Terminate existing audio instance if present
    if (narrationAudio) {
        narrationAudio.pause();
        narrationAudio.currentTime = 0;
    }
    
    // Initialize and activate audio component
    narrationAudio = new Audio('./assets/audio/blog/prologue.m4a');
    narrationAudio.volume = 0.5;
    narrationAudio.play().catch(e => console.log('Audio play failed:', e));
}

/**
 * Manages ambient fire sound playback
 * Implements continuous looping functionality
 */
function playFireSound() {
    // Terminate existing audio instance if present
    if (fireAudio) {
        fireAudio.pause();
        fireAudio.currentTime = 0;
    }
    
    // Initialize and activate looping audio component
    fireAudio = new Audio('./assets/audio/blog/fire-sound.mp3');
    fireAudio.volume = 1.0;
    fireAudio.loop = true;
    fireAudio.play().catch(e => console.log('Fire audio play failed:', e));
}

/**
 * Initiates flame propagation animation sequence
 * Creates fullscreen fire overlay effect
 */
function startFlameAnimation() {
    const flame = document.getElementById('flame');
    const scroll = document.getElementById('epic-scroll');
    const epicPage = document.getElementById('epic-scroll-page');
    
    // Create animated flame overlay
    const flameOverlay = document.createElement('div');
    flameOverlay.id = 'flame-overlay';
    flameOverlay.style.position = 'fixed';
    flameOverlay.style.top = '0';
    flameOverlay.style.left = '0';
    flameOverlay.style.width = '100%';
    flameOverlay.style.height = '100%';
    flameOverlay.style.background = 'url("./assets/animation/blog/fire-animation.gif") center/cover no-repeat';
    flameOverlay.style.zIndex = '1002';
    flameOverlay.style.opacity = '0';
    flameOverlay.style.transition = 'opacity 1.5s ease-in-out';
    document.body.appendChild(flameOverlay);
    
    // Execute flame propagation sequence
    setTimeout(() => {
        flameOverlay.style.opacity = '1';
        
        // Transition to blog interface
        setTimeout(() => {
            transitionToBlogPage();
        }, 4000); // 4-second animation duration
    }, 100);
}

/**
 * Terminates all active audio streams
 * Ensures clean transition between interface states
 */
function stopAllSounds() {
    if (narrationAudio) {
        narrationAudio.pause();
        narrationAudio.currentTime = 0;
    }
    if (fireAudio) {
        fireAudio.pause();
        fireAudio.currentTime = 0;
    }
}

/**
 * Constructs the blog interface following flame animation
 * Implements responsive multi-panel navigation system
 */
function transitionToBlogPage() {
    stopAllSounds(); // Terminate audio components

    // Create primary blog container
    const blogPage = document.createElement('div');
    blogPage.id = 'blog-page';
    document.body.appendChild(blogPage);

    // Permanently suppress clock interface elements
    const clockToggle = document.querySelector('.clock-toggle');
    if (clockToggle) clockToggle.style.display = 'none';

    // Background
    const blogBackground = document.createElement('div');
    blogBackground.id = 'blog-background';
    blogPage.appendChild(blogBackground);

    // Main container
    const blogContainer = document.createElement('div');
    blogContainer.id = 'blog-container';
    blogPage.appendChild(blogContainer);

    // Navbar
    const navbar = document.createElement('div');
    navbar.id = 'blog-navbar';
    blogContainer.appendChild(navbar);

    // Home avatar
    const topLeftAvatar = document.createElement('img');
    topLeftAvatar.id = 'blog-home';
    topLeftAvatar.src = './assets/images/avatar.jpg';
    topLeftAvatar.alt = 'Home';
    topLeftAvatar.dataset.cursor = 'precise_select';
    topLeftAvatar.addEventListener('click', function (event) {
        returnToMainPage(event.target);
    });
    navbar.appendChild(topLeftAvatar);

    // Title
    const blogTitle = document.createElement('h1');
    blogTitle.id = 'blog-title';
    blogTitle.textContent = 'Personal Blog';
    navbar.appendChild(blogTitle);

    // Nav links
    const navLinks = document.createElement('div');
    navLinks.id = 'blog-nav-links';
    navbar.appendChild(navLinks);

    const pages = ['Post', 'Favorite', 'Research'];

    pages.forEach((page, index) => {
        const link = document.createElement('a');
        link.href = '#';
        link.dataset.page = String(index);
        link.textContent = page;
        link.className = 'blog-nav-link';
        link.dataset.cursor = 'precise_select';
        navLinks.appendChild(link);

        if (index < pages.length - 1) {
            const sep = document.createElement('span');
            sep.className = 'blog-nav-sep';
            sep.textContent = '✦';
            navLinks.appendChild(sep);
        }
    });

    // Pages rail
    const pagesContainer = document.createElement('div');
    pagesContainer.id = 'blog-pages';
    blogContainer.appendChild(pagesContainer);

    pages.forEach((page, index) => {
        const pageSection = document.createElement('section');
        pageSection.className = 'blog-section';
        pageSection.dataset.page = String(index);

        const inner = document.createElement('div');
        inner.className = 'blog-section-inner';
        pageSection.appendChild(inner);

        const header = document.createElement('div');
        header.className = 'blog-section-header';
        inner.appendChild(header);

        const title = document.createElement('h2');
        title.className = 'blog-section-title';
        title.textContent = page;
        header.appendChild(title);

        const sub = document.createElement('p');
        sub.className = 'blog-section-sub';
        sub.textContent =
            page === 'Post' ? 'Notes, ideas, and small experiments.' :
            page === 'Favorite' ? 'Quotes & fragments worth keeping.' :
            'Work in progress — new updates soon.';
        header.appendChild(sub);

        const body = document.createElement('div');
        body.className = 'blog-grid';
        inner.appendChild(body);

        if (page === 'Post') {
            for (let i = 1; i <= 6; i++) body.appendChild(createBlogPost(i));
        } else if (page === 'Favorite') {
            for (let i = 1; i <= 8; i++) body.appendChild(createFavoriteItem(i));
        } else {
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.style.gridColumn = 'span 12';
            card.dataset.cursor = 'precise_select';
            card.innerHTML = `
              <div class="blog-card-title-row">
                <h3 class="blog-card-title">Research Section</h3>
                <div class="blog-card-meta">Under development</div>
              </div>
              <p class="blog-card-excerpt">This section is currently under development. Check back soon for updates.</p>
              <div class="blog-card-actions">
                <span class="blog-pill" style="pointer-events:none; opacity:.85;">Coming soon</span>
              </div>
            `;
            body.appendChild(card);
        }

        pagesContainer.appendChild(pageSection);
    });

    // Hover navigation buttons
    const leftNav = document.createElement('div');
    leftNav.id = 'blog-nav-left';
    leftNav.className = 'blog-nav-button';
    leftNav.innerHTML = '<i class="fas fa-chevron-left"></i>';
    leftNav.dataset.cursor = 'precise_select';
    blogContainer.appendChild(leftNav);

    const rightNav = document.createElement('div');
    rightNav.id = 'blog-nav-right';
    rightNav.className = 'blog-nav-button';
    rightNav.innerHTML = '<i class="fas fa-chevron-right"></i>';
    rightNav.dataset.cursor = 'precise_select';
    blogContainer.appendChild(rightNav);

    // State
    let currentPageIndex = 0;
    const navLinkEls = navLinks.querySelectorAll('.blog-nav-link');

    const navigateToPage = (index) => {
        pagesContainer.style.transform = `translateX(-${index * 33.3333}%)`;

        navLinkEls.forEach((lnk, i) => {
            if (i === index) lnk.classList.add('is-active');
            else lnk.classList.remove('is-active');
        });
    };

    // Buttons
    leftNav.addEventListener('click', () => {
        if (currentPageIndex > 0) {
            currentPageIndex--;
            navigateToPage(currentPageIndex);
        }
    });

    rightNav.addEventListener('click', () => {
        if (currentPageIndex < pages.length - 1) {
            currentPageIndex++;
            navigateToPage(currentPageIndex);
        }
    });

    // Link clicks
    navLinkEls.forEach((lnk) => {
        lnk.addEventListener('click', (e) => {
            e.preventDefault();
            currentPageIndex = parseInt(lnk.dataset.page, 10);
            navigateToPage(currentPageIndex);
        });
    });

    // Init
    navigateToPage(0);

    // Hover logic for nav buttons
    blogContainer.addEventListener('mousemove', (e) => {
        const w = blogContainer.clientWidth;
        const x = e.clientX;

        if (x < w / 8) leftNav.style.opacity = '1';
        else leftNav.style.opacity = '0';

        if (x > w * 7 / 8) rightNav.style.opacity = '1';
        else rightNav.style.opacity = '0';
    });

    blogContainer.addEventListener('mouseleave', () => {
        leftNav.style.opacity = '0';
        rightNav.style.opacity = '0';
    });

    // Entrance animation + cleanup previous layers
    setTimeout(() => {
        blogPage.classList.add('is-visible');

        const epicPage = document.getElementById('epic-scroll-page');
        const flameOverlay = document.getElementById('flame-overlay');

        if (epicPage) {
            epicPage.style.opacity = '0';
            setTimeout(() => {
                epicPage.remove();
                if (flameOverlay) flameOverlay.remove();
            }, 1000);
        }
    }, 60);
}

/**
 * Generates a blog post content element (styled via blog.css)
 */
function createBlogPost(index) {
    const post = document.createElement('div');
    post.className = 'blog-card blog-post';
    post.dataset.cursor = 'precise_select';

    const postTitle = `Exploring Mathematical Concepts ${index}`;
    const postDate = `2025-0${index}-1${index}`;

    post.innerHTML = `
      <div class="blog-card-title-row">
        <h3 class="blog-card-title">${postTitle}</h3>
        <div class="blog-card-meta">${postDate}</div>
      </div>
      <p class="blog-card-excerpt">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <div class="blog-card-actions">
        <a class="blog-pill" href="#" data-action="read">Read more <span aria-hidden="true">→</span></a>
      </div>
    `;

    const openPostDetail = () => {
        showPostDetail({
            id: index,
            title: postTitle,
            date: postDate,
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        });
    };

    post.addEventListener('click', openPostDetail);

    const read = post.querySelector('[data-action="read"]');
    read.dataset.cursor = 'precise_select';
    read.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openPostDetail();
    });

    return post;
}

/**
 * Generates a favorite content element (styled via blog.css)
 */
function createFavoriteItem(index) {
    const item = document.createElement('div');
    item.className = 'blog-card favorite-item';
    item.dataset.cursor = 'precise_select';

    const title = `Inspirational Quote ${index}`;
    const quote = 'Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding.';
    const author = 'William Paul Thurston';

    item.innerHTML = `
      <div class="blog-card-title-row">
        <h3 class="blog-card-title">${title}</h3>
        <div class="blog-card-meta">Favorite</div>
      </div>
      <div class="blog-quote">${quote}</div>
      <div class="blog-author">— ${author}</div>
      <div class="blog-card-actions">
        <a class="blog-pill" href="#" data-action="view">View</a>
      </div>
    `;

    const openFavoriteDetail = () => {
        showFavoriteDetail({
            id: index,
            title,
            content: `${quote} — ${author}`,
            quote,
            author
        });
    };

    item.addEventListener('click', openFavoriteDetail);

    const view = item.querySelector('[data-action="view"]');
    view.dataset.cursor = 'precise_select';
    view.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openFavoriteDetail();
    });

    return item;
}

/**
 * Displays detailed view for a blog post (styled via blog.css)
 */
function showPostDetail(postData) {
    const overlay = document.createElement('div');
    overlay.id = 'detail-overlay';
    document.body.appendChild(overlay);

    const content = document.createElement('div');
    content.className = 'detail-content';
    overlay.appendChild(content);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'detail-close';
    closeBtn.textContent = '✕';
    closeBtn.dataset.cursor = 'precise_select';
    closeBtn.addEventListener('click', () => closeOverlay(overlay));
    content.appendChild(closeBtn);

    const title = document.createElement('h2');
    title.className = 'detail-title';
    title.textContent = postData.title;
    content.appendChild(title);

    const date = document.createElement('div');
    date.className = 'detail-meta';
    date.textContent = `Published on: ${postData.date}`;
    content.appendChild(date);

    const body = document.createElement('div');
    body.className = 'detail-body';
    body.innerHTML = `
      <p>${postData.content}</p>
      <p>Additional details about the topic would appear here. This expanded view allows for complete content presentation without truncation.</p>
      <p>Further elaboration and analysis would continue in this section. The complete text provides context and nuance that cannot be captured in the truncated preview.</p>
    `;
    content.appendChild(body);

    const footer = document.createElement('div');
    footer.className = 'detail-footer';
    footer.textContent = '© 2025 Personal Blog. All rights reserved.';
    content.appendChild(footer);

    // click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay(overlay);
    });

    setTimeout(() => overlay.classList.add('is-visible'), 10);
}

/**
 * Displays detailed view for a favorite item (styled via blog.css)
 */
function showFavoriteDetail(favoriteData) {
    const overlay = document.createElement('div');
    overlay.id = 'detail-overlay';
    document.body.appendChild(overlay);

    const content = document.createElement('div');
    content.className = 'detail-content narrow';
    overlay.appendChild(content);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'detail-close';
    closeBtn.textContent = '✕';
    closeBtn.dataset.cursor = 'precise_select';
    closeBtn.addEventListener('click', () => closeOverlay(overlay));
    content.appendChild(closeBtn);

    const title = document.createElement('h2');
    title.className = 'detail-title';
    title.textContent = favoriteData.title;
    content.appendChild(title);

    const body = document.createElement('div');
    body.className = 'detail-body';
    body.innerHTML = `
      <blockquote style="margin:16px 0; padding:16px 18px; border-left:4px solid rgba(142,68,173,0.55); background: rgba(0,0,0,0.04); border-radius: 12px;">
        ${favoriteData.quote}
      </blockquote>
      <div style="font-family: Georgia, serif; color: rgba(20,24,32,0.70); font-style: italic;">— ${favoriteData.author}</div>
    `;
    content.appendChild(body);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay(overlay);
    });

    setTimeout(() => overlay.classList.add('is-visible'), 10);
}

function closeOverlay(overlay) {
    overlay.classList.remove('is-visible');
    setTimeout(() => overlay.remove(), 260);
}

/**
 * Returns to main page with swirling animation (Upgraded vortex)
 * @param {HTMLElement} avatarElement - The avatar element clicked
 */
function returnToMainPage(avatarElement) {
    const rect = avatarElement.getBoundingClientRect();
    const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };

    runVortexTransition({
        centerX: center.x,
        centerY: center.y,
        zIndex: 2000,
        durationMs: 1150,
        reverse: true,
        onDone: () => {
            // Clean up elements
            const blogPage = document.getElementById('blog-page');
            if (blogPage) blogPage.remove();

            const flameOverlay = document.getElementById('flame-overlay');
            if (flameOverlay) flameOverlay.remove();

            // Show clock toggle
            const clockToggle = document.querySelector('.clock-toggle');
            if (clockToggle) clockToggle.style.display = 'block';
        }
    });
}

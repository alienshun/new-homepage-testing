// epic-transition.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize avatar element and preload image for seamless transition
    const avatar = document.querySelector('#avatar-frame img');
    
    // Preload avatar image to ensure visual continuity
    const avatarImg = new Image();
    avatarImg.src = './assets/images/avatar.jpg';
    
    // Execute opacity transition after successful image loading
    avatarImg.onload = function() {
        document.querySelector('#avatar-frame img').style.opacity = '1';
    };
    
    // Register click event handler for avatar element
    avatar.addEventListener('click', function() {
        startSwirlAnimation();
    });
});

/**
 * Initiates the vortex animation sequence preceding the narrative transition
 * Creates a multi-layered swirling visual effect centered at avatar position
 */
function startSwirlAnimation() {
    // Create primary container for vortex visualization
    const swirlContainer = document.createElement('div');
    swirlContainer.id = 'swirl-container';
    swirlContainer.style.position = 'fixed';
    swirlContainer.style.top = '0';
    swirlContainer.style.left = '0';
    swirlContainer.style.width = '100%';
    swirlContainer.style.height = '100%';
    swirlContainer.style.zIndex = '1000';
    swirlContainer.style.pointerEvents = 'none';
    document.body.appendChild(swirlContainer);

    // Calculate geometric center of avatar element
    const avatar = document.querySelector('#avatar-frame');
    const avatarRect = avatar.getBoundingClientRect();
    const avatarCenter = {
        x: avatarRect.left + avatarRect.width / 2,
        y: avatarRect.top + avatarRect.height / 2
    };

    // Generate five distinct swirling layers for visual complexity
    const swirlLayers = [];
    for (let i = 0; i < 5; i++) {
        const swirl = document.createElement('div');
        swirl.style.position = 'absolute';
        swirl.style.width = '150px';
        swirl.style.height = '150px';
        swirl.style.borderRadius = '50%';
        
        // Apply distinct gradient patterns to each layer
        switch(i) {
            case 0:
                swirl.style.background = `
                    conic-gradient(
                        from 0deg,
                        rgba(0, 10, 20, 0.95) 0%,
                        rgba(0, 30, 60, 0.95) 20%,
                        rgba(5, 5, 15, 0.95) 30%,
                        rgba(0, 30, 60, 0.95) 40%,
                        rgba(5, 5, 15, 0.95) 50%,
                        rgba(0, 30, 60, 0.95) 60%,
                        rgba(5, 5, 15, 0.95) 70%,
                        rgba(0, 30, 60, 0.95) 80%,
                        rgba(5, 5, 15, 0.95) 90%,
                        rgba(0, 10, 20, 0.95) 100%
                    )
                `;
                break;
            case 1:
                swirl.style.background = `
                    radial-gradient(
                        circle,
                        rgba(0, 60, 120, 0.8) 0%,
                        rgba(0, 30, 90, 0.9) 50%,
                        rgba(0, 10, 40, 0.95) 100%
                    )
                `;
                break;
            case 2:
                swirl.style.background = `
                    repeating-radial-gradient(
                        circle at center,
                        rgba(0, 80, 150, 0.7) 0%,
                        rgba(0, 40, 100, 0.8) 10%,
                        rgba(0, 20, 60, 0.9) 20%
                    )
                `;
                break;
            case 3:
                swirl.style.background = `
                    conic-gradient(
                        from 180deg,
                        rgba(10, 0, 30, 0.8) 0%,
                        rgba(20, 0, 60, 0.85) 25%,
                        rgba(30, 0, 90, 0.9) 50%,
                        rgba(20, 0, 60, 0.85) 75%,
                        rgba(10, 0, 30, 0.8) 100%
                    )
                `;
                break;
            default:
                swirl.style.background = `
                    radial-gradient(
                        circle,
                        rgba(0, 0, 20, 0.9) 0%,
                        rgba(0, 0, 40, 0.8) 50%,
                        rgba(0, 0, 60, 0.7) 100%
                    )
                `;
        }
        
        // Position swirl elements at avatar's geometric center
        swirl.style.left = `${avatarCenter.x - 75}px`;
        swirl.style.top = `${avatarCenter.y - 75}px`;
        swirl.style.transformOrigin = 'center center';
        swirl.style.boxShadow = `0 0 40px rgba(0,60,120,0.8)`;
        swirlContainer.appendChild(swirl);
        swirlLayers.push(swirl);
    }

    // Initialize animation parameters
    let scale = 1;
    let opacity = 1;
    const rotations = [0, 180, 90, 270, 45]; // Initial rotation angles
    
    // Execute frame-by-frame animation sequence
    const swirlAnimation = setInterval(() => {
        // Incrementally modify transformation parameters
        scale += 0.18;
        opacity -= 0.012;
        
        // Apply transformations to each layer
        swirlLayers.forEach((swirl, index) => {
            rotations[index] += (index + 1) * 15;  // Layer-specific angular velocity
            swirl.style.transform = `scale(${scale * (1 + index * 0.15)}) rotate(${rotations[index]}deg)`;
            swirl.style.opacity = opacity * (1 - index * 0.08);
        });
        
        // Termination condition for animation sequence
        if (scale > 20) {
            clearInterval(swirlAnimation);
            showEpicScrollPage();
        }
    }, 10); // 100Hz animation frequency
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
    epicPage.style.background = 'url("./assets/images/background.jpg") center/cover no-repeat';
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
    scroll.style.backgroundImage = 'url("./assets/images/old-paper-texture.jpg")';
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
    scrollEdgeLeft.style.backgroundImage = 'url("./assets/images/scroll-texture.png")';
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
    scrollEdgeRight.style.backgroundImage = 'url("./assets/images/scroll-texture.png")';
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
    epicText.style.fontFamily = '"Cinzel", "Times New Roman", serif';
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
        <div style="
            text-align: center; 
            margin-top: 5px; 
            font-family: 'Cinzel', serif; 
            color: '#3a2c1a'; 
            font-size: 0.9rem;
        ">Ignite</div>
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
    narrationAudio = new Audio('./assets/audio/prologue.m4a');
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
    fireAudio = new Audio('./assets/audio/fire-sound.mp3');
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
    flameOverlay.style.background = 'url("./assets/animation/fire-animation.gif") center/cover no-repeat';
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
    blogPage.style.position = 'fixed';
    blogPage.style.top = '0';
    blogPage.style.left = '0';
    blogPage.style.width = '100%';
    blogPage.style.height = '100%';
    blogPage.style.zIndex = '1003';
    blogPage.style.backgroundColor = '#f5f5f5';
    blogPage.style.display = 'flex';
    blogPage.style.justifyContent = 'center';
    blogPage.style.alignItems = 'center';
    blogPage.style.opacity = '0';
    blogPage.style.transition = 'opacity 1s ease-in-out';
    document.body.appendChild(blogPage);
    
    // Permanently suppress clock interface elements
    const clockToggle = document.querySelector('.clock-toggle');
    if (clockToggle) clockToggle.style.display = 'none';
    
    // Implement blog background with luminosity adjustment
    const blogBackground = document.createElement('div');
    blogBackground.id = 'blog-background';
    blogBackground.style.position = 'fixed';
    blogBackground.style.top = '0';
    blogBackground.style.left = '0';
    blogBackground.style.width = '100%';
    blogBackground.style.height = '100%';
    blogBackground.style.background = 'url("./assets/images/background.png") center/cover no-repeat';
    blogBackground.style.zIndex = '-1';
    blogBackground.style.filter = 'brightness(0.8)';
    blogPage.appendChild(blogBackground);
    
    // Create content management container
    const blogContainer = document.createElement('div');
    blogContainer.id = 'blog-container';
    blogContainer.style.position = 'relative';
    blogContainer.style.width = '100%';
    blogContainer.style.height = '100%';
    blogContainer.style.overflow = 'hidden';
    blogContainer.style.display = 'flex';
    blogContainer.style.flexDirection = 'column';
    blogPage.appendChild(blogContainer);
    
    // Construct navigation header with top-left avatar
    const navbar = document.createElement('div');
    navbar.id = 'blog-navbar';
    navbar.style.position = 'fixed';
    navbar.style.top = '0';
    navbar.style.left = '0';
    navbar.style.width = '100%';
    navbar.style.height = '100px';
    navbar.style.zIndex = '10';
    navbar.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
    navbar.style.backdropFilter = 'blur(10px)';
    navbar.style.display = 'flex';
    navbar.style.flexDirection = 'column';
    navbar.style.justifyContent = 'center';
    navbar.style.alignItems = 'center';
    navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    blogContainer.appendChild(navbar);
    
    // Add top-left avatar with transition effect
    const topLeftAvatar = document.createElement('img');
    topLeftAvatar.src = './assets/images/avatar.jpg';
    topLeftAvatar.alt = 'Home';
    topLeftAvatar.style.position = 'absolute';
    topLeftAvatar.style.top = '15px';
    topLeftAvatar.style.left = '15px';
    topLeftAvatar.style.width = '70px';
    topLeftAvatar.style.height = '70px';
    topLeftAvatar.style.borderRadius = '50%';
    topLeftAvatar.style.border = '2px solid rgba(255,255,255,0.3)';
    topLeftAvatar.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    topLeftAvatar.style.cursor = 'pointer';
    topLeftAvatar.style.transition = 'all 0.3s ease';
    topLeftAvatar.dataset.cursor = 'precise_select';
    
    // Add hover effect for avatar
    topLeftAvatar.addEventListener('mouseenter', () => {
        topLeftAvatar.style.transform = 'scale(1.05)';
        topLeftAvatar.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    });
    
    topLeftAvatar.addEventListener('mouseleave', () => {
        topLeftAvatar.style.transform = 'scale(1)';
        topLeftAvatar.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    });
    
    // Add click handler to return to main page
    topLeftAvatar.addEventListener('click', function(event) {
        returnToMainPage(event.target);
    });
    
    navbar.appendChild(topLeftAvatar);
    
    // Implement blog title element
    const blogTitle = document.createElement('h1');
    blogTitle.id = 'blog-title';
    blogTitle.textContent = 'Personal Blog';
    blogTitle.style.fontFamily = '"Great Vibes", "Allura", cursive';
    blogTitle.style.fontSize = '2.5rem';
    blogTitle.style.color = '#fff';
    blogTitle.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';
    blogTitle.style.margin = '0';
    blogTitle.style.letterSpacing = '2px';
    navbar.appendChild(blogTitle);
    
    // Create navigation link container
    const navLinks = document.createElement('div');
    navLinks.id = 'blog-nav-links';
    navLinks.style.display = 'flex';
    navLinks.style.justifyContent = 'center';
    navLinks.style.gap = '30px';
    navLinks.style.marginTop = '15px';
    navbar.appendChild(navLinks);
    
    // Generate navigation elements
    const pages = ['Post', 'Favorite', 'Research'];
    pages.forEach((page, index) => {
        const link = document.createElement('a');
        link.href = '#';
        link.dataset.page = index;
        link.textContent = page;
        link.style.fontFamily = '"Cinzel", serif';
        link.style.fontSize = '1.2rem';
        link.style.color = '#fff';
        link.style.textDecoration = 'none';
        link.style.padding = '5px 15px';
        link.style.borderRadius = '20px';
        link.style.transition = 'all 0.3s ease';
        link.dataset.cursor = 'precise_select';
        
        // Add decorative separators between links
        if (index < pages.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = '✦';
            separator.style.marginLeft = '10px';
            separator.style.opacity = '0.5';
            navLinks.appendChild(separator);
        }
        
        navLinks.appendChild(link);
    });
    
    // Create multi-page content container
    const pagesContainer = document.createElement('div');
    pagesContainer.id = 'blog-pages';
    pagesContainer.style.position = 'absolute';
    pagesContainer.style.top = '100px';
    pagesContainer.style.left = '0';
    pagesContainer.style.width = '300%'; // 3-page width
    pagesContainer.style.height = 'calc(100% - 100px)';
    pagesContainer.style.display = 'flex';
    pagesContainer.style.transition = 'transform 0.5s ease-in-out';
    blogContainer.appendChild(pagesContainer);
    
    // Generate content sections
    pages.forEach((page, index) => {
        const pageSection = document.createElement('div');
        pageSection.className = 'blog-page';
        pageSection.dataset.page = index;
        pageSection.style.width = '33.3333%'; // Equal width per page
        pageSection.style.height = '100%';
        pageSection.style.padding = '120px 5% 50px 5%';
        pageSection.style.overflowY = 'auto';
        pageSection.style.boxSizing = 'border-box';
        
        // Apply distinct background gradients
        const gradientColors = [
            'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,240,255,0.9))',
            'linear-gradient(135deg, rgba(255,255,240,0.9), rgba(255,240,240,0.9))',
            'linear-gradient(135deg, rgba(240,255,255,0.9), rgba(240,240,255,0.9))'
        ];
        pageSection.style.background = gradientColors[index];
        pageSection.style.borderRadius = '20px';
        pageSection.style.boxShadow = '0 0 30px rgba(0,0,0,0.1)';
        pageSection.style.margin = '0 2.5%';
        
        // Implement section title
        const pageTitle = document.createElement('h2');
        pageTitle.textContent = page;
        pageTitle.style.fontFamily = '"Cinzel", serif';
        pageTitle.style.color = '#333';
        pageTitle.style.borderBottom = '2px solid #ddd';
        pageTitle.style.paddingBottom = '10px';
        pageTitle.style.marginBottom = '30px';
        pageSection.appendChild(pageTitle);
        
        // Generate section-specific content
        switch(page) {
            case 'Post':
                for (let i = 1; i <= 5; i++) {
                    pageSection.appendChild(createBlogPost(i));
                }
                break;
            case 'Favorite':
                for (let i = 1; i <= 6; i++) {
                    pageSection.appendChild(createFavoriteItem(i));
                }
                break;
            case 'Research':
                const researchContent = document.createElement('div');
                researchContent.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h3 style="font-family: 'Cinzel', serif; color: #555;">Research Section</h3>
                        <p style="font-family: 'Georgia', serif; color: #777;">
                            This section is currently under development. Check back soon for updates.
                        </p>
                    </div>
                `;
                pageSection.appendChild(researchContent);
                break;
        }
        
        pagesContainer.appendChild(pageSection);
    });
    
    // Create left navigation control
    const leftNav = document.createElement('div');
    leftNav.id = 'blog-nav-left';
    leftNav.className = 'blog-nav-button';
    leftNav.innerHTML = '<i class="fas fa-chevron-left"></i>';
    leftNav.style.position = 'fixed';
    leftNav.style.left = '0';
    leftNav.style.top = '50%';
    leftNav.style.transform = 'translateY(-50%)';
    leftNav.style.opacity = '0';
    leftNav.style.transition = 'opacity 0.3s ease';
    leftNav.dataset.cursor = 'precise_select';
    blogContainer.appendChild(leftNav);
    
    // Create right navigation control
    const rightNav = document.createElement('div');
    rightNav.id = 'blog-nav-right';
    rightNav.className = 'blog-nav-button';
    rightNav.innerHTML = '<i class="fas fa-chevron-right"></i>';
    rightNav.style.position = 'fixed';
    rightNav.style.right = '0';
    rightNav.style.top = '50%';
    rightNav.style.transform = 'translateY(-50%)';
    rightNav.style.opacity = '0';
    rightNav.style.transition = 'opacity 0.3s ease';
    rightNav.dataset.cursor = 'precise_select';
    blogContainer.appendChild(rightNav);
    
    // Apply navigation button styling
    const navStyle = document.createElement('style');
    navStyle.textContent = `
        .blog-nav-button {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.7);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.2rem;
            color: #333;
            cursor: pointer;
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
            z-index: 20;
            transition: all 0.3s ease;
        }
        
        .blog-nav-button:hover {
            background: rgba(255,255,255,0.9);
            transform: scale(1.1);
        }
    `;
    blogContainer.appendChild(navStyle);
    
    // Initialize navigation state
    let currentPageIndex = 0;
    
    // Register navigation event handlers
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
    
    // Register page link handlers
    const navLinksElements = navLinks.querySelectorAll('a');
    navLinksElements.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentPageIndex = parseInt(link.dataset.page);
            navigateToPage(currentPageIndex);
        });
    });
    
    /**
     * Navigates to specified content section
     * @param {number} index - Target section identifier
     */
    function navigateToPage(index) {
        // Calculate horizontal translation
        pagesContainer.style.transform = `translateX(-${index * 33.3333}%)`;
        
        // Update navigation state indicators
        navLinksElements.forEach((link, i) => {
            if (i === index) {
                link.style.background = 'rgba(255,255,255,0.3)';
                link.style.fontWeight = 'bold';
            } else {
                link.style.background = 'transparent';
                link.style.fontWeight = 'normal';
            }
        });
    }
    
    // Initialize navigation state
    navigateToPage(0);
    
    // Implement hover-based navigation controls
    blogContainer.addEventListener('mousemove', (e) => {
        const containerWidth = blogContainer.clientWidth;
        const mouseX = e.clientX;
        
        // Left navigation control logic
        if (mouseX < containerWidth / 8) {
            leftNav.style.opacity = '1';
        } else {
            leftNav.style.opacity = '0';
        }
        
        // Right navigation control logic
        if (mouseX > containerWidth * 7/8) {
            rightNav.style.opacity = '1';
        } else {
            rightNav.style.opacity = '0';
        }
    });
    
    // Hide navigation controls on mouse exit
    blogContainer.addEventListener('mouseleave', () => {
        leftNav.style.opacity = '0';
        rightNav.style.opacity = '0';
    });
    
    // Execute entrance animation sequence
    setTimeout(() => {
        blogPage.style.opacity = '1';
        
        const epicPage = document.getElementById('epic-scroll-page');
        const flameOverlay = document.getElementById('flame-overlay');
        
        // Cleanup previous interface elements
        if (epicPage) {
            epicPage.style.opacity = '0';
            
            setTimeout(() => {
                epicPage.remove();
                if (flameOverlay) flameOverlay.remove();
            }, 1000);
        }
    }, 100);
}

/**
 * Generates a blog post content element
 * @param {number} index - Post identifier
 * @returns {HTMLElement} Constructed post element
 */
function createBlogPost(index) {
    const post = document.createElement('div');
    post.className = 'blog-post';
    post.style.background = 'rgba(255,255,255,0.7)';
    post.style.borderRadius = '15px';
    post.style.padding = '20px';
    post.style.marginBottom = '30px';
    post.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
    post.style.transition = 'transform 0.3s ease';
    post.style.cursor = 'pointer';
    post.dataset.cursor = 'precise_select';
    
    // Implement hover elevation effect
    post.addEventListener('mouseenter', () => {
        post.style.transform = 'translateY(-5px)';
        post.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
    });
    
    post.addEventListener('mouseleave', () => {
        post.style.transform = 'none';
        post.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
    });
    
    // Create header section
    const titleRow = document.createElement('div');
    titleRow.style.display = 'flex';
    titleRow.style.justifyContent = 'space-between';
    titleRow.style.alignItems = 'center';
    titleRow.style.marginBottom = '15px';
    
    const postTitle = document.createElement('h3');
    postTitle.textContent = `Exploring Mathematical Concepts ${index}`;
    postTitle.style.fontFamily = '"Cinzel", serif';
    postTitle.style.color = '#333';
    postTitle.style.margin = '0';
    
    const postDate = document.createElement('span');
    postDate.textContent = `2025-0${index}-1${index}`;
    postDate.style.fontFamily = '"Georgia", serif';
    postDate.style.color = '#666';
    postDate.style.fontSize = '0.9rem';
    
    titleRow.appendChild(postTitle);
    titleRow.appendChild(postDate);
    post.appendChild(titleRow);
    
    // Create content section with truncated text
    const content = document.createElement('p');
    content.textContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    content.style.fontFamily = '"Georgia", serif';
    content.style.color = '#444';
    content.style.lineHeight = '1.6';
    content.style.marginBottom = '20px';
    content.style.maxHeight = '60px';
    content.style.overflow = 'hidden';
    content.style.textOverflow = 'ellipsis';
    content.style.display = '-webkit-box';
    content.style.webkitLineClamp = '3';
    content.style.webkitBoxOrient = 'vertical';
    post.appendChild(content);
    
    // Create interactive element
    const readMore = document.createElement('a');
    readMore.href = '#';
    readMore.textContent = 'Read more →';
    readMore.style.fontFamily = '"Cinzel", serif';
    readMore.style.color = '#2c3e50';
    readMore.style.textDecoration = 'none';
    readMore.style.display = 'inline-block';
    readMore.style.padding = '8px 15px';
    readMore.style.background = 'rgba(52, 152, 219, 0.1)';
    readMore.style.borderRadius = '20px';
    readMore.style.transition = 'all 0.3s ease';
    readMore.dataset.cursor = 'precise_select';
    
    // Implement hover effects
    readMore.addEventListener('mouseenter', () => {
        readMore.style.background = 'rgba(52, 152, 219, 0.2)';
        readMore.style.transform = 'translateX(5px)';
    });
    
    readMore.addEventListener('mouseleave', () => {
        readMore.style.background = 'rgba(52, 152, 219, 0.1)';
        readMore.style.transform = 'none';
    });
    
    // Register click handler for entire post and read more button
    const openPostDetail = () => {
        showPostDetail({
            id: index,
            title: `Exploring Mathematical Concepts ${index}`,
            date: `2025-0${index}-1${index}`,
            content: content.textContent
        });
    };
    
    post.addEventListener('click', openPostDetail);
    readMore.addEventListener('click', (e) => {
        e.stopPropagation();
        openPostDetail();
    });
    
    post.appendChild(readMore);
    
    return post;
}

/**
 * Generates a favorite content element
 * @param {number} index - Item identifier
 * @returns {HTMLElement} Constructed favorite element
 */
function createFavoriteItem(index) {
    const item = document.createElement('div');
    item.className = 'favorite-item';
    item.style.position = 'relative';
    item.style.background = 'rgba(255,255,255,0.7)';
    item.style.borderRadius = '15px';
    item.style.padding = '20px';
    item.style.marginBottom = '30px';
    item.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
    item.style.overflow = 'hidden';
    item.style.transition = 'transform 0.3s ease';
    item.style.cursor = 'pointer';
    item.dataset.cursor = 'precise_select';
    
    // Implement hover elevation effect
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-5px)';
        item.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'none';
        item.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
    });
    
    // Create title element
    const title = document.createElement('h3');
    title.textContent = `Inspirational Quote ${index}`;
    title.style.fontFamily = '"Cinzel", serif';
    title.style.color = '#333';
    title.style.margin = '0 0 15px 0';
    item.appendChild(title);
    
    // Create content container with truncated text
    const content = document.createElement('div');
    content.style.position = 'relative';
    content.style.height = '150px';
    content.style.overflow = 'hidden';
    
    const quote = document.createElement('p');
    quote.textContent = 'Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding. - William Paul Thurston';
    quote.style.fontFamily = '"Georgia", serif';
    quote.style.color = '#444';
    quote.style.lineHeight = '1.6';
    quote.style.margin = '0';
    quote.style.maxHeight = '120px';
    quote.style.overflow = 'hidden';
    quote.style.textOverflow = 'ellipsis';
    quote.style.display = '-webkit-box';
    quote.style.webkitLineClamp = '5';
    quote.style.webkitBoxOrient = 'vertical';
    content.appendChild(quote);
    
    // Implement content fade effect
    const blurOverlay = document.createElement('div');
    blurOverlay.style.position = 'absolute';
    blurOverlay.style.bottom = '0';
    blurOverlay.style.left = '0';
    blurOverlay.style.width = '100%';
    blurOverlay.style.height = '30px';
    blurOverlay.style.background = 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)';
    blurOverlay.style.backdropFilter = 'blur(2px)';
    content.appendChild(blurOverlay);
    
    item.appendChild(content);
    
    // Create interaction element
    const viewBtn = document.createElement('a');
    viewBtn.href = '#';
    viewBtn.textContent = 'View';
    viewBtn.style.position = 'absolute';
    viewBtn.style.right = '20px';
    viewBtn.style.bottom = '20px';
    viewBtn.style.fontFamily = '"Cinzel", serif';
    viewBtn.style.color = '#fff';
    viewBtn.style.textDecoration = 'none';
    viewBtn.style.padding = '8px 15px';
    viewBtn.style.background = 'rgba(106, 48, 147, 0.8)';
    viewBtn.style.borderRadius = '20px';
    viewBtn.style.transition = 'all 0.3s ease';
    viewBtn.style.zIndex = '2';
    viewBtn.dataset.cursor = 'precise_select';
    
    // Implement hover effects
    viewBtn.addEventListener('mouseenter', () => {
        viewBtn.style.background = 'rgba(106, 48, 147, 1)';
        viewBtn.style.transform = 'scale(1.05)';
    });
    
    viewBtn.addEventListener('mouseleave', () => {
        viewBtn.style.background = 'rgba(106, 48, 147, 0.8)';
        viewBtn.style.transform = 'none';
    });
    
    // Register click handler for entire item and view button
    const openFavoriteDetail = () => {
        showFavoriteDetail({
            id: index,
            title: `Inspirational Quote ${index}`,
            content: quote.textContent
        });
    };
    
    item.addEventListener('click', openFavoriteDetail);
    viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openFavoriteDetail();
    });
    
    item.appendChild(viewBtn);
    
    return item;
}

/**
 * Displays detailed view for a blog post
 * @param {Object} postData - Post data object
 */
function showPostDetail(postData) {
    // Create detail overlay container
    const detailOverlay = document.createElement('div');
    detailOverlay.id = 'detail-overlay';
    detailOverlay.style.position = 'fixed';
    detailOverlay.style.top = '0';
    detailOverlay.style.left = '0';
    detailOverlay.style.width = '100%';
    detailOverlay.style.height = '100%';
    detailOverlay.style.zIndex = '2000';
    detailOverlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
    detailOverlay.style.display = 'flex';
    detailOverlay.style.justifyContent = 'center';
    detailOverlay.style.alignItems = 'center';
    detailOverlay.style.opacity = '0';
    detailOverlay.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(detailOverlay);
    
    // Create detail content container
    const detailContent = document.createElement('div');
    detailContent.style.position = 'relative';
    detailContent.style.width = '80%';
    detailContent.style.maxWidth = '800px';
    detailContent.style.maxHeight = '90vh';
    detailContent.style.overflowY = 'auto';
    detailContent.style.padding = '40px';
    detailContent.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,240,255,0.95))';
    detailContent.style.borderRadius = '15px';
    detailContent.style.boxShadow = '0 0 50px rgba(255,255,255,0.2)';
    detailOverlay.appendChild(detailContent);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '15px';
    closeBtn.style.right = '15px';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.background = 'rgba(231, 76, 60, 0.9)';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '1.2rem';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.transition = 'all 0.3s ease';
    closeBtn.dataset.cursor = 'precise_select';
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.transform = 'scale(1.1)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.transform = 'scale(1)';
    });
    
    closeBtn.addEventListener('click', () => {
        detailOverlay.style.opacity = '0';
        setTimeout(() => {
            detailOverlay.remove();
        }, 500);
    });
    
    detailContent.appendChild(closeBtn);
    
    // Add post title
    const title = document.createElement('h2');
    title.textContent = postData.title;
    title.style.fontFamily = '"Cinzel", serif';
    title.style.color = '#2c3e50';
    title.style.marginTop = '0';
    title.style.borderBottom = '2px solid #eee';
    title.style.paddingBottom = '15px';
    detailContent.appendChild(title);
    
    // Add post date
    const date = document.createElement('div');
    date.textContent = `Published on: ${postData.date}`;
    date.style.fontFamily = '"Georgia", serif';
    date.style.fontStyle = 'italic';
    date.style.color = '#7f8c8d';
    date.style.marginBottom = '30px';
    detailContent.appendChild(date);
    
    // Add full content
    const content = document.createElement('div');
    content.innerHTML = `<p>${postData.content}</p>
        <p>Additional details about the topic would appear here. This expanded view allows for complete content presentation without truncation. Readers can fully immerse themselves in the subject matter and appreciate the depth of the discussion.</p>
        <p>Further elaboration and analysis would continue in this section. The complete text provides context and nuance that cannot be captured in the truncated preview shown in the main list view.</p>`;
    content.style.fontFamily = '"Georgia", serif';
    content.style.color = '#2c3e50';
    content.style.lineHeight = '1.8';
    content.style.fontSize = '1.1rem';
    detailContent.appendChild(content);
    
    // Add footer
    const footer = document.createElement('div');
    footer.style.marginTop = '40px';
    footer.style.paddingTop = '20px';
    footer.style.borderTop = '1px solid #eee';
    footer.style.fontFamily = '"Georgia", serif';
    footer.style.fontSize = '0.9rem';
    footer.style.color = '#7f8c8d';
    footer.textContent = '© 2025 Personal Blog. All rights reserved.';
    detailContent.appendChild(footer);
    
    // Show overlay with animation
    setTimeout(() => {
        detailOverlay.style.opacity = '1';
    }, 10);
}

/**
 * Displays detailed view for a favorite item
 * @param {Object} favoriteData - Favorite data object
 */
function showFavoriteDetail(favoriteData) {
    // Create detail overlay container
    const detailOverlay = document.createElement('div');
    detailOverlay.id = 'detail-overlay';
    detailOverlay.style.position = 'fixed';
    detailOverlay.style.top = '0';
    detailOverlay.style.left = '0';
    detailOverlay.style.width = '100%';
    detailOverlay.style.height = '100%';
    detailOverlay.style.zIndex = '2000';
    detailOverlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
    detailOverlay.style.display = 'flex';
    detailOverlay.style.justifyContent = 'center';
    detailOverlay.style.alignItems = 'center';
    detailOverlay.style.opacity = '0';
    detailOverlay.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(detailOverlay);
    
    // Create detail content container
    const detailContent = document.createElement('div');
    detailContent.style.position = 'relative';
    detailContent.style.width = '60%';
    detailContent.style.maxWidth = '600px';
    detailContent.style.padding = '40px';
    detailContent.style.background = 'linear-gradient(135deg, rgba(255,255,240,0.95), rgba(255,240,240,0.95))';
    detailContent.style.borderRadius = '15px';
    detailContent.style.boxShadow = '0 0 50px rgba(255,255,255,0.2)';
    detailContent.style.textAlign = 'center';
    detailOverlay.appendChild(detailContent);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '15px';
    closeBtn.style.right = '15px';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.background = 'rgba(231, 76, 60, 0.9)';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '1.2rem';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.transition = 'all 0.3s ease';
    closeBtn.dataset.cursor = 'precise_select';
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.transform = 'scale(1.1)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.transform = 'scale(1)';
    });
    
    closeBtn.addEventListener('click', () => {
        detailOverlay.style.opacity = '0';
        setTimeout(() => {
            detailOverlay.remove();
        }, 500);
    });
    
    detailContent.appendChild(closeBtn);
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = favoriteData.title;
    title.style.fontFamily = '"Cinzel", serif';
    title.style.color = '#8e44ad';
    title.style.marginTop = '0';
    detailContent.appendChild(title);
    
    // Add decorative separator
    const separator = document.createElement('div');
    separator.style.height = '2px';
    separator.style.width = '100px';
    separator.style.background = 'linear-gradient(to right, transparent, #8e44ad, transparent)';
    separator.style.margin = '20px auto';
    detailContent.appendChild(separator);
    
    // Add content
    const content = document.createElement('blockquote');
    content.textContent = favoriteData.content;
    content.style.fontFamily = '"Georgia", serif';
    content.style.fontSize = '1.3rem';
    content.style.color = '#2c3e50';
    content.style.lineHeight = '1.8';
    content.style.fontStyle = 'italic';
    content.style.padding = '20px';
    content.style.background = 'rgba(255,255,255,0.5)';
    content.style.borderRadius = '10px';
    content.style.position = 'relative';
    detailContent.appendChild(content);
    
    // Add decorative quote marks
    const openQuote = document.createElement('div');
    openQuote.textContent = '"';
    openQuote.style.position = 'absolute';
    openQuote.style.top = '-30px';
    openQuote.style.left = '20px';
    openQuote.style.fontSize = '6rem';
    openQuote.style.color = 'rgba(142, 68, 173, 0.2)';
    openQuote.style.fontFamily = '"Georgia", serif';
    openQuote.style.lineHeight = '1';
    content.appendChild(openQuote);
    
    const closeQuote = document.createElement('div');
    closeQuote.textContent = '"';
    closeQuote.style.position = 'absolute';
    closeQuote.style.bottom = '-70px';
    closeQuote.style.right = '20px';
    closeQuote.style.fontSize = '6rem';
    closeQuote.style.color = 'rgba(142, 68, 173, 0.2)';
    closeQuote.style.fontFamily = '"Georgia", serif';
    closeQuote.style.lineHeight = '1';
    content.appendChild(closeQuote);
    
    // Add author attribution
    const author = document.createElement('div');
    author.textContent = '- William Paul Thurston';
    author.style.marginTop = '30px';
    author.style.fontFamily = '"Georgia", serif';
    author.style.fontSize = '1.1rem';
    author.style.color = '#7f8c8d';
    author.style.fontStyle = 'italic';
    detailContent.appendChild(author);
    
    // Show overlay with animation
    setTimeout(() => {
        detailOverlay.style.opacity = '1';
    }, 10);
}

/**
 * Returns to main page with swirling animation
 * @param {HTMLElement} avatarElement - The avatar element clicked
 */
function returnToMainPage(avatarElement) {
    // Create swirl animation container
    const swirlContainer = document.createElement('div');
    swirlContainer.id = 'swirl-container';
    swirlContainer.style.position = 'fixed';
    swirlContainer.style.top = '0';
    swirlContainer.style.left = '0';
    swirlContainer.style.width = '100%';
    swirlContainer.style.height = '100%';
    swirlContainer.style.zIndex = '2000';
    swirlContainer.style.pointerEvents = 'none';
    document.body.appendChild(swirlContainer);

    // Calculate position of clicked avatar
    const avatarRect = avatarElement.getBoundingClientRect();
    const avatarCenter = {
        x: avatarRect.left + avatarRect.width / 2,
        y: avatarRect.top + avatarRect.height / 2
    };

    // Generate swirling layers
    const swirlLayers = [];
    for (let i = 0; i < 5; i++) {
        const swirl = document.createElement('div');
        swirl.style.position = 'absolute';
        swirl.style.width = '150px';
        swirl.style.height = '150px';
        swirl.style.borderRadius = '50%';
        
        // Apply distinct gradient patterns
        switch(i) {
            case 0:
                swirl.style.background = `
                    conic-gradient(
                        from 0deg,
                        rgba(0, 10, 20, 0.95) 0%,
                        rgba(0, 30, 60, 0.95) 20%,
                        rgba(5, 5, 15, 0.95) 30%,
                        rgba(0, 30, 60, 0.95) 40%,
                        rgba(5, 5, 15, 0.95) 50%,
                        rgba(0, 30, 60, 0.95) 60%,
                        rgba(5, 5, 15, 0.95) 70%,
                        rgba(0, 30, 60, 0.95) 80%,
                        rgba(5, 5, 15, 0.95) 90%,
                        rgba(0, 10, 20, 0.95) 100%
                    )
                `;
                break;
            case 1:
                swirl.style.background = `
                    radial-gradient(
                        circle,
                        rgba(0, 60, 120, 0.8) 0%,
                        rgba(0, 30, 90, 0.9) 50%,
                        rgba(0, 10, 40, 0.95) 100%
                    )
                `;
                break;
            case 2:
                swirl.style.background = `
                    repeating-radial-gradient(
                        circle at center,
                        rgba(0, 80, 150, 0.7) 0%,
                        rgba(0, 40, 100, 0.8) 10%,
                        rgba(0, 20, 60, 0.9) 20%
                    )
                `;
                break;
            case 3:
                swirl.style.background = `
                    conic-gradient(
                        from 180deg,
                        rgba(10, 0, 30, 0.8) 0%,
                        rgba(20, 0, 60, 0.85) 25%,
                        rgba(30, 0, 90, 0.9) 50%,
                        rgba(20, 0, 60, 0.85) 75%,
                        rgba(10, 0, 30, 0.8) 100%
                    )
                `;
                break;
            default:
                swirl.style.background = `
                    radial-gradient(
                        circle,
                        rgba(0, 0, 20, 0.9) 0%,
                        rgba(0, 0, 40, 0.8) 50%,
                        rgba(0, 0, 60, 0.7) 100%
                    )
                `;
        }
        
        // Position swirl elements at avatar's center
        swirl.style.left = `${avatarCenter.x - 75}px`;
        swirl.style.top = `${avatarCenter.y - 75}px`;
        swirl.style.transformOrigin = 'center center';
        swirl.style.boxShadow = `0 0 40px rgba(0,60,120,0.8)`;
        swirlContainer.appendChild(swirl);
        swirlLayers.push(swirl);
    }

    // Animation parameters
    let scale = 1;
    let opacity = 1;
    const rotations = [0, 180, 90, 270, 45];
    
    // Animation loop
    const swirlAnimation = setInterval(() => {
        scale += 0.18;
        opacity -= 0.012;
        
        // Update each layer
        swirlLayers.forEach((swirl, index) => {
            rotations[index] += (index + 1) * 15;
            swirl.style.transform = `scale(${scale * (1 + index * 0.15)}) rotate(${rotations[index]}deg)`;
            swirl.style.opacity = opacity * (1 - index * 0.08);
        });
        
        // End animation condition
        if (scale > 20) {
            clearInterval(swirlAnimation);
            
            // Clean up elements
            swirlContainer.remove();
            
            const blogPage = document.getElementById('blog-page');
            if (blogPage) blogPage.remove();
            
            const flameOverlay = document.getElementById('flame-overlay');
            if (flameOverlay) flameOverlay.remove();
            
            // Show clock toggle
            const clockToggle = document.querySelector('.clock-toggle');
            if (clockToggle) clockToggle.style.display = 'block';
        }
    }, 10);
}
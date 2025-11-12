/* Neko Name Wheel - Complete JavaScript */

// Global State
let names = [];
let isSpinning = false;
let soundEnabled = true;
let rotation = 0;
let lastWinningColor = null; // Store the color of the last winning segment

// DOM Elements
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('nameInput');
const spinButton = document.getElementById('spinButton');
const shareContainer = document.getElementById('shareContainer');
const shareButton = document.getElementById('shareButton');
const shareDropdown = document.getElementById('shareDropdown');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const emailShareBtn = document.getElementById('emailShareBtn');
const facebookShareBtn = document.getElementById('facebookShareBtn');
const redditShareBtn = document.getElementById('redditShareBtn');
const twitterShareBtn = document.getElementById('twitterShareBtn');
const clearButton = document.getElementById('clearButton');
const soundToggle = document.getElementById('soundToggle');
const nameCount = document.getElementById('nameCount');
const nekoCat = document.getElementById('nekoCat');
const winnerModal = document.getElementById('winnerModal');
const winnerText = document.getElementById('winnerText');
const closeModal = document.getElementById('closeModal');
const copyToast = document.getElementById('copyToast');
const wheelPointer = document.querySelector('.wheel-pointer');
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;

// Sound Effects - Multiple instances for rapid successive plays
const sounds = {
    chime: [
        new Audio('sounds/chimewheel.mp3'),
        new Audio('sounds/chimewheel.mp3'),
        new Audio('sounds/chimewheel.mp3')
    ],
    applause: [
        new Audio('sounds/applause.mp3'),
        new Audio('sounds/applause.mp3'),
        new Audio('sounds/applause.mp3')
    ],
    intro: [
        new Audio('sounds/nekointro.mp3')
    ]
};

// Track which instance to use next for each sound
const soundIndexes = { chime: 0, applause: 0, intro: 0 };

// Preload sounds with enhanced reliability
Object.keys(sounds).forEach(soundName => {
    sounds[soundName].forEach((sound, index) => {
        sound.preload = 'auto';
        sound.volume = 0.7;
        sound.loop = false;
        
        // Force load immediately
        sound.load();
        
        // Handle any loading errors gracefully
        sound.addEventListener('error', (e) => {
            console.warn(`Audio file could not be loaded: ${soundName} instance ${index + 1}`, e);
        });
    });
});

// Audio preparation function for maximum reliability
let audioPrepared = false;
function prepareAudio() {
    if (audioPrepared) return;
    
    try {
        // Force audio preparation on user interaction
        Object.keys(sounds).forEach(soundName => {
            sounds[soundName].forEach(sound => {
                // Force load if not already loaded
                if (sound.readyState < 3) {
                    sound.load();
                }
                
                // Play and immediately pause to prepare audio context
                const preparationPromise = sound.play();
                if (preparationPromise !== undefined) {
                    preparationPromise
                        .then(() => {
                            sound.pause();
                            sound.currentTime = 0;
                        })
                        .catch(() => {
                            // Silent fail - audio will still work when needed
                        });
                }
            });
        });
        audioPrepared = true;
        console.log('Audio preparation completed');
    } catch (e) {
        console.log('Audio preparation failed, but continuing');
    }
}

// Welcome intro sound - Neko purr and meow
let introPlayed = false;
function playIntroSound() {
    // CRITICAL: Respect user's sound preference
    if (!soundEnabled) return; // Don't play if sound is toggled off
    if (introPlayed) return; // Only play once per page load
    
    const introAudio = sounds.intro[0];
    
    // Strategy: Start muted, attempt fade-in, fallback to user interaction
    introAudio.volume = 0; // Start completely muted
    introAudio.muted = true; // Extra insurance for browsers
    
    // Try to start playing while muted (usually allowed)
    const playPromise = introAudio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                // Playing successfully while muted - now try to unmute and fade in
                introAudio.muted = false;
                
                // Fade volume from 0 to 0.6 over 1 second
                let currentVolume = 0;
                const targetVolume = 0.6;
                const fadeSteps = 20; // 20 steps over 1 second = 50ms per step
                const volumeIncrement = targetVolume / fadeSteps;
                
                const fadeInterval = setInterval(() => {
                    currentVolume += volumeIncrement;
                    if (currentVolume >= targetVolume) {
                        introAudio.volume = targetVolume;
                        clearInterval(fadeInterval);
                        introPlayed = true;
                        console.log('🐱 Welcome! Neko says hello!');
                    } else {
                        introAudio.volume = currentVolume;
                    }
                }, 50); // Update every 50ms
            })
            .catch((error) => {
                // Even muted autoplay blocked - show fallback prompt and wait for interaction
                console.log('Autoplay blocked, showing user prompt');
                showAudioPrompt();
            });
    } else {
        // Browser doesn't support promises on play()
        showAudioPrompt();
    }
}

function showAudioPrompt() {
    // Create a subtle, cute prompt for user to enable sound
    const prompt = document.createElement('div');
    prompt.id = 'audioPrompt';
    prompt.innerHTML = '🐱 Click anywhere to hear Neko\'s welcome!';
    prompt.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #F4B5B0 0%, #FF9A9E 100%);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(244, 181, 176, 0.4);
        cursor: pointer;
        z-index: 10000;
        animation: bounce 1s ease-in-out infinite;
        font-size: 16px;
    `;
    
    // Add bounce animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-5px); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(prompt);
    
    // Play intro sound on any interaction and remove prompt
    const playOnInteraction = () => {
        if (!introPlayed) {
            const introAudio = sounds.intro[0];
            introAudio.volume = 0.6;
            introAudio.muted = false;
            introAudio.currentTime = 0;
            introAudio.play()
                .then(() => {
                    introPlayed = true;
                    console.log('🐱 Welcome! Neko says hello!');
                    // Fade out and remove prompt
                    prompt.style.transition = 'opacity 0.5s';
                    prompt.style.opacity = '0';
                    setTimeout(() => prompt.remove(), 500);
                })
                .catch(() => {
                    // User might have sound disabled entirely
                    prompt.remove();
                });
        }
    };
    
    // Remove on any interaction
    prompt.addEventListener('click', playOnInteraction);
    document.addEventListener('click', playOnInteraction, { once: true });
    document.addEventListener('keydown', playOnInteraction, { once: true });
    document.addEventListener('touchstart', playOnInteraction, { once: true });
}


// Color Palette for Wheel
const wheelColors = [
    '#F4B5B0', '#E6D5F5', '#C8F4E6', '#FAC59D', 
    '#FFF4B8', '#D4E5F7', '#FFE9D1', '#F5C6CB',
    '#DDC3E3', '#D3EADA', '#FFA5C5', '#CED1F8', '#FFDAB4'
];

// Helper function to determine which segment is under the pointer
function getSegmentUnderPointer(currentRotation, segmentCount) {
    if (segmentCount === 0) return -1;
    
    // Pointer is at top (270 degrees = 3π/2 radians)
    const pointerAngle = 3 * Math.PI / 2;
    
    // Normalize rotation to [0, 2π)
    const normalizedRotation = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // Calculate angle per segment
    const anglePerSegment = (2 * Math.PI) / segmentCount;
    
    // The first segment starts at rotation angle (index 0)
    // We need to find which segment the pointer intersects
    // Pointer angle - current rotation gives us the relative pointer position
    let relativePointerAngle = pointerAngle - normalizedRotation;
    
    // Normalize to [0, 2π)
    relativePointerAngle = ((relativePointerAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // Calculate which segment this falls into
    const segmentIndex = Math.floor(relativePointerAngle / anglePerSegment);
    
    return segmentIndex % segmentCount;
}

// Function to update pointer color based on current segment
function updatePointerColor() {
    if (!isSpinning || !spinningNames || spinningNames.length === 0) {
        // If we have a stored winning color, use that; otherwise reset to original gradient
        if (lastWinningColor) {
            // Keep the winning segment's color
            wheelPointer.style.background = `linear-gradient(135deg, ${lastWinningColor} 0%, ${lastWinningColor} 100%)`;
            wheelPointer.style.webkitBackgroundClip = 'text';
            wheelPointer.style.webkitTextFillColor = 'transparent';
            wheelPointer.style.backgroundClip = 'text';
        } else {
            // Reset to original gradient when no winning color stored
            wheelPointer.style.background = 'linear-gradient(135deg, var(--color-pink) 0%, var(--color-peach) 100%)';
            wheelPointer.style.webkitBackgroundClip = 'text';
            wheelPointer.style.webkitTextFillColor = 'transparent';
            wheelPointer.style.backgroundClip = 'text';
        }
        return;
    }
    
    // Use the helper function to get the correct segment
    const segmentIndex = getSegmentUnderPointer(rotation, spinningNames.length);
    
    // Get the color for this segment
    const segmentColor = wheelColors[segmentIndex % wheelColors.length];
    
    // Apply gradient using the segment color (maintains pointer shape)
    wheelPointer.style.background = `linear-gradient(135deg, ${segmentColor} 0%, ${segmentColor} 100%)`;
    wheelPointer.style.webkitBackgroundClip = 'text';
    wheelPointer.style.webkitTextFillColor = 'transparent';
    wheelPointer.style.backgroundClip = 'text';
}

// Initialization
function init() {
    soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    updateSoundButton();
    
    const savedNames = localStorage.getItem('savedNames');
    if (savedNames) {
        nameInput.value = savedNames;
        updateNames();
    }
    
    loadFromURL();
    
    if (names.length === 0) {
        nameInput.value = 'Alice\nBob\nCharlie\nDiana';
        updateNames();
    }
    
    // Set initial pointer color
    updatePointerColor();
    
    // Play welcome intro sound (Neko purr and meow)
    playIntroSound();
    
    nameInput.addEventListener('input', handleNameInput);
    spinButton.addEventListener('click', handleSpin);
    canvas.addEventListener('click', handleSpin);
    soundToggle.addEventListener('click', toggleSound);
    shareButton.addEventListener('click', toggleShareDropdown);
    copyLinkBtn.addEventListener('click', handleCopyLink);
    emailShareBtn.addEventListener('click', handleEmailShare);
    facebookShareBtn.addEventListener('click', handleFacebookShare);
    redditShareBtn.addEventListener('click', handleRedditShare);
    twitterShareBtn.addEventListener('click', handleTwitterShare);
    clearButton.addEventListener('click', handleClear);
    closeModal.addEventListener('click', hideModal);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!shareContainer.contains(e.target)) {
            closeShareDropdown();
        }
    });
    
    // Add remove winner button listener
    const removeButton = document.getElementById('removeWinner');
    if (removeButton) {
        removeButton.addEventListener('click', removeWinner);
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey && !isSpinning) {
            handleSpin();
        }
        if (e.key === 'Escape' && winnerModal.classList.contains('show')) {
            hideModal();
        }
        if (e.key === 'Escape') {
            closeShareDropdown();
        }
    });
    
    drawWheel();
}

// Name Management
function handleNameInput() {
    updateNames();
    saveNames();
    drawWheel();
}

function updateNames() {
    const input = nameInput.value.trim();
    names = input
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    updateNameCount();
    updateShareButton();
}

function updateNameCount() {
    const count = names.length;
    nameCount.textContent = `${count} name${count !== 1 ? 's' : ''}`;
    
    if (count < 3 || count > 50) {
        spinButton.disabled = true;
        spinButton.innerHTML = count < 3 
            ? '<span class="button-text">Add at least 3 names</span>'
            : '<span class="button-text">Maximum 50 names</span>';
    } else {
        spinButton.disabled = false;
        spinButton.innerHTML = '<span class="button-text">Spin Wheel</span>';
    }
}

function saveNames() {
    localStorage.setItem('savedNames', nameInput.value);
}

function updateShareButton() {
    shareContainer.style.display = names.length >= 3 ? 'inline-block' : 'none';
}

function handleClear() {
    if (confirm('Clear all names? This cannot be undone.')) {
        nameInput.value = '';
        updateNames();
        saveNames();
        drawWheel();
    }
}

// Wheel Drawing with text that fits perfectly
function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use spinningNames during spin, otherwise use names
    const wheelNames = (isSpinning && spinningNames && spinningNames.length >= 3) ? spinningNames : names;

    if (wheelNames.length === 0) {
        drawEmptyWheel(centerX, centerY, radius);
        return;
    }

    const anglePerSegment = (2 * Math.PI) / wheelNames.length;

    wheelNames.forEach((name, index) => {
        const startAngle = rotation + (index * anglePerSegment);
        const endAngle = startAngle + anglePerSegment;

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = wheelColors[index % wheelColors.length];
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw text - FITS PERFECTLY IN SEGMENT
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSegment / 2);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#000';

        // Calculate maximum text width based on radial distance available
        // Text runs from near center to near edge
        const innerRadius = radius * 0.30; // Start text with breathing room from center
        const outerRadius = radius * 0.92; // End text very close to edge (just a few mm margin)
        const maxTextWidth = outerRadius - innerRadius; // Available straight-line distance
        
        // Target 98% of available width to maximize text extension
        const targetWidth = maxTextWidth * 0.98;
        
        // Start with a large font size and scale down to fit precisely
        let fontSize = 90;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        let textWidth = ctx.measureText(name).width;
        
        // Scale down until text fits within the safe target width
        while (textWidth > targetWidth && fontSize > 16) {
            fontSize -= 1;
            ctx.font = `bold ${fontSize}px Arial, sans-serif`;
            textWidth = ctx.measureText(name).width;
        }
        
        // Add text shadow for visibility
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 4;

        // If still too wide after minimum font, truncate with ellipsis
        let displayName = name;
        if (textWidth > targetWidth && fontSize <= 16) {
            while (textWidth > targetWidth && displayName.length > 3) {
                displayName = displayName.substring(0, displayName.length - 1);
                textWidth = ctx.measureText(displayName + '...').width;
            }
            displayName = displayName + '...';
        }

        // Position text to start from where we calculated (inner radius)
        const textRadius = innerRadius; // Start at the calculated inner radius
        
        ctx.fillText(displayName, textRadius, fontSize / 3);
        ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#FAC59D';
    ctx.lineWidth = 4;
    ctx.stroke();
}

function drawEmptyWheel(centerX, centerY, radius) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#f5f5f5';
    ctx.fill();
    ctx.strokeStyle = '#FAC59D';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = '#999';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add names to spin', centerX, centerY);
}

// Winner locking for 100% accurate modal
let spinningNames = null;
let spinningWinnerIndex = null;

function handleSpin() {
    if (isSpinning || names.length < 3 || names.length > 50) return;

    // Reset the stored winning color for new spin
    lastWinningColor = null;

    isSpinning = true;
    spinButton.disabled = true;
    canvas.classList.add('spinning');
    nekoCat.classList.add('waving');
    
    // Prepare audio on user interaction
    prepareAudio();
    
    playSound('chime');

    // Lock the names for this spin
    spinningNames = names.slice();
    
    // Randomly choose a winner index
    spinningWinnerIndex = Math.floor(Math.random() * spinningNames.length);
    
    // Calculate the target rotation to land the chosen winner under the pointer
    const anglePerSegment = (2 * Math.PI) / spinningNames.length;
    
    // The winner segment should be positioned so the pointer intersects it
    // We want the center of the winner segment under the pointer (top position)
    const pointerAngle = 3 * Math.PI / 2; // Top (270 degrees)
    
    // The winner segment's center should be at: rotation + (winnerIndex * anglePerSegment) + anglePerSegment/2
    // We want this to equal the pointer angle after rotation
    // So: finalRotation + (winnerIndex * anglePerSegment) + anglePerSegment/2 = pointerAngle + 2πn
    
    // Current rotation normalized
    const currentRotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // Target angle for winner segment center
    const winnerSegmentCenter = spinningWinnerIndex * anglePerSegment + anglePerSegment / 2;
    
    // How much to adjust rotation so winner center aligns with pointer
    let rotationAdjustment = pointerAngle - winnerSegmentCenter;
    
    // Normalize adjustment
    rotationAdjustment = ((rotationAdjustment % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // Add multiple full spins for visual effect
    const minSpins = 5;
    const randomSpins = Math.random() * 3;
    const totalSpins = (minSpins + randomSpins) * 2 * Math.PI;
    
    // Final target rotation
    const targetRotation = currentRotation + totalSpins + rotationAdjustment;
    
    const duration = 8000; // Extended from 7000ms to 8000ms (8 seconds)
    animateSpin(targetRotation, duration);
}

function animateSpin(targetAngle, duration) {
    const startTime = Date.now();
    const startRotation = rotation;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Simple quartic ease-out - slower at end naturally
        const eased = 1 - Math.pow(1 - progress, 5); // Changed from 4 to 5 for extra slowness
        rotation = startRotation + (targetAngle - startRotation) * eased;
        
        // Update pointer color to match current segment
        updatePointerColor();
        
        drawWheel();
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            finishSpin();
        }
    }
    animate();
}

function finishSpin() {
    isSpinning = false;
    spinButton.disabled = false;
    canvas.classList.remove('spinning');
    nekoCat.classList.remove('waving');
    // Normalize rotation to [0, 2π) - this is needed for consistent positioning
    rotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // Store the winning segment's color before updating pointer
    if (spinningNames && spinningNames.length > 0) {
        const winningSegmentIndex = getSegmentUnderPointer(rotation, spinningNames.length);
        lastWinningColor = wheelColors[winningSegmentIndex % wheelColors.length];
    }
    
    // Update pointer color (will now use the stored winning color)
    updatePointerColor();
    
    playSound('applause');
    
    // Show winner modal after a brief moment (optimal UX timing)
    setTimeout(() => {
        // Use the helper function to determine the actual winner under the pointer
        if (spinningNames && spinningNames.length > 0) {
            const actualWinnerIndex = getSegmentUnderPointer(rotation, spinningNames.length);
            const actualWinner = spinningNames[actualWinnerIndex];
            showWinner(actualWinner);
        } else {
            showWinner('');
        }
        
        spinningNames = null;
        spinningWinnerIndex = null;
    }, 400); // 400ms - quick but natural feeling delay
}

// Confetti System
let confettiParticles = [];
let confettiAnimationId = null;

class ConfettiParticle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = -Math.random() * confettiCanvas.height; // Distribute particles throughout the fall zone
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: Math.random() * 3 + 2
        };
        this.size = Math.random() * 8 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 5;
        this.color = this.getRandomColor();
        this.shape = Math.floor(Math.random() * 4); // 0: square, 1: circle, 2: triangle, 3: diamond
    }
    
    getRandomColor() {
        const colors = ['#FF6B9D', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F8C471', '#85C1E9'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
        this.velocity.y += 0.1; // gravity
        
        // Reset if off screen
        if (this.y > confettiCanvas.height + 10) {
            this.reset();
        }
    }
    
    draw() {
        confettiCtx.save();
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate(this.rotation * Math.PI / 180);
        confettiCtx.fillStyle = this.color;
        
        switch(this.shape) {
            case 0: // Square
                confettiCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
                break;
            case 1: // Circle
                confettiCtx.beginPath();
                confettiCtx.arc(0, 0, this.size/2, 0, Math.PI * 2);
                confettiCtx.fill();
                break;
            case 2: // Triangle
                confettiCtx.beginPath();
                confettiCtx.moveTo(0, -this.size/2);
                confettiCtx.lineTo(-this.size/2, this.size/2);
                confettiCtx.lineTo(this.size/2, this.size/2);
                confettiCtx.closePath();
                confettiCtx.fill();
                break;
            case 3: // Diamond
                confettiCtx.beginPath();
                confettiCtx.moveTo(0, -this.size/2);
                confettiCtx.lineTo(this.size/2, 0);
                confettiCtx.lineTo(0, this.size/2);
                confettiCtx.lineTo(-this.size/2, 0);
                confettiCtx.closePath();
                confettiCtx.fill();
                break;
        }
        
        confettiCtx.restore();
    }
}

function initConfetti() {
    confettiParticles = [];
    for (let i = 0; i < 50; i++) {
        confettiParticles.push(new ConfettiParticle());
    }
}

function animateConfetti() {
    if (!confettiCtx || !confettiCanvas) return;
    
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    confettiParticles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    confettiAnimationId = requestAnimationFrame(animateConfetti);
}

function startConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    
    // Set canvas size to match full screen
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    initConfetti();
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
    }
    animateConfetti();
}

function stopConfetti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    if (confettiCtx && confettiCanvas) {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

// Winner Modal with Remove option
let currentWinner = '';

function showWinner(winner) {
    currentWinner = winner;
    winnerText.textContent = winner;
    winnerModal.classList.add('show');
    
    // Start confetti animation
    startConfetti();
    
    setTimeout(() => {
        if (winnerModal.classList.contains('show')) {
            hideModal();
        }
    }, 60000);
}

function hideModal() {
    winnerModal.classList.remove('show');
    stopConfetti();
}

function removeWinner() {
    if (!currentWinner) return;
    
    // Remove winner from names array
    const lines = nameInput.value.split('\n');
    const filteredLines = lines.filter(line => line.trim() !== currentWinner);
    nameInput.value = filteredLines.join('\n');
    
    updateNames();
    saveNames();
    drawWheel();
    hideModal();
    
    currentWinner = '';
}

// Sound Management
function playSound(soundName) {
    if (!soundEnabled) return;
    
    try {
        const soundArray = sounds[soundName];
        if (!soundArray || soundArray.length === 0) return;
        
        // Get current instance
        const currentIndex = soundIndexes[soundName];
        const sound = soundArray[currentIndex];
        
        // Move to next instance immediately for next call
        soundIndexes[soundName] = (currentIndex + 1) % soundArray.length;
        
        // Clone the audio for maximum reliability
        const audioClone = sound.cloneNode();
        audioClone.volume = sound.volume;
        
        // Simple, direct play with fallback
        const playPromise = audioClone.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Success - no action needed
                })
                .catch((error) => {
                    // Fallback: try original instance
                    console.log(`Clone failed for ${soundName}, trying original`);
                    try {
                        sound.currentTime = 0;
                        sound.play().catch(() => {
                            // Final fallback: try next instance
                            const nextIndex = soundIndexes[soundName];
                            const nextSound = soundArray[nextIndex];
                            nextSound.currentTime = 0;
                            nextSound.play().catch(() => {
                                console.warn(`All audio instances failed for ${soundName}`);
                            });
                        });
                    } catch (e) {
                        console.warn(`Fallback failed for ${soundName}`);
                    }
                });
        }
    } catch (err) {
        console.error(`Sound error for ${soundName}:`, err);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundButton();
}

function updateSoundButton() {
    soundToggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
}

// Enhanced Share Feature with Social Sharing
function toggleShareDropdown() {
    shareContainer.classList.toggle('active');
}

function closeShareDropdown() {
    shareContainer.classList.remove('active');
}

function generateShareUrl() {
    if (names.length < 3) return null;
    
    try {
        const namesString = names.join('\n');
        const encoded = btoa(unescape(encodeURIComponent(namesString)));
        return `${window.location.origin}${window.location.pathname}?names=${encoded}`;
    } catch (err) {
        console.error('Failed to create share URL:', err);
        return null;
    }
}

function generateShareText() {
    const nameList = names.length > 5 ? 
        `${names.slice(0, 3).join(', ')}, and ${names.length - 3} others` : 
        names.join(', ');
    
    return `🎯 Help me pick a winner from: ${nameList}! Use this awesome name picker and random spin wheel with lucky cat charm ✨`;
}

function handleCopyLink() {
    const url = generateShareUrl();
    if (!url) {
        alert('Please add at least 3 names first.');
        return;
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showToast();
            closeShareDropdown();
        }).catch(() => {
            fallbackCopy(url);
        });
    } else {
        fallbackCopy(url);
    }
}

function handleEmailShare() {
    const url = generateShareUrl();
    if (!url) {
        alert('Please add at least 3 names first.');
        return;
    }
    
    const subject = encodeURIComponent('🎯 Help Me Pick a Winner - Name Picker Wheel');
    const body = encodeURIComponent(`${generateShareText()}\n\nTry it here: ${url}\n\nThis free name picker and random spin wheel is perfect for making fair decisions!`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    closeShareDropdown();
}

function handleFacebookShare() {
    const url = generateShareUrl();
    if (!url) {
        alert('Please add at least 3 names first.');
        return;
    }
    
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(generateShareText())}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    closeShareDropdown();
}

function handleRedditShare() {
    const url = generateShareUrl();
    if (!url) {
        alert('Please add at least 3 names first.');
        return;
    }
    
    const title = encodeURIComponent('🎯 Help Me Pick a Winner with this Lucky Cat Name Picker!');
    const shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${title}`;
    
    window.open(shareUrl, '_blank', 'width=700,height=500,scrollbars=yes,resizable=yes');
    closeShareDropdown();
}

function handleTwitterShare() {
    const url = generateShareUrl();
    if (!url) {
        alert('Please add at least 3 names first.');
        return;
    }
    
    const text = encodeURIComponent(`${generateShareText()} 🐱`);
    const hashtags = encodeURIComponent('NamePicker,RandomWheel,WheelDecide,PickerWheel');
    // Note: Still using twitter.com API endpoint as X hasn't changed their sharing URLs yet
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    closeShareDropdown();
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast();
        closeShareDropdown();
    } catch (err) {
        alert('Please copy manually: ' + text);
    }
    
    document.body.removeChild(textarea);
}

function showToast() {
    copyToast.classList.add('show');
    setTimeout(() => {
        copyToast.classList.remove('show');
    }, 3000);
}

function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedNames = urlParams.get('names');
    
    if (encodedNames) {
        try {
            const decoded = decodeURIComponent(escape(atob(encodedNames)));
            nameInput.value = decoded;
            updateNames();
        } catch (err) {
            console.error('Failed to load from URL');
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.offsetWidth - 40, 500);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
}

window.addEventListener('resize', () => {
    resizeCanvas();
    drawWheel();
    // Resize confetti canvas if it exists and modal is showing
    if (confettiCanvas && winnerModal.classList.contains('show')) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
});

resizeCanvas();

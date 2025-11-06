/* Neko Name Wheel - Complete JavaScript */

// Global State
let names = [];
let isSpinning = false;
let soundEnabled = true;
let rotation = 0;

// DOM Elements
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('nameInput');
const spinButton = document.getElementById('spinButton');
const shareButton = document.getElementById('shareButton');
const soundToggle = document.getElementById('soundToggle');
const nameCount = document.getElementById('nameCount');
const nekoCat = document.getElementById('nekoCat');
const winnerModal = document.getElementById('winnerModal');
const winnerText = document.getElementById('winnerText');
const closeModal = document.getElementById('closeModal');
const copyToast = document.getElementById('copyToast');

// Sound Effects
const sounds = {
    chime: new Audio('sounds/chimewheel.mp3'),
    applause: new Audio('sounds/applause.mp3')
};

// Preload sounds
Object.values(sounds).forEach(sound => {
    sound.preload = 'auto';
    sound.volume = 0.7;
});

// Color Palette for Wheel
const wheelColors = [
    '#F4B5B0', '#E6D5F5', '#C8F4E6', '#FAC59D', 
    '#FFF4B8', '#D4E5F7', '#FFE9D1', '#F5C6CB'
];

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
    
    nameInput.addEventListener('input', handleNameInput);
    spinButton.addEventListener('click', handleSpin);
    canvas.addEventListener('click', handleSpin);
    soundToggle.addEventListener('click', toggleSound);
    shareButton.addEventListener('click', handleShare);
    closeModal.addEventListener('click', hideModal);
    
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
    shareButton.style.display = names.length >= 3 ? 'inline-block' : 'none';
}

// Wheel Drawing with text that fits perfectly
function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (names.length === 0) {
        drawEmptyWheel(centerX, centerY, radius);
        return;
    }
    
    const anglePerSegment = (2 * Math.PI) / names.length;
    
    names.forEach((name, index) => {
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
        
        // Dynamic font size
        let fontSize = 28;
        if (names.length > 10) fontSize = 24;
        if (names.length > 20) fontSize = 20;
        if (names.length > 30) fontSize = 18;
        
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 4;
        
        // Smart text fitting - measure and scale
        let displayName = name;
        const maxWidth = radius * 0.35; // Maximum text width
        let textWidth = ctx.measureText(displayName).width;
        
        // If text is too wide, shrink font or truncate
        if (textWidth > maxWidth) {
            // Try smaller font first
            let scaledFontSize = fontSize;
            while (textWidth > maxWidth && scaledFontSize > 12) {
                scaledFontSize -= 2;
                ctx.font = `bold ${scaledFontSize}px Arial, sans-serif`;
                textWidth = ctx.measureText(displayName).width;
            }
            
            // If still too wide, truncate
            if (textWidth > maxWidth) {
                while (textWidth > maxWidth && displayName.length > 3) {
                    displayName = displayName.substring(0, displayName.length - 1);
                    textWidth = ctx.measureText(displayName + '...').width;
                }
                displayName = displayName + '...';
            }
        }
        
        const textRadius = radius * 0.6;
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

// FIXED: Correct winner calculation
function handleSpin() {
    if (isSpinning || names.length < 3 || names.length > 50) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    canvas.classList.add('spinning');
    nekoCat.classList.add('waving');
    
    playSound('chime');
    
    const spinsMin = 5;
    const spinsMax = 8;
    const totalSpins = spinsMin + Math.random() * (spinsMax - spinsMin);
    const duration = 3500;
    
    // Select random winner
    const winnerIndex = Math.floor(Math.random() * names.length);
    
    // CORRECTED MATH: Calculate rotation to land winner at top pointer
    const anglePerSegment = (2 * Math.PI) / names.length;
    const pointerAngle = -Math.PI / 2; // Top of wheel (12 o'clock = -90 degrees)
    
    // Current angle of winner segment
    const currentWinnerAngle = winnerIndex * anglePerSegment;
    
    // How much to rotate to align winner with pointer
    const targetRotation = (2 * Math.PI * totalSpins) - currentWinnerAngle + pointerAngle;
    
    animateSpin(targetRotation, duration, winnerIndex);
}

function animateSpin(targetAngle, duration, winnerIndex) {
    const startTime = Date.now();
    const startRotation = rotation;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = 1 - Math.pow(1 - progress, 3);
        
        rotation = startRotation + (targetAngle * eased);
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            finishSpin(winnerIndex);
        }
    }
    
    animate();
}

function finishSpin(winnerIndex) {
    isSpinning = false;
    spinButton.disabled = false;
    canvas.classList.remove('spinning');
    nekoCat.classList.remove('waving');
    
    rotation = rotation % (2 * Math.PI);
    
    playSound('applause');
    showWinner(names[winnerIndex]);
}

// Winner Modal with Remove option
let currentWinner = '';

function showWinner(winner) {
    currentWinner = winner;
    winnerText.textContent = winner;
    winnerModal.classList.add('show');
    
    setTimeout(() => {
        if (winnerModal.classList.contains('show')) {
            hideModal();
        }
    }, 5000);
}

function hideModal() {
    winnerModal.classList.remove('show');
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
        const sound = sounds[soundName];
        sound.currentTime = 0;
        
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                setTimeout(() => sound.play().catch(() => {}), 100);
            });
        }
    } catch (err) {
        console.error('Sound error:', err);
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

// Share Feature
function handleShare() {
    if (names.length < 3) return;
    
    try {
        const namesString = names.join('\n');
        const encoded = btoa(unescape(encodeURIComponent(namesString)));
        const url = `${window.location.origin}${window.location.pathname}?names=${encoded}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                showToast();
            }).catch(() => {
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }
    } catch (err) {
        alert('Failed to create share link.');
    }
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
});

resizeCanvas();
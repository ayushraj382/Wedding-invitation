// script.js — Client-side dynamic data loader, YouTube audio controller, and animation system

let ytPlayer = null;
let isAudioPlaying = false;
let hasLoaderFinished = false;

// YouTube IFrame API Callback
window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('yt-player', {
    height: '1',
    width: '1',
    videoId: 'rW4axKNu2Xw',
    playerVars: {
      autoplay: 1,
      controls: 0,
      loop: 1,
      playlist: 'rW4axKNu2Xw',
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin
    },
    events: {
      onReady: () => {
        if (hasLoaderFinished) {
          startMusic();
        }
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING) {
          isAudioPlaying = true;
          updateMusicButtonUI(true);
        } else if (event.data === YT.PlayerState.PAUSED) {
          isAudioPlaying = false;
          updateMusicButtonUI(false);
        } else if (event.data === YT.PlayerState.ENDED) {
          if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
            ytPlayer.playVideo();
          }
        }
      }
    }
  });
};

function sendYTCommand(command, args = []) {
  const iframe = document.getElementById('yt-player');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func: command,
      args: args
    }), '*');
  }
}

function startMusic() {
  isAudioPlaying = true;
  updateMusicButtonUI(true);

  sendYTCommand('unMute');
  sendYTCommand('setVolume', [80]);
  sendYTCommand('playVideo');

  if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
    try {
      ytPlayer.unMute();
      ytPlayer.setVolume(80);
      ytPlayer.playVideo();
    } catch (err) {
      console.warn('YT API play notice:', err);
    }
  }
}

function pauseMusic() {
  isAudioPlaying = false;
  updateMusicButtonUI(false);

  sendYTCommand('pauseVideo');

  if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
    try {
      ytPlayer.pauseVideo();
    } catch (err) {
      console.warn('YT API pause notice:', err);
    }
  }
}

function updateMusicButtonUI(playing) {
  const musicBtn = document.getElementById('music-toggle');
  if (!musicBtn) return;
  if (playing) {
    musicBtn.classList.remove('paused');
    musicBtn.classList.add('playing');
    musicBtn.setAttribute('aria-label', 'Pause background music');
    musicBtn.setAttribute('title', 'Pause Music');
  } else {
    musicBtn.classList.remove('playing');
    musicBtn.classList.add('paused');
    musicBtn.setAttribute('aria-label', 'Play background music');
    musicBtn.setAttribute('title', 'Play Music');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Failed to load data.json');
    const data = await response.json();

    // Extract dynamic names supporting multiple schema variations
    const groomName = data.groom || data.couple?.groom || "Ayush";
    const brideName = data.bride || data.couple?.bride || "Megha";
    const initials = `${groomName.charAt(0)} & ${brideName.charAt(0)}`;

    // Populate Hero Names
    const heroBrideEl = document.getElementById('hero-bride');
    const heroGroomEl = document.getElementById('hero-groom');
    if (heroBrideEl) heroBrideEl.textContent = brideName;
    if (heroGroomEl) heroGroomEl.textContent = groomName;

    // Populate Envelope Letter & Monogram Overlay
    const letterNames = document.getElementById('letter-couple-names');
    const sealInitials = document.getElementById('seal-initials');
    if (letterNames) letterNames.textContent = `${groomName} & ${brideName}`;
    if (sealInitials) sealInitials.textContent = initials;

    // Populate Closing Names
    const closingNames = document.getElementById('closing-names');
    if (closingNames) closingNames.textContent = `${brideName} & ${groomName}`;

    // Music Toggle Listener
    const musicBtn = document.getElementById('music-toggle');
    if (musicBtn) {
      musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAudioPlaying) {
          pauseMusic();
        } else {
          startMusic();
        }
      });
    }

    // Modern browser autoplay gesture trigger
    const triggerAudioOnFirstInteraction = () => {
      if (hasLoaderFinished && !isAudioPlaying && ytPlayer) {
        startMusic();
      }
    };
    document.addEventListener('click', triggerAudioOnFirstInteraction, { once: true });
    document.addEventListener('touchstart', triggerAudioOnFirstInteraction, { once: true });

    // Initialize Components
    initScratchCard(data);
    initCountdownTimer(data);
    initEventsAndLocation(data);
    initClosingSignoff();
    initEnvelopeLoader(data);

  } catch (error) {
    console.error('Error initializing wedding invitation:', error);
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  }
});

// ===== SCRATCH TO REVEAL CARD CONTROLLER (HIGH-DPI / RETINA OPTIMIZED) =====
function initScratchCard(data) {
  const stage = document.getElementById('scratch-stage');
  const canvas = document.getElementById('scratch-canvas');
  const dateText = document.getElementById('scratch-date-text');
  if (!stage || !canvas) return;

  if (data && data.date && dateText) {
    dateText.textContent = data.date;
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let isScratching = false;
  let isRevealed = false;
  let lastX = 0;
  let lastY = 0;

  const overlayImg = new Image();
  overlayImg.src = 'assets/images/scratch to reveal.png';

  let initialOpaquePixels = 0;

  function resizeCanvas() {
    if (isRevealed) return;
    const rect = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    drawOverlay();
  }

  function drawOverlay() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (overlayImg.complete && overlayImg.naturalWidth > 0) {
      ctx.drawImage(overlayImg, 0, 0, w, h);
    } else {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#E8C266');
      grad.addColorStop(0.5, '#D99A16');
      grad.addColorStop(1, '#9E6A05');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
    calculateInitialOpaque();
  }

  function calculateInitialOpaque() {
    try {
      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) return;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      let count = 0;
      const step = 8;
      for (let i = 0; i < data.length; i += 4 * step) {
        if (data[i + 3] > 40) count++;
      }
      initialOpaquePixels = Math.max(count, 100);
    } catch (e) {
      console.warn('Initial baseline opaque calculation:', e);
    }
  }

  overlayImg.onload = resizeCanvas;
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 150);

  function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function scratch(x, y) {
    if (isRevealed) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = Math.max(26, stage.clientWidth * 0.08) * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX * dpr, lastY * dpr);
    ctx.lineTo(x * dpr, y * dpr);
    ctx.stroke();

    lastX = x;
    lastY = y;

    checkRevealedPercentage();
  }

  let checkThrottleTimeout = null;
  function checkRevealedPercentage() {
    if (isRevealed || checkThrottleTimeout || !initialOpaquePixels) return;
    checkThrottleTimeout = setTimeout(() => {
      checkThrottleTimeout = null;
      try {
        const w = canvas.width;
        const h = canvas.height;
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        let currentOpaque = 0;
        const step = 8;

        for (let i = 0; i < data.length; i += 4 * step) {
          if (data[i + 3] > 40) currentOpaque++;
        }

        const erased = initialOpaquePixels - currentOpaque;
        const erasedPercentage = (erased / initialOpaquePixels) * 100;

        if (erasedPercentage >= 65) {
          revealDate(true);
        }
      } catch (err) {
        console.warn('Scratch percentage check notice:', err);
      }
    }, 60);
  }

  function revealDate(animate = true) {
    if (isRevealed) return;
    isRevealed = true;
    canvas.classList.add('revealed');

    if (animate) {
      if (typeof gsap !== 'undefined') {
        gsap.fromTo('.scratch-revealed-date', 
          { scale: 0.92, opacity: 0.8 }, 
          { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.5)' }
        );
        gsap.to('.wax-seal', { rotate: 18, scale: 1.12, duration: 0.35, yoyo: true, repeat: 1 });
      }
      triggerCelebrationConfetti();
    }
  }

  function triggerCelebrationConfetti() {
    const card = document.getElementById('scratch-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const container = document.createElement('div');
    container.className = 'celebration-container';
    document.body.appendChild(container);

    const colors = ['#B73527', '#D99A16', '#C85A3A', '#B88A32', '#ECCB85', '#E05343', '#FFC857'];
    const particleCount = 65;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      const isStreamer = i % 4 === 0;
      const isPetal = i % 2 === 0;

      p.className = `celebration-particle ${isStreamer ? 'streamer' : isPetal ? 'petal' : 'confetti'}`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      container.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 90 + Math.random() * 220;
      const targetX = Math.cos(angle) * velocity + (Math.random() - 0.5) * 90;
      const targetY = Math.sin(angle) * velocity * 0.75 - 70 - Math.random() * 90;
      const fallDistance = 220 + Math.random() * 380;
      const duration = 2.4 + Math.random() * 1.4;

      if (typeof gsap !== 'undefined') {
        gsap.timeline({ onComplete: () => p.remove() })
          .to(p, {
            x: targetX,
            y: targetY,
            rotation: Math.random() * 360,
            rotationX: Math.random() * 720,
            rotationY: Math.random() * 720,
            duration: duration * 0.35,
            ease: 'power2.out'
          })
          .to(p, {
            y: targetY + fallDistance,
            x: targetX + (Math.random() - 0.5) * 140,
            rotation: `+=${Math.random() * 360}`,
            opacity: 0,
            duration: duration * 0.65,
            ease: 'power1.in'
          });
      } else {
        setTimeout(() => p.remove(), 2500);
      }
    }

    setTimeout(() => container.remove(), 4500);
  }

  function startScratch(e) {
    if (isRevealed) return;
    isScratching = true;
    const coords = getCoords(e);
    lastX = coords.x;
    lastY = coords.y;
    scratch(coords.x, coords.y);
  }

  function moveScratch(e) {
    if (!isScratching || isRevealed) return;
    if (e.cancelable) e.preventDefault();
    const coords = getCoords(e);
    scratch(coords.x, coords.y);
  }

  function endScratch() {
    isScratching = false;
  }

  canvas.addEventListener('mousedown', startScratch);
  window.addEventListener('mousemove', moveScratch);
  window.addEventListener('mouseup', endScratch);

  canvas.addEventListener('touchstart', startScratch, { passive: false });
  window.addEventListener('touchmove', moveScratch, { passive: false });
  window.addEventListener('touchend', endScratch);
  window.addEventListener('touchcancel', endScratch);

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from('#scratch-card', {
      scrollTrigger: {
        trigger: '#scratch-section',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 35,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  }
}

// ===== COUNTDOWN CONTROLLER =====
function initCountdownTimer(data) {
  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const targetDateStr = data?.targetTimestamp || '2026-12-25T16:00:00';
  const targetDate = new Date(targetDateStr).getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from('.countdown-header', {
      scrollTrigger: {
        trigger: '#countdown-section',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });

    gsap.from('.countdown-card', {
      scrollTrigger: {
        trigger: '#countdown-section',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 15,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }
}

// ===== EVENTS & LOCATION CONTROLLER =====
function initEventsAndLocation(data) {
  if (data) {
    if (data.venue) {
      const venueEl = document.getElementById('venue-name');
      if (venueEl) venueEl.textContent = data.venue;
    }
    if (data.address) {
      const addressEl = document.getElementById('venue-address');
      if (addressEl) addressEl.innerHTML = data.address.replace(', ', ',<br>');
    }
    if (data.quote) {
      const quoteEl = document.getElementById('venue-quote');
      if (quoteEl) quoteEl.innerHTML = data.quote.replace(', ', ',<br>').replace(' laughter', ' laughter<br>');
    }
    if (data.mapLink) {
      const mapLinkEl = document.getElementById('location-map-link');
      if (mapLinkEl) mapLinkEl.href = data.mapLink;
    }
  }

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from('#events-section .section-title-wrapper', {
      scrollTrigger: {
        trigger: '#events-section',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });

    gsap.from('.event-card', {
      scrollTrigger: {
        trigger: '#events-grid',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 15,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    });

    gsap.from('#location-section .section-title-wrapper', {
      scrollTrigger: {
        trigger: '#location-section',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });

    gsap.from('.location-map-card', {
      scrollTrigger: {
        trigger: '.location-layout',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      x: -20,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out'
    });

    gsap.from('.location-info > *', {
      scrollTrigger: {
        trigger: '.location-layout',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      x: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }
}

// ===== CLOSING SIGNOFF CONTROLLER =====
function initClosingSignoff() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from('.closing-container', {
      scrollTrigger: {
        trigger: '#closing-section',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      scale: 0.95,
      y: 20,
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out'
    });
  }
}

// ===== MULTI-FLORAL FALLING PETALS ENGINE =====
function initFallingPetals() {
  const container = document.getElementById('falling-petals-container');
  if (!container) return;

  const floralTypes = ['petal-type-rose', 'petal-type-marigold', 'petal-type-lotus', 'petal-type-jasmine'];
  const maxPetals = window.innerWidth < 768 ? 32 : 60;
  const swayVariants = ['petalSway0', 'petalSway1', 'petalSway2', 'petalSway3'];

  function createPetal(isInitial = false) {
    if (document.hidden || container.childElementCount >= maxPetals) return;

    const petal = document.createElement('div');
    const randomType = floralTypes[Math.floor(Math.random() * floralTypes.length)];
    const randomSway = swayVariants[Math.floor(Math.random() * swayVariants.length)];

    petal.className = `falling-petal ${randomType}`;

    const startLeft = Math.random() * 100;
    const duration = 8 + Math.random() * 9;
    const swayDuration = 2.5 + Math.random() * 3;
    const scale = 0.5 + Math.random() * 0.5;
    const delay = isInitial ? Math.random() * 8 : 0;

    petal.style.left = `${startLeft}vw`;
    petal.style.transform = `scale(${scale})`;
    petal.style.animation = `petalFallLinear ${duration}s linear ${delay}s infinite, ${randomSway} ${swayDuration}s ease-in-out infinite alternate`;

    container.appendChild(petal);

    petal.addEventListener('animationiteration', (e) => {
      if (e.animationName === 'petalFallLinear') {
        petal.style.left = `${Math.random() * 100}vw`;
      }
    });
  }

  for (let i = 0; i < maxPetals; i++) {
    createPetal(true);
  }

  setInterval(() => {
    if (container.childElementCount < maxPetals) {
      createPetal(false);
    }
  }, 400);
}

// ===== INTERACTIVE ROYAL 3D ENVELOPE CONTROLLER =====
function initEnvelopeLoader(data) {
  const loader = document.getElementById('loader');
  const envelopeStage = document.getElementById('envelope-stage');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const promptEl = document.getElementById('envelope-prompt');

  if (!loader || !envelopeStage || !envelopeWrapper) return;

  if (typeof gsap !== 'undefined') {
    gsap.from(envelopeStage, {
      scale: 0.85,
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
    gsap.from(promptEl, {
      opacity: 0,
      y: 15,
      duration: 0.8,
      delay: 0.5,
      ease: 'power2.out'
    });
  }

  let isOpened = false;

  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;

    envelopeStage.classList.add('is-open');

    const cordialTag = document.querySelector('.envelope-cordial-tag');
    if (cordialTag) {
      cordialTag.style.transition = 'opacity 0.4s ease';
      cordialTag.style.opacity = '0';
    }

    if (promptEl) {
      promptEl.style.transition = 'opacity 0.4s ease';
      promptEl.style.opacity = '0';
      promptEl.style.pointerEvents = 'none';
    }

    startMusic();

    setTimeout(() => {
      if (typeof gsap !== 'undefined') {
        gsap.to(loader, {
          opacity: 0,
          scale: 1.06,
          duration: 1.0,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            hasLoaderFinished = true;
            initFallingPetals();
          }
        });

        gsap.from('.hero-illustration', { opacity: 0, y: 25, duration: 1.1, delay: 0.15, ease: 'power3.out' });
        gsap.from('.hero-tagline', { opacity: 0, y: 15, duration: 0.8, delay: 0.35, stagger: 0.15, ease: 'power2.out' });
        gsap.from('.name-part', { opacity: 0, scale: 0.9, y: 18, duration: 1.0, delay: 0.5, stagger: 0.1, ease: 'back.out(1.7)' });
        gsap.from('.name-and', { opacity: 0, duration: 0.5, delay: 0.65 });
        gsap.from('.hero-decor', { opacity: 0, duration: 1.2, delay: 0.4, stagger: 0.15, ease: 'power2.out' });
      } else {
        loader.classList.add('hidden');
        setTimeout(() => {
          loader.style.display = 'none';
          hasLoaderFinished = true;
          initFallingPetals();
        }, 700);
      }
    }, 750);
  }

  envelopeWrapper.addEventListener('click', openEnvelope);
  envelopeWrapper.addEventListener('touchend', (e) => {
    e.preventDefault();
    openEnvelope();
  }, { passive: false });
}

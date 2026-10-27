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
      onReady: (event) => {
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
          // Seamless loop
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

  // Send direct postMessage commands to iframe
  sendYTCommand('unMute');
  sendYTCommand('setVolume', [80]);
  sendYTCommand('playVideo');

  // Also call YT API if initialized
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

  // Send direct postMessage command
  sendYTCommand('pauseVideo');

  // Also call YT API if initialized
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

    // Populate dynamic data
    if (data.bride && data.groom) {
      const heroBrideEl = document.getElementById('hero-bride');
      const heroGroomEl = document.getElementById('hero-groom');
      if (heroBrideEl) heroBrideEl.textContent = data.bride;
      if (heroGroomEl) heroGroomEl.textContent = data.groom;

      const loaderMonogramEl = document.getElementById('loader-monogram');
      if (loaderMonogramEl) loaderMonogramEl.textContent = `${data.bride.charAt(0)} & ${data.groom.charAt(0)}`;
    }

    // Music Toggle Button Listener
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

    // One-time interaction fallback to satisfy modern browser audio autoplay policy
    const triggerAudioOnFirstInteraction = () => {
      if (hasLoaderFinished && !isAudioPlaying && ytPlayer) {
        startMusic();
      }
    };
    document.addEventListener('click', triggerAudioOnFirstInteraction, { once: true });
    document.addEventListener('touchstart', triggerAudioOnFirstInteraction, { once: true });

    // Initialize Scratch to Reveal Card
    initScratchCard(data);

    // Initialize Countdown Timer
    initCountdownTimer(data);

    // Initialize Events & Location
    initEventsAndLocation(data);

    // Initialize Gallery
    initGallery(data);

    // Initialize RSVP & Share
    initRSVPAndShare(data);

    // Initialize Interactive 3D Envelope Loading Screen
    initEnvelopeLoader(data);

  } catch (error) {
    console.error('Error initializing wedding template:', error);
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  }
});

// ===== SCRATCH TO REVEAL CARD CONTROLLER =====
function initScratchCard(data) {
  const stage = document.getElementById('scratch-stage');
  const canvas = document.getElementById('scratch-canvas');
  const dateText = document.getElementById('scratch-date-text');
  const waxSeal = document.getElementById('wax-seal');
  if (!stage || !canvas) return;

  if (data && data.date) {
    // If exact date text needed
    dateText.textContent = "25.12.2026";
  }

  const ctx = canvas.getContext('2d');
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
    ctx.scale(dpr, dpr);
    drawOverlay();
  }

  function drawOverlay() {
    const rect = stage.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    if (overlayImg.complete && overlayImg.naturalWidth > 0) {
      ctx.drawImage(overlayImg, 0, 0, rect.width, rect.height);
    } else {
      ctx.fillStyle = '#D99A16';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
    // Calculate initial baseline of opaque gold pixels
    calculateInitialOpaque();
  }

  function calculateInitialOpaque() {
    try {
      const width = canvas.width;
      const height = canvas.height;
      if (!width || !height) return;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let count = 0;
      const step = 8;
      for (let i = 0; i < data.length; i += 4 * step) {
        if (data[i + 3] > 40) { // Opaque gold pixel
          count++;
        }
      }
      initialOpaquePixels = Math.max(count, 100);
    } catch (e) {
      console.warn('Baseline opaque calc notice:', e);
    }
  }

  overlayImg.onload = () => {
    resizeCanvas();
  };
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
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = Math.max(28, canvas.clientWidth * 0.09);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
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
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        let currentOpaque = 0;
        const step = 8;

        for (let i = 0; i < data.length; i += 4 * step) {
          if (data[i + 3] > 40) {
            currentOpaque++;
          }
        }

        const erased = initialOpaquePixels - currentOpaque;
        const erasedPercentage = (erased / initialOpaquePixels) * 100;

        // Strictly require 70% of the gold foil to be scratched away
        if (erasedPercentage >= 70) {
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

  // Celebration Flower Petals & Confetti Bursts
  function triggerCelebrationConfetti() {
    const card = document.getElementById('scratch-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const container = document.createElement('div');
    container.className = 'celebration-container';
    document.body.appendChild(container);

    const colors = [
      '#B73527', // Wedding Red
      '#D99A16', // Marigold
      '#C85A3A', // Terracotta
      '#B88A32', // Gold Line
      '#ECCB85', // Soft Gold
      '#E05343', // Rose Red
      '#FFC857'  // Bright Marigold
    ];

    const particleCount = 70;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      const isStreamer = i % 4 === 0;
      const isPetal = i % 2 === 0;

      if (isStreamer) {
        p.className = 'celebration-particle streamer';
      } else if (isPetal) {
        p.className = 'celebration-particle petal';
      } else {
        p.className = 'celebration-particle confetti';
      }

      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.backgroundColor = color;
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
        gsap.timeline({
          onComplete: () => {
            p.remove();
          }
        })
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
          rotationX: `+=${Math.random() * 720}`,
          rotationY: `+=${Math.random() * 720}`,
          opacity: 0,
          duration: duration * 0.65,
          ease: 'power1.in'
        });
      } else {
        setTimeout(() => p.remove(), 2500);
      }
    }

    // Card aura pulse
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#scratch-card',
        { boxShadow: '0 0 35px rgba(217, 154, 22, 0.55), 0 10px 30px rgba(41, 37, 31, 0.09)' },
        { boxShadow: '0 10px 30px rgba(41, 37, 31, 0.09), 0 2px 6px rgba(184, 138, 50, 0.15)', duration: 2.2, ease: 'power2.out' }
      );
    }

    setTimeout(() => {
      container.remove();
    }, 4500);
  }

  // Mouse & Touch Scratch Handlers
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

  // ScrollTrigger entry reveal for the card
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

// ===== REAL-TIME COUNTDOWN TIMER CONTROLLER =====
function initCountdownTimer(data) {
  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  // Target Wedding Date (Dec 25, 2026 16:00:00)
  const targetDate = new Date('2026-12-25T16:00:00').getTime();

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

  // GSAP ScrollTrigger entry animation for the countdown cards
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
      ease: 'power2.out',
      clearProps: 'transform'
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
      ease: 'power2.out',
      clearProps: 'transform'
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

  // ScrollTrigger Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Events Section
    gsap.from('#events-section .section-title-wrapper', {
      scrollTrigger: {
        trigger: '#events-section',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform'
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
      ease: 'power2.out',
      clearProps: 'transform'
    });

    // Location Section
    gsap.from('#location-section .section-title-wrapper', {
      scrollTrigger: {
        trigger: '#location-section',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform'
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
      ease: 'power2.out',
      clearProps: 'transform'
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
      ease: 'power2.out',
      clearProps: 'transform'
    });
  }
}

// ===== GALLERY CONTROLLER & LIGHTBOX =====
function initGallery(data) {
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const cards = document.querySelectorAll('.gallery-card');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.gallery-img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Gallery ScrollTrigger Animation
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from('#gallery-section .section-title-wrapper', {
      scrollTrigger: {
        trigger: '#gallery-section',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform'
    });

    gsap.from('.gallery-card', {
      scrollTrigger: {
        trigger: '#gallery-grid',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      clearProps: 'transform'
    });
  }
}

// ===== RSVP & SHARE CONTROLLER =====
function initRSVPAndShare(data) {
  // Update closing names
  if (data && data.bride && data.groom) {
    const closingNames = document.getElementById('closing-names');
    if (closingNames) closingNames.textContent = `${data.bride} & ${data.groom}`;
  }

  // RSVP Form Handler
  const rsvpForm = document.getElementById('rsvp-form');
  const feedback = document.getElementById('rsvp-feedback');
  if (rsvpForm && feedback) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = document.getElementById('guest-name')?.value || 'Friend';
      feedback.textContent = `Thank you, ${guestName}! We are thrilled to celebrate with you. 🌿✨`;
      feedback.style.opacity = '1';
      rsvpForm.reset();
      setTimeout(() => {
        if (feedback) feedback.textContent = '';
      }, 6000);
    });
  }

  // Share Button Handler
  const shareBtn = document.getElementById('share-invite-btn');
  const shareFeedback = document.getElementById('share-feedback');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: `${data?.bride || 'Bride'} & ${data?.groom || 'Groom'}'s Wedding Invitation`,
        text: `You're cordially invited to celebrate the wedding of ${data?.bride || 'Bride'} & ${data?.groom || 'Groom'}!`,
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // User dismissed share dialog
        }
      } else {
        // Fallback: Copy link to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          if (shareFeedback) {
            shareFeedback.textContent = 'Invitation link copied to clipboard! ✨';
            setTimeout(() => {
              if (shareFeedback) shareFeedback.textContent = '';
            }, 3500);
          }
        } catch (err) {
          if (shareFeedback) shareFeedback.textContent = 'Link: ' + window.location.href;
        }
      }
    });
  }

  // RSVP & Closing ScrollTriggers
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from('#rsvp-section .section-title-wrapper', {
      scrollTrigger: {
        trigger: '#rsvp-section',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform'
    });

    gsap.from('.rsvp-form', {
      scrollTrigger: {
        trigger: '.rsvp-form',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 20,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      clearProps: 'transform'
    });

    gsap.from('.share-block', {
      scrollTrigger: {
        trigger: '.share-block',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform'
    });

    gsap.from('.closing-signoff', {
      scrollTrigger: {
        trigger: '.closing-signoff',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      scale: 0.95,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      clearProps: 'transform'
    });
  }
}

// ===== SAKURA-INSPIRED MULTI-FLORAL FALLING PETALS ENGINE =====
function initFallingPetals() {
  const container = document.getElementById('falling-petals-container');
  if (!container) return;

  const floralTypes = ['petal-type-rose', 'petal-type-marigold', 'petal-type-lotus', 'petal-type-jasmine'];
  const maxPetals = window.innerWidth < 768 ? 32 : 60;
  const swayVariants = ['petalSway0', 'petalSway1', 'petalSway2', 'petalSway3'];

  function createPetal(isInitial = false) {
    if (document.hidden) return;
    if (container.childElementCount >= maxPetals) return;

    const petal = document.createElement('div');
    const randomType = floralTypes[Math.floor(Math.random() * floralTypes.length)];
    const randomSway = swayVariants[Math.floor(Math.random() * swayVariants.length)];

    petal.className = `falling-petal ${randomType}`;

    // Randomize physics properties
    const startLeft = Math.random() * 100; // 0vw to 100vw
    const duration = 8 + Math.random() * 9; // 8s to 17s fall duration
    const swayDuration = 2.5 + Math.random() * 3; // 2.5s to 5.5s sway period
    const scale = 0.5 + Math.random() * 0.5; // delicate compact size scale
    const delay = isInitial ? Math.random() * 8 : 0; // stagger initial petals

    petal.style.left = `${startLeft}vw`;
    petal.style.transform = `scale(${scale})`;
    petal.style.animation = `petalFallLinear ${duration}s linear ${delay}s infinite, ${randomSway} ${swayDuration}s ease-in-out infinite alternate`;

    container.appendChild(petal);

    // Auto recycle positions on each cycle
    petal.addEventListener('animationiteration', (e) => {
      if (e.animationName === 'petalFallLinear') {
        petal.style.left = `${Math.random() * 100}vw`;
      }
    });
  }

  // Populate initial falling petals
  for (let i = 0; i < maxPetals; i++) {
    createPetal(true);
  }

  // Spawning interval to maintain steady natural drift
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
  const letterNames = document.getElementById('letter-couple-names');
  const sealInitials = document.getElementById('seal-initials');

  if (!loader || !envelopeStage || !envelopeWrapper) return;

  if (data && data.couple) {
    const groomName = data.couple.groom || "Ayush";
    const brideName = data.couple.bride || "Megha";
    if (letterNames) letterNames.textContent = `${groomName} & ${brideName}`;
    if (sealInitials) {
      const gInit = groomName.charAt(0);
      const bInit = brideName.charAt(0);
      sealInitials.textContent = `${gInit} & ${bInit}`;
    }
  }

  // Initial Entrance Animation for the Envelope
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

    // 1. Play Opening Animation on Stage
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

    // 2. Start Background Music & Unblock Audio
    startMusic();

    // 3. Fluid, Continuous Transition into Website (Zero awkward pausing)
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
            // Launch falling petals shower
            initFallingPetals();
          }
        });

        // Trigger Hero Section Entrance in direct sync with dissolve
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
  });
}

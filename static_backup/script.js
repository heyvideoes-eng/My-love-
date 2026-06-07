// script.js

document.addEventListener('DOMContentLoaded', () => {
  initDate();
  initIntersectionObserver();
  initEnvelopeReveal();
  initLoveJar();
  initVinylPlayer();
  initDailyNote();
  initThreeJS();
  initNavScroll();
});

/**
 * 1. Initialize Date on the Letter
 */
function initDate() {
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    const options = { month: 'long', year: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-GB', options);
  }
}

/**
 * 2. Intersection Observer for Scroll Animations
 */
function initIntersectionObserver() {
  const options = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  const animatedElements = document.querySelectorAll('.fade-in-section, .scroll-reveal');
  animatedElements.forEach((el) => observer.observe(el));
}

/**
 * 3. Envelope Reveal Interaction
 */
function initEnvelopeReveal() {
  const openBtn = document.getElementById('open-note');
  const envelope = document.getElementById('envelope-interactive');
  const revealSection = document.getElementById('reveal');

  if (!openBtn || !envelope) return;

  let isOpen = false;

  const toggleEnvelope = () => {
    isOpen = !isOpen;
    
    if (isOpen) {
      envelope.classList.add('open');
      openBtn.classList.add('active');
      openBtn.setAttribute('aria-expanded', 'true');
      
      openBtn.innerHTML = `
        Close my note
        <svg class="cta-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;

      setTimeout(() => {
        revealSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
      
    } else {
      envelope.classList.remove('open');
      openBtn.classList.remove('active');
      openBtn.setAttribute('aria-expanded', 'false');
      
      openBtn.innerHTML = `
        Open my note
        <svg class="cta-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      `;
      
      document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
    }
  };

  openBtn.addEventListener('click', toggleEnvelope);
}

/**
 * 4. Love Jar Interaction
 * Reveals randomized thoughts / reasons for love on click.
 */
function initLoveJar() {
  const jarBtn = document.getElementById('jar-button');
  const messageText = document.getElementById('jar-message');

  if (!jarBtn || !messageText) return;

  const REASONS = [
    "I love how safe and quiet the world feels when I'm walking next to you, Vanshika. - Rishi",
    "I love the way you laugh, and how your smile can brighten my entire day. - Rishi",
    "I love the comforting, calm sound of your voice. It is my favorite place to rest. - Rishi",
    "I love how passionate you are about the things you care about. It is inspiring. - Rishi",
    "I love how you turn simple coffee runs and mornings into beautiful memories. - Rishi",
    "I love your gentle kindness and how deeply you care for those around you. - Rishi",
    "I love the quiet, unspoken understanding we share. Words aren't always needed. - Rishi",
    "I love the peaceful mornings and long evening walks we take together. - Rishi",
    "I love how simply being near you makes everything feel a little bit lighter. - Rishi",
    "I love your warmth, your intelligence, and your beautiful, gentle spirit. - Rishi"
  ];

  let currentIdx = -1;

  jarBtn.addEventListener('click', () => {
    // Select a random reason distinct from the current one
    let newIdx;
    do {
      newIdx = Math.floor(Math.random() * REASONS.length);
    } while (newIdx === currentIdx && REASONS.length > 1);
    
    currentIdx = newIdx;
    const message = REASONS[currentIdx];

    // Trigger visual shake on the button
    jarBtn.classList.add('shaking');
    messageText.style.opacity = 0; // fade out

    setTimeout(() => {
      jarBtn.classList.remove('shaking');
      
      // Typewriter-like smooth text insertion
      messageText.textContent = message;
      messageText.style.opacity = 1; // fade in
    }, 400); // matching shake animation duration
  });
}

/**
 * 5. Interactive Vinyl Player Simulation
 * Simulates playing a list of soft songs.
 */
function initVinylPlayer() {
  const playlistCard = document.getElementById('vinyl-card');
  const vinylPlayer = playlistCard ? playlistCard.querySelector('.vinyl-player') : null;
  const playPauseBtn = document.getElementById('play-pause');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const songTitle = document.getElementById('player-title');
  const timeCurrent = document.getElementById('time-current');
  const timeDuration = document.getElementById('time-duration');
  const progressBar = document.getElementById('progress-bar');
  const progressContainer = document.getElementById('progress-container');
  const musicIndicator = document.getElementById('nav-music-indicator');

  const prevBtn = document.getElementById('prev-song');
  const nextBtn = document.getElementById('next-song');

  if (!playPauseBtn || !vinylPlayer) return;

  // Mock songs
  const SONGS = [
    { title: "Coffee & Mornings", duration: 192 }, // 3:12
    { title: "Warm Shared Walks", duration: 165 }, // 2:45
    { title: "Our Quiet Space", duration: 210 }    // 3:30
  ];

  let currentSongIdx = 0;
  let isPlaying = false;
  let playInterval = null;
  let elapsedSeconds = 0;

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const updateSongDisplay = () => {
    const song = SONGS[currentSongIdx];
    songTitle.textContent = song.title;
    timeDuration.textContent = formatTime(song.duration);
    resetPlayback();
  };

  const resetPlayback = () => {
    elapsedSeconds = 0;
    timeCurrent.textContent = "0:00";
    progressBar.style.width = "0%";
  };

  const startPlaybackTimer = () => {
    const song = SONGS[currentSongIdx];
    playInterval = setInterval(() => {
      elapsedSeconds++;
      
      if (elapsedSeconds >= song.duration) {
        // Auto progress to next song
        nextSong();
      } else {
        timeCurrent.textContent = formatTime(elapsedSeconds);
        const percent = (elapsedSeconds / song.duration) * 100;
        progressBar.style.width = `${percent}%`;
      }
    }, 1000);
  };

  const stopPlaybackTimer = () => {
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  };

  const playSong = () => {
    isPlaying = true;
    vinylPlayer.classList.add('playing');
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    if (musicIndicator) musicIndicator.classList.add('playing');
    
    startPlaybackTimer();
  };

  const pauseSong = () => {
    isPlaying = false;
    vinylPlayer.classList.remove('playing');
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    if (musicIndicator) musicIndicator.classList.remove('playing');
    
    stopPlaybackTimer();
  };

  const nextSong = () => {
    const wasPlaying = isPlaying;
    pauseSong();
    currentSongIdx = (currentSongIdx + 1) % SONGS.length;
    updateSongDisplay();
    if (wasPlaying) playSong();
  };

  const prevSong = () => {
    const wasPlaying = isPlaying;
    pauseSong();
    currentSongIdx = (currentSongIdx - 1 + SONGS.length) % SONGS.length;
    updateSongDisplay();
    if (wasPlaying) playSong();
  };

  // Click Play/Pause toggle
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  });

  // Track buttons
  nextBtn.addEventListener('click', nextSong);
  prevBtn.addEventListener('click', prevSong);

  // Click on progress bar to seek (aesthetic only)
  progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const song = SONGS[currentSongIdx];
    
    elapsedSeconds = Math.floor(percent * song.duration);
    timeCurrent.textContent = formatTime(elapsedSeconds);
    progressBar.style.width = `${percent * 100}%`;
  });

  // Initialize display
  updateSongDisplay();
}

/**
 * 6. Nvidia API Daily Message Handler
 * Requests a cute daily message from the server-side API proxy.
 * Falls back seamlessly to offline local messages if server is unavailable or API key is not configured.
 */
function initDailyNote() {
  const noteText = document.getElementById('daily-note-text');
  const sourceTag = document.getElementById('daily-source');
  const refreshBtn = document.getElementById('refresh-daily-note');
  const shimmerLoader = document.getElementById('daily-loading');
  const contentBox = document.querySelector('.daily-content-box');

  if (!noteText || !refreshBtn) return;

  const fetchDailyNote = async () => {
    // Show loading shimmers
    if (shimmerLoader) shimmerLoader.classList.remove('hidden');
    if (contentBox) contentBox.style.opacity = '0.3';
    refreshBtn.disabled = true;

    try {
      // Query local Node.js proxy server
      const response = await fetch('/api/daily-message');
      if (!response.ok) {
        throw new Error(`HTTP status error: ${response.status}`);
      }

      const data = await response.json();
      
      // Update text
      noteText.textContent = data.message;

      // Update source indicators
      if (sourceTag) {
        if (data.isGeneratedByAI) {
          sourceTag.textContent = "AI Generated";
          sourceTag.style.backgroundColor = "var(--accent-rose)";
        } else {
          sourceTag.textContent = "Warm Reminder";
          sourceTag.style.backgroundColor = "var(--accent-gold)";
        }
      }

    } catch (error) {
      console.warn("Could not load daily message from server. Using browser local fallbacks.", error.message);
      
      // Select offline static fallback based on day of week
      const dayIndex = new Date().getDay();
      const FALLBACKS = [
        "You make ordinary days feel special just by being in them, Vanshika. Sending you all my love today. - Rishi",
        "You are my favourite part of every single day, Vanshika. Wishing you a calm and happy morning. - Rishi",
        "Just a little reminder that your smile is my comfort, Vanshika. I hope your day is as wonderful as you are. - Rishi",
        "I cherish the simple, quiet moments we share. You bring so much peace into my life, Vanshika. - Rishi",
        "No matter how busy today gets, remember that I am thinking of you and grateful for your warmth. - Rishi",
        "Your voice is my favourite sound and my absolute calm, Vanshika. Have a beautiful day. - Rishi",
        "I love the quiet mornings and peaceful evenings we share. Thank you for being you, Vanshika. - Rishi"
      ];
      noteText.textContent = FALLBACKS[dayIndex % FALLBACKS.length];
      
      if (sourceTag) {
        sourceTag.textContent = "Offline Fallback";
        sourceTag.style.backgroundColor = "var(--accent-gold)";
      }
    } finally {
      // Hide loading shimmers
      setTimeout(() => {
        if (shimmerLoader) shimmerLoader.classList.add('hidden');
        if (contentBox) contentBox.style.opacity = '1';
        refreshBtn.disabled = false;
      }, 500); // small delay to make loading transition feel smooth
    }
  };

  refreshBtn.addEventListener('click', fetchDailyNote);

  // Fetch initial note on page load
  fetchDailyNote();
}

/**
 * 7. Navigation Smooth Scrolling & Indicator
 */
function initNavScroll() {
  const links = document.querySelectorAll('.nav-links a');
  const musicIndicator = document.getElementById('nav-music-indicator');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  if (musicIndicator) {
    musicIndicator.addEventListener('click', () => {
      const playlistSection = document.getElementById('interactive');
      if (playlistSection) {
        playlistSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

/**
 * 8. Three.js WebGL Custom Interactive 3D Background
 */
function initThreeJS() {
  const canvas = document.getElementById('canvas-3d');
  const fallback = document.getElementById('ambient-fallback');

  if (!canvas) return;

  if (window.innerWidth < 768) {
    if (fallback) fallback.style.display = 'block';
    canvas.style.display = 'none';
    return;
  }

  if (typeof THREE === 'undefined') {
    console.warn('Three.js library is not available. Using 2D ambient fallback.');
    if (fallback) fallback.style.display = 'block';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Detail level 4 (2.5k vertices) for high-performance fluid calculations
  const geometry = new THREE.IcosahedronGeometry(1.6, 4);
  const positionAttr = geometry.attributes.position;
  const originalPositions = positionAttr.clone();

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xEFA8B5,
    roughness: 0.18,
    metalness: 0.05,
    transmission: 0.75,
    thickness: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
  });

  const blobMesh = new THREE.Mesh(geometry, material);
  scene.add(blobMesh);

  const ambientLight = new THREE.AmbientLight(0xFFF4F1, 0.7);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xEFA8B5, 1.2);
  dirLight1.position.set(5, 5, 3);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xD4AF37, 1.0);
  dirLight2.position.set(-5, -5, 2);
  scene.add(dirLight2);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  window.addEventListener('mousemove', (event) => {
    targetMouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    targetMouseY = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  });

  let scrollY = 0;
  let targetScrollY = 0;

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  });

  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = originalPositions.getX(i);
      const y = originalPositions.getY(i);
      const z = originalPositions.getZ(i);

      const wave1 = Math.sin(x * 1.4 + elapsedTime * 0.7) * 0.12;
      const wave2 = Math.cos(y * 1.8 + elapsedTime * 0.9) * 0.10;
      const wave3 = Math.sin(z * 1.5 + elapsedTime * 0.5) * 0.08;
      
      const displacement = wave1 + wave2 + wave3;

      const vertexLength = Math.sqrt(x*x + y*y + z*z);
      positions.setXYZ(
        i,
        x + (x / vertexLength) * displacement,
        y + (y / vertexLength) * displacement,
        z + (z / vertexLength) * displacement
      );
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    scrollY += (targetScrollY - scrollY) * 0.08;

    blobMesh.rotation.y = elapsedTime * 0.1 + mouseX * 0.4;
    blobMesh.rotation.x = elapsedTime * 0.05 + mouseY * 0.4;

    blobMesh.position.y = -(scrollY * 0.002);
    blobMesh.position.x = mouseX * 0.25;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();

  setTimeout(() => {
    canvas.classList.add('loaded');
  }, 100);
}

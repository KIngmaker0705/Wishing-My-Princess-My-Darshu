// ========================================================
// 👑 PRINCESS DAY - INTERACTIVE CORE ENGINE (DARK LUXURY)
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  // Current State
  let currentPage = 0;
  const totalPages = princessConfig.pages.length;

  // DOM Elements
  const body = document.body;
  const siteTitleEl = document.getElementById("siteTitle");
  const cardElement = document.getElementById("cardElement");
  const chapterBadge = document.getElementById("chapterBadge");
  const pageTitle = document.getElementById("pageTitle");
  const cardImage = document.getElementById("cardImage");
  const imageCaption = document.getElementById("imageCaption");
  const imagePlaceholder = document.getElementById("imagePlaceholder");
  const placeholderFilename = document.getElementById("placeholderFilename");
  const messageContent = document.getElementById("messageContent");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageCounter = document.getElementById("pageCounter");
  const navDots = document.querySelectorAll(".nav-dot");
  const surpriseSection = document.getElementById("surpriseSection");
  const surpriseBtn = document.getElementById("surpriseBtn");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalConfirmBtn = document.getElementById("modalConfirmBtn");
  const modalHerName = document.getElementById("modalHerName");

  // Music Popup & Audio Elements
  const bgSongAudio = document.getElementById("bgSongAudio");
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  const musicIcon = document.getElementById("musicIcon");
  const musicLabel = document.getElementById("musicLabel");
  const musicModalOverlay = document.getElementById("musicModalOverlay");
  const musicModalPlayBtn = document.getElementById("musicModalPlayBtn");
  const musicModalMuteBtn = document.getElementById("musicModalMuteBtn");
  const musicPopupTitle = document.getElementById("musicPopupTitle");
  const musicPopupMessage = document.getElementById("musicPopupMessage");
  const songToast = document.getElementById("songToast");
  const songToastText = document.getElementById("songToastText");

  // Audio Playback State
  let isMusicPlaying = false;
  let isCustomSongAvailable = false;
  let audioCtx = null;
  let melodyTimer = null;
  let noteIndex = 0;

  // Initialize Config Texts
  if (princessConfig.siteTitle) {
    siteTitleEl.textContent = princessConfig.siteTitle;
    document.title = princessConfig.siteTitle;
  }
  if (princessConfig.herName) {
    modalHerName.textContent = princessConfig.herName;
  }
  if (princessConfig.music) {
    if (princessConfig.music.popupTitle) musicPopupTitle.textContent = princessConfig.music.popupTitle;
    if (princessConfig.music.popupMessage) musicPopupMessage.textContent = princessConfig.music.popupMessage;
    if (princessConfig.music.file) {
      bgSongAudio.src = princessConfig.music.file;
    }
    if (princessConfig.music.title) {
      songToastText.textContent = `Now Playing: ${princessConfig.music.title}`;
    }
  }

  // ========================================================
  // 1. PAGE RENDER & TRANSITIONS
  // ========================================================
  function renderPage(index) {
    const data = princessConfig.pages[index];
    if (!data) return;

    // Card Animation reset
    cardElement.classList.remove("fade-in-slide");
    void cardElement.offsetWidth;
    cardElement.classList.add("fade-in-slide");

    // Dynamic Dark Theme Switch
    const themeName = `theme-${index + 1}`;
    body.setAttribute("data-theme", themeName);

    // Update Card Content
    chapterBadge.textContent = `👑 ${data.chapter}`;
    pageTitle.textContent = data.title;
    imageCaption.textContent = data.imageCaption || "";
    messageContent.textContent = data.message;
    pageCounter.textContent = `${index + 1} / ${totalPages}`;

    // Handle Image Loading / Fallback
    const filename = data.image.split("/").pop() || `photo${index + 1}.jpg`;
    placeholderFilename.textContent = filename;

    imagePlaceholder.classList.remove("show");
    cardImage.style.display = "block";

    cardImage.onerror = () => {
      cardImage.style.display = "none";
      imagePlaceholder.classList.add("show");
    };

    cardImage.onload = () => {
      cardImage.style.display = "block";
      imagePlaceholder.classList.remove("show");
    };

    cardImage.src = data.image;

    // Navigation Controls
    prevBtn.disabled = index === 0;
    
    if (index === totalPages - 1) {
      nextBtn.innerHTML = `<span class="btn-text">Replay from Start</span> <span class="arrow">↺</span>`;
      surpriseSection.style.display = "block";
    } else {
      nextBtn.innerHTML = `<span class="btn-text">Next Chapter</span> <span class="arrow">→</span>`;
      surpriseSection.style.display = "none";
    }

    // Update Dots
    navDots.forEach((dot, dotIdx) => {
      if (dotIdx === index) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    // Update particle colors for this dark chapter
    updateParticleTheme(index);
  }

  // ========================================================
  // 2. NAVIGATION EVENT LISTENERS
  // ========================================================
  prevBtn.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      renderPage(currentPage);
      playSoftChime(440);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderPage(currentPage);
      playSoftChime(587);
    } else {
      currentPage = 0;
      renderPage(currentPage);
      playSoftChime(523);
    }
  });

  navDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetPage = parseInt(dot.getAttribute("data-page"), 10);
      if (!isNaN(targetPage) && targetPage !== currentPage) {
        currentPage = targetPage;
        renderPage(currentPage);
        playSoftChime(520 + targetPage * 40);
      }
    });
  });

  // Keyboard navigation (Arrow keys)
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      nextBtn.click();
    } else if (e.key === "ArrowLeft" && currentPage > 0) {
      prevBtn.click();
    }
  });

  // Mobile Touch Swipe Navigation
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const threshold = 45;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > threshold) {
      if (diff < 0) {
        nextBtn.click();
      } else if (diff > 0 && currentPage > 0) {
        prevBtn.click();
      }
    }
  }

  // ========================================================
  // 3. INTERACTIVE TAP / CLICK HEARTS
  // ========================================================
  const romanticEmojis = ["💖", "✨", "🌸", "👑", "💕", "🌹", "💫", "💎"];

  document.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    spawnClickHeart(e.clientX, e.clientY);
  });

  function spawnClickHeart(x, y) {
    const heart = document.createElement("div");
    heart.className = "floating-click-heart";
    const randomEmoji = romanticEmojis[Math.floor(Math.random() * romanticEmojis.length)];
    heart.textContent = randomEmoji;
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--rot", `${(Math.random() - 0.5) * 50}deg`);
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1200);
  }

  // ========================================================
  // 4. MUSIC CONTROLS & WELCOME POPUP
  // ========================================================
  function showSongToast(msg) {
    if (msg) songToastText.textContent = msg;
    songToast.classList.add("show");
    setTimeout(() => {
      songToast.classList.remove("show");
    }, 3800);
  }

  function startMusic() {
    isMusicPlaying = true;
    musicToggleBtn.classList.add("playing");
    musicIcon.textContent = "💖";
    musicLabel.textContent = "Song Playing";

    // Try playing custom MP3 song first
    if (bgSongAudio && bgSongAudio.src) {
      const playPromise = bgSongAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isCustomSongAvailable = true;
            showSongToast(`Now Playing: ${princessConfig.music.title || "Our Special Song 💖"}`);
          })
          .catch(() => {
            // If custom mp3 fails or doesn't exist yet, fallback to synthesizer lullaby
            isCustomSongAvailable = false;
            startSynthesizerMelody();
            showSongToast("Playing Romantic Melody Box 🎶");
          });
      }
    } else {
      startSynthesizerMelody();
      showSongToast("Playing Romantic Melody Box 🎶");
    }
  }

  function stopMusic() {
    isMusicPlaying = false;
    musicToggleBtn.classList.remove("playing");
    musicIcon.textContent = "🎵";
    musicLabel.textContent = "Play Music";

    if (bgSongAudio) {
      bgSongAudio.pause();
    }
    stopSynthesizerMelody();
  }

  // Toggle button in header
  musicToggleBtn.addEventListener("click", () => {
    initAudio();
    if (isMusicPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });

  // Welcome Popup Actions
  musicModalPlayBtn.addEventListener("click", () => {
    initAudio();
    musicModalOverlay.classList.remove("open");
    startMusic();
  });

  musicModalMuteBtn.addEventListener("click", () => {
    musicModalOverlay.classList.remove("open");
  });

  // Fallback Web Audio Synthesizer (Zero external file dependencies)
  const romanticNotes = [
    261.63, 329.63, 392.00, 493.88, 523.25, 587.33, 659.25, 783.99,
    659.25, 587.33, 523.25, 392.00
  ];

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playSoftChime(freq, duration = 1.2) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.07, audioCtx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignore
    }
  }

  function playRoyalFanfare() {
    initAudio();
    const fanfareNotes = [392, 523.25, 659.25, 783.99, 1046.5];
    fanfareNotes.forEach((f, idx) => {
      setTimeout(() => {
        playSoftChime(f, 1.4);
      }, idx * 150);
    });
  }

  function startSynthesizerMelody() {
    initAudio();
    if (melodyTimer) clearInterval(melodyTimer);

    melodyTimer = setInterval(() => {
      if (!isMusicPlaying) return;
      const freq = romanticNotes[noteIndex % romanticNotes.length];
      playSoftChime(freq, 1.8);

      if (noteIndex % 3 === 0) {
        setTimeout(() => playSoftChime(freq * 0.75, 1.4), 80);
      }

      noteIndex++;
    }, 700);
  }

  function stopSynthesizerMelody() {
    if (melodyTimer) {
      clearInterval(melodyTimer);
      melodyTimer = null;
    }
  }

  // ========================================================
  // 5. SURPRISE MODAL & CONFETTI FINALE
  // ========================================================
  surpriseBtn.addEventListener("click", () => {
    modalOverlay.classList.add("open");
    launchConfetti();
    playRoyalFanfare();
  });

  modalCloseBtn.addEventListener("click", () => {
    modalOverlay.classList.remove("open");
  });

  modalConfirmBtn.addEventListener("click", () => {
    modalOverlay.classList.remove("open");
    launchConfetti();
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("open");
    }
  });

  // ========================================================
  // 6. CANVAS PARTICLES (Floating Hearts, Petals & Stars)
  // ========================================================
  const canvas = document.getElementById("particleCanvas");
  const ctx = canvas.getContext("2d");

  let particles = [];
  const particleCount = 45;

  let currentPalette = {
    type: "petals",
    colors: ["#fda4af", "#f43f5e", "#ffd700", "#ffffff"]
  };

  function updateParticleTheme(themeIdx) {
    if (themeIdx === 0) {
      currentPalette = {
        type: "petals",
        colors: ["#fb7185", "#f43f5e", "#ffd700", "#fecdd3"]
      };
    } else if (themeIdx === 1) {
      currentPalette = {
        type: "starlight",
        colors: ["#c084fc", "#a855f7", "#e9d5ff", "#facc15"]
      };
    } else if (themeIdx === 2) {
      currentPalette = {
        type: "hearts",
        colors: ["#fb7185", "#f43f5e", "#fda4af", "#f59e0b"]
      };
    } else {
      currentPalette = {
        type: "stars",
        colors: ["#facc15", "#fde047", "#ffffff", "#60a5fa"]
      };
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 80;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 0.9 + 0.4;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.7;
      this.opacity = Math.random() * 0.65 + 0.25;
      this.color = currentPalette.colors[Math.floor(Math.random() * currentPalette.colors.length)];
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    update() {
      this.y -= this.speedY;
      this.x += Math.sin(this.y * 0.02) * 0.5 + this.speedX * 0.3;
      this.rotation += this.rotationSpeed;

      if (this.y < -30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      if (currentPalette.type === "stars" || currentPalette.type === "starlight") {
        ctx.beginPath();
        const s = this.size * 0.85;
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
      } else if (currentPalette.type === "hearts") {
        const s = this.size * 0.75;
        ctx.beginPath();
        ctx.moveTo(0, s / 4);
        ctx.bezierCurveTo(0, -s / 2, -s, -s / 2, -s, 0);
        ctx.bezierCurveTo(-s, s / 2, 0, s, 0, s * 1.2);
        ctx.bezierCurveTo(0, s, s, s / 2, s, 0);
        ctx.bezierCurveTo(s, -s / 2, 0, -s / 2, 0, s / 4);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.85, this.size * 0.45, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ========================================================
  // 7. GRAND FINALE CONFETTI SYSTEM
  // ========================================================
  const confettiCanvas = document.getElementById("confettiCanvas");
  const confettiCtx = confettiCanvas.getContext("2d");
  let confettiParticles = [];
  let confettiAnimationId = null;

  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeConfetti);
  resizeConfetti();

  class ConfettiPiece {
    constructor() {
      this.x = window.innerWidth / 2;
      this.y = window.innerHeight / 2 + 50;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 6;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 6;
      this.size = Math.random() * 10 + 6;
      this.colors = ["#ffd700", "#ff4081", "#c084fc", "#fde047", "#ff9100", "#f43f5e", "#ffffff"];
      this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 15;
      this.gravity = 0.28;
      this.drag = 0.98;
      this.alpha = 1;
    }

    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
      this.alpha -= 0.007;
    }

    draw() {
      confettiCtx.save();
      confettiCtx.translate(this.x, this.y);
      confettiCtx.rotate((this.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, this.alpha);
      confettiCtx.fillStyle = this.color;
      confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      confettiCtx.restore();
    }
  }

  function launchConfetti() {
    confettiParticles = [];
    for (let i = 0; i < 180; i++) {
      confettiParticles.push(new ConfettiPiece());
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

    function runConfetti() {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiParticles.forEach((piece) => {
        piece.update();
        piece.draw();
      });

      confettiParticles = confettiParticles.filter((piece) => piece.alpha > 0);

      if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(runConfetti);
      } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    runConfetti();
  }

  // Initial Page Render
  renderPage(currentPage);
});

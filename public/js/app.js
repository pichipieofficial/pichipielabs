/**
 * PichiPie Labs - Premium Landing Page Scripts
 */

(function () {
  'use strict';

  // --- Header Shrink & Active Navigation ---
  const headerNav = document.querySelector('.header-nav');
  window.addEventListener('scroll', () => {
    if (!headerNav) return;
    if (window.scrollY > 50) {
      headerNav.classList.add('scrolled');
    } else {
      headerNav.classList.remove('scrolled');
    }
  }, { passive: true });

  // --- Mobile Menu Toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Premium Mouse Spotlights ---
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  });

  window.addEventListener('mouseleave', () => {
    document.documentElement.style.setProperty('--mouse-x', `-1000px`);
    document.documentElement.style.setProperty('--mouse-y', `-1000px`);
  });

  // --- Reusable 3D Card Tilt with Glare ---
  const tiltElements = document.querySelectorAll('.interactive-tilt');
  tiltElements.forEach(el => {
    // Inject glare overlay dynamically if missing
    if (!el.querySelector('.glare-overlay')) {
      const glare = document.createElement('div');
      glare.className = 'glare-overlay';
      el.appendChild(glare);
    }

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left; // cursor x relative to card
      const y = e.clientY - rect.top;  // cursor y relative to card

      // Save cursor position for card radial glow
      el.style.setProperty('--glow-x', `${x}px`);
      el.style.setProperty('--glow-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation ranges (capped at 7 degrees max)
      const rotateX = ((centerY - y) / centerY) * 7;
      const rotateY = ((x - centerX) / centerX) * 7;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      el.style.transition = 'transform 0.1s ease-out, border-color 0.3s ease';

      // Position the glare highlight
      const glare = el.querySelector('.glare-overlay');
      if (glare) {
        glare.style.setProperty('--glare-x', `${x}px`);
        glare.style.setProperty('--glare-y', `${y}px`);
      }
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease';
      el.style.setProperty('--glow-x', `-300px`);
      el.style.setProperty('--glow-y', `-300px`);
    });
  });

  // --- Intersection Observer for Scroll Reveals ---
  const revealElements = document.querySelectorAll('.reveal');
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach((el, index) => {
    // Add cascading transition delays for child grid cards
    if (el.classList.contains('spec-card') || el.classList.contains('value-card')) {
      el.style.transitionDelay = `${(index % 3) * 0.08}s`;
    }
    scrollObserver.observe(el);
  });

  // --- TV Channel Simulated Live Cycler ---
  const tvChannels = [
    {
      num: "CH 001",
      name: "PichiPie Live Channel",
      epg: "Sweet Solutions for Sour Problems • 10:00 PM - 11:30 PM",
      char: "P",
      resolution: "1080P HD • HLS STREAM",
      color: "rgba(124, 58, 237, 0.4)", // Violet backlight
      hue: 258
    },
    {
      num: "CH 007",
      name: "FSTV Cinema HD",
      epg: "Premium Blockbuster Movies • 08:30 PM - 11:00 PM",
      char: "F",
      resolution: "720P HD • DASH STREAM",
      color: "rgba(236, 72, 153, 0.4)", // Pink backlight
      hue: 330
    },
    {
      num: "CH 012",
      name: "Kids World TV",
      epg: "Animated Adventures Marathon • 09:00 PM - 10:30 PM",
      char: "K",
      resolution: "1080P HD • HLS STREAM",
      color: "rgba(6, 182, 212, 0.4)", // Cyan backlight
      hue: 188
    },
    {
      num: "CH 024",
      name: "World News Live",
      epg: "Global Studio Updates & Headlines • 24/7 Live Feed",
      char: "N",
      resolution: "576P SD • HTTP STREAM",
      color: "rgba(245, 158, 11, 0.35)", // Amber backlight
      hue: 38
    }
  ];

  let currentTvIndex = 0;
  const tvScreenContent = document.getElementById('tv-screen-content');
  const tvChannelNum = document.getElementById('tv-channel-num');
  const tvChannelName = document.getElementById('tv-channel-name');
  const tvEpgTitle = document.getElementById('tv-epg-title');
  const tvEpgProgress = document.getElementById('tv-epg-progress');
  const tvChannelIcon = document.getElementById('tv-channel-icon');
  const tvResolutionBadge = document.getElementById('tv-resolution-badge');
  const tvBacklight = document.getElementById('tv-backlight');

  function cycleTVChannel() {
    if (!tvScreenContent) return;

    // Trigger visual channel switch fade
    tvScreenContent.classList.add('tv-screen-transitioning');

    setTimeout(() => {
      currentTvIndex = (currentTvIndex + 1) % tvChannels.length;
      const channel = tvChannels[currentTvIndex];

      // Update Screen Details
      if (tvChannelNum) tvChannelNum.innerText = channel.num;
      if (tvChannelName) tvChannelName.innerText = channel.name;
      if (tvEpgTitle) tvEpgTitle.innerText = channel.epg;
      if (tvResolutionBadge) tvResolutionBadge.innerText = channel.resolution;

      // Update TV Screen Icon and Border Glows
      if (tvChannelIcon) {
        tvChannelIcon.innerText = channel.char;
        tvChannelIcon.style.borderColor = `hsla(${channel.hue}, 80%, 60%, 0.4)`;
        tvChannelIcon.style.backgroundColor = `hsla(${channel.hue}, 80%, 60%, 0.15)`;
        tvChannelIcon.style.color = `hsla(${channel.hue}, 80%, 75%, 1)`;
      }

      // Update TV Backlight Glow
      if (tvBacklight) {
        tvBacklight.style.background = `radial-gradient(circle, ${channel.color} 0%, transparent 70%)`;
      }

      // Randomize EPG Timeline Progress (25% to 85%)
      if (tvEpgProgress) {
        const randProgress = Math.floor(Math.random() * 60) + 25;
        tvEpgProgress.style.width = `${randProgress}%`;
      }

      // Fade back in
      tvScreenContent.classList.remove('tv-screen-transitioning');
    }, 250);
  }

  // Init channel cycler interval (8 seconds)
  if (tvScreenContent) {
    setInterval(cycleTVChannel, 8000);
  }

  // --- Phone Screen Simulated UI Cycler ---
  const phoneScreenInner = document.getElementById('phone-screen-inner');
  const phoneStates = [
    // Welcome Board
    `<div class="phone-welcome-card" style="margin-top: 10px;">
      <h4 style="font-size: 10px; color: var(--color-accent); font-family: var(--font-heading); margin-bottom: 4px;">PichiPie TV</h4>
      <p style="font-size: 7px; color: var(--text-secondary); line-height: 1.3;">100% Ad-free, private, and customizable IPTV Player.</p>
      <div class="phone-btn" style="background: var(--color-primary-light); padding: 5px; font-size: 7px; border-radius: 4px; margin-top: 8px; text-transform: uppercase; font-weight: bold; box-shadow: 0 0 8px rgba(167, 139, 250, 0.4);">Welcome Board</div>
    </div>
    <div class="phone-gesture-overlay" style="margin-top: 8px; padding: 6px;">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="phone-swipe-arrow">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
      <span style="font-size: 7px;">Swipe to Switch Channels</span>
      <div class="phone-gesture-line"></div>
    </div>`,
    
    // Buffer Connection Splash
    `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 10px; padding: 20px 0; text-align: center;">
      <div class="tv-channel-icon-circle" style="width: 50px; height: 50px; font-size: 20px; animation: pulseProgressDot 1.5s infinite alternate;">P</div>
      <div style="font-size: 7px; color: var(--color-accent-light); letter-spacing: 0.1em; font-weight: bold;">CONNECTING TO SERVER FEED...</div>
      <div style="display: flex; gap: 4px; justify-content: center;">
        <div style="width: 4px; height: 4px; border-radius: 50%; background: var(--color-accent); animation: pulseProgressDot 1.2s infinite alternate;"></div>
        <div style="width: 4px; height: 4px; border-radius: 50%; background: var(--color-primary-light); animation: pulseProgressDot 1.2s infinite alternate 0.3s;"></div>
        <div style="width: 4px; height: 4px; border-radius: 50%; background: #fff; animation: pulseProgressDot 1.2s infinite alternate 0.6s;"></div>
      </div>
    </div>`,

    // Category Lists View
    `<div style="display: flex; flex-direction: column; gap: 6px; height: 100%; text-align: left; padding: 5px 0;">
      <div style="font-size: 8px; font-weight: bold; color: var(--color-primary-light); display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px;">
        <span>CATEGORIES</span>
        <span style="color: var(--color-accent-light);">★ FAVS</span>
      </div>
      <div style="display: flex; gap: 4px; overflow: hidden; margin-top: 1px;">
        <span style="background: var(--color-accent); font-size: 6px; padding: 1.5px 4px; border-radius: 3px; font-weight: bold; color: #fff;">Movies</span>
        <span style="background: rgba(255,255,255,0.08); font-size: 6px; padding: 1.5px 4px; border-radius: 3px; color: var(--text-secondary);">Kids</span>
        <span style="background: rgba(255,255,255,0.08); font-size: 6px; padding: 1.5px 4px; border-radius: 3px; color: var(--text-secondary);">News</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
        <div style="background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 6px; padding: 4px 6px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 7px; font-weight: bold; color: #fff;">007 | FSTV Cinema HD</span>
          <span style="font-size: 7px; color: var(--color-accent);">★</span>
        </div>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; padding: 4px 6px; display: flex; align-items: center; justify-content: space-between; opacity: 0.65;">
          <span style="font-size: 7px; color: var(--text-secondary);">008 | Action Plus HD</span>
          <span style="font-size: 7px; color: var(--text-muted);">☆</span>
        </div>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; padding: 4px 6px; display: flex; align-items: center; justify-content: space-between; opacity: 0.65;">
          <span style="font-size: 7px; color: var(--text-secondary);">009 | CineMax HD</span>
          <span style="font-size: 7px; color: var(--text-muted);">☆</span>
        </div>
      </div>
    </div>`,

    // Swiping Playback Mode
    `<div class="phone-gesture-overlay" style="padding: 12px 6px; display: flex; flex-direction: column; justify-content: center; height: 100%; border: 1px dashed rgba(236, 72, 153, 0.25); background: rgba(236, 72, 153, 0.02);">
      <div style="font-size: 7px; color: var(--color-accent); font-weight: bold; margin-bottom: 2px; text-transform: uppercase;">NOW PLAYING</div>
      <div style="font-size: 8px; color: #fff; font-weight: bold; margin-bottom: 12px;">FSTV Cinema HD • 1080P</div>
      
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-primary-light)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="phone-swipe-arrow">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
      <span style="font-size: 7px; font-weight: 500; color: #fff;">Swipe Up/Down to Switch</span>
      <span style="font-size: 6px; color: var(--text-muted); margin-top: 2px;">Slide Right Edge for Volume</span>
      <div class="phone-gesture-line" style="height: 36px; right: 4px;"></div>
    </div>`
  ];

  let currentPhoneIndex = 0;
  function cyclePhoneState() {
    if (!phoneScreenInner) return;

    phoneScreenInner.classList.add('tv-screen-transitioning');

    setTimeout(() => {
      currentPhoneIndex = (currentPhoneIndex + 1) % phoneStates.length;
      phoneScreenInner.innerHTML = phoneStates[currentPhoneIndex];
      phoneScreenInner.classList.remove('tv-screen-transitioning');
    }, 250);
  }

  // Init phone UI states interval (6 seconds)
  if (phoneScreenInner) {
    setInterval(cyclePhoneState, 6000);
  }

  // --- QR Code Modal Interactions ---
  const qrTrigger = document.getElementById('qr-trigger');
  const qrModal = document.getElementById('qr-modal');
  const qrModalClose = document.getElementById('qr-modal-close');
  const qrCodeImg = document.getElementById('qr-code-img');
  const qrLinkText = document.getElementById('qr-link-text');

  if (qrTrigger && qrModal && qrModalClose) {
    const downloadUrl = `${window.location.origin}/download`;

    qrTrigger.addEventListener('click', () => {
      if (qrCodeImg) {
        qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(downloadUrl)}`;
      }
      if (qrLinkText) {
        qrLinkText.innerText = downloadUrl;
      }
      qrModal.classList.add('active');
    });

    const closeModal = () => qrModal.classList.remove('active');

    qrModalClose.addEventListener('click', closeModal);
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) closeModal();
    });
  }

  // --- Copy Support Email Utility ---
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const copyBtnText = document.getElementById('copy-btn-text');
  const iconCopy = document.getElementById('icon-copy');

  if (btnCopyEmail && copyBtnText) {
    btnCopyEmail.addEventListener('click', () => {
      const email = 'pichipie.official@gmail.com';
      
      navigator.clipboard.writeText(email).then(() => {
        // Change text state
        copyBtnText.innerText = 'Copied!';
        btnCopyEmail.style.borderColor = '#10b981';
        btnCopyEmail.style.background = 'rgba(16, 185, 129, 0.08)';
        
        // Show check icon instead of copies SVG icon
        if (iconCopy) {
          iconCopy.outerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" id="icon-copy"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        }
        
        // Reset copy button after 2.5 seconds
        setTimeout(() => {
          copyBtnText.innerText = 'Copy Email';
          btnCopyEmail.style.borderColor = '';
          btnCopyEmail.style.background = '';
          const newIcon = document.getElementById('icon-copy');
          if (newIcon) {
            newIcon.outerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="icon-copy"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          }
        }, 2500);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });
  }

  // --- Interactive Premium Background Logic (Soft Floating Ambient Dust Motes) ---
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let particleCount = 30; // Soft ambient quantity
    let mouse = { x: null, y: null };

    // Track Mouse Position
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Resize canvas
    const resizeCanvas = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      if (window.innerWidth < 768) {
        particleCount = 15;
      } else {
        particleCount = 30;
      }
    };

    let w = 0;
    let h = 0;
    let raf = 0;

    // Particle Class: Soft Floating Ambient Dust Motes
    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * w;
        // If initializing, scatter across screen. Otherwise, spawn below viewport.
        this.y = init ? Math.random() * h : h + 20;
        // Drifting slowly upwards
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = -0.15 - Math.random() * 0.25; // Negative Y speed to move up
        this.radius = Math.random() * 6 + 4; // Large, soft particles
        // Vary colors between brand primary (violet), accent (pink), and soft cyan
        const rand = Math.random();
        if (rand > 0.6) {
          this.color = { r: 255, g: 107, b: 157 }; // Pink
        } else if (rand > 0.3) {
          this.color = { r: 108, g: 58, b: 225 };  // Violet
        } else {
          this.color = { r: 6, g: 182, b: 212 };   // Cyan
        }
        this.alpha = Math.random() * 0.25 + 0.1; // Soft, ambient opacities
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Mouse interactive repulsion (push away from mouse cursor)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180 * 0.4;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force;
            this.y += Math.sin(angle) * force;
          }
        }

        // Reset when exiting the top or side boundaries
        if (this.y < -20 || this.x < -20 || this.x > w + 20) {
          this.reset(false);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // Draw particles with rich, blurry radial glows
        ctx.shadowBlur = this.radius * 2.5;
        ctx.shadowColor = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
        ctx.fill();
        ctx.restore();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      raf = requestAnimationFrame(draw);
    };

    resizeCanvas();
    initParticles();
    draw();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    window.addEventListener('load', () => {
      resizeCanvas();
      initParticles();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        draw();
      }
    });
  }

})();

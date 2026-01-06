/**
 * STAR WARS CHARACTER CREATOR - VISUAL EFFECTS
 */

// =============================================================================
// AUDIO SYSTEM
// =============================================================================

const AudioManager = {
  music: null,
  scanSound: null,
  selectSound: null,
  initialized: false,
  musicEnabled: true,
  sfxEnabled: true,
  
  init() {
    if (this.initialized) return;
    
    // Create audio elements
    this.music = new Audio('assets/Audio/music.mp3');
    this.music.loop = true;
    this.music.volume = 0.7;
    
    this.scanSound = new Audio('assets/Audio/scan.mp3');
    this.scanSound.volume = 0.3;
    
    this.selectSound = new Audio('assets/Audio/select.mp3');
    this.selectSound.volume = 0.7;
    
    this.initialized = true;
  },
  
  // Start background music (requires user interaction first)
  startMusic() {
    if (!this.initialized) this.init();
    if (!this.musicEnabled) return;
    
    this.music.play().catch(e => {
      // Autoplay blocked - will retry on user interaction
      console.log('Music autoplay blocked, waiting for user interaction');
    });
  },
  
  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  },
  
  // Play scan sound effect
  playScan() {
    if (!this.initialized) this.init();
    if (!this.sfxEnabled) return;
    
    // Reset and play
    this.scanSound.currentTime = 0;
    this.scanSound.play().catch(() => {});
  },
  
  // Play select sound effect
  playSelect() {
    if (!this.initialized) this.init();
    if (!this.sfxEnabled) return;
    
    // Reset and play
    this.selectSound.currentTime = 0;
    this.selectSound.play().catch(() => {});
  },
  
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  },
  
  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }
};

// =============================================================================
// VISUAL EFFECTS
// =============================================================================

/**
 * Flicker effect for datapad authenticity
 */
function startFlicker() {
  const el = $('#flicker');
  if (!el) return;
  
  const tick = () => {
    const on = Math.random() < 0.18;
    el.classList.toggle('on', on);
    const delay = 120 + Math.random() * 650;
    setTimeout(tick, delay);
  };
  tick();
}

/**
 * CRT refresh sweep effect
 */
function startRefreshSweep() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  const el = $('#refresh');
  if (!el) return;
  
  const fire = () => {
    el.classList.remove('on');
    void el.offsetWidth; // Force reflow
    el.classList.add('on');
    // Play scan sound synced with visual
    AudioManager.playScan();
  };
  
  const tick = () => {
    if (Math.random() < 0.40) fire();
    const delay = 1800 + Math.random() * 5200;
    setTimeout(tick, delay);
  };
  
  el.addEventListener('animationend', () => el.classList.remove('on'));
  tick();
}

/**
 * STAR WARS CHARACTER CREATOR - VISUAL EFFECTS
 */

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
  };
  
  const tick = () => {
    if (Math.random() < 0.40) fire();
    const delay = 1800 + Math.random() * 5200;
    setTimeout(tick, delay);
  };
  
  el.addEventListener('animationend', () => el.classList.remove('on'));
  tick();
}

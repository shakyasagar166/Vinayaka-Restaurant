// Kitchen Service Desk Bell & Audio Notification Engine
// Designed for Garam Masala Family Restaurant Admin & Kitchen Staff

let audioContext = null;
let isUnlocked = false;

// Initialize or resume the Web Audio Context
export function getAudioContext() {
  try {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    if (audioContext && audioContext.state === 'running') {
      isUnlocked = true;
    }
  } catch (e) {
    console.warn("AudioContext init error:", e);
  }
  return audioContext;
}

// Global user interaction listener to silently unlock browser autoplay
export function isAudioUnlocked() {
  return Boolean(isUnlocked || (audioContext && audioContext.state === 'running'));
}

if (typeof window !== 'undefined') {
  const unlockAudio = async () => {
    try {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }
        if (ctx.state === 'running') {
          isUnlocked = true;
          window.dispatchEvent(new CustomEvent('gm_audio_unlocked'));
        }
      }
    } catch (e) {}
  };

  ['click', 'touchstart', 'touchend', 'keydown'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { passive: true });
  });
}

// Generate single bell tone with realistic brass harmonics & acoustic decay
function strikeBellHarmonic(ctx, freq, startTime, duration = 1.0, masterVol = 0.5) {
  // Acoustic metallic harmonics: fundamental, octave, minor third, fifth, upper overtone
  const harmonics = [
    { mult: 1.0, amp: 1.0, decay: 1.0 },
    { mult: 2.0, amp: 0.6, decay: 0.85 },
    { mult: 2.76, amp: 0.4, decay: 0.65 },
    { mult: 3.98, amp: 0.25, decay: 0.45 },
    { mult: 5.4, amp: 0.15, decay: 0.3 }
  ];

  harmonics.forEach(({ mult, amp, decay }) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * mult, startTime);

      const targetVol = Math.max(0.0001, masterVol * amp);
      gain.gain.setValueAtTime(0.0001, startTime);
      // Fast strike attack (5ms)
      gain.gain.exponentialRampToValueAtTime(targetVol, startTime + 0.008);
      // Natural exponential ringing decay
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * decay));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + (duration * decay) + 0.05);
    } catch (err) {
      console.warn("Bell strike error:", err);
    }
  });
}

// Generate an authentic "Ding - Dong ... Ding - Dong" Restaurant Kitchen Service Bell
export async function playKitchenBell(options = {}) {
  const { repeat = 2, volume = 0.55 } = options;

  // Check user preference
  const isMuted = localStorage.getItem('gm_bell_muted') === 'true';
  if (isMuted && !options.force) {
    return false;
  }

  // Trigger mobile vibration if device supports it
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([250, 100, 250, 100, 400]);
    } catch (e) {}
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Cycle 1: "Ding" (B5: ~987.77 Hz) -> "Dong" (G5: ~783.99 Hz)
    strikeBellHarmonic(ctx, 987.77, now, 0.9, volume);
    strikeBellHarmonic(ctx, 783.99, now + 0.28, 1.2, volume * 1.1);

    // Optional Cycle 2 for high kitchen urgency: "Ding" -> "Dong" again
    if (repeat >= 2) {
      strikeBellHarmonic(ctx, 987.77, now + 0.75, 0.9, volume * 0.95);
      strikeBellHarmonic(ctx, 783.99, now + 1.03, 1.3, volume * 1.05);
    }

    return true;
  } catch (err) {
    console.warn("Could not play kitchen bell via Web Audio:", err);
    return false;
  }
}

// Test Bell function (Forces play even if suspended, returns result message)
export async function testKitchenBell() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {}
  }
  const played = await playKitchenBell({ repeat: 2, volume: 0.6, force: true });
  return played;
}

// Bell Mute toggle helpers
export function isBellMuted() {
  return localStorage.getItem('gm_bell_muted') === 'true';
}

export function setBellMuted(muted) {
  localStorage.setItem('gm_bell_muted', muted ? 'true' : 'false');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gm_bell_mute_changed', { detail: { muted } }));
  }
}

// Global Order Tracker (prevents double chimes across tabs & handles cross-device polling)
const knownOrderIds = new Set();
let isInitialized = false;

export function checkAndNotifyNewOrders(orders = []) {
  if (!Array.isArray(orders)) return { hasNew: false, newOrders: [] };

  // First time initialization: check if any recent pending order was placed in last 3 mins
  if (!isInitialized) {
    const now = Date.now();
    const recentPending = orders.filter(o => {
      if (o.status !== 'PENDING') return false;
      const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : 0;
      return (now - orderTime) < 180000; // 3 minutes
    });

    orders.forEach(o => {
      const idKey = String(o.id || o.orderNumber);
      if (idKey) knownOrderIds.add(idKey);
    });
    isInitialized = true;

    if (recentPending.length > 0) {
      playKitchenBell({ repeat: 2, volume: 0.6 });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gm_new_order_received', {
          detail: recentPending[0]
        }));
        window.dispatchEvent(new CustomEvent('garam_masala_order_placed', {
          detail: recentPending[0]
        }));
      }
      return { hasNew: true, newOrders: recentPending };
    }
    return { hasNew: false, newOrders: [] };
  }

  // Find newly placed orders (specifically PENDING status requiring Captain verification)
  const newlyPlacedOrders = orders.filter(o => {
    const idKey = String(o.id || o.orderNumber);
    return idKey && !knownOrderIds.has(idKey) && o.status === 'PENDING';
  });

  // Always mark all incoming orders as known so they don't re-trigger
  orders.forEach(o => {
    const idKey = String(o.id || o.orderNumber);
    if (idKey) knownOrderIds.add(idKey);
  });

  if (newlyPlacedOrders.length > 0) {
    // Ring the kitchen bell!
    playKitchenBell({ repeat: 2, volume: 0.6 });

    // Show native browser notification if permitted
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const first = newlyPlacedOrders[0];
        new Notification(`🔔 Naya Order: Table ${first.tableNumber}`, {
          body: `Bill: ₹${first.totalAmount} • Customer: ${first.customerName || 'Guest'}`,
          icon: '/favicon.ico'
        });
      }
    } catch (e) {}

    // Dispatch global events for instant reactive UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gm_new_order_received', {
        detail: newlyPlacedOrders[0]
      }));
      window.dispatchEvent(new CustomEvent('garam_masala_order_placed', {
        detail: newlyPlacedOrders[0]
      }));
    }

    return { hasNew: true, newOrders: newlyPlacedOrders };
  }

  return { hasNew: false, newOrders: [] };
}

// Request Notification Permission
export async function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      try {
        return await Notification.requestPermission();
      } catch (e) {}
    }
    return Notification.permission;
  }
  return 'unsupported';
}

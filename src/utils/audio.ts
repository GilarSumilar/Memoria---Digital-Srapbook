/**
 * Audio Synthesizer untuk Efek Suara Membalik Halaman Buku (Page-Flip Sound)
 * Menggunakan Web Audio API sehingga tidak bergantung pada aset audio eksternal.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Mainkan suara gemerisik kertas saat halaman dibalik
 */
export function playPageFlipSound(volume: number = 0.25): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.28;

    // Buat buffer noise putih untuk mensimulasikan gesekan serat kertas
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Filter bandpass untuk karakter suara kertas tebal
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(450, now + duration);
    filter.Q.setValueAtTime(1.8, now);

    // Gain envelope (suara mulai lembut, memuncak lalu memudar lembut)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);
  } catch (err) {
    console.debug('Page flip audio could not play:', err);
  }
}

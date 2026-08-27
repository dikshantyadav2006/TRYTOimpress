const SAMPLE_RATE = 11025;
const LOOP_SECONDS = 4.8;

interface MelodyNote {
  freq: number;
  start: number;
  duration: number;
  volume?: number;
}

const MELODY: MelodyNote[] = [
  { freq: 523.25, start: 0.0, duration: 0.6 },
  { freq: 659.25, start: 0.6, duration: 0.6 },
  { freq: 783.99, start: 1.2, duration: 0.6 },
  { freq: 659.25, start: 1.8, duration: 0.6 },
  { freq: 587.33, start: 2.4, duration: 0.6 },
  { freq: 523.25, start: 3.0, duration: 0.6 },
  { freq: 440.0, start: 3.6, duration: 1.2 },
  { freq: 261.63, start: 0.0, duration: 4.8, volume: 0.07 },
  { freq: 329.63, start: 0.0, duration: 4.8, volume: 0.05 },
];

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function buildWav(): Uint8Array {
  const totalSamples = Math.floor(LOOP_SECONDS * SAMPLE_RATE);
  const buffer = new ArrayBuffer(44 + totalSamples);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint32(0, 0x46464952, false);
  view.setUint32(4, 36 + totalSamples, true);
  view.setUint32(8, 0x45564157, false);
  view.setUint32(12, 0x20746d66, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  view.setUint32(36, 0x61746164, false);
  view.setUint32(40, totalSamples, true);

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    for (const note of MELODY) {
      const local = t - note.start;
      if (local < 0 || local > note.duration) continue;

      const attack = Math.min(1, local / 0.04);
      const release = Math.min(1, (note.duration - local) / 0.18);
      const envelope = Math.max(0, attack * release);
      const vibrato = 1 + 0.004 * Math.sin(2 * Math.PI * 5 * t);
      const fundamental = Math.sin(2 * Math.PI * note.freq * vibrato * t);
      const overtone = Math.sin(2 * Math.PI * note.freq * 2 * t) * 0.22;

      sample += (fundamental + overtone) * envelope * (note.volume ?? 0.16);
    }

    const clamped = Math.max(-1, Math.min(1, sample));
    bytes[44 + i] = Math.round((clamped * 0.5 + 0.5) * 255);
  }

  return bytes;
}

let cachedSrc: string | null = null;

export function getMelodySrc(): string {
  if (cachedSrc) return cachedSrc;
  if (typeof btoa !== "function") return "";
  cachedSrc = `data:audio/wav;base64,${toBase64(buildWav())}`;
  return cachedSrc;
}

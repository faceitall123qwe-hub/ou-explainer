import { writeFileSync } from "node:fs";

const SR = 44100;
const DUR = 143;
const BPM = 92;
const beat = 60 / BPM;
const bar = beat * 4;
const N = Math.floor(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// Am9 - Fmaj7 - C(add9) - G6, two bars each
const chords = [
  [45, 57, 60, 64, 71],
  [41, 57, 60, 64, 69],
  [48, 55, 62, 64, 67],
  [43, 55, 59, 62, 64],
];
const chordLen = bar * 2;

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

for (let c = 0; c * chordLen < DUR; c++) {
  const notes = chords[c % chords.length];
  const t0 = c * chordLen;
  const fade = 1.6;
  const len = chordLen + fade;
  for (const [k, m] of notes.entries()) {
    const f = hz(m);
    const gain = (k === 0 ? 0.16 : 0.07) / 1;
    const pan = k === 0 ? 0.5 : (k % 2 ? 0.3 : 0.7);
    for (let s = Math.floor(t0 * SR); s < Math.min(N, Math.floor((t0 + len) * SR)); s++) {
      const t = s / SR - t0;
      const env = Math.min(1, t / fade) * Math.min(1, (len - t) / fade);
      const v =
        gain * env * (Math.sin(2 * Math.PI * f * t) * 0.7 + Math.sin(2 * Math.PI * f * 1.003 * t + 1) * 0.3 + Math.sin(4 * Math.PI * f * t) * 0.08);
      L[s] += v * (1 - pan);
      R[s] += v * pan;
    }
  }
  // soft plucked arpeggio, eighth notes
  const arp = [notes[2] + 12, notes[3] + 12, notes[4] + 12, notes[3] + 12];
  for (let e = 0; e < 16; e++) {
    if (rnd() < 0.22) continue;
    const st = t0 + e * (beat / 2);
    const f = hz(arp[e % arp.length]);
    const pan = 0.35 + 0.3 * rnd();
    const g = 0.045 * (0.75 + 0.25 * rnd());
    for (let s = Math.floor(st * SR); s < Math.min(N, Math.floor((st + 1.4) * SR)); s++) {
      const t = s / SR - st;
      const env = Math.min(1, t / 0.008) * Math.exp(-t * 3.2);
      const v = g * env * (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 6));
      L[s] += v * (1 - pan);
      R[s] += v * pan;
    }
  }
}

// global fade in/out + normalize
let peak = 0;
for (let s = 0; s < N; s++) {
  const t = s / SR;
  const g = Math.min(1, t / 2.5) * Math.min(1, (DUR - t) / 4);
  L[s] *= g;
  R[s] *= g;
  peak = Math.max(peak, Math.abs(L[s]), Math.abs(R[s]));
}
const norm = 0.8 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let s = 0; s < N; s++) {
  buf.writeInt16LE(Math.round(L[s] * norm * 32767), 44 + s * 4);
  buf.writeInt16LE(Math.round(R[s] * norm * 32767), 46 + s * 4);
}
writeFileSync(process.argv[2] || "music-raw.wav", buf);

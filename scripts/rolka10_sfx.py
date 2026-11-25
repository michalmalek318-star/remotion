"""Syntetyczna ścieżka do Rolka10s: puls 120 BPM, uderzenia + narastanie przed cięciami, glitch-trzaski.
Bez zewnętrznych sampli (brak praw autorskich). Uruchom: python3 scripts/rolka10_sfx.py
Zapisuje public/rolka10/beat.wav. CUTS muszą zgadzać się z CUTS w src/Rolka10s.tsx."""
import wave
import numpy as np

SR = 44100
FPS = 30
TOTAL = 300 / FPS
CUTS = [0, 60, 120, 195, 255]
BEAT = 0.5

n = int(TOTAL * SR)
out = np.zeros(n)
rng = np.random.default_rng(11)


def add(sig, t, gain=1.0):
    i = int(t * SR)
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(n, i + len(sig))
    if i < n:
        out[i:j] += sig[: j - i] * gain


def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 110 * np.exp(-t * 18) + 42
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat():
    t = np.arange(int(0.05 * SR)) / SR
    noise = np.diff(np.concatenate([[0], rng.standard_normal(len(t))]))
    return noise * np.exp(-t * 80) * 0.25


def impact():
    t = np.arange(int(1.2 * SR)) / SR
    sub = np.sin(2 * np.pi * (48 * np.exp(-t * 2) + 30) * t) * np.exp(-t * 3)
    return sub + rng.standard_normal(len(t)) * np.exp(-t * 14) * 0.5


def riser(d=0.5):
    t = np.arange(int(d * SR)) / SR
    sweep = np.sin(2 * np.pi * np.cumsum(300 + 2500 * (t / d) ** 2) / SR)
    return (rng.standard_normal(len(t)) * 0.35 + sweep * 0.25) * (t / d) ** 2.5


def glitch():
    # krótkie, cyfrowe trzaski (bitcrush szumu)
    t = np.arange(int(0.18 * SR)) / SR
    s = np.sign(np.sin(2 * np.pi * 1800 * t)) * (rng.random(len(t)) > 0.5)
    return np.repeat(s[::40], 40)[: len(t)] * 0.25 * np.exp(-t * 12)


def drone():
    t = np.arange(int(2.0 * SR)) / SR
    return (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t)) * np.minimum(1, t * 2) * 0.25


k, h = kick(), hat()
add(drone(), 0, 0.8)  # hak: bez bitu, tylko pomruk
b = CUTS[1] / FPS
while b < TOTAL - 0.4:
    add(k, b, 0.9)
    add(h, b + BEAT / 2, 1.0)
    b += BEAT

for c in CUTS:
    t = c / FPS
    add(impact(), t, 0.8 if c else 0.55)
    add(glitch(), t + 0.02, 1.0)
    if c:
        add(riser(), t - 0.5, 0.6)

fade = int(0.8 * SR)
out[-fade:] *= np.linspace(1, 0, fade)
out = np.tanh(out * 1.2)
out /= np.max(np.abs(out)) * 1.12
pcm = (out * 32767).astype(np.int16)
with wave.open('public/rolka10/beat.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())
print('ok', TOTAL, 's')

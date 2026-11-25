"""Syntetyczna ścieżka do ExportStories: puls 120 BPM, uderzenia na cięciach, narastanie przed cięciami.
Bez zewnętrznych sampli (brak praw autorskich). Uruchom: python3 scripts/eksport_sfx.py
Zapisuje public/eksport/beat.wav. Czasy cięć muszą zgadzać się z CUTS w src/ExportStories.tsx."""
import wave
import numpy as np

SR = 44100
FPS = 30
TOTAL = 1080 / FPS
CUTS = [0, 60, 180, 330, 510, 705, 900]  # klatki
BEAT = 0.5  # 120 BPM

n = int(TOTAL * SR)
out = np.zeros(n)
rng = np.random.default_rng(7)


def add(sig, t, gain=1.0):
    i = int(t * SR)
    j = min(n, i + len(sig))
    if i < n:
        out[i:j] += sig[: j - i] * gain


def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 110 * np.exp(-t * 18) + 42
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat():
    t = np.arange(int(0.05 * SR)) / SR
    noise = rng.standard_normal(len(t))
    noise = np.diff(np.concatenate([[0], noise]))  # prosty filtr górnoprzepustowy
    return noise * np.exp(-t * 80) * 0.25


def impact():
    t = np.arange(int(1.2 * SR)) / SR
    sub = np.sin(2 * np.pi * (48 * np.exp(-t * 2) + 30) * t) * np.exp(-t * 3)
    noise = rng.standard_normal(len(t)) * np.exp(-t * 14) * 0.5
    return sub + noise


def riser(d=0.5):
    t = np.arange(int(d * SR)) / SR
    noise = rng.standard_normal(len(t))
    sweep = np.sin(2 * np.pi * np.cumsum(300 + 2500 * (t / d) ** 2) / SR)
    env = (t / d) ** 2.5
    return (noise * 0.35 + sweep * 0.25) * env


k, h = kick(), hat()
b = 0.0
while b < TOTAL - 0.2:
    if b >= CUTS[1] / FPS:  # okładka bez bitu, sam „drop” po okładce
        add(k, b, 0.9)
        add(h, b + BEAT / 2, 1.0)
    b += BEAT

for c in CUTS:
    t = c / FPS
    add(impact(), t, 0.8 if c else 0.6)
    if c:
        add(riser(), t - 0.5, 0.6)

# wyciszenie na końcu
fade = int(1.0 * SR)
out[-fade:] *= np.linspace(1, 0, fade)
out = np.tanh(out * 1.2)
out /= np.max(np.abs(out)) * 1.12
pcm = (out * 32767).astype(np.int16)
stereo = np.repeat(pcm[:, None], 2, axis=1)
with wave.open('public/eksport/beat.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('ok', TOTAL, 's')

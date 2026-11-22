# Generuje proste efekty dźwiękowe (whoosh, tick, glitch, rise, hit) do public/sfx. Bez zewnętrznych plików.
import numpy as np, wave, os, sys
SR = 48000
out = sys.argv[1] if len(sys.argv) > 1 else 'public/sfx'
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)
def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    st = np.repeat((x * 32767).astype(np.int16)[:, None], 2, axis=1)
    with wave.open(f'{out}/{name}.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
def t(d): return np.linspace(0, d, int(SR * d), endpoint=False)
def lp(x, a):  # prosty filtr dolnoprzepustowy o zmiennym współczynniku
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s); y[i] = s
    return y
# whoosh: szum z narastającym i opadającym filtrem
d = 0.55; tt = t(d); n = rng.standard_normal(len(tt))
env = np.sin(np.pi * tt / d) ** 2
save('whoosh', lp(n, 0.02 + 0.25 * env) * env)
# tick: krótki klik
tt = t(0.08); save('tick', np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt * 60))
# glitch: cyfrowe trzaski
tt = t(0.4); g = np.sign(np.sin(2 * np.pi * (300 + 900 * rng.random()) * tt)) * (rng.random(len(tt)) > 0.6)
save('glitch', g * np.exp(-tt * 6) * 0.6 + rng.standard_normal(len(tt)) * 0.15 * np.exp(-tt * 10))
# rise: narastający ton (napięcie przed odsłoną)
d = 1.3; tt = t(d); f = 120 + 500 * (tt / d) ** 2
save('rise', np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / d) ** 1.5 + lp(rng.standard_normal(len(tt)), 0.05 + 0.3 * tt / d) * 0.3 * tt / d)
# hit: niski uderzeniowy bas
tt = t(0.9); f = 110 * np.exp(-tt * 4) + 40
save('hit', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5) + rng.standard_normal(len(tt)) * np.exp(-tt * 40) * 0.4)

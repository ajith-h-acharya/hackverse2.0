# -*- coding: utf-8 -*-
"""Phase 4: Download final images using verified Wikipedia URLs from browser research."""
import sys, io, os, time, urllib.request, ssl
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "public", "images")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
AGENT = "MangaluruNavigator/1.0 (educational; contact@example.com) Python/3.13"

# Verified URLs from Wikipedia (found by browser subagent)
FINAL = {
    "loc_krishna_matha_udupi.jpg":   "https://upload.wikimedia.org/wikipedia/commons/7/7d/Udupi_Sri_Krishna_Matha_Temple.jpg",
    "loc_kukke_subramanya.jpg":      "https://upload.wikimedia.org/wikipedia/commons/5/5f/Kukke_Subramanya_Swami.jpg",
    "loc_dharmasthala.jpg":          "https://upload.wikimedia.org/wikipedia/commons/d/d1/Dharmasthala_Temple.jpg",
    "loc_zeenath_masjid.jpg":        "https://upload.wikimedia.org/wikipedia/commons/3/3f/Jumma_mazjid%2C_Zinad_Baksh%2C_Bunder%2C_Mangalore-2.jpg",
    "loc_rosario_cathedral.jpg":     "https://upload.wikimedia.org/wikipedia/commons/e/e8/Rosario_Cathedral.jpg",
    "loc_milagres_church.jpg":       "https://upload.wikimedia.org/wikipedia/commons/b/b8/Milagres_Hampankatta.jpg",
    # Unsplash fallbacks for remaining
    "loc_aloyseum.jpg":              "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop",
    "loc_city_centre_mall.jpg":      "https://images.unsplash.com/photo-1519567770-c1f0d0ab7a8c?q=80&w=800&auto=format&fit=crop",
    "loc_stella_maris_church.jpg":   "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=800&auto=format&fit=crop",
}

def download(fname, url):
    path = os.path.join(OUTPUT_DIR, fname)
    if os.path.exists(path) and os.path.getsize(path) > 10_000:
        print(f"  SKIP {fname} ({os.path.getsize(path)//1024}KB)")
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": AGENT})
        with urllib.request.urlopen(req, context=ctx, timeout=25) as resp:
            data = resp.read()
        if len(data) < 5000:
            raise ValueError(f"Too small: {len(data)} bytes")
        with open(path, "wb") as f:
            f.write(data)
        print(f"  OK   {fname} ({len(data)//1024}KB)")
        return True
    except Exception as e:
        print(f"  FAIL {fname}: {e}")
        return False

if __name__ == "__main__":
    print(f"\n{'='*55}\nPhase 4: Final {len(FINAL)} images\n{'='*55}\n")
    ok = fail = 0
    for fname, url in FINAL.items():
        if download(fname, url): ok += 1
        else: fail += 1
        time.sleep(1.5)
    print(f"\nDone: {ok} OK, {fail} failed\n")

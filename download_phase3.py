# -*- coding: utf-8 -*-
"""
Phase 3: Download the final 14 failed images using direct working Unsplash URLs.
"""
import sys, io, os, time, urllib.request, ssl
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "public", "images")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"

# These are the 14 remaining failed images with working Unsplash alternatives
REMAINING = {
    # Famous Krishna temple - use generic Indian temple shot
    "loc_krishna_matha_udupi.jpg":   "https://images.unsplash.com/photo-1567591370429-2e15c37fbddd?q=80&w=800&auto=format&fit=crop",
    # Kukke Subramanya - forest temple
    "loc_kukke_subramanya.jpg":      "https://images.unsplash.com/photo-1590502593747-4229b4c482bf?q=80&w=800&auto=format&fit=crop",
    # Dharmasthala - pilgrimage site
    "loc_dharmasthala.jpg":          "https://images.unsplash.com/photo-1590502593747-4229b4c482bf?q=80&w=800&auto=format&fit=crop",
    # Zeenath Baksh Masjid - mosque
    "loc_zeenath_masjid.jpg":        "https://images.unsplash.com/photo-1564571420294-10b693a3f3eb?q=80&w=800&auto=format&fit=crop",
    # Rosario Cathedral - Portuguese church
    "loc_rosario_cathedral.jpg":     "https://images.unsplash.com/photo-1548625361-ec853715b746?q=80&w=800&auto=format&fit=crop",
    # Milagres Church - old colonial church
    "loc_milagres_church.jpg":       "https://images.unsplash.com/photo-1543330386-89680ee110b9?q=80&w=800&auto=format&fit=crop",
    # Aloyseum - museum with antiques
    "loc_aloyseum.jpg":              "https://images.unsplash.com/photo-1581875403743-23e2a3a90ae0?q=80&w=800&auto=format&fit=crop",
    # City Centre Mall Mangaluru
    "loc_city_centre_mall.jpg":      "https://images.unsplash.com/photo-1519567770-c1f0d0ab7a8c?q=80&w=800&auto=format&fit=crop",
    # Nexus/Forum Mall
    "loc_nexus_mall.jpg":            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    # Bharat Mall
    "loc_bharat_mall.jpg":           "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800&auto=format&fit=crop",
    # Canara Mall Manipal
    "loc_canara_mall.jpg":           "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop",
    # Empire Mall MG Road
    "loc_empire_mall.jpg":           "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800&auto=format&fit=crop",
    # Museum of Anatomy - Manipal University building
    "loc_anatomy_museum.jpg":        "https://images.unsplash.com/photo-1576153192396-180ecef2a715?q=80&w=800&auto=format&fit=crop",
    # Stella Maris Church - boat-shaped church
    "loc_stella_maris_church.jpg":   "https://images.unsplash.com/photo-1543330386-89680ee110b9?q=80&w=800&auto=format&fit=crop",
}


def download(fname, url):
    path = os.path.join(OUTPUT_DIR, fname)
    if os.path.exists(path) and os.path.getsize(path) > 10_000:
        print(f"  SKIP  {fname} ({os.path.getsize(path)//1024}KB)")
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": AGENT})
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            data = resp.read()
        if len(data) < 5000:
            print(f"  TINY  {fname}: {len(data)} bytes")
            return False
        with open(path, "wb") as f:
            f.write(data)
        print(f"  OK    {fname} ({len(data)//1024}KB)")
        return True
    except Exception as e:
        print(f"  FAIL  {fname}: {e}")
        return False


if __name__ == "__main__":
    print(f"\n{'='*60}")
    print(f"Phase 3: Downloading {len(REMAINING)} remaining images")
    print(f"{'='*60}\n")
    ok = fail = 0
    for fname, url in REMAINING.items():
        if download(fname, url):
            ok += 1
        else:
            fail += 1
        time.sleep(0.3)
    print(f"\n{'='*60}")
    print(f"Done: {ok} succeeded, {fail} failed")
    print(f"{'='*60}\n")

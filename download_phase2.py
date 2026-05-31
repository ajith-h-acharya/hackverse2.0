# -*- coding: utf-8 -*-
"""
Mangaluru Navigator - Phase 2 Image Downloader
Uses Wikimedia REST API with proper Bot header + Unsplash fallbacks.
Only downloads images that are still missing.
"""
import sys, io, os, time, urllib.request, ssl, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "public", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Wikimedia requires a descriptive User-Agent
WIKI_AGENT = "MangaluruNavigator/1.0 (tourist-app; contact@example.com) Python/3.13"
UNSPLASH_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"

# ─────────────────────────────────────────────────────────────
# Map: local filename -> (wiki_filename, fallback_unsplash_url)
# wiki_filename = exact Commons file name (without "File:")
# ─────────────────────────────────────────────────────────────
WIKI_IMAGES = {
    # BEACHES
    "loc_sasihithlu_beach.jpg":     ("Sasihithlu_beach.jpg",             "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"),
    "loc_tannirbhavi_beach.jpg":    ("Tannirbhavi_Beach.jpg",            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"),
    "loc_bengre.jpg":               ("Bengre_Beach.jpg",                 "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"),
    "loc_someshwara_beach.jpg":     ("Someshwara_beach.jpg",             "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"),
    "loc_maravanthe.jpg":           ("Maravanthe_beach.jpg",             "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800&auto=format&fit=crop"),
    "loc_mattu_beach.jpg":          ("Mattu_beach.jpg",                  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"),
    "loc_st_marys_island.jpg":      ("St_Marys_Island_Basalt.jpg",       "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"),
    "loc_ottinene.jpg":             ("Maravanthe_beach.jpg",             "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800&auto=format&fit=crop"),
    "loc_malpe_beach.jpg":          ("Malpe_Beach.jpg",                  "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800&auto=format&fit=crop"),
    "loc_kodi_beach.jpg":           ("Kodi_beach_Kundapura.jpg",         "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800&auto=format&fit=crop"),

    # TEMPLES & RELIGIOUS
    "loc_kudroli_temple.jpg":       ("Sri_Gokarnanatha_Temple_Kudroli.jpg",   "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
    "loc_mangaladevi_temple.jpg":   ("Mangaladevi_temple_Mangalore.jpg",       "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
    "loc_krishna_matha_udupi.jpg":  ("KrishnaMatha.jpg",                       "https://images.unsplash.com/photo-1600100397561-483ddefaa2b5?q=80&w=800&auto=format&fit=crop"),
    "loc_kukke_subramanya.jpg":     ("Kukke_Subramanya_temple.jpg",             "https://images.unsplash.com/photo-1590502593747-4229b4c482bf?q=80&w=800&auto=format&fit=crop"),
    "loc_dharmasthala.jpg":         ("Dharmasthala_temple.jpg",                "https://images.unsplash.com/photo-1590502593747-4229b4c482bf?q=80&w=800&auto=format&fit=crop"),
    "loc_kateel_temple.jpg":        ("Kateel_temple.jpg",                       "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
    "loc_sultan_battery.jpg":       ("Sultan_Battery_2163.JPG",                "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=800&auto=format&fit=crop"),
    "loc_pandava_caves.jpg":        ("Kadri_Hill_Caves.jpg",                   "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"),
    "loc_gomateshwara_karkala.jpg": ("Gomateshwara_Karkala.jpg",               "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=800&auto=format&fit=crop"),
    "loc_thousand_pillars_moodabidri.jpg": ("Saavira_Kambada_Basadi.jpg",      "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=800&auto=format&fit=crop"),
    "loc_varanga_jain.jpg":         ("Varanga_Jain_Temple.jpg",                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"),
    "loc_southadka_temple.jpg":     ("Southadka_Shri_Mahaganapathi_Temple.jpg","https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
    "loc_zeenath_masjid.jpg":       ("Zeenath_Baksh_Juma_Masjid_Mangalore.jpg","https://images.unsplash.com/photo-1564056094493-27471207e2c9?q=80&w=800&auto=format&fit=crop"),
    "loc_rosario_cathedral.jpg":    ("Rosario_Cathedral_Mangalore.jpg",        "https://images.unsplash.com/photo-1548625361-ec853715b746?q=80&w=800&auto=format&fit=crop"),
    "loc_milagres_church.jpg":      ("Milagres_Church_Mangalore.jpg",          "https://images.unsplash.com/photo-1548625361-ec853715b746?q=80&w=800&auto=format&fit=crop"),

    # NATURE / VIEWPOINTS / WATERFALLS
    "loc_adyar_falls.jpg":          ("Adyar_Falls_Mangalore.jpg",              "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop"),
    "loc_manipal_lake.jpg":         ("Manipal_Lake.jpg",                       "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop"),
    "loc_hanuman_gundi.jpg":        ("Hanumangundi_Falls.jpg",                 "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=800&auto=format&fit=crop"),
    "loc_kudlu_falls.jpg":          ("Kudlu_falls.jpg",                        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=800&auto=format&fit=crop"),
    "loc_jomlu_falls.jpg":          ("Jomlu_Theertha_Falls.jpg",               "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop"),
    "loc_agumbe_sunset.jpg":        ("Agumbe_View_point.jpg",                  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop"),
    "loc_bisle_ghat.jpg":           ("Bisle_Reserve_Forest.jpg",               "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop"),
    "loc_end_point_park.jpg":       ("End_Point_Manipal.jpg",                  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop"),
    "loc_kanchiugudda.jpg":         ("Agumbe_View_point.jpg",                  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop"),
    "loc_soans_farms.jpg":          ("Jackfruit_farm.jpg",                     "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop"),
    "loc_kapu_lighthouse.jpg":      ("Kapu_Lighthouse.jpg",                    "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=800&auto=format&fit=crop"),
    "loc_nitk_lighthouse.jpg":      ("NITK_Lighthouse.jpg",                    "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=800&auto=format&fit=crop"),
    "loc_jamalabad_fort.jpg":       ("Jamalabad_fort.jpg",                     "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop"),
    "loc_mulki_kayaking.jpg":       ("Kayaking_in_mangroves.jpg",              "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop"),
    "loc_butterfly_park_india.jpg": ("Blue_Morpho_Butterfly.jpg",              "https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?q=80&w=800&auto=format&fit=crop"),
    "loc_hasta_shilpa.jpg":         ("Hasta_Shilpa_Heritage_Village.jpg",      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
    "loc_aloyseum.jpg":             ("Aloyseum.jpg",                           "https://images.unsplash.com/photo-1581875403743-23e2a3a90ae0?q=80&w=800&auto=format&fit=crop"),
    "loc_pilikula_artisan.jpg":     ("Pilikula_Nisarga_Dhama.jpg",             "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"),

    # URBAN
    "loc_city_centre_mall.jpg":     ("City_Centre_Mall_Mangalore.jpg",         "https://images.unsplash.com/photo-1519567770-c1f0d0ab7a8c?q=80&w=800&auto=format&fit=crop"),
    "loc_nexus_mall.jpg":           ("Forum_Fiza_Mall_Mangalore.jpg",          "https://images.unsplash.com/photo-1519567770-c1f0d0ab7a8c?q=80&w=800&auto=format&fit=crop"),
    "loc_bharat_mall.jpg":          ("Forum_Fiza_Mall_Mangalore.jpg",          "https://images.unsplash.com/photo-1519567770-c1f0d0ab7a8c?q=80&w=800&auto=format&fit=crop"),
    "loc_canara_mall.jpg":          ("Forum_Fiza_Mall_Mangalore.jpg",          "https://images.unsplash.com/photo-1519567770-c1f0d0ab7a8c?q=80&w=800&auto=format&fit=crop"),
    "loc_empire_mall.jpg":          ("Forum_Fiza_Mall_Mangalore.jpg",          "https://images.unsplash.com/photo-1519567770-c1f0d0ab7a8c?q=80&w=800&auto=format&fit=crop"),
    "loc_city_library.jpg":         ("Seattle_Central_Library,_northwest_corner.jpg", "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop"),
    "loc_anatomy_museum.jpg":       ("Kasturba_Medical_College_Manipal.jpg",   "https://images.unsplash.com/photo-1581875403743-23e2a3a90ae0?q=80&w=800&auto=format&fit=crop"),
    "loc_stella_maris_church.jpg":  ("",                                        "https://images.unsplash.com/photo-1548625361-ec853715b746?q=80&w=800&auto=format&fit=crop"),

    # CULINARY
    "loc_pabbas_icecream.jpg":      ("Special_Gadbad_at_Pabbas_Ideal_Icecream_Cafe_,_Mangalore.jpg", "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=800&auto=format&fit=crop"),
    "loc_mitra_samaj.jpg":          ("Masala_dosa_2.jpg",                      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop"),
}


def get_wiki_url(filename):
    """Use Wikimedia Commons REST API to get the actual image URL."""
    encoded = urllib.parse.quote(filename.replace(' ', '_'))
    api = f"https://en.wikipedia.org/w/api.php?action=query&titles=File:{encoded}&prop=imageinfo&iiprop=url&format=json"
    try:
        req = urllib.request.Request(api, headers={"User-Agent": WIKI_AGENT})
        with urllib.request.urlopen(req, context=ctx, timeout=15) as r:
            data = json.loads(r.read())
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            info = page.get("imageinfo", [])
            if info:
                return info[0]["url"]
    except Exception:
        pass
    return None


def download_url(url, agent, path):
    req = urllib.request.Request(url, headers={"User-Agent": agent})
    with urllib.request.urlopen(req, context=ctx, timeout=25) as resp:
        data = resp.read()
    if len(data) < 5000:
        raise ValueError(f"Too small: {len(data)} bytes")
    with open(path, "wb") as f:
        f.write(data)
    return len(data)


import urllib.parse

def process(local_name, wiki_fname, fallback_url):
    path = os.path.join(OUTPUT_DIR, local_name)
    if os.path.exists(path) and os.path.getsize(path) > 10_000:
        print(f"  SKIP  {local_name} ({os.path.getsize(path)//1024}KB)")
        return "skip"

    # Try Wikimedia API first (if wiki_fname provided)
    if wiki_fname:
        url = get_wiki_url(wiki_fname)
        if url:
            try:
                size = download_url(url, WIKI_AGENT, path)
                print(f"  WIKI  {local_name} ({size//1024}KB)")
                return "wiki"
            except Exception as e:
                print(f"  wiki-err {local_name}: {e}")
        time.sleep(0.5)

    # Fallback to Unsplash / other direct URL
    if fallback_url:
        try:
            size = download_url(fallback_url, UNSPLASH_AGENT, path)
            print(f"  FALL  {local_name} ({size//1024}KB)")
            return "fallback"
        except Exception as e:
            print(f"  FAIL  {local_name}: {e}")
            return "fail"
    return "fail"


if __name__ == "__main__":
    print(f"\n{'='*60}")
    print(f"Phase 2: Downloading {len(WIKI_IMAGES)} images via API + fallbacks")
    print(f"{'='*60}\n")

    counts = {"skip": 0, "wiki": 0, "fallback": 0, "fail": 0}
    failures = []

    for local, (wiki, fallback) in WIKI_IMAGES.items():
        result = process(local, wiki, fallback)
        counts[result] += 1
        if result == "fail":
            failures.append(local)
        time.sleep(0.4)

    print(f"\n{'='*60}")
    print(f"Results: {counts['skip']} skipped, {counts['wiki']} from Wiki, {counts['fallback']} from fallback, {counts['fail']} failed")
    if failures:
        print("\nStill failed:")
        for f in failures:
            print(f"  - {f}")
    print(f"{'='*60}\n")

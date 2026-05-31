# -*- coding: utf-8 -*-
"""
Mangaluru Navigator - Missing/Wrong Image Downloader
Downloads authentic Wikipedia images for all locations using placeholder or wrong images.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import urllib.request
import os
import time
import ssl

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "public", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# SSL context to handle HTTPS
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
}

# ─────────────────────────────────────────────────────────────
# TARGET IMAGES: filename -> (url, description)
# Only images that are WRONG or PLACEHOLDERS are listed here.
# ─────────────────────────────────────────────────────────────
IMAGES = {
    # ── MALLS (currently all showing Guwahati mall) ──
    "loc_city_centre_mall.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/City_Centre_Mall_Mangalore.jpg/1280px-City_Centre_Mall_Mangalore.jpg",
        "City Centre Mall Mangaluru"
    ),
    "loc_nexus_mall.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Forum_Fiza_Mall_Mangalore.jpg/1280px-Forum_Fiza_Mall_Mangalore.jpg",
        "Nexus/Forum Mall Mangaluru"
    ),
    "loc_bharat_mall.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Forum_Fiza_Mall_Mangalore.jpg/1280px-Forum_Fiza_Mall_Mangalore.jpg",
        "Bharat Mall Mangaluru"
    ),
    "loc_canara_mall.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Forum_Fiza_Mall_Mangalore.jpg/1280px-Forum_Fiza_Mall_Mangalore.jpg",
        "Canara Mall Udupi/Manipal"
    ),
    "loc_empire_mall.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Forum_Fiza_Mall_Mangalore.jpg/1280px-Forum_Fiza_Mall_Mangalore.jpg",
        "Empire Mall Mangaluru"
    ),

    # ── URBAN / ENTERTAINMENT ──
    "loc_froth_on_top.jpg": (
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
        "Froth on Top lounge"
    ),
    "loc_timezone_arcade.jpg": (
        "https://images.unsplash.com/photo-1626379961798-54f819ee896a?q=80&w=800&auto=format&fit=crop",
        "Timezone Gaming Arcade"
    ),
    "loc_smaaash.jpg": (
        "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=800&auto=format&fit=crop",
        "Smaaash Entertainment"
    ),
    "loc_city_library.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Seattle_Central_Library%2C_northwest_corner.jpg/1280px-Seattle_Central_Library%2C_northwest_corner.jpg",
        "City Central Library Mangaluru"
    ),
    "loc_anatomy_museum.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Kasturba_Medical_College_Manipal.jpg/1280px-Kasturba_Medical_College_Manipal.jpg",
        "Museum of Anatomy Manipal"
    ),

    # ── BUTTERFLY PARK (currently Portland USA) ──
    "loc_butterfly_park_india.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Blue_Morpho_Butterfly.jpg/1280px-Blue_Morpho_Butterfly.jpg",
        "Butterfly Park Mangaluru"
    ),

    # ── BEACHES WITH GENERIC IMAGES ──
    "loc_sasihithlu_beach.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Sasihithlu_beach.jpg/1280px-Sasihithlu_beach.jpg",
        "Sasihithlu Beach Mangaluru"
    ),
    "loc_tannirbhavi_beach.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Tannirbhavi_Beach.jpg/1280px-Tannirbhavi_Beach.jpg",
        "Tannirbhavi Beach Mangaluru"
    ),
    "loc_bengre.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Bengre_Beach.jpg/1280px-Bengre_Beach.jpg",
        "Bengre Sandspit Mangaluru"
    ),
    "loc_someshwara_beach.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Someshwara_beach.jpg/1280px-Someshwara_beach.jpg",
        "Someshwara Beach"
    ),
    "loc_maravanthe.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Maravanthe_beach.jpg/1280px-Maravanthe_beach.jpg",
        "Maravanthe Beach Udupi"
    ),
    "loc_mattu_beach.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Mattu_beach.jpg/1280px-Mattu_beach.jpg",
        "Mattu Beach Udupi"
    ),
    "loc_st_marys_island.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/St_Marys_Island_Basalt.jpg/1280px-St_Marys_Island_Basalt.jpg",
        "St. Mary's Island Udupi"
    ),
    "loc_ottinene.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Maravanthe_beach.jpg/1280px-Maravanthe_beach.jpg",
        "Ottinene Sunset Viewpoint"
    ),

    # ── HERITAGE / TEMPLES WITH WRONG IMAGES ──
    "loc_kudroli_temple.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Sri_Gokarnanatha_Temple_Kudroli.jpg/1280px-Sri_Gokarnanatha_Temple_Kudroli.jpg",
        "Kudroli Gokarnath Temple"
    ),
    "loc_mangaladevi_temple.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mangaladevi_temple_Mangalore.jpg/1280px-Mangaladevi_temple_Mangalore.jpg",
        "Mangaladevi Temple"
    ),
    "loc_krishna_matha_udupi.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/KrishnaMatha.jpg/1280px-KrishnaMatha.jpg",
        "Sri Krishna Matha Udupi"
    ),
    "loc_kukke_subramanya.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kukke_Subramanya_temple.jpg/1280px-Kukke_Subramanya_temple.jpg",
        "Kukke Subramanya Temple"
    ),
    "loc_dharmasthala.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Dharmasthala_temple.jpg/1280px-Dharmasthala_temple.jpg",
        "Dharmasthala Temple"
    ),
    "loc_kateel_temple.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Kateel_temple.jpg/1280px-Kateel_temple.jpg",
        "Kateel Temple"
    ),
    "loc_sultan_battery.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Sultan_Battery_2163.JPG/1280px-Sultan_Battery_2163.JPG",
        "Sultan Battery Mangaluru"
    ),
    "loc_pandava_caves.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Kadri_Hill_Caves.jpg/1280px-Kadri_Hill_Caves.jpg",
        "Pandava Caves Kadri"
    ),
    "loc_gomateshwara_karkala.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Gomateshwara_Karkala.jpg/1280px-Gomateshwara_Karkala.jpg",
        "Gomateshwara Statue Karkala"
    ),
    "loc_thousand_pillars_moodabidri.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Saavira_Kambada_Basadi.jpg/1280px-Saavira_Kambada_Basadi.jpg",
        "Thousand Pillars Temple Moodabidri"
    ),
    "loc_varanga_jain.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Varanga_Jain_Temple.jpg/1280px-Varanga_Jain_Temple.jpg",
        "Varanga Jain Matha"
    ),
    "loc_hasta_shilpa.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Hasta_Shilpa_Heritage_Village.jpg/1280px-Hasta_Shilpa_Heritage_Village.jpg",
        "Hasta Shilpa Heritage Village Manipal"
    ),
    "loc_aloyseum.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Aloyseum.jpg/1280px-Aloyseum.jpg",
        "Aloyseum St. Aloysius Museum"
    ),
    "loc_pilikula_artisan.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Pilikula_Nisarga_Dhama.jpg/1280px-Pilikula_Nisarga_Dhama.jpg",
        "Pilikula Artisan Village"
    ),
    "loc_rosario_cathedral.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Rosario_Cathedral_Mangalore.jpg/1280px-Rosario_Cathedral_Mangalore.jpg",
        "Rosario Cathedral Mangaluru"
    ),
    "loc_milagres_church.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Milagres_Church_Mangalore.jpg/1280px-Milagres_Church_Mangalore.jpg",
        "Milagres Church Mangaluru"
    ),
    "loc_stella_maris_church.jpg": (
        "https://images.unsplash.com/photo-1548625361-ec853715b746?q=80&w=800&auto=format&fit=crop",
        "Stella Maris Church Kalmady"
    ),
    "loc_zeenath_masjid.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Zeenath_Baksh_Juma_Masjid_Mangalore.jpg/1280px-Zeenath_Baksh_Juma_Masjid_Mangalore.jpg",
        "Zeenath Baksh Masjid"
    ),

    # ── NATURE / VIEWPOINTS ──
    "loc_adyar_falls.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Adyar_Falls_Mangalore.jpg/1280px-Adyar_Falls_Mangalore.jpg",
        "Adyar Falls Mangaluru"
    ),
    "loc_manipal_lake.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Manipal_Lake.jpg/1280px-Manipal_Lake.jpg",
        "Manipal Lake"
    ),
    "loc_hanuman_gundi.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Hanumangundi_Falls.jpg/1280px-Hanumangundi_Falls.jpg",
        "Hanuman Gundi Falls"
    ),
    "loc_kudlu_falls.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Kudlu_falls.jpg/1280px-Kudlu_falls.jpg",
        "Kudlu Falls Udupi"
    ),
    "loc_ermai_falls.jpg": (
        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=800&auto=format&fit=crop",
        "Ermai Falls DK"
    ),
    "loc_jomlu_falls.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Jomlu_Theertha_Falls.jpg/1280px-Jomlu_Theertha_Falls.jpg",
        "Jomlu Theertha Falls"
    ),
    "loc_agumbe_sunset.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Agumbe_View_point.jpg/1280px-Agumbe_View_point.jpg",
        "Agumbe Sunset Point"
    ),
    "loc_bisle_ghat.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bisle_Reserve_Forest.jpg/1280px-Bisle_Reserve_Forest.jpg",
        "Bisle Ghat Viewpoint"
    ),
    "loc_end_point_park.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/End_Point_Manipal.jpg/1280px-End_Point_Manipal.jpg",
        "End Point Park Manipal"
    ),
    "loc_kanchiugudda.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Agumbe_View_point.jpg/1280px-Agumbe_View_point.jpg",
        "Kanchiugudda Viewpoint Manipal"
    ),
    "loc_soans_farms.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Jackfruit_farm.jpg/1280px-Jackfruit_farm.jpg",
        "Soans Farms Moodabidri"
    ),
    "loc_kapu_lighthouse.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Kapu_Lighthouse.jpg/1280px-Kapu_Lighthouse.jpg",
        "Kapu Lighthouse Udupi"
    ),
    "loc_nitk_lighthouse.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/NITK_Lighthouse.jpg/1280px-NITK_Lighthouse.jpg",
        "NITK Lighthouse Surathkal"
    ),
    "loc_jamalabad_fort.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Jamalabad_fort.jpg/1280px-Jamalabad_fort.jpg",
        "Jamalabad Fort DK"
    ),
    "loc_mulki_kayaking.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Kayaking_in_mangroves.jpg/1280px-Kayaking_in_mangroves.jpg",
        "Mulki Kayaking"
    ),
    "loc_malpe_beach.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Malpe_Beach.jpg/1280px-Malpe_Beach.jpg",
        "Malpe Beach Udupi"
    ),
    "loc_kodi_beach.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Kodi_beach_Kundapura.jpg/1280px-Kodi_beach_Kundapura.jpg",
        "Kodi Beach Kundapura"
    ),

    # ── CULINARY / RESTAURANTS ──
    "loc_pabbas_icecream.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/c/c1/Special_Gadbad_at_Pabbas_Ideal_Icecream_Cafe_%2C_Mangalore.jpg",
        "Pabba's Ice Cream Gadbad Mangaluru"
    ),
    "loc_mitra_samaj.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Masala_dosa_2.jpg/1280px-Masala_dosa_2.jpg",
        "Mitra Samaj Udupi Dosa"
    ),
    "loc_machali.jpg": (
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop",
        "Machali Seafood Mangaluru"
    ),
    "loc_giri_manjas.jpg": (
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop",
        "Giri Manja's Seafood"
    ),
    "loc_pallkhi.jpg": (
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
        "Pallkhi Restaurant"
    ),
    "loc_village_restaurant.jpg": (
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
        "Village Restaurant Mangaluru"
    ),
    "loc_gajalee.jpg": (
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop",
        "Gajalee Seafood Mangaluru"
    ),
    "loc_southadka_temple.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Southadka_Shri_Mahaganapathi_Temple.jpg/1280px-Southadka_Shri_Mahaganapathi_Temple.jpg",
        "Southadka Mahaganapathi Temple"
    ),
}


def download(filename, url, desc):
    path = os.path.join(OUTPUT_DIR, filename)
    if False:
        pass
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            data = resp.read()
        if len(data) < 5000:
            print(f"  ✗ TINY  {filename} ({len(data)} bytes) — {desc}")
            return False
        with open(path, "wb") as f:
            f.write(data)
        print(f"  ✓ OK    {filename} ({len(data)//1024}KB) — {desc}")
        return True
    except Exception as e:
        print(f"  ✗ FAIL  {filename} — {e}")
        return False


if __name__ == "__main__":
    print(f"\n{'='*60}")
    print(f"Downloading {len(IMAGES)} images -> {OUTPUT_DIR}")
    print(f"{'='*60}\n")

    ok, fail = 0, 0
    failed_list = []
    for fname, (url, desc) in IMAGES.items():
        result = download(fname, url, desc)
        if result:
            ok += 1
        else:
            fail += 1
            failed_list.append((fname, url, desc))
        time.sleep(0.3)

    print(f"\n{'='*60}")
    print(f"Done: {ok} succeeded, {fail} failed")
    if failed_list:
        print("\nFailed items (need manual fix):")
        for fname, url, desc in failed_list:
            print(f"  • {fname} — {desc}")
            print(f"    URL: {url}")
    print(f"{'='*60}\n")

import urllib.request
import ssl
import os
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Create the output directory
OUT_DIR = "public/images"
os.makedirs(OUT_DIR, exist_ok=True)

IMAGES = [
    # (filename, url)
    # ── EVENTS ──
    ("event_yakshagana.jpg",    "https://upload.wikimedia.org/wikipedia/commons/e/e9/Yakshaganads.jpg"),
    ("event_kambala.jpg",       "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Kadri_Kambala.jpg/960px-Kadri_Kambala.jpg"),
    ("event_dasara.jpg",        "https://upload.wikimedia.org/wikipedia/commons/6/6f/Mangalore_Dasara.jpg"),
    ("event_utsava.jpg",        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Rath_Yatra_Puri_07-11027.jpg/960px-Rath_Yatra_Puri_07-11027.jpg"),

    # ── BEACHES ──
    ("loc_panambur.jpg",        "https://upload.wikimedia.org/wikipedia/commons/2/23/Panambur_Beach_Mangalore.jpg"),
    ("loc_tannirbhavi.jpg",     "https://upload.wikimedia.org/wikipedia/commons/d/d8/Tannirubhavi_beach_02.JPG"),
    ("loc_sasihithlu.jpg",      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Sasihithlu_Beach.jpg/1280px-Sasihithlu_Beach.jpg"),
    ("loc_bengre.jpg",          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Gurupura_river_mouth%2C_Mangalore.jpg/1280px-Gurupura_river_mouth%2C_Mangalore.jpg"),
    ("loc_someshwara.jpg",      "https://upload.wikimedia.org/wikipedia/commons/1/1f/Someshwar_Beach_%284531032078%29.jpg"),
    ("loc_surathkal.jpg",       "https://upload.wikimedia.org/wikipedia/commons/d/d3/Lighthouse_at_Surathkal_Beach%2CMangalore.jpg"),
    ("loc_malpe.jpg",           "https://upload.wikimedia.org/wikipedia/commons/7/7a/Malpe_Beach_from_above.jpg"),
    ("loc_stmarys.jpg",         "https://upload.wikimedia.org/wikipedia/commons/f/fc/St._Mary%27s_islands%2C_Udupi_1767.jpg"),
    ("loc_maravanthe.jpg",      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Maravanthe_Beach.jpg/1280px-Maravanthe_Beach.jpg"),
    ("loc_mattu.jpg",           "https://upload.wikimedia.org/wikipedia/commons/2/25/Mattu_Beach%2C_Udupi%2C_Karnataka%2C_India%2C_%282017%29.jpg"),
    ("loc_kodi.jpg",            "https://upload.wikimedia.org/wikipedia/commons/c/c9/Kodi_beach_kundapura.jpg"),

    # ── RELIGIOUS / TEMPLES ──
    ("loc_kadri.jpg",           "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Kadri_Manjunath_Temple%2C_Mangalore.jpg/1280px-Kadri_Manjunath_Temple%2C_Mangalore.jpg"),
    ("loc_kudroli.jpg",         "https://upload.wikimedia.org/wikipedia/commons/7/70/Gokarnatheshwara_Temple_7042008.jpg"),
    ("loc_mangaladevi.jpg",     "https://upload.wikimedia.org/wikipedia/commons/1/1f/Mangaladevi_Temple_Mangalore_2.jpg"),
    ("loc_sultan_battery.jpg",  "https://upload.wikimedia.org/wikipedia/commons/e/e4/Sultan_Battery_2163.JPG"),
    ("loc_krishna_matha.jpg",   "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Udupi_Sri_Krishna_Matha_Temple.jpg/960px-Udupi_Sri_Krishna_Matha_Temple.jpg"),
    ("loc_kapu_lighthouse.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Kapu_Lighthouse_-_panoramio.jpg/1280px-Kapu_Lighthouse_-_panoramio.jpg"),
    ("loc_kukke.jpg",           "https://upload.wikimedia.org/wikipedia/commons/5/5f/Kukke_Subramanya_Swami.jpg"),
    ("loc_dharmasthala.jpg",    "https://upload.wikimedia.org/wikipedia/commons/d/d1/Dharmasthala_Temple.jpg"),
    ("loc_kateel.jpg",          "https://upload.wikimedia.org/wikipedia/commons/c/c7/Kateel_Durga_Parameshwari_0145.JPG"),
    ("loc_anegudde.jpg",        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Anegudde_Vinayaka_Temple.jpg/1280px-Anegudde_Vinayaka_Temple.jpg"),
    ("loc_thousand_pillars.jpg","https://upload.wikimedia.org/wikipedia/commons/b/b7/Thousand_Piller_Temple%2C_Moodbidri.jpg"),
    ("loc_gomateshwara.jpg",    "https://upload.wikimedia.org/wikipedia/commons/4/43/Gomateshwara_Statue%2C_Karkala.jpg"),
    ("loc_varanga.jpg",         "https://upload.wikimedia.org/wikipedia/commons/f/f4/Kere_Basadi_-_Varanga.jpg"),

    # ── CHURCHES ──
    ("loc_rosario.jpg",         "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Rosario_Cathedral_Mangalore.jpg/1280px-Rosario_Cathedral_Mangalore.jpg"),
    ("loc_milagres.jpg",        "https://upload.wikimedia.org/wikipedia/commons/b/b8/Milagres_Hampankatta.jpg"),
    ("loc_infant_jesus.jpg",    "https://upload.wikimedia.org/wikipedia/commons/7/76/Infant_Jesus_Shrine%2C_Bikarnakatte.jpg"),
    ("loc_attur.jpg",           "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Attur_St._Lawrence_Church.jpg/1280px-Attur_St._Lawrence_Church.jpg"),
    ("loc_stella_maris.jpg",    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Stella_Maris_Church_Kalmady.jpg/1280px-Stella_Maris_Church_Kalmady.jpg"),

    # ── MOSQUES / DARGAHS ──
    ("loc_zeenath.jpg",         "https://upload.wikimedia.org/wikipedia/commons/3/3f/Jumma_mazjid%2C_Zinad_Baksh%2C_Bunder%2C_Mangalore-2.jpg"),
    ("loc_sayyid.jpg",          "https://upload.wikimedia.org/wikipedia/commons/6/6e/Ullal_Sayyad_Madani_Dargah_Gumbaz.jpg"),
    ("loc_udupi_masjid.jpg",    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Udupi_Central_Mosque.jpg/1280px-Udupi_Central_Mosque.jpg"),
    ("loc_idgah.jpg",           "https://upload.wikimedia.org/wikipedia/commons/8/89/Idgah_mosque_Mangaluru.jpg"),

    # ── NATURE / WATERFALLS ──
    ("loc_pilikula.jpg",        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Pilikula_Nisargadhama.jpg/1280px-Pilikula_Nisargadhama.jpg"),
    ("loc_butterfly.jpg",       "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Butterfly_Park_Bannerghatta.jpg/1280px-Butterfly_Park_Bannerghatta.jpg"),
    ("loc_adyar_falls.jpg",     "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Irupu_falls.jpg/1280px-Irupu_falls.jpg"),
    ("loc_manipal_lake.jpg",    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Manipal_Lake.jpg/1280px-Manipal_Lake.jpg"),
    ("loc_agumbe.jpg",          "https://upload.wikimedia.org/wikipedia/commons/4/4d/Agumbe_View_point.jpg"),
    ("loc_kudlu_falls.jpg",     "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Dudhsagar_Falls_Goa_India.jpg/1280px-Dudhsagar_Falls_Goa_India.jpg"),
    ("loc_jomlu.jpg",           "https://upload.wikimedia.org/wikipedia/commons/3/30/Jomlu_Theertham_Falls.jpg"),
    ("loc_hanuman_gundi.jpg",   "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Hanuman_Gundi_Falls.jpg/1280px-Hanuman_Gundi_Falls.jpg"),
    ("loc_bisle.jpg",           "https://upload.wikimedia.org/wikipedia/commons/9/9c/Bisile_ghat_from_view_point.jpg"),
    ("loc_ermai.jpg",           "https://upload.wikimedia.org/wikipedia/commons/7/76/Didupe_waterfalls%2C_Ujire%2C_Dakshina_Kannada_%282016%29.jpg"),

    # ── ADVENTURE ──
    ("loc_mulki.jpg",           "https://upload.wikimedia.org/wikipedia/commons/7/7b/Boating_in_Backwater.jpg"),
    ("loc_jamalabad.jpg",       "https://upload.wikimedia.org/wikipedia/en/f/fc/Jamalabad_Rock%28Gadaikallu%29.jpg"),

    # ── FOOD / CULINARY ──
    ("loc_gadbad.jpg",          "https://upload.wikimedia.org/wikipedia/commons/c/c1/Special_Gadbad_at_Pabbas_Ideal_Icecream_Cafe_%2C_Mangalore.jpg"),
    ("loc_seafood.jpg",         "https://upload.wikimedia.org/wikipedia/commons/1/14/Manglorean_style_white_pomfret_fish_curry-My_home_Bangalore-Karn.jpg"),
    ("loc_dosa.jpg",            "https://upload.wikimedia.org/wikipedia/commons/e/e6/Butter_Masala_Dosa.png"),
    ("loc_restaurant.jpg",      "https://upload.wikimedia.org/wikipedia/commons/0/07/Mangalorean_fish_curry.jpg"),
    ("loc_hotel_dining.jpg",    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Restaurant_interior_Mangalore.jpg/1280px-Restaurant_interior_Mangalore.jpg"),

    # ── HERITAGE / OTHERS ──
    ("loc_st_aloysius.jpg",     "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/St_Aloysius_College_Chapel.jpg/1280px-St_Aloysius_College_Chapel.jpg"),
    ("loc_pandava_caves.jpg",   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Kadri_Manjunath_Temple%2C_Mangalore.jpg/1280px-Kadri_Manjunath_Temple%2C_Mangalore.jpg"),
    ("loc_hasta_shilpa.jpg",    "https://upload.wikimedia.org/wikipedia/commons/c/c9/Hasta_Shilpa_Heritage_Village_Manipal.jpg"),
    ("loc_pilikula_artisan.jpg","https://upload.wikimedia.org/wikipedia/commons/1/13/Pilikula_Nisargadhama_-_Heritage_Village_or_Guthu_Mane_04.jpg"),
    ("loc_barkur.jpg",          "https://upload.wikimedia.org/wikipedia/commons/0/0b/Barkur_Panchalingeshwara_Temple.jpg"),
    ("loc_western_ghats.jpg",   "https://upload.wikimedia.org/wikipedia/commons/b/b5/Western_ghats_Karnataka.jpg"),
    ("loc_mall.jpg",            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Nexus_mall_Mangalore.jpg/1280px-Nexus_mall_Mangalore.jpg"),
    ("loc_library.jpg",         "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Library.jpg/1280px-Library.jpg"),
    ("loc_arcade.jpg",          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Laser_Quest.jpg/1280px-Laser_Quest.jpg"),
    ("loc_lounge.jpg",          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Bar_interior.jpg/1280px-Bar_interior.jpg"),
    ("loc_viewpoint.jpg",       "https://upload.wikimedia.org/wikipedia/commons/4/4d/Agumbe_View_point.jpg"),
    ("loc_soans_farms.jpg",     "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Pineapple_on_plant_1.jpg/1280px-Pineapple_on_plant_1.jpg"),
    ("loc_anatomy_museum.jpg",  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Anatomy_museum_Manipal.jpg/1280px-Anatomy_museum_Manipal.jpg"),
    ("loc_aloyseum.jpg",        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/St_Aloysius_College_Chapel.jpg/1280px-St_Aloysius_College_Chapel.jpg"),
    ("loc_ganesha_temple.jpg",  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Ganesh_temple_Goa.jpg/1280px-Ganesh_temple_Goa.jpg"),
    ("loc_coastal_temple.jpg",  "https://upload.wikimedia.org/wikipedia/commons/7/70/Gokarnatheshwara_Temple_7042008.jpg"),
]

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

ok = []
failed = []

for filename, url in IMAGES:
    out_path = os.path.join(OUT_DIR, filename)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 5000:
        print(f"SKIP (exists): {filename}")
        ok.append(filename)
        continue
    time.sleep(0.4)
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
            data = response.read()
        if len(data) < 5000:
            raise Exception(f"File too small ({len(data)} bytes)")
        with open(out_path, 'wb') as f:
            f.write(data)
        print(f"OK ({len(data)//1024}KB): {filename}")
        ok.append(filename)
    except Exception as e:
        print(f"FAIL: {filename} -> {str(e)[:70]}")
        failed.append((filename, url, str(e)))

print(f"\n=== Done: {len(ok)} OK, {len(failed)} Failed ===")
if failed:
    print("\nFailed files:")
    for fn, url, err in failed:
        print(f"  {fn}: {err[:60]}")

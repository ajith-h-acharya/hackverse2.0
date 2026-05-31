import urllib.request, ssl, os, time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

OUT_DIR = "public/images"
os.makedirs(OUT_DIR, exist_ok=True)

# Use Wikimedia Commons Image Thumb API — much less restricted
# Format: https://commons.wikimedia.org/wiki/Special:FilePath/FILENAME?width=800
def make_url(filename, width=800):
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{filename}?width={width}"

IMAGES = [
    ("loc_bengre.jpg",         make_url("Gurupura_River_Mouth_Mangalore.jpg")),
    ("loc_someshwara.jpg",     make_url("Someshwara_Beach_Mangalore.jpg")),
    ("loc_malpe.jpg",          make_url("Malpe_beach,_Karnataka.jpg")),
    ("loc_stmarys.jpg",        make_url("St.Mary's_Islands,_Udupi.jpg")),
    ("loc_maravanthe.jpg",     make_url("Maravanthe_Beach,_Udupi_District.jpg")),
    ("loc_mangaladevi.jpg",    make_url("Mangaladevi_Temple_Mangalore.jpg")),
    ("loc_sultan_battery.jpg", make_url("Sultan_Battery_Mangalore.JPG")),
    ("loc_kapu_lighthouse.jpg",make_url("Kapu_Lighthouse.jpg")),
    ("loc_kadri.jpg",          make_url("Kadri_Manjunath_Temple.jpg")),
    ("loc_kateel.jpg",         make_url("Kateel_Durgaparameshwari_Temple.jpg")),
    ("loc_anegudde.jpg",       make_url("Anegudde_Temple.jpg")),
    ("loc_varanga.jpg",        make_url("Varanga_Lake_Temple.jpg")),
    ("loc_dharmasthala.jpg",   make_url("Dharmasthala_Manjunatha_Swami_Temple.jpg")),
    ("loc_thousand_pillars.jpg",make_url("Saavira_Kambada_Basadi.jpg")),
    ("loc_rosario.jpg",        make_url("Rosario_Cathedral_Mangalore.jpg")),
    ("loc_milagres.jpg",       make_url("Milagres_Church_Mangalore.jpg")),
    ("loc_infant_jesus.jpg",   make_url("Infant_Jesus_Shrine_Mangalore.jpg")),
    ("loc_attur.jpg",          make_url("St._Lawrence_Church,_Attur.jpg")),
    ("loc_zeenath.jpg",        make_url("Zeenath_Baksh_Mosque_Mangalore.jpg")),
    ("loc_sayyid.jpg",         make_url("Syed_Mohammed_Shareef_Dargah_Ullal.jpg")),
    ("loc_udupi_masjid.jpg",   make_url("Juma_Masjid_Udupi.jpg")),
    ("loc_idgah.jpg",          make_url("Idgah_Maidan_Mangalore.jpg")),
    ("loc_pilikula.jpg",       make_url("Pilikula_Nisargadhama_Mangaluru.jpg")),
    ("loc_butterfly.jpg",      make_url("Butterfly_Park_Bannerghatta_National_Park.jpg")),
    ("loc_adyar_falls.jpg",    make_url("Irupu_Falls_Coorg.jpg")),
    ("loc_manipal_lake.jpg",   make_url("Manipal_Lake,_Karnataka.jpg")),
    ("loc_kudlu_falls.jpg",    make_url("Kudremukh_National_Park_Karnataka.jpg")),
    ("loc_jomlu.jpg",          make_url("Jomlu_Teertha_Falls.jpg")),
    ("loc_hanuman_gundi.jpg",  make_url("Hanuman_Gundi_Falls_Kudremukh.jpg")),
    ("loc_jamalabad.jpg",      make_url("Jamalabad_Fort_Karnataka.jpg")),
    ("loc_mulki.jpg",          make_url("Backwater_Boating_Karnataka.jpg")),
    ("loc_gadbad.jpg",         make_url("Gadbad_ice_cream_Mangalore.jpg")),
    ("loc_seafood.jpg",        make_url("Mangalorean_Prawn_Curry.jpg")),
    ("loc_dosa.jpg",           make_url("Masala_Dosa.jpg")),
    ("loc_restaurant.jpg",     make_url("Mangalorean_Fish_Curry.jpg")),
    ("loc_st_aloysius.jpg",    make_url("St._Aloysius_Chapel,_Mangalore.jpg")),
    ("loc_hasta_shilpa.jpg",   make_url("Hasta_Shilpa_Village_Manipal.jpg")),
    ("loc_pilikula_artisan.jpg",make_url("Pilikula_Heritage_Village.jpg")),
    ("loc_barkur.jpg",         make_url("Panchalingeshwara_Temple_Barkur.jpg")),
    ("loc_western_ghats.jpg",  make_url("Western_Ghats_Karnataka_Forest.jpg")),
    ("loc_soans_farms.jpg",    make_url("Pineapple_Plantation_India.jpg")),
    ("loc_lounge.jpg",         make_url("Restaurant_interior_evening.jpg")),
    ("loc_mall.jpg",           make_url("Shopping_mall_India.jpg")),
    ("loc_arcade.jpg",         make_url("Game_arcade_India.jpg")),
    ("loc_library.jpg",        make_url("Public_library_India.jpg")),
    ("loc_viewpoint.jpg",      make_url("Karnataka_viewpoint_sunset.jpg")),
    ("loc_stella_maris.jpg",   make_url("Stella_Maris_Church_Kalmady.jpg")),
    ("loc_milagres_udupi.jpg", make_url("Milagres_Cathedral_Udupi.jpg")),
]

# Use realistic browser headers to avoid bot detection
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://en.wikipedia.org/',
}

ok = []
failed = []

for filename, url in IMAGES:
    out_path = os.path.join(OUT_DIR, filename)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 15000:
        print(f"SKIP (exists): {filename}")
        ok.append(filename)
        continue

    time.sleep(1.5)  # More delay to avoid rate limiting

    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=20) as response:
            content_type = response.headers.get('Content-Type', '')
            data = response.read()

        # Check it's actually an image
        if len(data) < 15000 or 'html' in content_type.lower():
            raise Exception(f"Not a valid image (size={len(data)}, type={content_type})")

        with open(out_path, 'wb') as f:
            f.write(data)
        print(f"OK ({len(data)//1024}KB): {filename}")
        ok.append(filename)

    except Exception as e:
        print(f"FAIL: {filename} -> {str(e)[:70]}")
        failed.append((filename, url, str(e)))

print(f"\n=== Done: {len(ok)} OK, {len(failed)} Failed ===")
if failed:
    print("\nFailed:")
    for fn, url, err in failed:
        print(f"  {fn}: {err[:60]}")

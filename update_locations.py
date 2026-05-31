# -*- coding: utf-8 -*-
"""
Update locations.js to use local /images/ paths instead of wrong external URLs.
Maps each location id to its correct local image filename.
"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

LOCATIONS_FILE = r"C:\Users\Ajith\OneDrive\Desktop\New folder\src\data\locations.js"

# Map of location name -> local image path
# Each tuple: (search_pattern_in_file, replacement_url)
REPLACEMENTS = [
    # ── CITY CENTRE MALL (Guwahati mall image) ──
    (r'(id: 7,.*?image: )"[^"]*CIty_Center_Mall_Guwahati[^"]*"', r'\1"/images/loc_city_centre_mall.jpg"', 1),
    # ── SASIHITHLU BEACH ──
    (r'(id: 8,.*?image: )"[^"]*unsplash[^"]*1502680390469[^"]*"', r'\1"/images/loc_sasihithlu_beach.jpg"', 1),
    # ── KUDROLI TEMPLE ──
    (r'(id: 10,.*?image: )"[^"]*unsplash[^"]*1582510003544[^"]*"', r'\1"/images/loc_kudroli_temple.jpg"', 1),
    # ── BUTTERFLY PARK ──
    (r'(id: 11,.*?image: )"[^"]*Butterfly_Park_Portland[^"]*"', r'\1"/images/loc_butterfly_park_india.jpg"', 1),
    # ── BENGRE SANDSPIT ──
    (r'(id: 12,.*?image: )"[^"]*unsplash[^"]*1507525428034[^"]*"', r'\1"/images/loc_bengre.jpg"', 1),
    # ── FROTH ON TOP ──
    (r'(id: 13,.*?image: )"[^"]*CIty_Center_Mall_Guwahati[^"]*"', r'\1"/images/loc_froth_on_top.jpg"', 1),
    # ── MANGALADEVI TEMPLE ──
    (r'(id: 14,.*?image: )"[^"]*unsplash[^"]*1544005313[^"]*"', r'\1"/images/loc_mangaladevi_temple.jpg"', 1),
    # ── MULKI KAYAKING ──
    (r'(id: 15,.*?image: )"[^"]*unsplash[^"]*1544551763[^"]*"', r'\1"/images/loc_mulki_kayaking.jpg"', 1),
    # ── TANNIRBHAVI BEACH ──
    (r'(id: 19,.*?image: )"[^"]*unsplash[^"]*1507525428034[^"]*"', r'\1"/images/loc_tannirbhavi_beach.jpg"', 1),
    # ── ADYAR FALLS ──
    (r'(id: 20,.*?image: )"[^"]*unsplash[^"]*1441974231531[^"]*"', r'\1"/images/loc_adyar_falls.jpg"', 1),
    # ── SRI KRISHNA MATHA (Udupi) ──
    (r'(id: 23,.*?image: )"[^"]*unsplash[^"]*1600100397561[^"]*"', r'\1"/images/loc_krishna_matha_udupi.jpg"', 1),
    # ── MALPE BEACH ──
    (r'(id: 24,.*?image: )"[^"]*unsplash[^"]*1590523277543[^"]*"', r'\1"/images/loc_malpe_beach.jpg"', 1),
    # ── ST MARY'S ISLAND ──
    (r'(id: 25,.*?image: )"[^"]*unsplash[^"]*1507525428034[^"]*"', r'\1"/images/loc_st_marys_island.jpg"', 1),
    # ── KAPU LIGHTHOUSE ──
    (r'(id: 26,.*?image: )"[^"]*unsplash[^"]*1516738901171[^"]*"', r'\1"/images/loc_kapu_lighthouse.jpg"', 1),
    # ── MITRA SAMAJ ──
    (r'(id: 27,.*?image: )"[^"]*unsplash[^"]*1589302168068[^"]*"', r'\1"/images/loc_mitra_samaj.jpg"', 1),
    # ── MANIPAL LAKE ──
    (r'(id: 30,.*?image: )"[^"]*unsplash[^"]*1441974231531[^"]*"', r'\1"/images/loc_manipal_lake.jpg"', 1),
    # ── KUKKE SUBRAMANYA ──
    (r'(id: 31,.*?image: )"[^"]*unsplash[^"]*1590502593747[^"]*"', r'\1"/images/loc_kukke_subramanya.jpg"', 1),
    # ── DHARMASTHALA ──
    (r'(id: 32,.*?image: )"[^"]*unsplash[^"]*1590502593747[^"]*"', r'\1"/images/loc_dharmasthala.jpg"', 1),
    # ── SOMESHWARA BEACH ──
    (r'(id: 33,.*?image: )"[^"]*unsplash[^"]*1507525428034[^"]*"', r'\1"/images/loc_someshwara_beach.jpg"', 1),
    # ── THOUSAND PILLARS TEMPLE ──
    (r'(id: 34,.*?image: )"[^"]*unsplash[^"]*1516738901171[^"]*"', r'\1"/images/loc_thousand_pillars_moodabidri.jpg"', 1),
    # ── JAMALABAD FORT ──
    (r'(id: 35,.*?image: )"[^"]*unsplash[^"]*1544551763[^"]*"', r'\1"/images/loc_jamalabad_fort.jpg"', 1),
    # ── MARAVANTHE BEACH ──
    (r'(id: 36,.*?image: )"[^"]*unsplash[^"]*1502680390469[^"]*"', r'\1"/images/loc_maravanthe.jpg"', 1),
    # ── AGUMBE SUNSET ──
    (r'(id: 37,.*?image: )"[^"]*unsplash[^"]*1441974231531[^"]*"', r'\1"/images/loc_agumbe_sunset.jpg"', 1),
    # ── GOMATESHWARA KARKALA ──
    (r'(id: 38,.*?image: )"[^"]*unsplash[^"]*1516738901171[^"]*"', r'\1"/images/loc_gomateshwara_karkala.jpg"', 1),
    # ── VARANGA JAIN MATHA ──
    (r'(id: 39,.*?image: )"[^"]*unsplash[^"]*1544005313[^"]*"', r'\1"/images/loc_varanga_jain.jpg"', 1),
    # ── KUDLU FALLS ──
    (r'(id: 40,.*?image: )"[^"]*unsplash[^"]*1441974231531[^"]*"', r'\1"/images/loc_kudlu_falls.jpg"', 1),
    # ── MATTU BEACH ──
    (r'(id: 41,.*?image: )"[^"]*unsplash[^"]*1507525428034[^"]*"', r'\1"/images/loc_mattu_beach.jpg"', 1),
    # ── KATEEL TEMPLE ──
    (r'(id: 42,.*?image: )"[^"]*unsplash[^"]*1582510003544[^"]*"', r'\1"/images/loc_kateel_temple.jpg"', 1),
    # ── KODI BEACH ──
    (r'(id: 43,.*?image: )"[^"]*unsplash[^"]*1590523277543[^"]*"', r'\1"/images/loc_kodi_beach.jpg"', 1),
    # ── NEXUS MALL ──
    (r'(id: 46,.*?image: )"[^"]*CIty_Center_Mall_Guwahati[^"]*"', r'\1"/images/loc_nexus_mall.jpg"', 1),
    # ── BHARAT MALL ──
    (r'(id: 47,.*?image: )"[^"]*CIty_Center_Mall_Guwahati[^"]*"', r'\1"/images/loc_bharat_mall.jpg"', 1),
    # ── CANARA MALL ──
    (r'(id: 48,.*?image: )"[^"]*CIty_Center_Mall_Guwahati[^"]*"', r'\1"/images/loc_canara_mall.jpg"', 1),
    # ── EMPIRE MALL ──
    (r'(id: 49,.*?image: )"[^"]*CIty_Center_Mall_Guwahati[^"]*"', r'\1"/images/loc_empire_mall.jpg"', 1),
    # ── SOUTHADKA TEMPLE ──
    (r'(id: 50,.*?image: )"[^"]*unsplash[^"]*1582510003544[^"]*"', r'\1"/images/loc_southadka_temple.jpg"', 1),
    # ── GOMATESHWARA KARKALA (id 51 - Narahari) ──
    (r'(id: 51,.*?image: )"[^"]*unsplash[^"]*1516738901171[^"]*"', r'\1"/images/loc_gomateshwara_karkala.jpg"', 1),
    # ── PANCHALINGESHWARA (52) ──
    (r'(id: 52,.*?image: )"[^"]*unsplash[^"]*1544005313[^"]*"', r'\1"/images/loc_varanga_jain.jpg"', 1),
    # ── KUNJARUGIRI / POLALI (53,54) - Gokarnatheshwara ──
    (r'(id: 53,.*?image: )"[^"]*Gokarnatheshwara_Temple[^"]*"', r'\1"/images/loc_kadri.jpg"', 1),
    (r'(id: 54,.*?image: )"[^"]*Gokarnatheshwara_Temple[^"]*"', r'\1"/images/loc_coastal_temple.jpg"', 1),
    (r'(id: 55,.*?image: )"[^"]*Gokarnatheshwara_Temple[^"]*"', r'\1"/images/loc_coastal_temple.jpg"', 1),
    (r'(id: 56,.*?image: )"[^"]*Gokarnatheshwara_Temple[^"]*"', r'\1"/images/loc_coastal_temple.jpg"', 1),
    (r'(id: 58,.*?image: )"[^"]*Gokarnatheshwara_Temple[^"]*"', r'\1"/images/loc_coastal_temple.jpg"', 1),
    (r'(id: 68,.*?image: )"[^"]*Gokarnatheshwara_Temple[^"]*"', r'\1"/images/loc_milagres_church.jpg"', 1),
    # ── NANDIKESHWARA (57) - Sultan Battery ──
    (r'(id: 57,.*?image: )"[^"]*Sultan_Battery[^"]*"', r'\1"/images/loc_thousand_pillars.jpg"', 1),
    # ── ROSARIO CATHEDRAL (59) ──
    (r'(id: 59,.*?image: )"[^"]*unsplash[^"]*1548625361[^"]*"', r'\1"/images/loc_rosario_cathedral.jpg"', 1),
    # ── ZEENATH MASJID (60) ──
    (r'(id: 60,.*?image: )"[^"]*unsplash[^"]*1564056094493[^"]*"', r'\1"/images/loc_zeenath_masjid.jpg"', 1),
    # ── ATTUR SHRINE (61) ──
    (r'(id: 61,.*?image: )"[^"]*unsplash[^"]*1543330386[^"]*"', r'\1"/images/loc_stella_maris_church.jpg"', 1),
    # ── INFANT JESUS SHRINE (63) ──
    (r'(id: 63,.*?image: )"[^"]*unsplash[^"]*1548625361[^"]*"', r'\1"/images/loc_rosario_cathedral.jpg"', 1),
    # ── STELLA MARIS CHURCH (64) - Sultan Battery ──
    (r'(id: 64,.*?image: )"[^"]*Sultan_Battery[^"]*"', r'\1"/images/loc_stella_maris_church.jpg"', 1),
    # ── MILAGRES CATHEDRAL (66) ──
    (r'(id: 66,.*?image: )"[^"]*unsplash[^"]*1548625361[^"]*"', r'\1"/images/loc_milagres_church.jpg"', 1),
    # ── HANUMAN GUNDI FALLS (69) ──
    (r'(id: 69,.*?image: )"[^"]*unsplash[^"]*1433086966358[^"]*"', r'\1"/images/loc_hanuman_gundi.jpg"', 1),
    # ── ERMAI FALLS (70) ──
    (r'(id: 70,.*?image: )"[^"]*unsplash[^"]*1544551763[^"]*"', r'\1"/images/loc_ermai_falls.jpg"', 1),
    # ── SOANS FARMS (71) ──
    (r'(id: 71,.*?image: )"[^"]*Agumbe_View_point[^"]*"', r'\1"/images/loc_soans_farms.jpg"', 1),
    # ── HASTA SHILPA (72) ──
    (r'(id: 72,.*?image: )"[^"]*unsplash[^"]*1582510003544[^"]*"', r'\1"/images/loc_hasta_shilpa.jpg"', 1),
    # ── ANATOMY MUSEUM (73) ──
    (r'(id: 73,.*?image: )"[^"]*CIty_Center_Mall_Guwahati[^"]*"', r'\1"/images/loc_anatomy_museum.jpg"', 1),
    # ── CITY LIBRARY (74) ──
    (r'(id: 74,.*?image: )"[^"]*CIty_Center_Mall_Guwahati[^"]*"', r'\1"/images/loc_city_library.jpg"', 1),
    # ── TIMEZONE ARCADE (75) ──
    (r'(id: 75,.*?image: )"[^"]*CIty_Center_Mall_Guwahati[^"]*"', r'\1"/images/loc_timezone_arcade.jpg"', 1),
    # ── JOMLU FALLS (76) ──
    (r'(id: 76,.*?image: )"[^"]*unsplash[^"]*1441974231531[^"]*"', r'\1"/images/loc_jomlu_falls.jpg"', 1),
    # ── END POINT PARK (77) ──
    (r'(id: 77,.*?image: )"[^"]*Agumbe_View_point[^"]*"', r'\1"/images/loc_end_point_park.jpg"', 1),
    # ── ALOYSEUM (78) - Sultan Battery ──
    (r'(id: 78,.*?image: )"[^"]*Sultan_Battery[^"]*"', r'\1"/images/loc_aloyseum.jpg"', 1),
    # ── PILIKULA ARTISAN (79) ──
    (r'(id: 79,.*?image: )"[^"]*unsplash[^"]*1544005313[^"]*"', r'\1"/images/loc_pilikula_artisan.jpg"', 1),
    # ── SMAAASH (80) ──
    (r'(id: 80,.*?image: )"[^"]*CIty_Center_Mall_Guwahati[^"]*"', r'\1"/images/loc_smaaash.jpg"', 1),
    # ── BISLE GHAT (81) ──
    (r'(id: 81,.*?image: )"[^"]*unsplash[^"]*1469474968028[^"]*"', r'\1"/images/loc_bisle_ghat.jpg"', 1),
    # ── OTTINENE (82) ──
    (r'(id: 82,.*?image: )"[^"]*unsplash[^"]*1502680390469[^"]*"', r'\1"/images/loc_ottinene.jpg"', 1),
    # ── KANCHIUGUDDA (83) ──
    (r'(id: 83,.*?image: )"[^"]*Agumbe_View_point[^"]*"', r'\1"/images/loc_kanchiugudda.jpg"', 1),
    # ── NITK LIGHTHOUSE (84) ──
    (r'(id: 84,.*?image: )"[^"]*unsplash[^"]*1516738901171[^"]*"', r'\1"/images/loc_nitk_lighthouse.jpg"', 1),
]

with open(LOCATIONS_FILE, "r", encoding="utf-8") as f:
    content = f.read()

total_replaced = 0
for pattern, replacement, expected in REPLACEMENTS:
    new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
    if count > 0:
        content = new_content
        total_replaced += count
        name = re.search(r'id: (\d+)', pattern)
        print(f"  OK   id={name.group(1) if name else '?'} -> replaced {count}")
    else:
        name = re.search(r'id: (\d+)', pattern)
        print(f"  MISS id={name.group(1) if name else '?'} (no match)")

with open(LOCATIONS_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nTotal replacements: {total_replaced}")

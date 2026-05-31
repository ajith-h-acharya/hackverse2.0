
# Download remaining images using curl (built-in Windows)
$images = @(
    @{name="loc_sasihithlu.jpg";   url="https://upload.wikimedia.org/wikipedia/commons/1/16/%E0%B2%B8%E0%B2%B6%E0%B2%BF%E0%B2%B9%E0%B2%BF%E0%B2%A4%E0%B3%8D%E0%B2%B2%E0%B3%81_%E0%B2%95%E0%B2%A1%E0%B2%B2%E0%B3%8D.jpg"},
    @{name="loc_bengre.jpg";       url="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Gurupura_river_mouth%2C_Mangalore.jpg/960px-Gurupura_river_mouth%2C_Mangalore.jpg"},
    @{name="loc_someshwara.jpg";   url="https://upload.wikimedia.org/wikipedia/commons/1/1f/Someshwar_Beach_%284531032078%29.jpg"},
    @{name="loc_malpe.jpg";        url="https://upload.wikimedia.org/wikipedia/commons/7/7a/Malpe_Beach_from_above.jpg"},
    @{name="loc_stmarys.jpg";      url="https://upload.wikimedia.org/wikipedia/commons/f/fc/St._Mary%27s_islands%2C_Udupi_1767.jpg"},
    @{name="loc_maravanthe.jpg";   url="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Maravanthe_Beach.jpg/960px-Maravanthe_Beach.jpg"},
    @{name="loc_mattu.jpg";        url="https://upload.wikimedia.org/wikipedia/commons/2/25/Mattu_Beach%2C_Udupi%2C_Karnataka%2C_India%2C_%282017%29.jpg"},
    @{name="loc_kodi.jpg";         url="https://upload.wikimedia.org/wikipedia/commons/c/c9/Kodi_beach_kundapura.jpg"},
    @{name="loc_kadri.jpg";        url="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Kadri_Manjunath_Temple%2C_Mangalore.jpg/960px-Kadri_Manjunath_Temple%2C_Mangalore.jpg"},
    @{name="loc_mangaladevi.jpg";  url="https://upload.wikimedia.org/wikipedia/commons/1/1f/Mangaladevi_Temple_Mangalore_2.jpg"},
    @{name="loc_sultan_battery.jpg";url="https://upload.wikimedia.org/wikipedia/commons/e/e4/Sultan_Battery_2163.JPG"},
    @{name="loc_kapu_lighthouse.jpg";url="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Kapu_Lighthouse_-_panoramio.jpg/960px-Kapu_Lighthouse_-_panoramio.jpg"},
    @{name="loc_dharmasthala.jpg"; url="https://upload.wikimedia.org/wikipedia/commons/d/d1/Dharmasthala_Temple.jpg"},
    @{name="loc_kateel.jpg";       url="https://upload.wikimedia.org/wikipedia/commons/c/c7/Kateel_Durga_Parameshwari_0145.JPG"},
    @{name="loc_anegudde.jpg";     url="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Anegudde_Vinayaka_Temple.jpg/960px-Anegudde_Vinayaka_Temple.jpg"},
    @{name="loc_thousand_pillars.jpg";url="https://upload.wikimedia.org/wikipedia/commons/b/b7/Thousand_Piller_Temple%2C_Moodbidri.jpg"},
    @{name="loc_varanga.jpg";      url="https://upload.wikimedia.org/wikipedia/commons/f/f4/Kere_Basadi_-_Varanga.jpg"},
    @{name="loc_rosario.jpg";      url="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Rosario_Cathedral_Mangalore.jpg/960px-Rosario_Cathedral_Mangalore.jpg"},
    @{name="loc_milagres.jpg";     url="https://upload.wikimedia.org/wikipedia/commons/b/b8/Milagres_Hampankatta.jpg"},
    @{name="loc_infant_jesus.jpg"; url="https://upload.wikimedia.org/wikipedia/commons/7/76/Infant_Jesus_Shrine%2C_Bikarnakatte.jpg"},
    @{name="loc_attur.jpg";        url="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Attur_St._Lawrence_Church.jpg/960px-Attur_St._Lawrence_Church.jpg"},
    @{name="loc_zeenath.jpg";      url="https://upload.wikimedia.org/wikipedia/commons/3/3f/Jumma_mazjid%2C_Zinad_Baksh%2C_Bunder%2C_Mangalore-2.jpg"},
    @{name="loc_sayyid.jpg";       url="https://upload.wikimedia.org/wikipedia/commons/6/6e/Ullal_Sayyad_Madani_Dargah_Gumbaz.jpg"},
    @{name="loc_udupi_masjid.jpg"; url="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Udupi_Central_Mosque.jpg/960px-Udupi_Central_Mosque.jpg"},
    @{name="loc_idgah.jpg";        url="https://upload.wikimedia.org/wikipedia/commons/8/89/Idgah_mosque_Mangaluru.jpg"},
    @{name="loc_pilikula.jpg";     url="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Pilikula_Nisargadhama.jpg/960px-Pilikula_Nisargadhama.jpg"},
    @{name="loc_butterfly.jpg";    url="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Bannerghatta_Butterfly_Park.jpg/960px-Bannerghatta_Butterfly_Park.jpg"},
    @{name="loc_adyar_falls.jpg";  url="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Irupu_falls.jpg/960px-Irupu_falls.jpg"},
    @{name="loc_manipal_lake.jpg"; url="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Manipal_Lake.jpg/960px-Manipal_Lake.jpg"},
    @{name="loc_agumbe.jpg";       url="https://upload.wikimedia.org/wikipedia/commons/4/4d/Agumbe_View_point.jpg"},
    @{name="loc_kudlu_falls.jpg";  url="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Kudremukh_National_Park.jpg/960px-Kudremukh_National_Park.jpg"},
    @{name="loc_jomlu.jpg";        url="https://upload.wikimedia.org/wikipedia/commons/3/30/Jomlu_Theertham_Falls.jpg"},
    @{name="loc_hanuman_gundi.jpg";url="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Hanuman_Gundi_Falls.jpg/960px-Hanuman_Gundi_Falls.jpg"},
    @{name="loc_ermai.jpg";        url="https://upload.wikimedia.org/wikipedia/commons/7/76/Didupe_waterfalls%2C_Ujire%2C_Dakshina_Kannada_%282016%29.jpg"},
    @{name="loc_mulki.jpg";        url="https://upload.wikimedia.org/wikipedia/commons/7/7b/Boating_in_Backwater.jpg"},
    @{name="loc_jamalabad.jpg";    url="https://upload.wikimedia.org/wikipedia/en/f/fc/Jamalabad_Rock%28Gadaikallu%29.jpg"},
    @{name="loc_gadbad.jpg";       url="https://upload.wikimedia.org/wikipedia/commons/c/c1/Special_Gadbad_at_Pabbas_Ideal_Icecream_Cafe_%2C_Mangalore.jpg"},
    @{name="loc_seafood.jpg";      url="https://upload.wikimedia.org/wikipedia/commons/1/14/Manglorean_style_white_pomfret_fish_curry-My_home_Bangalore-Karn.jpg"},
    @{name="loc_dosa.jpg";         url="https://upload.wikimedia.org/wikipedia/commons/e/e6/Butter_Masala_Dosa.png"},
    @{name="loc_restaurant.jpg";   url="https://upload.wikimedia.org/wikipedia/commons/0/07/Mangalorean_fish_curry.jpg"},
    @{name="loc_st_aloysius.jpg";  url="https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/St_Aloysius_College_Chapel.jpg/960px-St_Aloysius_College_Chapel.jpg"},
    @{name="loc_hasta_shilpa.jpg"; url="https://upload.wikimedia.org/wikipedia/commons/c/c9/Hasta_Shilpa_Heritage_Village_Manipal.jpg"},
    @{name="loc_pilikula_artisan.jpg";url="https://upload.wikimedia.org/wikipedia/commons/1/13/Pilikula_Nisargadhama_-_Heritage_Village_or_Guthu_Mane_04.jpg"},
    @{name="loc_barkur.jpg";       url="https://upload.wikimedia.org/wikipedia/commons/0/0b/Barkur_Panchalingeshwara_Temple.jpg"},
    @{name="loc_western_ghats.jpg";url="https://upload.wikimedia.org/wikipedia/commons/b/b5/Western_ghats_Karnataka.jpg"},
    @{name="loc_agumbe2.jpg";      url="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Agumbe_rainforest.jpg/960px-Agumbe_rainforest.jpg"},
    @{name="loc_soans_farms.jpg";  url="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Pineapple_on_plant_1.jpg/960px-Pineapple_on_plant_1.jpg"}
)

$outDir = "public\images"

foreach ($img in $images) {
    $outPath = Join-Path $outDir $img.name
    if (Test-Path $outPath) {
        $size = (Get-Item $outPath).Length
        if ($size -gt 10000) {
            Write-Host "SKIP: $($img.name)"
            continue
        }
    }
    Start-Sleep -Milliseconds 800
    try {
        curl.exe -L -A "Mozilla/5.0" --retry 2 --retry-delay 2 -o $outPath $img.url --silent --show-error
        if (Test-Path $outPath) {
            $size = (Get-Item $outPath).Length
            if ($size -gt 10000) {
                Write-Host "OK ($([math]::Round($size/1024))KB): $($img.name)"
            } else {
                Remove-Item $outPath -Force
                Write-Host "FAIL (too small): $($img.name)"
            }
        }
    } catch {
        Write-Host "ERROR: $($img.name) - $_"
    }
}

Write-Host "`nDownload complete."
Get-ChildItem $outDir | Measure-Object | Select-Object -ExpandProperty Count | ForEach-Object { Write-Host "Total files in public\images: $_" }

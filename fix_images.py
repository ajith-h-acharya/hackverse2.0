import re

CORRECTIONS = {
    # Gadbad / Pabba's Ice Cream (IDs 6 and 16)
    6: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Special_Gadbad_at_Pabbas_Ideal_Icecream_Cafe_%2C_Mangalore.jpg",
    16: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Special_Gadbad_at_Pabbas_Ideal_Icecream_Cafe_%2C_Mangalore.jpg",
    # Mattu Beach
    41: "https://upload.wikimedia.org/wikipedia/commons/2/25/Mattu_Beach%2C_Udupi%2C_Karnataka%2C_India%2C_%282017%29.jpg",
    # Kodi Beach
    43: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Kodi_beach_kundapura.jpg",
    # Milagres Church Mangalore
    66: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Milagres_Hampankatta.jpg",
    # Infant Jesus Shrine
    63: "https://upload.wikimedia.org/wikipedia/commons/7/76/Infant_Jesus_Shrine%2C_Bikarnakatte.jpg",
    # Zeenath Baksh Mosque
    60: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Jumma_mazjid%2C_Zinad_Baksh%2C_Bunder%2C_Mangalore-2.jpg",
    # Sayyid Madani Dargah
    62: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Ullal_Sayyad_Madani_Dargah_Gumbaz.jpg",
    # Pilikula Artisan Village / Pilikula area
    79: "https://upload.wikimedia.org/wikipedia/commons/1/13/Pilikula_Nisargadhama_-_Heritage_Village_or_Guthu_Mane_04.jpg",
    # Bisle Ghat
    81: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Bisile_ghat_from_view_point.jpg",
    # Ermai Falls
    70: "https://upload.wikimedia.org/wikipedia/commons/7/76/Didupe_waterfalls%2C_Ujire%2C_Dakshina_Kannada_%282016%29.jpg",
}

with open('src/data/locations.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Split by object boundaries
blocks = re.split(r'(\n  \{)', content)
result_parts = [blocks[0]]
i = 1

while i < len(blocks):
    block_start = blocks[i]
    i += 1
    if i >= len(blocks):
        result_parts.append(block_start)
        break
    block_content = blocks[i]
    i += 1

    id_match = re.search(r'id:\s*(\d+)', block_content)
    if id_match:
        loc_id = int(id_match.group(1))
        if loc_id in CORRECTIONS:
            new_img = CORRECTIONS[loc_id]
            # Replace image
            block_content = re.sub(
                r'image:\s*"https?://[^"]+\.(?:jpg|JPG|jpeg|png|PNG|webp)[^"]*"',
                f'image: "{new_img}"',
                block_content
            )
            # Replace gallery
            block_content = re.sub(
                r'gallery:\s*\["https?://[^"]+\.(?:jpg|JPG|jpeg|png|PNG|webp)[^"]*"\]',
                f'gallery: ["{new_img}"]',
                block_content
            )
            print(f'Corrected ID {loc_id}')

    result_parts.append(block_start + block_content)

with open('src/data/locations.js', 'w', encoding='utf-8') as f:
    f.write(''.join(result_parts))

print('All corrections applied!')

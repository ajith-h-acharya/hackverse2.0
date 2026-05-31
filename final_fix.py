import re

# Final specific fixes needed
FINAL_FIXES = {
    # Malpe Beach - wrong thumb format, use direct Wikimedia URL
    24: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Malpe_Beach_from_above.jpg",
    # Sri Krishna Matha - use the thumbnail format that works
    23: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Udupi_Sri_Krishna_Matha_Temple.jpg/960px-Udupi_Sri_Krishna_Matha_Temple.jpg",
    # Bengre Sandspit - check if actual file exists
    12: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Gurupura_river_mouth%2C_Mangalore.jpg/1280px-Gurupura_river_mouth%2C_Mangalore.jpg",
    # Someshwara Beach - correct URL
    33: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Someshwara_Beach_%2CSomeshwara%2C_Mangalore%2CKarnataka%2CIndia.jpg",
    # Maravanthe Beach - use a known-good URL
    36: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Maravanthe_Beach.jpg/1280px-Maravanthe_Beach.jpg",
    # Manipal Lake - correct URL  
    30: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Manipal_Lake.jpg/1280px-Manipal_Lake.jpg",
}

with open('src/data/locations.js', 'r', encoding='utf-8') as f:
    content = f.read()

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
        if loc_id in FINAL_FIXES:
            new_img = FINAL_FIXES[loc_id]
            block_content = re.sub(
                r'image:\s*"https?://[^"]+\.(?:jpg|JPG|jpeg|png|PNG|webp)[^"]*"',
                f'image: "{new_img}"',
                block_content
            )
            block_content = re.sub(
                r'gallery:\s*\["https?://[^"]+\.(?:jpg|JPG|jpeg|png|PNG|webp)[^"]*"\]',
                f'gallery: ["{new_img}"]',
                block_content
            )
            print(f'Final fix ID {loc_id}')

    result_parts.append(block_start + block_content)

with open('src/data/locations.js', 'w', encoding='utf-8') as f:
    f.write(''.join(result_parts))

print('All final fixes applied!')

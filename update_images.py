import re, urllib.request, urllib.parse, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_page_image(title):
    search_title = title.replace(' ', '_')
    url = f'https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(search_title)}&prop=pageimages&pithumbsize=800&format=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        res = json.loads(urllib.request.urlopen(req, context=ctx).read())
        pages = res['query']['pages']
        for page_id in pages:
            if 'thumbnail' in pages[page_id]:
                return pages[page_id]['thumbnail']['source']
    except Exception as e:
        pass
    
    # Try searching instead
    search_url = f'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(title)}&format=json'
    req2 = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        res2 = json.loads(urllib.request.urlopen(req2, context=ctx).read())
        search_results = res2['query']['search']
        if len(search_results) > 0:
            first_title = search_results[0]['title'].replace(' ', '_')
            url3 = f'https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(first_title)}&prop=pageimages&pithumbsize=800&format=json'
            req3 = urllib.request.Request(url3, headers={'User-Agent': 'Mozilla/5.0'})
            res3 = json.loads(urllib.request.urlopen(req3, context=ctx).read())
            pages3 = res3['query']['pages']
            for page_id in pages3:
                if 'thumbnail' in pages3[page_id]:
                    return pages3[page_id]['thumbnail']['source']
    except Exception as e:
        pass
        
    return None

with open('src/data/locations.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace image: "https://images.unsplash..."
pattern = re.compile(r'name:\s*\"([^\"]+)\".*?image:\s*\"(https://images\.unsplash\.com/[^\"]+)\"', re.DOTALL)

def replace_match(match):
    name = match.group(1)
    old_img = match.group(2)
    new_img = get_page_image(name)
    if new_img:
        print(f'Replacing {name}: {new_img}')
        return match.group(0).replace(old_img, new_img)
    else:
        print(f'No image found for {name}')
        return match.group(0)

new_content = pattern.sub(replace_match, content)

# Replace gallery: ["https://images.unsplash..."]
pattern_gallery = re.compile(r'name:\s*\"([^\"]+)\".*?gallery:\s*\[\s*\"(https://images\.unsplash\.com/[^\"]+)\"\s*\]', re.DOTALL)
def replace_gallery(match):
    name = match.group(1)
    old_img = match.group(2)
    new_img = get_page_image(name)
    if new_img:
        return match.group(0).replace(old_img, new_img)
    return match.group(0)
    
new_content = pattern_gallery.sub(replace_gallery, new_content)

with open('src/data/locations.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Done updating locations.js')

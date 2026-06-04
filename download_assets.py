import os
import re
import urllib.request

html_file = 'index.html'

if not os.path.exists('img'):
    os.makedirs('img')
if not os.path.exists('fonts'):
    os.makedirs('fonts')

with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# 1. Download Images
img_pattern = re.compile(r'<img[^>]+src="([^"]+)"')
img_srcs = img_pattern.findall(html_content)

for src in img_srcs:
    if src.startswith('http'):
        if 'unsplash.com' in src:
            filename = 'unsplash_' + src.split('/')[-1].split('?')[0] + '.jpg'
        else:
            filename = src.split('/')[-1].split('?')[0]
        
        filepath = os.path.join('img', filename)
        print(f"Downloading {src} to {filepath}")
        
        try:
            req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
                out_file.write(response.read())
            html_content = html_content.replace(src, f'img/{filename}')
        except Exception as e:
            print(f"Failed to download {src}: {e}")

# 2. Download Fonts
font_link_pattern = re.compile(r'<link[^>]+href="(https://fonts.googleapis.com/css2?[^"]+)"[^>]*>')
font_links = font_link_pattern.findall(html_content)

local_css_content = ""

for font_url in font_links:
    decoded_url = font_url.replace('&amp;', '&')
    print(f"Downloading font CSS from {decoded_url}")
    try:
        req = urllib.request.Request(decoded_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
        with urllib.request.urlopen(req) as response:
            css_content = response.read().decode('utf-8')
            
        url_pattern = re.compile(r'url\((https://[^)]+)\)')
        font_urls = url_pattern.findall(css_content)
        
        for url in font_urls:
            filename = url.split('/')[-1]
            filepath = os.path.join('fonts', filename)
            if not os.path.exists(filepath):
                print(f"Downloading font {url} to {filepath}")
                req_font = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req_font) as f_res, open(filepath, 'wb') as f_out:
                    f_out.write(f_res.read())
            
            css_content = css_content.replace(url, f'../fonts/{filename}')
            
        local_css_content += css_content + "\n"
        
        # Replace the original link tag with the local css tag
        # Use regex to match the exact link tag and replace it
        html_content = re.sub(r'<link[^>]+href="' + re.escape(font_url) + r'"[^>]*>', '<link rel="stylesheet" href="style/fonts.css">', html_content)
    except Exception as e:
        print(f"Failed to process fonts from {decoded_url}: {e}")

if local_css_content:
    with open('style/fonts.css', 'w', encoding='utf-8') as f:
        f.write(local_css_content)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Done!")

#!/usr/bin/env python3
"""Test translation on first 3 articles"""
import os
from bs4 import BeautifulSoup
from googletrans import Translator
import time

translator = Translator()

def translate_text(text):
    try:
        result = translator.translate(text, src='en', dest='zh-cn')
        return result.text
    except Exception as e:
        return f"[翻译失败: {str(e)[:50]}]"

articles_dir = 'articles'
files = sorted([f for f in os.listdir(articles_dir) if f.endswith('.html')])[:3]

print(f"Testing translation on {len(files)} articles...\n")

for filename in files:
    filepath = os.path.join(articles_dir, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    chinese_pars = soup.find_all('p', class_='chinese-text')
    to_translate = [p for p in chinese_pars if '[翻译占位' in p.get_text()]
    
    print(f"{filename}: {len(to_translate)} paragraphs to translate")
    
    count = 0
    for p_tag in to_translate[:5]:  # Just first 5 paragraphs as test
        parent = p_tag.parent
        if parent:
            eng_p = parent.find('p', class_='english-text')
            if eng_p:
                eng_text = eng_p.get_text().strip()
                chinese = translate_text(eng_text)
                print(f"  EN: {eng_text[:60]}...")
                print(f"  CN: {chinese}")
                count += 1
                time.sleep(0.5)
    
    print(f"  ✓ Translated {count} paragraphs\n")

print("Test complete!")

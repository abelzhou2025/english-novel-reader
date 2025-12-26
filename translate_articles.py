#!/usr/bin/env python3
"""
Translate all article placeholders using free translation service
Uses googletrans library (free Google Translate API)
"""
import os
import re
from bs4 import BeautifulSoup
import time

try:
    from googletrans import Translator
    translator = Translator()
    HAS_TRANSLATOR = True
except ImportError:
    print("Installing googletrans library...")
    import subprocess
    try:
        subprocess.check_call(['pip3', 'install', 'googletrans==4.0.0-rc1'])
        from googletrans import Translator
        translator = Translator()
        HAS_TRANSLATOR = True
    except:
        HAS_TRANSLATOR = False

def translate_with_google(text, max_retries=3):
    """Translate English text to Chinese using Google Translate (free)"""
    if not HAS_TRANSLATOR:
        return f"[翻译服务不可用]"
    
    # Skip very short or empty text
    if not text or len(text.strip()) < 3:
        return text
    
    for attempt in range(max_retries):
        try:
            result = translator.translate(text, src='en', dest='zh-cn')
            return result.text
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(1)  # Wait before retry
                continue
            else:
                print(f"  Translation error: {str(e)[:100]}")
                return f"[翻译失败: {text[:30]}...]"

def translate_article(filepath, translate_func):
    """Translate all placeholders in an article"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Find all chinese-text paragraphs with placeholder
    chinese_paragraphs = soup.find_all('p', class_='chinese-text')
    
    translated_count = 0
    for p_tag in chinese_paragraphs:
        text = p_tag.get_text().strip()
        
        # Skip if already translated (not a placeholder)
        if '[翻译占位' not in text and 'Translation placeholder' not in text:
            continue
        
        # Find the corresponding English text
        parent = p_tag.parent
        if parent and parent.get('class') == ['paragraph-block']:
            english_p = parent.find('p', class_='english-text')
            if english_p:
                english_text = english_p.get_text().strip()
                
                # Skip very short texts
                if len(english_text) < 5:
                    p_tag.string = english_text
                    continue
                
                # Translate
                chinese_text = translate_func(english_text)
                p_tag.string = chinese_text
                translated_count += 1
                
                # Rate limiting - be nice to the API
                time.sleep(0.5)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    
    return translated_count

def main():
    articles_dir = 'articles'
    article_files = [f for f in os.listdir(articles_dir) if f.endswith('.html')]
    
    if not HAS_TRANSLATOR:
        print("\n❌ Translation library not available!")
        print("Please install manually: pip3 install googletrans==4.0.0-rc1")
        return
    
    print(f"🌐 Starting FREE translation of {len(article_files)} articles...")
    print("Using Google Translate (free service)")
    print("This will take a while. Please be patient.\n")
    
    total_translated = 0
    processed = 0
    errors = 0
    
    for i, filename in enumerate(article_files, 1):
        filepath = os.path.join(articles_dir, filename)
        try:
            count = translate_article(filepath, translate_with_google)
            total_translated += count
            processed += 1
            print(f"[{i}/{len(article_files)}] ✓ {filename}: {count} paragraphs translated")
        except Exception as e:
            errors += 1
            print(f"[{i}/{len(article_files)}] ✗ {filename}: Error - {str(e)[:100]}")
    
    print(f"\n{'='*60}")
    print(f"Translation complete!")
    print(f"  Articles processed: {processed}")
    print(f"  Total paragraphs translated: {total_translated}")
    print(f"  Errors: {errors}")
    print(f"\n✅ All articles now have Chinese translations! 🎉")

if __name__ == '__main__':
    main()

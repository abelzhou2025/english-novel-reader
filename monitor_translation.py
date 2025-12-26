#!/usr/bin/env python3
"""
Monitor translation progress and notify when complete
"""
import os
import time
import subprocess

def check_translation_progress():
    articles_dir = 'articles'
    files = [f for f in os.listdir(articles_dir) if f.endswith('.html')]
    
    total_articles = len(files)
    translated_articles = 0
    
    for filename in files:
        filepath = os.path.join(articles_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                # Check if translation placeholders still exist
                if '[翻译占位 - Translation placeholder]' not in content:
                    translated_articles += 1
        except Exception as e:
            print(f"Error reading {filename}: {e}")
    
    return translated_articles, total_articles

def main():
    print("🔄 Starting translation progress monitoring...")
    print("This script will check every 30 seconds until all articles are translated.")
    
    while True:
        translated, total = check_translation_progress()
        progress = (translated / total * 100) if total > 0 else 0
        
        print(f"\r📊 Translation progress: {translated}/{total} articles ({progress:.1f}%)", end="", flush=True)
        
        if translated >= total:
            print(f"\n\n🎉 SUCCESS! All {total} articles have been translated!")
            print("✅ Translation process completed.")
            print("🌐 You can now view all articles with full Chinese translations.")
            break
        
        # Wait 30 seconds before next check
        time.sleep(30)
    
    print("\n✅ Monitoring completed.")

if __name__ == '__main__':
    main()
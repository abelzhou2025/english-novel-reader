#!/usr/bin/env python3
"""
Check translation progress for articles
"""
import os

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
    
    print(f"Total articles: {total_articles}")
    print(f"Translated articles: {translated_articles}/{total_articles}")
    print(f"Progress: {translated_articles/total_articles*100:.1f}%" if total_articles > 0 else "0%")

if __name__ == '__main__':
    check_translation_progress()
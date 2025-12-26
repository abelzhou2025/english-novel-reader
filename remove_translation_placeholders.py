#!/usr/bin/env python3
import os
import re

# Define the directory containing the articles
ARTICLES_DIR = './articles'

# Define the patterns to match and remove
PLACEHOLDER_PATTERNS = [
    r'<p class="english-text">\[翻译占位 - Translation placeholder\]</p>\s*<p class="chinese-text">\[翻译失败: \[翻译占位 - Translation placeholde...\]</p>',
    r'<p class="english-text">\[翻译占位 - Translation placeholder\]</p>',
    r'<p class="chinese-text">\[翻译失败: \[翻译占位 - Translation placeholde...\]</p>',
    r'<p class="chinese-text">\[翻译占位 - Translation placeholder\]</p>',
    r'\s*Image Credits:.*?\s*',
    r'<img[^>]*>\s*',
    r'<figure[^>]*>.*?</figure>',
    r'<div class="image-container[^>]*>.*?</div>'
]

def remove_placeholders():
    """Remove translation placeholders from all HTML files in the articles directory."""
    # Get all HTML files in the articles directory
    html_files = [f for f in os.listdir(ARTICLES_DIR) if f.endswith('.html')]
    
    total_files = len(html_files)
    processed_files = 0
    removed_placeholders = 0
    
    print(f"Found {total_files} HTML files to process.")
    
    # Process each HTML file
    for filename in html_files:
        file_path = os.path.join(ARTICLES_DIR, filename)
        
        try:
            # Read the file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Remove all placeholder patterns
            for pattern in PLACEHOLDER_PATTERNS:
                matches = re.findall(pattern, content, re.DOTALL)
                removed_placeholders += len(matches)
                content = re.sub(pattern, '', content, flags=re.DOTALL)
            
            # If content has changed, write it back to the file
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                processed_files += 1
                
        except Exception as e:
            print(f"Error processing file {filename}: {e}")
    
    print(f"Processing completed.")
    print(f"Files modified: {processed_files}/{total_files}")
    print(f"Placeholders removed: {removed_placeholders}")

if __name__ == "__main__":
    remove_placeholders()

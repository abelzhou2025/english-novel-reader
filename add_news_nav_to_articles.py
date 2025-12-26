#!/usr/bin/env python3
import os
import re

# Define the directory containing the articles
ARTICLES_DIR = './articles'

# Define the navigation patterns to match and replace
# Original pattern: <li><a href="../about.html">关于我</a></li>
# New pattern: <li><a href="../news.html">新闻</a></li>
#              <li><a href="../about.html">关于我</a></li>

# Define the regex patterns
NAV_PATTERNS = [
    # Pattern for articles with active网文 link
    (r'<li><a class="active" href="\.\./webnovels\.html">网文</a></li>\s*<li><a href="\.\./about\.html">关于我</a></li>',
     '<li><a class="active" href="../webnovels.html">网文</a></li>\n    <li><a href="../news.html">新闻</a></li>\n    <li><a href="../about.html">关于我</a></li>'),
    # Pattern for articles with active小说 link
    (r'<li><a class="active" href="\.\./novels\.html">小说</a></li>\s*<li><a href="\.\./about\.html">关于我</a></li>',
     '<li><a class="active" href="../novels.html">小说</a></li>\n    <li><a href="../webnovels.html">网文</a></li>\n    <li><a href="../news.html">新闻</a></li>\n    <li><a href="../about.html">关于我</a></li>'),
    # Pattern for articles with active首页 link
    (r'<li><a class="active" href="\.\./index\.html">首页</a></li>\s*<li><a href="\.\./about\.html">关于我</a></li>',
     '<li><a class="active" href="../index.html">首页</a></li>\n    <li><a href="../novels.html">小说</a></li>\n    <li><a href="../webnovels.html">网文</a></li>\n    <li><a href="../news.html">新闻</a></li>\n    <li><a href="../about.html">关于我</a></li>'),
    # Pattern for articles with no active link (general case)
    (r'<li><a href="\.\./webnovels\.html">网文</a></li>\s*<li><a href="\.\./about\.html">关于我</a></li>',
     '<li><a href="../webnovels.html">网文</a></li>\n    <li><a href="../news.html">新闻</a></li>\n    <li><a href="../about.html">关于我</a></li>'),
    # Pattern for articles with index, novels, webnovels but no news
    (r'<li><a href="\.\./index\.html">首页</a></li>\s*<li><a href="\.\./novels\.html">小说</a></li>\s*<li><a href="\.\./webnovels\.html">网文</a></li>\s*<li><a href="\.\./about\.html">关于我</a></li>',
     '<li><a href="../index.html">首页</a></li>\n    <li><a href="../novels.html">小说</a></li>\n    <li><a href="../webnovels.html">网文</a></li>\n    <li><a href="../news.html">新闻</a></li>\n    <li><a href="../about.html">关于我</a></li>')
]

def add_news_nav_to_articles():
    """Add news navigation link to all article HTML files."""
    # Get all HTML files in the articles directory
    html_files = [f for f in os.listdir(ARTICLES_DIR) if f.endswith('.html')]
    
    total_files = len(html_files)
    processed_files = 0
    updated_files = 0
    
    print(f"Found {total_files} HTML files to process.")
    
    # Process each HTML file
    for filename in html_files:
        file_path = os.path.join(ARTICLES_DIR, filename)
        
        try:
            # Read the file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Apply all navigation patterns
            for pattern, replacement in NAV_PATTERNS:
                content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            
            # If content has changed, write it back to the file
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                processed_files += 1
                updated_files += 1
                print(f"Added news navigation to: {filename}")
            else:
                processed_files += 1
                print(f"No changes needed for: {filename}")
                
        except Exception as e:
            print(f"Error processing file {filename}: {e}")
    
    print(f"Processing completed.")
    print(f"Files processed: {processed_files}/{total_files}")
    print(f"Files updated: {updated_files}/{total_files}")

if __name__ == "__main__":
    add_news_nav_to_articles()

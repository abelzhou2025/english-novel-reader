#!/usr/bin/env python3
"""
Process all article HTML files to:
1. Add bilingual paragraph-by-paragraph translation structure
2. Remove hyperlinks but keep text
3. Clean ads and irrelevant content
4. Unify font styles
"""
import os
import re
from bs4 import BeautifulSoup

articles_dir = 'articles'
article_files = [f for f in os.listdir(articles_dir) if f.endswith('.html')]

print(f"Processing {len(article_files)} article files...")

# Patterns to identify ad/promotional content
AD_PATTERNS = [
    r'MORE FOR YOU',
    r'PROMOTED',
    r'Email Address',
    r'You\'re Subscribed',
    r'Explore More Newsletters',
    r'By signing up, you agree',
    r'Getty Images',
    r'Source:.*',
    r'www\.\w+\.com$',  # URLs as standalone paragraphs
]

def is_ad_content(text):
    """Check if text appears to be ad or promotional content"""
    if not text or len(text.strip()) < 3:
        return True
    
    text_clean = text.strip()
    
    for pattern in AD_PATTERNS:
        if re.search(pattern, text_clean, re.IGNORECASE):
            return True
    
    # Check for newsletter signup, subscription prompts
    if 'newsletter' in text_clean.lower() or 'subscribe' in text_clean.lower():
        return True
    
    # Very short paragraphs that are just links
    if len(text_clean) < 20 and text_clean.startswith('http'):
        return True
        
    return False

def clean_paragraph(p_tag):
    """Remove hyperlinks but keep text, clean up content"""
    # Remove all <a> tags but keep their text
    for a_tag in p_tag.find_all('a'):
        a_tag.replace_with(a_tag.get_text())
    
    # Remove images
    for img in p_tag.find_all('img'):
        img.decompose()
    
    return p_tag.get_text().strip()

def process_article(filepath):
    """Process single article file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    # Find the article content div
    article_content = soup.find('div', class_='article-content')
    if not article_content:
        print(f"  ✗ No article-content div found in {os.path.basename(filepath)}")
        return False
    
    # Extract title
    title_tag = article_content.find('h1')
    title = title_tag.get_text().strip() if title_tag else "Untitled"
    
    # Find all paragraphs and headings
    elements = article_content.find_all(['p', 'h1', 'h2', 'h3', 'h4'])
    
    # Filter and clean content
    cleaned_elements = []
    for elem in elements:
        text = clean_paragraph(elem)
        
        # Skip if it's ad content or empty
        if is_ad_content(text):
            continue
        
        # Skip if it's just the title again
        if elem.name == 'h1' and text == title:
            continue
        
        cleaned_elements.append({
            'tag': elem.name,
            'text': text,
            'original': elem
        })
    
    # Build new article content with bilingual structure
    new_content_html = f'''<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - English Novel Reader</title>
    <link rel="stylesheet" href="../styles.css">
    <style>
        body {{
            font-family: Georgia, serif;
            background-color: #f9f7f4;
            margin: 0;
            padding: 0;
        }}
        
        .article-content {{
            max-width: 900px;
            margin: 100px auto 50px;
            padding: 40px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }}
        
        .back-btn {{
            display: inline-block;
            background-color: #5a3e2b;
            color: #fff;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-family: 'Microsoft YaHei', sans-serif;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            margin-bottom: 30px;
        }}
        
        .back-btn:hover {{
            background-color: #7a5c42;
            transform: translateY(-2px);
        }}
        
        .article-title {{
            font-family: Georgia, serif;
            font-size: 2rem;
            color: #2c2c2c;
            margin-bottom: 30px;
            line-height: 1.3;
            font-weight: 600;
        }}
        
        .article-section {{
            margin-bottom: 30px;
        }}
        
        .section-heading {{
            font-family: Georgia, serif;
            font-size: 1.5rem;
            color: #3a3a3a;
            margin-top: 35px;
            margin-bottom: 20px;
            font-weight: 600;
            line-height: 1.4;
        }}
        
        .section-subheading {{
            font-family: Georgia, serif;
            font-size: 1.2rem;
            color: #4a4a4a;
            margin-top: 25px;
            margin-bottom: 15px;
            font-weight: 600;
            line-height: 1.4;
        }}
        
        .paragraph-block {{
            margin-bottom: 25px;
        }}
        
        .english-text {{
            font-family: Georgia, serif;
            font-size: 1.1rem;
            color: #2c2c2c;
            line-height: 1.8;
            margin-bottom: 12px;
        }}
        
        .chinese-text {{
            font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
            font-size: 1rem;
            color: #666;
            line-height: 1.8;
            padding-left: 20px;
            border-left: 3px solid #d4a76a;
            opacity: 0.7;
        }}
        
        @media (max-width: 768px) {{
            .article-content {{
                margin: 80px 15px 30px;
                padding: 25px;
            }}
            
            .article-title {{
                font-size: 1.6rem;
            }}
            
            .section-heading {{
                font-size: 1.3rem;
            }}
            
            .english-text {{
                font-size: 1rem;
            }}
        }}
    </style>
</head>
<body>
    <!-- Top Navigation -->
    <nav class="top-nav">
        <ul>
            <li><a href="../index.html">首页</a></li>
            <li><a href="../novels.html">小说</a></li>
            <li><a href="../webnovels.html" class="active">网文</a></li>
            <li><a href="../about.html">关于我</a></li>
        </ul>
    </nav>
    
    <div class="article-content">
        <a href="../webnovels.html" class="back-btn">← 返回网文列表</a>
        <h1 class="article-title">{title}</h1>
'''
    
    # Add cleaned content with bilingual structure
    for item in cleaned_elements:
        if item['tag'] in ['h2', 'h3', 'h4']:
            # Headings
            if item['tag'] == 'h2':
                new_content_html += f'\n        <h2 class="section-heading">{item["text"]}</h2>\n'
            else:
                new_content_html += f'\n        <h3 class="section-subheading">{item["text"]}</h3>\n'
        else:
            # Regular paragraphs with bilingual structure
            new_content_html += f'''        <div class="paragraph-block">
            <p class="english-text">{item["text"]}</p>
            <p class="chinese-text">[翻译占位 - Translation placeholder]</p>
        </div>
'''
    
    # Close HTML
    new_content_html += '''    </div>
</body>
</html>'''
    
    # Write back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content_html)
    
    return True

# Process all articles
processed = 0
errors = 0

for filename in article_files:
    filepath = os.path.join(articles_dir, filename)
    try:
        if process_article(filepath):
            processed += 1
            print(f"  ✓ {filename}")
        else:
            errors += 1
    except Exception as e:
        errors += 1
        print(f"  ✗ Error processing {filename}: {e}")

print(f"\n{'='*60}")
print(f"Processing complete!")
print(f"  Successfully processed: {processed} files")
print(f"  Errors: {errors} files")
print(f"\nArticles now have:")
print(f"  ✓ Bilingual structure (English + [翻译占位])")
print(f"  ✓ Hyperlinks removed")
print(f"  ✓ Ads and promotional content cleaned")
print(f"  ✓ Unified font styles (Georgia for English, Microsoft YaHei for Chinese)")

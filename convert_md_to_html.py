#!/usr/bin/env python3
"""
Convert markdown files to HTML and replace old articles
"""
import os
import shutil
import markdown
import re

# Paths
source_dir = '/Users/abel/Desktop/Qoder/articles'
target_dir = '/Users/abel/Desktop/Qoder/website_markdown/articles'

# Get all .md and .txt files
source_files = []
for f in os.listdir(source_dir):
    if f.endswith('.md') or f.endswith('.txt'):
        if not f.startswith('.'):  # Skip hidden files like .DS_Store
            source_files.append(f)

print(f"Found {len(source_files)} markdown/text files to convert")

# Clear the target directory first
print(f"\nClearing old articles in {target_dir}...")
if os.path.exists(target_dir):
    for old_file in os.listdir(target_dir):
        if old_file.endswith('.html'):
            os.remove(os.path.join(target_dir, old_file))
            
print(f"Cleared old HTML files")

# Convert each markdown file to HTML
converted = 0
errors = []

for filename in source_files:
    source_path = os.path.join(source_dir, filename)
    
    try:
        # Read the markdown content
        with open(source_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
        
        # Extract title from first line if it starts with #
        title_match = re.match(r'^#\s+(.+)$', md_content, re.MULTILINE)
        if title_match:
            title = title_match.group(1).strip()
        else:
            # Use filename as title
            title = filename.replace('.md', '').replace('.txt', '').replace('_', ' ')
        
        # Convert markdown to HTML
        md = markdown.Markdown(extensions=['extra', 'nl2br'])
        html_body = md.convert(md_content)
        
        # Create full HTML page with proper styling
        html_content = f'''<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - English Novel Reader</title>
    <link rel="stylesheet" href="../styles.css">
    <style>
        body {{
            transition: background-color 0.3s ease, color 0.3s ease;
        }}
        
        .article-content {{
            max-width: 800px;
            margin: 100px auto;
            padding: 30px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow-x: hidden;
            word-wrap: break-word;
        }}
        
        .article-content h1 {{
            font-size: 2rem;
            color: #5a3e2b;
            margin-bottom: 20px;
            font-family: Georgia, serif;
        }}
        
        .article-content h2 {{
            font-size: 1.5rem;
            color: #5a3e2b;
            margin-top: 30px;
            margin-bottom: 15px;
        }}
        
        .article-content h3 {{
            font-size: 1.2rem;
            color: #7a5c42;
            margin-top: 20px;
            margin-bottom: 10px;
        }}
        
        .article-content p {{
            margin-bottom: 15px;
            line-height: 1.8;
            color: #333;
            font-family: Georgia, serif;
        }}
        
        .article-content ul, .article-content ol {{
            margin-bottom: 15px;
            padding-left: 30px;
        }}
        
        .article-content li {{
            margin-bottom: 8px;
            line-height: 1.6;
        }}
        
        .article-content code {{
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }}
        
        .article-content pre {{
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin-bottom: 15px;
        }}
        
        .back-btn {{
            display: inline-block;
            background-color: #5a3e2b;
            color: #fff;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-family: 'Microsoft YaHei', sans-serif;
            transition: all 0.3s ease;
            margin-bottom: 30px;
        }}
        
        .back-btn:hover {{
            background-color: #7a5c42;
            transform: translateY(-2px);
        }}
        
        @media (max-width: 768px) {{
            .article-content {{
                margin: 80px 10px;
                padding: 20px;
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
        {html_body}
    </div>
</body>
</html>'''
        
        # Generate HTML filename (sanitize filename)
        html_filename = filename.replace('.md', '.html').replace('.txt', '.html')
        # Remove special characters that might cause issues
        html_filename = re.sub(r'[<>:"|?*]', '_', html_filename)
        
        target_path = os.path.join(target_dir, html_filename)
        
        # Write HTML file
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        converted += 1
        print(f"✓ Converted: {filename} -> {html_filename}")
        
    except Exception as e:
        errors.append(f"{filename}: {str(e)}")
        print(f"✗ Error converting {filename}: {e}")

print(f"\n{'='*60}")
print(f"Conversion complete!")
print(f"  Successfully converted: {converted} files")
print(f"  Errors: {len(errors)}")

if errors:
    print(f"\nErrors encountered:")
    for error in errors[:10]:  # Show first 10 errors
        print(f"  - {error}")

print(f"\nHTML files saved to: {target_dir}")

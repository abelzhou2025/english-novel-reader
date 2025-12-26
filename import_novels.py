#!/usr/bin/env python3
"""
Import novels from txt files and convert to JavaScript format
"""
import os
import re
import json

# Novel files location
NOVELS_DIR = os.path.expanduser('~/Desktop/Novels')
OUTPUT_FILE = 'novels_data.js'

# Novel metadata (Chinese names)
NOVEL_META = {
    "Jane Eyre": {
        "author": "Charlotte Brontë",
        "chinese_name": "简·爱"
    },
    "Pride and Prejudice": {
        "author": "Jane Austen",
        "chinese_name": "傲慢与偏见"
    },
    "Moby Dick": {
        "author": "Herman Melville",
        "chinese_name": "白鲸"
    },
    "The Count of Monte Cristo": {
        "author": "Alexandre Dumas",
        "chinese_name": "基督山伯爵"
    },
    "Gulliver's Travels into Several Remote Nations of the World": {
        "author": "Jonathan Swift",
        "chinese_name": "格列佛游记",
        "short_name": "Gulliver's Travels"
    },
    "The Railway Children": {
        "author": "E. Nesbit",
        "chinese_name": "铁路少年"
    }
}

def clean_paragraph(text):
    """Clean and filter paragraphs"""
    # Remove excessive whitespace
    text = ' '.join(text.split())
    
    # Skip very short paragraphs (likely formatting artifacts)
    if len(text) < 50:
        return None
    
    # Skip common header/footer content
    skip_patterns = [
        r'Project Gutenberg',
        r'gutenberg\.org',
        r'END OF.*PROJECT GUTENBERG',
        r'START OF.*PROJECT GUTENBERG',
        r'\*\*\* (START|END)',
        r'Produced by',
        r'eBook',
        r'ebook',
    ]
    
    for pattern in skip_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return None
    
    return text

def process_novel(filepath):
    """Process a single novel file"""
    filename = os.path.basename(filepath)
    title = os.path.splitext(filename)[0]
    
    print(f"\n📚 Processing: {title}")
    
    # Get metadata
    meta = NOVEL_META.get(title, {
        "author": "Unknown Author",
        "chinese_name": title
    })
    
    # Read file
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Split into paragraphs
    raw_paragraphs = content.split('\n')
    
    # Clean and filter paragraphs
    paragraphs = []
    for para in raw_paragraphs:
        cleaned = clean_paragraph(para)
        if cleaned:
            paragraphs.append(cleaned)
    
    print(f"   ✓ Extracted {len(paragraphs)} paragraphs")
    
    # Create novel ID (safe for JavaScript)
    novel_id = title.lower().replace("'", "").replace(" ", "_")
    novel_id = re.sub(r'[^a-z0-9_]', '', novel_id)
    
    return {
        'id': novel_id,
        'title': meta.get('short_name', title),
        'author': meta['author'],
        'chinese_name': meta['chinese_name'],
        'content': paragraphs[:2000]  # Limit to 2000 paragraphs per novel for performance
    }

def generate_javascript(novels):
    """Generate JavaScript file with novel data"""
    
    js_content = """// Novel Data - Auto-generated from txt files
// DO NOT EDIT MANUALLY - regenerate using import_novels.py

const NOVELS_DATA = {
"""
    
    for novel in novels:
        # Escape special characters in content
        content_json = json.dumps(novel['content'], ensure_ascii=False, indent=8)
        
        js_content += f"""    "{novel['id']}": {{
        "title": "{novel['title']}",
        "author": "{novel['author']}",
        "chineseName": "{novel['chinese_name']}",
        "content": {content_json}
    }},
"""
    
    js_content += """};

// Export for use in novels.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NOVELS_DATA;
}
"""
    
    return js_content

def main():
    """Main function"""
    print("🔄 Importing novels from txt files...")
    print(f"📁 Source directory: {NOVELS_DIR}")
    
    # Check if directory exists
    if not os.path.exists(NOVELS_DIR):
        print(f"❌ Error: Directory not found: {NOVELS_DIR}")
        return
    
    # Process all txt files
    novels = []
    txt_files = [f for f in os.listdir(NOVELS_DIR) if f.endswith('.txt')]
    
    if not txt_files:
        print(f"❌ No .txt files found in {NOVELS_DIR}")
        return
    
    print(f"\n📖 Found {len(txt_files)} novel files")
    
    for filename in sorted(txt_files):
        filepath = os.path.join(NOVELS_DIR, filename)
        try:
            novel = process_novel(filepath)
            novels.append(novel)
        except Exception as e:
            print(f"   ❌ Error processing {filename}: {e}")
    
    # Generate JavaScript file
    print(f"\n💾 Generating {OUTPUT_FILE}...")
    js_content = generate_javascript(novels)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"✅ Successfully created {OUTPUT_FILE}")
    print(f"📊 Imported {len(novels)} novels:")
    for novel in novels:
        print(f"   - {novel['title']} ({novel['chinese_name']}): {len(novel['content'])} paragraphs")
    
    print("\n🎉 Import complete!")

if __name__ == '__main__':
    main()
